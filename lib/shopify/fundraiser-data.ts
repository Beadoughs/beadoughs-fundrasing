import { storefrontRequest } from "./storefront"
import {
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTION_CARD_ONLY_QUERY,
  COLLECTIONS_FIRST_QUERY,
} from "./queries"
import { getFundraiserCollectionHandles } from "./config"
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
  boxesSold?: MetafieldNode
  leaderboard?: MetafieldNode
  goalAmount?: MetafieldNode
  raisedAmount?: MetafieldNode
  endDate?: MetafieldNode
  organization?: MetafieldNode
  supportersCount?: MetafieldNode
}

function parseIntMeta(value: string | null | undefined): number | null {
  if (value == null || value === "") return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
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
  const boxesSoldRaw = parseIntMeta(node.boxesSold?.value ?? undefined)
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    imageUrl: node.image?.url ?? null,
    imageAlt: node.image?.altText ?? null,
    goalBoxes: parseIntMeta(node.goalBoxes?.value ?? undefined),
    boxesSold: boxesSoldRaw ?? 0,
    leaderboard: parseLeaderboard(node.leaderboard?.value ?? undefined),
    goalAmount: parseIntMeta(node.goalAmount?.value ?? undefined),
    raisedAmount: parseIntMeta(node.raisedAmount?.value ?? undefined),
    endDate: node.endDate?.value ?? null,
    organization: node.organization?.value ?? null,
    supportersCount: parseIntMeta(node.supportersCount?.value ?? undefined),
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

export async function getFundraiserByHandle(handle: string): Promise<FundraiserDetail | null> {
  const data = await storefrontRequest<CollectionByHandleResponse>(
    COLLECTION_BY_HANDLE_QUERY,
    { handle },
    { revalidate: 30 }
  )
  const c = data.collection
  if (!c) return null

  const card = mapCollectionCard(c)
  const products: FundraiserProduct[] = c.products.edges.map(({ node: p }) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? "",
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
  }))

  return {
    ...card,
    descriptionHtml: c.descriptionHtml ?? "",
    products,
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
  return mapCollectionCard(data.collection)
}

export async function listFundraiserCards(): Promise<FundraiserCollectionCard[]> {
  const handles = getFundraiserCollectionHandles()
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

/** Up to `first` collections, as returned by Storefront API (order is Shopify-defined). */
export async function listFundraiserCardsFromStore(
  first: number = 48
): Promise<FundraiserCollectionCard[]> {
  const data = await storefrontRequest<CollectionsFirstResponse>(
    COLLECTIONS_FIRST_QUERY,
    { first },
    { revalidate: 30 }
  )
  return data.collections.edges.map(({ node }) => mapCollectionCard(node))
}
