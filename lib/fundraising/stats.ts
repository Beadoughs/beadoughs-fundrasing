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
  email?: string | null
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
  key: string
): string | null {
  if (!rows) return null
  const found = rows.find((r) => (r.name ?? "").trim().toLowerCase() === key.toLowerCase())
  const v = found?.value?.trim()
  return v || null
}

/**
 * Resolve fundraiser collection handle from cart/order attributes.
 * Prefers note_attributes "Fundraiser slug", then line item properties.
 */
export function resolveFundraiserSlug(order: ShopifyPaidOrderPayload): string | null {
  const fromNote = attrValue(order.note_attributes, "Fundraiser slug")
  if (fromNote) return fromNote

  for (const line of order.line_items ?? []) {
    const fromLine = attrValue(line.properties, "Fundraiser slug")
    if (fromLine) return fromLine
  }

  return null
}

/** Count boxes: sum of line item quantities (1 product unit = 1 box). */
export function countBoxesInOrder(order: ShopifyPaidOrderPayload): number {
  let total = 0
  for (const line of order.line_items ?? []) {
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
  | { status: "applied"; slug: string; boxesAdded: number; boxesSold: number }

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

  const slug = resolveFundraiserSlug(order)
  if (!slug) {
    return { status: "skipped", reason: "no_fundraiser_slug" }
  }

  const boxesAdded = countBoxesInOrder(order)
  if (boxesAdded <= 0) {
    await markOrderStatsApplied(orderGid)
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
    boxesAdded,
    boxesSold: next.boxesSold,
  }
}
