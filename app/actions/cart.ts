"use server"

import { cookies } from "next/headers"
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

export type CartLineInputAttr = { key: string; value: string }

export type AddLineInput = {
  merchandiseId: string
  quantity: number
  attributes?: CartLineInputAttr[]
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

  const lineInputs = lines.map((l) => ({
    merchandiseId: l.merchandiseId,
    quantity: l.quantity,
    attributes: l.attributes?.map((a) => ({ key: a.key, value: a.value })),
  }))

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
          attributes: cartAttributes?.map((a) => ({ key: a.key, value: a.value })),
        },
      },
      { cache: "no-store" }
    )
    cartUserErrors(data.cartCreate.userErrors, "cartCreate")
    const cart = data.cartCreate.cart
    if (!cart?.id) throw new Error("cartCreate returned no cart")
    await setCartCookie(cart.id)
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
          attributes: cartAttributes?.map((a) => ({ key: a.key, value: a.value })),
        },
      },
      { cache: "no-store" }
    )
    cartUserErrors(fresh.cartCreate.userErrors, "cartCreate")
    const cart = fresh.cartCreate.cart
    if (!cart?.id) throw new Error("cartCreate returned no cart")
    await setCartCookie(cart.id)
    return
  }

  const cartId = addData.cartLinesAdd.cart.id
  await setCartCookie(cartId)

  // Cart attributes become order note_attributes; line attributes become line
  // item properties. Keep both in sync for existing carts. The line property
  // remains the primary fallback if this best-effort cart update fails.
  try {
    await updateCartAttributes(cartId, cartAttributes)
  } catch (error) {
    console.warn(
      "[shopify cart] Failed to update cart fundraiser attributes; line attributes remain set",
      error instanceof Error ? error.message : error
    )
  }
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<void> {
  if (!isShopifyConfigured()) throw new Error("Shopify is not configured.")
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) return

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

export async function getCartForDisplay() {
  if (!isShopifyConfigured()) return null
  getShopifyConfig()
  const cartId = await getCartIdFromCookie()
  if (!cartId) return null

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
              product: { title: string; handle: string }
            }
          }
        }[]
      }
    } | null
  }

  try {
    const data = await storefrontRequest<Res>(CART_QUERY, { cartId }, { cache: "no-store" })
    return data.cart
  } catch {
    return null
  }
}
