import {
  buyerKeyFromOrder,
  formatBuyerDisplayName,
} from "@/lib/fundraising/display-name"
import type { FundraiserStats, LeaderboardEntry } from "@/lib/fundraising/types"
import {
  getCollectionStatsByHandle,
  isOrderStatsApplied,
  markOrderStatsApplied,
  orderGidFromRestId,
  resolveUniqueFundraiserHandleForProducts,
  saveCollectionStats,
} from "@/lib/shopify/admin"
import { creditGiveawayBoxes } from "@/lib/shopify/giveaway-ledger"
import { isGiveawayEnabled } from "@/lib/fundraising/giveaway"

export type ShopifyAttrRow = {
  name?: string
  key?: string
  value?: string
}

export type ShopifyPaidOrderPayload = {
  id: number | string
  name?: string | null
  email?: string | null
  tags?: string | string[] | null
  discount_codes?: { code?: string | null }[] | null
  customer?: {
    id?: number | string
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  } | null
  billing_address?: {
    first_name?: string | null
    last_name?: string | null
  } | null
  note_attributes?: ShopifyAttrRow[] | null
  line_items?: {
    quantity?: number
    product_id?: number | string | null
    properties?: ShopifyAttrRow[] | null
  }[] | null
}

function attrRowName(row: ShopifyAttrRow): string {
  return row.name ?? row.key ?? ""
}

function attrValue(
  rows: ShopifyAttrRow[] | null | undefined,
  keys: string[]
): string | null {
  if (!rows) return null
  const normalizedKeys = new Set(keys.map(normalizeAttributeName))
  const found = rows.find((r) =>
    normalizedKeys.has(normalizeAttributeName(attrRowName(r)))
  )
  const v = found?.value?.trim()
  return v || null
}

function normalizeAttributeName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
}

function normalizeFundraiserSlug(value: string | null): string | null {
  if (!value) return null
  const slug = value.trim().toLowerCase()
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : null
}

const FUNDRAISER_SLUG_KEYS = [
  "Fundraiser slug",
  "Fundraiser handle",
  "fundraiser_slug",
  "fundraiser_handle",
]

export type FundraiserAttributionSource =
  | "note_attribute"
  | "line_property"
  | "order_tag"
  | "discount_code"
  | "product_collection"

export type FundraiserAttribution = {
  slug: string
  source: FundraiserAttributionSource
  /** When source is product_collection, only these product ids should count. */
  matchedProductIds?: string[]
}

function fundraiserSlugFromAttributes(
  rows: ShopifyAttrRow[] | null | undefined
): string | null {
  return normalizeFundraiserSlug(attrValue(rows, FUNDRAISER_SLUG_KEYS))
}

function fundraiserSlugFromTags(tags: ShopifyPaidOrderPayload["tags"]): string | null {
  const values = Array.isArray(tags) ? tags : (tags ?? "").split(",")
  for (const tag of values) {
    const match = tag.trim().match(/^fundraiser(?:[\s_-]?slug)?\s*[:=]\s*(.+)$/i)
    const slug = normalizeFundraiserSlug(match?.[1] ?? null)
    if (slug) return slug
  }
  return null
}

function fundraiserSlugFromDiscountCodes(
  codes: ShopifyPaidOrderPayload["discount_codes"]
): string | null {
  for (const row of codes ?? []) {
    const match = row.code?.trim().match(/^fundraiser[-_:](.+)$/i)
    const slug = normalizeFundraiserSlug(match?.[1] ?? null)
    if (slug) return slug
  }
  return null
}

function productIdsFromOrder(order: ShopifyPaidOrderPayload): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const line of order.line_items ?? []) {
    if (line.product_id == null || line.product_id === "") continue
    const id = String(line.product_id)
    if (seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

/**
 * Resolve fundraiser collection handle from cart/order attributes.
 * Prefers line item properties because they identify the purchased item and
 * cannot be made stale by reusing a cart, then checks order note attributes.
 * Explicit `fundraiser:handle` tags and `FUNDRAISER-handle` discount codes are
 * supported as operational fallbacks for orders created outside this site.
 */
export function resolveFundraiserAttribution(
  order: ShopifyPaidOrderPayload
): FundraiserAttribution | null {
  for (const line of order.line_items ?? []) {
    const fromLine = fundraiserSlugFromAttributes(line.properties)
    if (fromLine) return { slug: fromLine, source: "line_property" }
  }

  const fromNote = fundraiserSlugFromAttributes(order.note_attributes)
  if (fromNote) return { slug: fromNote, source: "note_attribute" }

  const fromTag = fundraiserSlugFromTags(order.tags)
  if (fromTag) return { slug: fromTag, source: "order_tag" }

  const fromDiscount = fundraiserSlugFromDiscountCodes(order.discount_codes)
  if (fromDiscount) return { slug: fromDiscount, source: "discount_code" }

  return null
}

/**
 * Same as resolveFundraiserAttribution, then falls back to product→collection
 * membership via Admin API when Fundraiser slug is missing on the order.
 * Detects fundraiser collections by configured handles OR fundraiser metafields
 * (goal_boxes / boxes_sold / leaderboard), so native attribution is not required.
 */
export async function resolveFundraiserAttributionWithFallbacks(
  order: ShopifyPaidOrderPayload
): Promise<FundraiserAttribution | null> {
  const direct = resolveFundraiserAttribution(order)
  if (direct) return direct

  const productIds = productIdsFromOrder(order)
  if (!productIds.length) return null

  try {
    const match = await resolveUniqueFundraiserHandleForProducts(productIds)
    const slug = normalizeFundraiserSlug(match?.handle ?? null)
    if (slug && match) {
      return {
        slug,
        source: "product_collection",
        matchedProductIds: match.matchedProductIds,
      }
    }
  } catch (error) {
    console.warn(
      "[fundraising] Product-collection attribution fallback failed",
      error instanceof Error ? error.message : error
    )
  }

  return null
}

export function resolveFundraiserSlug(order: ShopifyPaidOrderPayload): string | null {
  return resolveFundraiserAttribution(order)?.slug ?? null
}

/**
 * Count boxes (1 product unit = 1 box).
 * - Line-property attribution: only lines for the resolved fundraiser count.
 * - Product-collection attribution: only products that uniquely matched count.
 * - Otherwise: sum all line quantities.
 */
export function countBoxesInOrder(
  order: ShopifyPaidOrderPayload,
  fundraiserSlug?: string,
  options?: { matchedProductIds?: string[] }
): number {
  const matchedProducts = options?.matchedProductIds?.length
    ? new Set(options.matchedProductIds.map(String))
    : null

  const hasLineAttribution = (order.line_items ?? []).some(
    (line) => fundraiserSlugFromAttributes(line.properties) != null
  )
  let total = 0
  for (const line of order.line_items ?? []) {
    if (matchedProducts) {
      if (line.product_id == null || !matchedProducts.has(String(line.product_id))) {
        continue
      }
    } else if (hasLineAttribution && fundraiserSlug) {
      const lineSlug = fundraiserSlugFromAttributes(line.properties)
      if (lineSlug !== fundraiserSlug) continue
    }
    const q = Number(line.quantity ?? 0)
    if (Number.isFinite(q) && q > 0) total += Math.floor(q)
  }
  return total
}

function mergeLeaderboard(
  existing: LeaderboardEntry[],
  entry: LeaderboardEntry
): LeaderboardEntry[] {
  const map = new Map(existing.map((e) => [e.key, e]))
  const prev = map.get(entry.key)
  if (prev) {
    map.set(entry.key, {
      key: entry.key,
      name: entry.name || prev.name,
      boxes: prev.boxes + entry.boxes,
    })
  } else {
    map.set(entry.key, entry)
  }
  return [...map.values()].sort((a, b) => b.boxes - a.boxes)
}

export type ApplyOrderStatsResult =
  | { status: "skipped"; reason: string }
  | {
      status: "applied"
      slug: string
      attributionSource: FundraiserAttributionSource
      boxesAdded: number
      boxesSold: number
    }

/**
 * Apply a paid Shopify order to the matching fundraiser collection stats.
 */
export async function applyPaidOrderToFundraiserStats(
  order: ShopifyPaidOrderPayload
): Promise<ApplyOrderStatsResult> {
  const orderGid = orderGidFromRestId(order.id)

  if (await isOrderStatsApplied(orderGid)) {
    return { status: "skipped", reason: "already_applied" }
  }

  const attribution = await resolveFundraiserAttributionWithFallbacks(order)
  if (!attribution) {
    console.warn("[fundraising] Could not attribute paid order", {
      orderId: String(order.id),
      orderName: order.name ?? null,
      productIds: productIdsFromOrder(order),
      noteAttributeKeys: (order.note_attributes ?? []).map((a) => attrRowName(a)),
      linePropertyKeys: (order.line_items ?? []).flatMap((line) =>
        (line.properties ?? []).map((p) => attrRowName(p))
      ),
    })
    return { status: "skipped", reason: "no_fundraiser_slug" }
  }
  const { slug } = attribution

  const boxesAdded = countBoxesInOrder(order, slug, {
    matchedProductIds: attribution.matchedProductIds,
  })
  if (boxesAdded <= 0) {
    return { status: "skipped", reason: "no_boxes" }
  }

  const current = await getCollectionStatsByHandle(slug)
  if (!current) {
    return { status: "skipped", reason: "collection_not_found" }
  }

  const first =
    order.customer?.first_name ?? order.billing_address?.first_name ?? null
  const last = order.customer?.last_name ?? order.billing_address?.last_name ?? null
  const displayName = formatBuyerDisplayName(first, last)
  const key = buyerKeyFromOrder({
    customerId: order.customer?.id ?? null,
    email: order.customer?.email ?? order.email ?? null,
    displayName,
  })

  const next: FundraiserStats = {
    boxesSold: current.stats.boxesSold + boxesAdded,
    leaderboard: mergeLeaderboard(current.stats.leaderboard, {
      key,
      name: displayName,
      boxes: boxesAdded,
    }),
  }

  await saveCollectionStats(current.collectionId, next)

  if (isGiveawayEnabled()) {
    try {
      const email = (order.customer?.email ?? order.email ?? null)?.trim() || null
      await creditGiveawayBoxes({
        key,
        email,
        name: displayName,
        boxesAdded,
        orderId: String(order.id),
      })
    } catch (error) {
      console.warn(
        "[fundraising] Giveaway ledger update failed; fundraiser stats were still saved",
        error instanceof Error ? error.message : error
      )
    }
  }

  await markOrderStatsApplied(orderGid)

  return {
    status: "applied",
    slug,
    attributionSource: attribution.source,
    boxesAdded,
    boxesSold: next.boxesSold,
  }
}
