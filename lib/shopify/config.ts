/**
 * Shopify headless setup (Admin — do once per store):
 *
 * 1. Settings → Apps → Develop apps → Create an app → Configure Storefront API scopes:
 *    unauthenticated_read_product_listings, unauthenticated_read_product_inventory,
 *    unauthenticated_read_collection_listings, unauthenticated_write_checkouts (if required by your API version),
 *    unauthenticated_read_checkouts, unauthenticated_write_checkouts — use the Storefront API access scopes
 *    shown in Shopify Admin for "Headless" / custom storefronts (products, collections, cart).
 *
 * 2. Install the app and copy the Storefront API access token.
 *
 * 3. Fundraisers: create one manual Collection per campaign. Use the collection handle as the URL slug
 *    (e.g. hobart-primary-playground). Add sellable products to that collection.
 *    Each product unit counts as one box toward the sold total.
 *
 * 4. Collection metafields (namespace `beadoughs`, expose to Storefront):
 *    - goal_boxes (integer) — box goal for the progress bar (e.g. 500)
 *    - boxes_sold (integer) — live total, updated by orders/paid webhook (start at 0)
 *    - leaderboard (json) — buyer rankings, updated by webhook
 *    - goal_amount / raised_amount (integer) — optional legacy dollar fields
 *    - end_date (date) optional
 *    - organization (single line text) optional
 *    - supporters_count (integer) optional
 *
 * 5. Admin API (for live counters): same custom app → Admin API scopes:
 *    read_orders, write_orders, read_products, write_products (metafields on collections + orders).
 *    Create an orders/paid webhook pointing to:
 *    https://YOUR_DOMAIN/api/webhooks/shopify/orders-paid
 *    Copy the webhook signing secret into SHOPIFY_WEBHOOK_SECRET.
 *
 * 6. Set env vars (see .env.example). List collection handles in SHOPIFY_FUNDRAISER_COLLECTION_HANDLES
 *    (comma-separated) for the /fundraisers directory. Every listed collection gets a counter +
 *    leaderboard automatically once orders are attributed via cart "Fundraiser slug".
 */

export const BEADOUGHS_METAFIELD_NAMESPACE = "beadoughs"

export const BEADOUGHS_COLLECTION_METAFIELDS = {
  goalBoxes: "goal_boxes",
  boxesSold: "boxes_sold",
  leaderboard: "leaderboard",
  goalAmount: "goal_amount",
  raisedAmount: "raised_amount",
  endDate: "end_date",
  organization: "organization",
  supportersCount: "supporters_count",
} as const

/** Order metafield set after stats are applied (idempotency). */
export const BEADOUGHS_ORDER_STATS_APPLIED_KEY = "stats_applied"

export const CART_COOKIE_NAME = "beadoughs_cart_id"
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Accepts pasted Admin URLs; Storefront endpoint must be https://{host}/api/{version}/graphql.json
 * with host = *.myshopify.com only (no protocol, no path).
 */
export function normalizeShopifyStoreDomain(raw: string): string {
  let s = raw.trim()
  s = s.replace(/^https?:\/\//i, "")
  s = s.split("/")[0] ?? s
  s = s.split("?")[0] ?? s
  return s.toLowerCase()
}

export function getShopifyConfig(): { domain: string; token: string; apiVersion: string } {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim()
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim()
  const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2024-10"
  if (!rawDomain || !token) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN. See lib/shopify/config.ts."
    )
  }
  const domain = normalizeShopifyStoreDomain(rawDomain)
  if (!domain.endsWith(".myshopify.com")) {
    throw new Error(
      `SHOPIFY_STORE_DOMAIN must be your *.myshopify.com hostname (e.g. beadoughs.myshopify.com), not a custom domain. Got: ${domain}`
    )
  }
  return { domain, token, apiVersion }
}

export function isShopifyConfigured(): boolean {
  try {
    const d = process.env.SHOPIFY_STORE_DOMAIN?.trim()
    const t = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim()
    if (!d || !t) return false
    const domain = normalizeShopifyStoreDomain(d)
    return domain.endsWith(".myshopify.com")
  } catch {
    return false
  }
}

export function getShopifyAdminConfig(): {
  domain: string
  token: string
  apiVersion: string
} | null {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim()
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim()
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION?.trim() || "2024-10"
  if (!rawDomain || !token) return null
  const domain = normalizeShopifyStoreDomain(rawDomain)
  if (!domain.endsWith(".myshopify.com")) return null
  return { domain, token, apiVersion }
}

export function isShopifyAdminConfigured(): boolean {
  return getShopifyAdminConfig() != null
}

export function getShopifyWebhookSecret(): string | null {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim()
  return secret || null
}

export function getFundraiserCollectionHandles(): string[] {
  const raw = process.env.SHOPIFY_FUNDRAISER_COLLECTION_HANDLES?.trim()
  if (!raw) return []
  return raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
}

/** When true, /fundraisers loads collections from Shopify instead of only SHOPIFY_FUNDRAISER_COLLECTION_HANDLES. */
export function listAllShopifyCollectionsEnabled(): boolean {
  const v = process.env.SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS?.trim().toLowerCase()
  return v === "1" || v === "true" || v === "yes"
}
