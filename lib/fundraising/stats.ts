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
  saveCollectionStats,
} from "@/lib/shopify/admin"

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
  note_attributes?: { name?: string; value?: string }[] | null
  line_items?: {
    quantity?: number
    properties?: { name?: string; value?: string }[] | null
  }[] | null
}

function attrValue(
  rows: { name?: string; value?: string }[] | null | undefined,
  keys: string[]
): string | null {
  if (!rows) return null
  const normalizedKeys = new Set(keys.map(normalizeAttributeName))
  const found = rows.find((r) => normalizedKeys.has(normalizeAttributeName(r.name ?? "")))
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

export type FundraiserAttribution = {
  slug: string
  source: FundraiserAttributionSource
}

function fundraiserSlugFromAttributes(
  rows: { name?: string; value?: string }[] | null | undefined
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

export function resolveFundraiserSlug(order: ShopifyPaidOrderPayload): string | null {
  return resolveFundraiserAttribution(order)?.slug ?? null
}

/**
 * Count boxes (1 product unit = 1 box). When line properties identify one or
 * more fundraisers, only lines attributed to the resolved fundraiser count.
 * This avoids counting unrelated products in a mixed cart.
 */
export function countBoxesInOrder(
  order: ShopifyPaidOrderPayload,
  fundraiserSlug?: string
): number {
  const hasLineAttribution = (order.line_items ?? []).some(
    (line) => fundraiserSlugFromAttributes(line.properties) != null
  )
  let total = 0
  for (const line of order.line_items ?? []) {
    if (hasLineAttribution && fundraiserSlug) {
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

  const attribution = resolveFundraiserAttribution(order)
  if (!attribution) {
    return { status: "skipped", reason: "no_fundraiser_slug" }
  }
  const { slug } = attribution

  const boxesAdded = countBoxesInOrder(order, slug)
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
  await markOrderStatsApplied(orderGid)

  return {
    status: "applied",
    slug,
    attributionSource: attribution.source,
    boxesAdded,
    boxesSold: next.boxesSold,
  }
}
