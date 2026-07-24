import {
  BEADOUGHS_COLLECTION_METAFIELDS,
  BEADOUGHS_METAFIELD_NAMESPACE,
  BEADOUGHS_ORDER_STATS_APPLIED_KEY,
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
          boxesSold: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.boxesSold}") {
            id
            value
          }
          leaderboard: metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${BEADOUGHS_COLLECTION_METAFIELDS.leaderboard}") {
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

export async function getCollectionStatsByHandle(
  handle: string
): Promise<{ collectionId: string; stats: FundraiserStats } | null> {
  const data = await adminGraphql<{
    collections: {
      edges: {
        node: {
          id: string
          handle: string
          boxesSold?: { value?: string | null } | null
          leaderboard?: { value?: string | null } | null
        }
      }[]
    }
  }>(COLLECTION_STATS_BY_HANDLE, { query: `handle:${handle}` })

  const c = data.collections.edges[0]?.node
  if (!c || c.handle !== handle) return null

  const boxesSold = Number.parseInt(c.boxesSold?.value ?? "0", 10)
  return {
    collectionId: c.id,
    stats: {
      boxesSold: Number.isFinite(boxesSold) ? boxesSold : 0,
      leaderboard: parseLeaderboardJson(c.leaderboard?.value),
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
        value: String(Math.max(0, Math.floor(stats.boxesSold))),
      },
      {
        ownerId: collectionId,
        namespace: BEADOUGHS_METAFIELD_NAMESPACE,
        key: BEADOUGHS_COLLECTION_METAFIELDS.leaderboard,
        type: "json",
        value: JSON.stringify(sorted),
      },
    ],
  })

  if (data.metafieldsSet.userErrors.length) {
    throw new Error(data.metafieldsSet.userErrors.map((e) => e.message).join("; "))
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
