import { storefrontRequest } from "./storefront"
import {
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTION_CARD_ONLY_QUERY,
  COLLECTIONS_FIRST_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries"
import { getFundraiserCollectionHandles, isShopifyAdminConfigured, type FundraiserRegion } from "./config"
import { getCollectionDisplayMetafieldsByHandle } from "./admin"
import type { LeaderboardEntry } from "@/lib/fundraising/types"

export type FundraiserCollectionCard = {
  id: string
  handle: string
  title: string
  description: string
  imageUrl: string | null
  imageAlt: string | null
  goalBoxes: number | null
  boxesSold: number
  leaderboard: LeaderboardEntry[]
  goalAmount: number | null
  raisedAmount: number | null
  endDate: string | null
  organization: string | null
  supportersCount: number | null
}

export type FundraiserProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  priceAmount: string
  currencyCode: string
}

export type FundraiserProduct = {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  imageUrl: string | null
  imageAlt: string | null
  minPriceAmount: string
  minPriceCurrency: string
  variants: FundraiserProductVariant[]
}

export type FundraiserDetail = FundraiserCollectionCard & {
  descriptionHtml: string
  products: FundraiserProduct[]
}

type MetafieldNode = { value?: string | null } | null | undefined

type CollectionMetafields = {
  id: string
  handle: string
  title: string
  description: string
  image?: { url: string; altText?: string | null } | null
  goalBoxes?: MetafieldNode
  goalBoxesCustom?: MetafieldNode
  boxesSold?: MetafieldNode
  boxesSoldCustom?: MetafieldNode
  leaderboard?: MetafieldNode
  leaderboardCustom?: MetafieldNode
  goalAmount?: MetafieldNode
  raisedAmount?: MetafieldNode
  endDate?: MetafieldNode
  organization?: MetafieldNode
  supportersCount?: MetafieldNode
}

function firstMetaValue(...nodes: MetafieldNode[]): string | null {
  for (const node of nodes) {
    const v = node?.value
    if (v != null && String(v).trim() !== "") return String(v)
  }
  return null
}

function parseIntMeta(value: string | null | undefined): number | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed === "") return null
  // Integer metafields are strings; also accept whole-number decimals like "500.0".
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function parseLeaderboard(raw: string | null | undefined): LeaderboardEntry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const r = row as Record<string, unknown>
        const key = typeof r.key === "string" ? r.key : null
        const name = typeof r.name === "string" ? r.name : null
        const boxes = typeof r.boxes === "number" ? r.boxes : Number(r.boxes)
        if (!key || !name || !Number.isFinite(boxes)) return null
        return { key, name, boxes: Math.max(0, Math.floor(boxes)) }
      })
      .filter((e): e is LeaderboardEntry => e != null)
      .sort((a, b) => b.boxes - a.boxes)
  } catch {
    return []
  }
}

function mapCollectionCard(node: CollectionMetafields): FundraiserCollectionCard {
  const goalBoxes = parseIntMeta(firstMetaValue(node.goalBoxes, node.goalBoxesCustom))
  const boxesSoldRaw = parseIntMeta(firstMetaValue(node.boxesSold, node.boxesSoldCustom))
  const leaderboard = parseLeaderboard(
    firstMetaValue(node.leaderboard, node.leaderboardCustom) ?? undefined
  )
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    imageUrl: node.image?.url ?? null,
    imageAlt: node.image?.altText ?? null,
    goalBoxes,
    boxesSold: boxesSoldRaw ?? 0,
    leaderboard,
    goalAmount: parseIntMeta(node.goalAmount?.value ?? undefined),
    raisedAmount: parseIntMeta(node.raisedAmount?.value ?? undefined),
    endDate: node.endDate?.value ?? null,
    organization: node.organization?.value ?? null,
    supportersCount: parseIntMeta(node.supportersCount?.value ?? undefined),
  }
}

/** When Storefront metafields are missing or stale, prefer Admin (beadoughs then custom). */
async function withAdminMetafieldFallback(
  card: FundraiserCollectionCard
): Promise<FundraiserCollectionCard> {
  if (!isShopifyAdminConfigured()) return card

  const admin = await getCollectionDisplayMetafieldsByHandle(card.handle)
  if (!admin) return card

  // Prefer Admin for live counters: Storefront may only expose custom.* while the
  // webhook writes beadoughs.*, leaving a stale custom.boxes_sold visible forever.
  const boxesSold =
    admin.boxesSold != null && admin.boxesSold >= 0
      ? Math.max(card.boxesSold, admin.boxesSold)
      : card.boxesSold
  const leaderboard =
    admin.leaderboard != null && admin.leaderboard.length > 0
      ? admin.leaderboard
      : card.leaderboard
  const goalBoxes =
    admin.goalBoxes != null && admin.goalBoxes > 0 ? admin.goalBoxes : card.goalBoxes

  return {
    ...card,
    goalBoxes: goalBoxes ?? card.goalBoxes,
    boxesSold,
    leaderboard,
  }
}

export function daysLeftFromEndDate(endDateIso: string | null): number | null {
  if (!endDateIso) return null
  const end = new Date(endDateIso)
  if (Number.isNaN(end.getTime())) return null
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/** Progress percent for boxes sold vs goal (or legacy dollar fields). */
export function percentRaised(raised: number | null, goal: number | null): number {
  if (goal == null || goal <= 0 || raised == null) return 0
  return Math.min(100, Math.round((raised / goal) * 100))
}

export function percentBoxesSold(boxesSold: number, goalBoxes: number | null): number {
  return percentRaised(boxesSold, goalBoxes)
}

type CollectionByHandleResponse = {
  collection: (CollectionMetafields & {
    descriptionHtml: string
    products: {
      edges: {
        node: {
          id: string
          title: string
          handle: string
          description: string
          descriptionHtml?: string | null
          featuredImage?: { url: string; altText?: string | null } | null
          priceRange: {
            minVariantPrice: { amount: string; currencyCode: string }
          }
          variants: {
            edges: {
              node: {
                id: string
                title: string
                availableForSale: boolean
                price: { amount: string; currencyCode: string }
              }
            }[]
          }
        }
      }[]
    }
  }) | null
}

function mapProductNode(p: {
  id: string
  title: string
  handle: string
  description?: string | null
  descriptionHtml?: string | null
  featuredImage?: { url: string; altText?: string | null } | null
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  variants: {
    edges: {
      node: {
        id: string
        title: string
        availableForSale: boolean
        price: { amount: string; currencyCode: string }
      }
    }[]
  }
}): FundraiserProduct {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? "",
    descriptionHtml: p.descriptionHtml ?? "",
    imageUrl: p.featuredImage?.url ?? null,
    imageAlt: p.featuredImage?.altText ?? null,
    minPriceAmount: p.priceRange.minVariantPrice.amount,
    minPriceCurrency: p.priceRange.minVariantPrice.currencyCode,
    variants: p.variants.edges.map(({ node: v }) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      priceAmount: v.price.amount,
      currencyCode: v.price.currencyCode,
    })),
  }
}

export async function getFundraiserByHandle(handle: string): Promise<FundraiserDetail | null> {
  const data = await storefrontRequest<CollectionByHandleResponse>(
    COLLECTION_BY_HANDLE_QUERY,
    { handle },
    { revalidate: 30 }
  )
  const c = data.collection
  if (!c) return null

  const card = await withAdminMetafieldFallback(mapCollectionCard(c))
  const products: FundraiserProduct[] = c.products.edges.map(({ node: p }) => mapProductNode(p))

  return {
    ...card,
    descriptionHtml: c.descriptionHtml ?? "",
    products,
  }
}

type ProductByHandleResponse = {
  product: {
    id: string
    title: string
    handle: string
    description: string
    descriptionHtml?: string | null
    featuredImage?: { url: string; altText?: string | null } | null
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string }
    }
    variants: {
      edges: {
        node: {
          id: string
          title: string
          availableForSale: boolean
          price: { amount: string; currencyCode: string }
        }
      }[]
    }
    collections: {
      edges: {
        node: { handle: string }
      }[]
    }
  } | null
}

export type FundraiserProductPage = {
  fundraiser: Pick<FundraiserCollectionCard, "handle" | "title" | "organization">
  product: FundraiserProduct
}

/**
 * Load a product by handle and ensure it belongs to the fundraiser collection.
 */
export async function getFundraiserProduct(
  fundraiserHandle: string,
  productHandle: string
): Promise<FundraiserProductPage | null> {
  const [card, productData] = await Promise.all([
    getFundraiserCardByHandle(fundraiserHandle),
    storefrontRequest<ProductByHandleResponse>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle: productHandle },
      { revalidate: 30 }
    ),
  ])

  if (!card || !productData.product) return null

  const inCollection = productData.product.collections.edges.some(
    ({ node }) => node.handle === fundraiserHandle
  )
  if (!inCollection) {
    // Fallback: some catalogs expose products via collection query more reliably.
    const detail = await getFundraiserByHandle(fundraiserHandle)
    if (!detail?.products.some((p) => p.handle === productHandle)) return null
  }

  return {
    fundraiser: {
      handle: card.handle,
      title: card.title,
      organization: card.organization,
    },
    product: mapProductNode(productData.product),
  }
}

type CollectionCardOnlyResponse = {
  collection: CollectionMetafields | null
}

export async function getFundraiserCardByHandle(
  handle: string
): Promise<FundraiserCollectionCard | null> {
  const data = await storefrontRequest<CollectionCardOnlyResponse>(
    COLLECTION_CARD_ONLY_QUERY,
    { handle },
    { revalidate: 30 }
  )
  if (!data.collection) return null
  return withAdminMetafieldFallback(mapCollectionCard(data.collection))
}

export async function listFundraiserCards(
  region: FundraiserRegion = "tas"
): Promise<FundraiserCollectionCard[]> {
  const handles = getFundraiserCollectionHandles(region)
  const results = await Promise.all(handles.map((h) => getFundraiserCardByHandle(h)))
  return results.filter((c): c is FundraiserCollectionCard => c != null)
}

type CollectionsFirstResponse = {
  collections: {
    edges: {
      node: CollectionMetafields
    }[]
  }
}

/** Up to `first` collections, as returned by Storefront API (order is Shopify-defined).
 * Excludes QLD + private handles so the public /fundraisers + homepage never surface them.
 */
export async function listFundraiserCardsFromStore(
  first: number = 48
): Promise<FundraiserCollectionCard[]> {
  const hiddenHandles = new Set(
    [
      ...getFundraiserCollectionHandles("qld"),
      ...getFundraiserCollectionHandles("private"),
    ].map((h) => h.toLowerCase())
  )
  const data = await storefrontRequest<CollectionsFirstResponse>(
    COLLECTIONS_FIRST_QUERY,
    { first },
    { revalidate: 30 }
  )
  const cards = await Promise.all(
    data.collections.edges.map(({ node }) => withAdminMetafieldFallback(mapCollectionCard(node)))
  )
  return cards.filter((c) => !hiddenHandles.has(c.handle.toLowerCase()))
}
