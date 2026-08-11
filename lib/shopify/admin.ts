import {
  BEADOUGHS_COLLECTION_METAFIELDS,
  BEADOUGHS_METAFIELD_NAMESPACE,
  BEADOUGHS_ORDER_STATS_APPLIED_KEY,
  getAllFundraiserCollectionHandles,
  getShopifyAdminConfig,
} from "./config"
import type { FundraiserStats, LeaderboardEntry } from "@/lib/fundraising/types"

type AdminFetchOptions = {
  cache?: RequestCache
}

export async function adminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: AdminFetchOptions = {}
): Promise<T> {
  const config = getShopifyAdminConfig()
  if (!config) {
    throw new Error(
      "Missing SHOPIFY_ADMIN_ACCESS_TOKEN. Required for live box counters and leaderboards."
    )
  }

  const endpoint = `https://${config.domain}/admin/api/${config.apiVersion}/graphql.json`
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.token,
    },
    body: JSON.stringify({ query, variables }),
    cache: options.cache ?? "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Admin API HTTP ${res.status}: ${text.slice(0, 500)}`)
  }

  const body = (await res.json()) as {
    data?: T
    errors?: { message: string }[]
  }

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "))
  }

  if (body.data === undefined) {
    throw new Error("Admin API returned no data")
  }

  return body.data
}

function parseLeaderboardJson(raw: string | null | undefined): LeaderboardEntry[] {
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

const COLLECTION_STATS_BY_HANDLE = `
  query CollectionStatsByHandle($query: String!) {
    collections(first: 1, query: $query) {
      edges {
        node {
          id
          handle
          goalBoxes: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.goalBoxes}") {
            id
            value
          }
          goalBoxesCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.goalBoxes}") {
            id
            value
          }
          boxesSold: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.boxesSold}") {
            id
            value
          }
          boxesSoldCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.boxesSold}") {
            id
            value
          }
          leaderboard: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.leaderboard}") {
            id
            value
          }
          leaderboardCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.leaderboard}") {
            id
            value
          }
        }
      }
    }
  }
`

const ORDER_STATS_FLAG = `
  query OrderStatsFlag($id: ID!) {
    order(id: $id) {
      id
      statsApplied: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_ORDER_STATS_APPLIED_KEY}") {
        id
        value
      }
    }
  }
`

const METAFIELDS_SET = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

type AdminMetaValue = { value?: string | null } | null | undefined

function firstMetaValue(...nodes: AdminMetaValue[]): string | null {
  for (const node of nodes) {
    const v = node?.value
    if (v != null && String(v).trim() !== "") return String(v)
  }
  return null
}

function parseAdminInt(value: string | null | undefined): number | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed === "") return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

export type CollectionDisplayMetafields = {
  collectionId: string
  goalBoxes: number | null
  boxesSold: number | null
  leaderboard: LeaderboardEntry[] | null
}

type CollectionStatsNode = {
  id: string
  handle: string
  goalBoxes?: AdminMetaValue
  goalBoxesCustom?: AdminMetaValue
  boxesSold?: AdminMetaValue
  boxesSoldCustom?: AdminMetaValue
  leaderboard?: AdminMetaValue
  leaderboardCustom?: AdminMetaValue
}

function mapCollectionDisplayMetafields(
  c: CollectionStatsNode
): CollectionDisplayMetafields {
  const goalRaw = firstMetaValue(c.goalBoxes, c.goalBoxesCustom)
  const soldRaw = firstMetaValue(c.boxesSold, c.boxesSoldCustom)
  const boardRaw = firstMetaValue(c.leaderboard, c.leaderboardCustom)

  return {
    collectionId: c.id,
    goalBoxes: parseAdminInt(goalRaw),
    boxesSold: parseAdminInt(soldRaw),
    leaderboard: boardRaw != null ? parseLeaderboardJson(boardRaw) : null,
  }
}

async function fetchCollectionStatsNode(
  handle: string
): Promise<CollectionStatsNode | null> {
  const data = await adminGraphql<{
    collections: {
      edges: {
        node: CollectionStatsNode
      }[]
    }
  }>(COLLECTION_STATS_BY_HANDLE, { query: `handle:${handle}` })

  const c = data.collections.edges[0]?.node
  if (!c || c.handle !== handle) return null
  return c
}

/**
 * Admin read of collection fundraiser metafields. Prefers `beadoughs.*`, falls
 * back to `custom.*` (common when the value was saved under the default namespace).
 * Soft-fails (returns null) so Storefront pages can optionally enrich.
 */
export async function getCollectionDisplayMetafieldsByHandle(
  handle: string
): Promise<CollectionDisplayMetafields | null> {
  if (!getShopifyAdminConfig()) return null

  try {
    const c = await fetchCollectionStatsNode(handle)
    return c ? mapCollectionDisplayMetafields(c) : null
  } catch {
    return null
  }
}

/** Throws if Admin is missing/misconfigured — used by the orders/paid webhook. */
export async function getCollectionStatsByHandle(
  handle: string
): Promise<{ collectionId: string; stats: FundraiserStats } | null> {
  const c = await fetchCollectionStatsNode(handle)
  if (!c) return null

  const display = mapCollectionDisplayMetafields(c)
  return {
    collectionId: display.collectionId,
    stats: {
      boxesSold: display.boxesSold ?? 0,
      leaderboard: display.leaderboard ?? [],
    },
  }
}

export async function isOrderStatsApplied(orderGid: string): Promise<boolean> {
  const data = await adminGraphql<{
    order: {
      id: string
      statsApplied?: { value?: string | null } | null
    } | null
  }>(ORDER_STATS_FLAG, { id: orderGid })

  const value = data.order?.statsApplied?.value?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

export async function saveCollectionStats(
  collectionId: string,
  stats: FundraiserStats
): Promise<void> {
  const sorted = [...stats.leaderboard].sort((a, b) => b.boxes - a.boxes).slice(0, 50)
  const boxesValue = String(Math.max(0, Math.floor(stats.boxesSold)))
  const boardValue = JSON.stringify(sorted)

  // Write beadoughs.* (canonical) and custom.* (Storefront often only exposes custom).
  const data = await adminGraphql<{
    metafieldsSet: {
      userErrors: { message: string }[]
    }
  }>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId: collectionId,
        namespace: BEADOUGHS_METAFIELD_NAMESPACE,
        key: BEADOUGHS_COLLECTION_METAFIELDS.boxesSold,
        type: "number_integer",
        value: boxesValue,
      },
      {
        ownerId: collectionId,
        namespace: BEADOUGHS_METAFIELD_NAMESPACE,
        key: BEADOUGHS_COLLECTION_METAFIELDS.leaderboard,
        type: "json",
        value: boardValue,
      },
      {
        ownerId: collectionId,
        namespace: "custom",
        key: BEADOUGHS_COLLECTION_METAFIELDS.boxesSold,
        type: "number_integer",
        value: boxesValue,
      },
      {
        ownerId: collectionId,
        namespace: "custom",
        key: BEADOUGHS_COLLECTION_METAFIELDS.leaderboard,
        type: "json",
        value: boardValue,
      },
    ],
  })

  if (data.metafieldsSet.userErrors.length) {
    // If custom.* definitions use a different type, retry beadoughs-only so the
    // webhook still advances the canonical counters.
    const onlyBeadoughs = await adminGraphql<{
      metafieldsSet: {
        userErrors: { message: string }[]
      }
    }>(METAFIELDS_SET, {
      metafields: [
        {
          ownerId: collectionId,
          namespace: BEADOUGHS_METAFIELD_NAMESPACE,
          key: BEADOUGHS_COLLECTION_METAFIELDS.boxesSold,
          type: "number_integer",
          value: boxesValue,
        },
        {
          ownerId: collectionId,
          namespace: BEADOUGHS_METAFIELD_NAMESPACE,
          key: BEADOUGHS_COLLECTION_METAFIELDS.leaderboard,
          type: "json",
          value: boardValue,
        },
      ],
    })
    if (onlyBeadoughs.metafieldsSet.userErrors.length) {
      throw new Error(
        onlyBeadoughs.metafieldsSet.userErrors.map((e) => e.message).join("; ")
      )
    }
    console.warn(
      "[fundraising] Dual-write to custom.* failed; beadoughs.* saved",
      data.metafieldsSet.userErrors.map((e) => e.message).join("; ")
    )
  }
}

export async function markOrderStatsApplied(orderGid: string): Promise<void> {
  const data = await adminGraphql<{
    metafieldsSet: {
      userErrors: { message: string }[]
    }
  }>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId: orderGid,
        namespace: BEADOUGHS_METAFIELD_NAMESPACE,
        key: BEADOUGHS_ORDER_STATS_APPLIED_KEY,
        type: "single_line_text_field",
        value: "true",
      },
    ],
  })

  if (data.metafieldsSet.userErrors.length) {
    throw new Error(data.metafieldsSet.userErrors.map((e) => e.message).join("; "))
  }
}

export function orderGidFromRestId(id: number | string): string {
  return `gid://shopify/Order/${id}`
}

export function productGidFromRestId(id: number | string): string {
  return `gid://shopify/Product/${id}`
}

type ProductCollectionNode = {
  handle?: string | null
  goalBoxes?: AdminMetaValue
  goalBoxesCustom?: AdminMetaValue
  boxesSold?: AdminMetaValue
  boxesSoldCustom?: AdminMetaValue
  leaderboard?: AdminMetaValue
  leaderboardCustom?: AdminMetaValue
}

const PRODUCT_COLLECTION_HANDLES = `
  query ProductCollectionHandles($id: ID!) {
    product(id: $id) {
      id
      collections(first: 100) {
        nodes {
          handle
          goalBoxes: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.goalBoxes}") {
            value
          }
          goalBoxesCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.goalBoxes}") {
            value
          }
          boxesSold: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.boxesSold}") {
            value
          }
          boxesSoldCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.boxesSold}") {
            value
          }
          leaderboard: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.leaderboard}") {
            value
          }
          leaderboardCustom: metafield(namespace: "custom", key: "${BEADOUGHS_COLLECTION_METAFIELDS.leaderboard}") {
            value
          }
        }
      }
    }
  }
`

/**
 * A collection counts as a fundraiser when:
 * - its handle is listed in SHOPIFY_FUNDRAISER_COLLECTION_HANDLES or
 *   SHOPIFY_FUNDRAISER_COLLECTION_HANDLES_QLD, OR
 * - it already has fundraiser metafields (goal_boxes / boxes_sold / leaderboard)
 *   under beadoughs.* or custom.*.
 *
 * This lets product→collection attribution work even when the env handle list is
 * stale or missing the campaign the product actually belongs to.
 */
function isFundraiserCollectionNode(
  node: ProductCollectionNode,
  configuredSet: Set<string>
): boolean {
  const handle = node.handle?.trim().toLowerCase()
  if (!handle) return false
  if (configuredSet.has(handle)) return true

  const markers = [
    node.goalBoxes,
    node.goalBoxesCustom,
    node.boxesSold,
    node.boxesSoldCustom,
    node.leaderboard,
    node.leaderboardCustom,
  ]
  return markers.some((m) => m != null && m.value != null)
}

export type ProductCollectionAttribution = {
  handle: string
  /** Product REST ids that uniquely matched this fundraiser collection. */
  matchedProductIds: string[]
}

/**
 * If ordered products resolve to exactly one fundraiser collection (via configured
 * handles and/or fundraiser metafields), return that handle. Used when cart/line
 * Fundraiser slug attributes are missing from checkout.
 */
export async function resolveUniqueFundraiserHandleForProducts(
  productIds: Array<number | string>
): Promise<ProductCollectionAttribution | null> {
  if (!productIds.length) return null
  if (!getShopifyAdminConfig()) return null

  const configuredSet = new Set(
    getAllFundraiserCollectionHandles().map((h) => h.toLowerCase())
  )
  const matchedHandles = new Set<string>()
  const matchedProductIds: string[] = []

  for (const productId of productIds) {
    const data = await adminGraphql<{
      product: {
        id: string
        collections: { nodes: ProductCollectionNode[] }
      } | null
    }>(PRODUCT_COLLECTION_HANDLES, { id: productGidFromRestId(productId) })

    const fundraiserMatches = (data.product?.collections.nodes ?? [])
      .filter((n) => isFundraiserCollectionNode(n, configuredSet))
      .map((n) => n.handle?.trim().toLowerCase())
      .filter((h): h is string => Boolean(h))

    // Only use an unambiguous single-collection match for this product.
    if (fundraiserMatches.length === 1) {
      matchedHandles.add(fundraiserMatches[0])
      matchedProductIds.push(String(productId))
    }
  }

  if (matchedHandles.size !== 1 || matchedProductIds.length === 0) return null
  return { handle: [...matchedHandles][0], matchedProductIds }
}

const RECENT_ORDERS_FOR_FUNDRAISING = `
  query RecentOrdersForFundraising($first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        name
        displayFinancialStatus
        statsApplied: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_ORDER_STATS_APPLIED_KEY}") {
          value
        }
      }
    }
  }
`

/**
 * Recent paid orders that do not yet have beadoughs.stats_applied.
 * Used by the admin backfill endpoint.
 */
export async function listRecentUnappliedPaidOrderIds(
  first: number = 10
): Promise<Array<{ id: string; name: string | null }>> {
  const limit = Math.min(Math.max(1, Math.floor(first)), 25)
  const data = await adminGraphql<{
    orders: {
      nodes: {
        id: string
        name?: string | null
        displayFinancialStatus?: string | null
        statsApplied?: { value?: string | null } | null
      }[]
    }
  }>(RECENT_ORDERS_FOR_FUNDRAISING, { first: limit })

  const out: Array<{ id: string; name: string | null }> = []
  for (const order of data.orders.nodes) {
    const status = (order.displayFinancialStatus ?? "").toUpperCase()
    if (status && status !== "PAID" && status !== "PARTIALLY_PAID") continue
    const flag = order.statsApplied?.value?.trim().toLowerCase()
    if (flag === "1" || flag === "true" || flag === "yes") continue
    const numeric = order.id.match(/\/Order\/(\d+)/)?.[1]
    if (!numeric) continue
    out.push({ id: numeric, name: order.name ?? null })
  }
  return out
}

const ORDER_FOR_FUNDRAISING = `
  query OrderForFundraising($id: ID!) {
    order(id: $id) {
      id
      name
      email
      tags
      customAttributes {
        key
        value
      }
      discountCodes
      customer {
        id
        firstName
        lastName
        email
      }
      billingAddress {
        firstName
        lastName
      }
      lineItems(first: 100) {
        nodes {
          quantity
          product {
            id
          }
          customAttributes {
            key
            value
          }
        }
      }
    }
  }
`

/**
 * Load a paid order via Admin GraphQL and map it into the REST-shaped payload
 * used by fundraising stats (note_attributes / line properties).
 */
export async function getPaidOrderPayloadById(
  orderId: number | string
): Promise<import("@/lib/fundraising/stats").ShopifyPaidOrderPayload | null> {
  const data = await adminGraphql<{
    order: {
      id: string
      name?: string | null
      email?: string | null
      tags?: string | string[] | null
      customAttributes?: { key?: string | null; value?: string | null }[] | null
      discountCodes?: string[] | null
      customer?: {
        id?: string | null
        firstName?: string | null
        lastName?: string | null
        email?: string | null
      } | null
      billingAddress?: {
        firstName?: string | null
        lastName?: string | null
      } | null
      lineItems: {
        nodes: {
          quantity?: number | null
          product?: { id?: string | null } | null
          customAttributes?: { key?: string | null; value?: string | null }[] | null
        }[]
      }
    } | null
  }>(ORDER_FOR_FUNDRAISING, { id: orderGidFromRestId(orderId) })

  const order = data.order
  if (!order) return null

  const numericId =
    typeof orderId === "number" || /^\d+$/.test(String(orderId))
      ? orderId
      : (order.id.match(/\/Order\/(\d+)/)?.[1] ?? orderId)

  const tags = Array.isArray(order.tags)
    ? order.tags
    : typeof order.tags === "string"
      ? order.tags
      : []

  return {
    id: numericId,
    name: order.name ?? null,
    email: order.email ?? null,
    tags,
    discount_codes: (order.discountCodes ?? []).map((code) => ({ code })),
    customer: order.customer
      ? {
          id: order.customer.id ?? undefined,
          first_name: order.customer.firstName ?? null,
          last_name: order.customer.lastName ?? null,
          email: order.customer.email ?? null,
        }
      : null,
    billing_address: order.billingAddress
      ? {
          first_name: order.billingAddress.firstName ?? null,
          last_name: order.billingAddress.lastName ?? null,
        }
      : null,
    note_attributes: (order.customAttributes ?? []).map((a) => ({
      name: a.key ?? undefined,
      value: a.value ?? undefined,
    })),
    line_items: order.lineItems.nodes.map((line) => {
      const productGid = line.product?.id ?? null
      const productId = productGid?.match(/\/Product\/(\d+)/)?.[1] ?? null
      return {
        quantity: line.quantity ?? 0,
        product_id: productId,
        properties: (line.customAttributes ?? []).map((a) => ({
          name: a.key ?? undefined,
          value: a.value ?? undefined,
        })),
      }
    }),
  }
}
