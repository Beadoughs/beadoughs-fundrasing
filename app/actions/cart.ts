"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  CART_COOKIE_MAX_AGE,
  CART_COOKIE_NAME,
  getShopifyConfig,
  isShopifyConfigured,
} from "@/lib/shopify/config"
import { storefrontRequest } from "@/lib/shopify/storefront"
import {
  CART_ATTRIBUTES_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/queries"
import type { CartAttribute } from "@/lib/fundraising/cart-fundraiser"

export type CartDisplayLine = {
  id: string
  quantity: number
  attributes: CartAttribute[]
  cost: { totalAmount: { amount: string; currencyCode: string } }
  merchandise: {
    id: string
    title: string
    imageUrl: string | null
    imageAlt: string | null
    product: { title: string; handle: string }
  }
}

export type CartDisplay = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { totalAmount: { amount: string; currencyCode: string } }
  attributes: CartAttribute[]
  lines: CartDisplayLine[]
}

function revalidateCart() {
  revalidatePath("/cart")
}

function mapCartForDisplay(
  cart: NonNullable<Awaited<ReturnType<typeof fetchCartRaw>>>
): CartDisplay {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    attributes: cart.attributes,
    lines: cart.lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      attributes: node.attributes ?? [],
      cost: node.cost,
      merchandise: {
        id: node.merchandise.id,
        title: node.merchandise.title,
        imageUrl:
          node.merchandise.image?.url ??
          node.merchandise.product.featuredImage?.url ??
          null,
        imageAlt:
          node.merchandise.image?.altText ??
          node.merchandise.product.featuredImage?.altText ??
          node.merchandise.product.title,
        product: {
          title: node.merchandise.product.title,
          handle: node.merchandise.product.handle,
        },
      },
    })),
  }
}

async function fetchCartRaw(cartId: string) {
  type Res = {
    cart: {
      id: string
      checkoutUrl: string
      totalQuantity: number
      cost: {
        totalAmount: { amount: string; currencyCode: string }
      }
      attributes: CartAttribute[]
      lines: {
        edges: {
          node: {
            id: string
            quantity: number
            cost: {
              totalAmount: { amount: string; currencyCode: string }
            }
            attributes: CartAttribute[]
            merchandise: {
              id: string
              title: string
              image?: { url: string; altText?: string | null } | null
              product: {
                title: string
                handle: string
                featuredImage?: { url: string; altText?: string | null } | null
              }
            }
          }
        }[]
      }
    } | null
  }

  const data = await storefrontRequest<Res>(CART_QUERY, { cartId }, { cache: "no-store" })
  return data.cart
}

export type CartLineInputAttr = { key: string; value: string }

export type AddLineInput = {
  merchandiseId: string
  quantity: number
  attributes?: CartLineInputAttr[]
}

function normalizeAttrKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
}

function attrByNormalizedKey(
  attrs: CartLineInputAttr[] | undefined,
  keys: string[]
): string | null {
  if (!attrs?.length) return null
  const wanted = new Set(keys.map(normalizeAttrKey))
  const found = attrs.find((a) => wanted.has(normalizeAttrKey(a.key)))
  const value = found?.value?.trim()
  return value || null
}

/**
 * Guarantee every line carries `Fundraiser slug` (and title when known).
 * Line properties survive checkout even if cart-level attributes fail to update,
 * so the webhook can always attribute fundraiser-page orders.
 */
function ensureFundraiserAttribution(
  lines: AddLineInput[],
  cartAttributes?: CartLineInputAttr[]
): { lines: AddLineInput[]; cartAttributes: CartLineInputAttr[] | undefined } {
  const slugFromCart = attrByNormalizedKey(cartAttributes, [
    "Fundraiser slug",
    "Fundraiser handle",
    "fundraiser_slug",
    "fundraiser_handle",
  ])
  const titleFromCart = attrByNormalizedKey(cartAttributes, ["Fundraiser"])

  let slug =
    slugFromCart ??
    lines
      .map((l) =>
        attrByNormalizedKey(l.attributes, [
          "Fundraiser slug",
          "Fundraiser handle",
          "fundraiser_slug",
          "fundraiser_handle",
        ])
      )
      .find(Boolean) ??
    null
  let title =
    titleFromCart ??
    lines.map((l) => attrByNormalizedKey(l.attributes, ["Fundraiser"])).find(Boolean) ??
    null

  const ensuredLines = lines.map((line) => {
    const attrs = [...(line.attributes ?? [])]
    const lineSlug = attrByNormalizedKey(attrs, [
      "Fundraiser slug",
      "Fundraiser handle",
      "fundraiser_slug",
      "fundraiser_handle",
    ])
    const lineTitle = attrByNormalizedKey(attrs, ["Fundraiser"])

    if (!lineSlug && slug) {
      attrs.push({ key: "Fundraiser slug", value: slug })
    }
    if (!lineTitle && title) {
      attrs.push({ key: "Fundraiser", value: title })
    }
    if (lineSlug && !slug) slug = lineSlug
    if (lineTitle && !title) title = lineTitle

    return { ...line, attributes: attrs.length ? attrs : line.attributes }
  })

  if (!slug) {
    return { lines: ensuredLines, cartAttributes }
  }

  const nextCart = [...(cartAttributes ?? [])]
  if (!attrByNormalizedKey(nextCart, ["Fundraiser slug", "fundraiser_slug", "Fundraiser handle"])) {
    nextCart.push({ key: "Fundraiser slug", value: slug })
  }
  if (title && !attrByNormalizedKey(nextCart, ["Fundraiser"])) {
    nextCart.push({ key: "Fundraiser", value: title })
  }

  return { lines: ensuredLines, cartAttributes: nextCart }
}

async function setCartCookie(cartId: string) {
  const jar = await cookies()
  jar.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  })
}

async function getCartIdFromCookie(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(CART_COOKIE_NAME)?.value
}

function cartUserErrors(
  userErrors: { field: string[]; message: string }[] | undefined,
  label: string
) {
  if (userErrors?.length) {
    throw new Error(`${label}: ${userErrors.map((e) => e.message).join("; ")}`)
  }
}

async function updateCartAttributes(
  cartId: string,
  attributes: CartLineInputAttr[] | undefined
): Promise<void> {
  if (!attributes?.length) return

  type Res = {
    cartAttributesUpdate: {
      cart: { id: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }
  const data = await storefrontRequest<Res>(
    CART_ATTRIBUTES_UPDATE_MUTATION,
    {
      cartId,
      attributes: attributes.map((a) => ({ key: a.key, value: a.value })),
    },
    { cache: "no-store" }
  )
  cartUserErrors(data.cartAttributesUpdate.userErrors, "cartAttributesUpdate")
  if (!data.cartAttributesUpdate.cart) {
    throw new Error("cartAttributesUpdate returned no cart")
  }
}

export async function addCartLines(
  lines: AddLineInput[],
  cartAttributes?: CartLineInputAttr[]
): Promise<void> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured.")
  }
  getShopifyConfig()

  const ensured = ensureFundraiserAttribution(lines, cartAttributes)
  const lineInputs = ensured.lines.map((l) => ({
    merchandiseId: l.merchandiseId,
    quantity: l.quantity,
    attributes: l.attributes?.map((a) => ({ key: a.key, value: a.value })),
  }))
  const cartAttrs = ensured.cartAttributes

  const existingId = await getCartIdFromCookie()

  if (!existingId) {
    type CreateRes = {
      cartCreate: {
        cart: { id: string; checkoutUrl: string } | null
        userErrors: { field: string[]; message: string }[]
      }
    }
    const data = await storefrontRequest<CreateRes>(
      CART_CREATE_MUTATION,
      {
        input: {
          lines: lineInputs,
          attributes: cartAttrs?.map((a) => ({ key: a.key, value: a.value })),
        },
      },
      { cache: "no-store" }
    )
    cartUserErrors(data.cartCreate.userErrors, "cartCreate")
    const cart = data.cartCreate.cart
    if (!cart?.id) throw new Error("cartCreate returned no cart")
    await setCartCookie(cart.id)
    revalidateCart()
    return
  }

  type AddRes = {
    cartLinesAdd: {
      cart: { id: string; checkoutUrl: string; totalQuantity: number } | null
      userErrors: { field: string[]; message: string }[]
    }
  }
  const addData = await storefrontRequest<AddRes>(
    CART_LINES_ADD_MUTATION,
    { cartId: existingId, lines: lineInputs },
    { cache: "no-store" }
  )
  cartUserErrors(addData.cartLinesAdd.userErrors, "cartLinesAdd")

  if (!addData.cartLinesAdd.cart) {
    type CreateRes = {
      cartCreate: {
        cart: { id: string; checkoutUrl: string } | null
        userErrors: { field: string[]; message: string }[]
      }
    }
    const fresh = await storefrontRequest<CreateRes>(
      CART_CREATE_MUTATION,
      {
        input: {
          lines: lineInputs,
          attributes: cartAttrs?.map((a) => ({ key: a.key, value: a.value })),
        },
      },
      { cache: "no-store" }
    )
    cartUserErrors(fresh.cartCreate.userErrors, "cartCreate")
    const cart = fresh.cartCreate.cart
    if (!cart?.id) throw new Error("cartCreate returned no cart")
    await setCartCookie(cart.id)
    revalidateCart()
    return
  }

  const cartId = addData.cartLinesAdd.cart.id
  await setCartCookie(cartId)

  // Cart attributes become order note_attributes; line attributes become line
  // item properties. Keep both in sync for existing carts. The line property
  // remains the primary fallback if this best-effort cart update fails.
  try {
    await updateCartAttributes(cartId, cartAttrs)
  } catch (error) {
    console.warn(
      "[shopify cart] Failed to update cart fundraiser attributes; line attributes remain set",
      error instanceof Error ? error.message : error
    )
  }
  revalidateCart()
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<void> {
  if (!isShopifyConfigured()) throw new Error("Shopify is not configured.")
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) return

  if (quantity < 1) {
    await removeCartLine(lineId)
    return
  }

  type Res = {
    cartLinesUpdate: {
      cart: { id: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }
  const data = await storefrontRequest<Res>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    { cache: "no-store" }
  )
  cartUserErrors(data.cartLinesUpdate.userErrors, "cartLinesUpdate")
  revalidateCart()
}

export async function removeCartLine(lineId: string): Promise<void> {
  if (!isShopifyConfigured()) throw new Error("Shopify is not configured.")
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) return

  type Res = {
    cartLinesRemove: {
      cart: { id: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }
  const data = await storefrontRequest<Res>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
    { cache: "no-store" }
  )
  cartUserErrors(data.cartLinesRemove.userErrors, "cartLinesRemove")
  revalidateCart()
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCartForDisplay()
  return cart?.totalQuantity ?? 0
}

export async function redirectToShopifyCheckout(): Promise<never> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured.")
  }
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) {
    redirect("/cart")
  }

  type Res = {
    cart: {
      checkoutUrl: string
    } | null
  }
  const data = await storefrontRequest<Res>(CART_QUERY, { cartId }, { cache: "no-store" })
  const url = data.cart?.checkoutUrl
  if (!url) {
    redirect("/cart")
  }
  redirect(url)
}

export async function getCartForDisplay(): Promise<CartDisplay | null> {
  if (!isShopifyConfigured()) return null
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) return null

  try {
    const cart = await fetchCartRaw(cartId)
    if (!cart) return null
    return mapCartForDisplay(cart)
  } catch {
    return null
  }
}
