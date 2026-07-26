# Beadoughs fundraising website

Next.js site for Beadoughs doughnut fundraisers. Each Shopify **collection** is one campaign at `/fundraisers/{handle}` with products, a **boxes sold** progress bar, and a **buyer leaderboard**.

## Getting started

```bash
pnpm install   # or npm install
cp .env.example .env.local
# fill in Shopify + Resend values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Shopify fundraisers (counters + leaderboards)

### Must-have checklist for automatic boxes sold + leaderboard

Confirm these five things once (then new paid orders update themselves — no manual `boxes_sold` edits):

1. **Webhook** in Shopify: event **Order payment** / `orders/paid` →  
   `https://YOUR_DOMAIN/api/webhooks/shopify/orders-paid`
2. **Vercel** env `SHOPIFY_WEBHOOK_SECRET` = that webhook’s signing secret (redeploy after changing)
3. **Vercel** env `SHOPIFY_ADMIN_ACCESS_TOKEN` with Admin scopes:  
   `read_orders`, `write_orders`, `read_products`, `write_products`
4. Each fundraiser **collection** has metafields `beadoughs.boxes_sold` (integer) and  
   `beadoughs.leaderboard` (json) — start sold at `0`
5. Buyers must purchase from this site’s **fundraiser page** (`/fundraisers/{handle}`),  
   not only the native Shopify Online Store theme

Quick test: place a $1 paid order from a fundraiser page, then refresh that page — boxes sold and the leaderboard should rise without editing metafields by hand.

### Full Shopify setup

1. **One collection per fundraiser** — handle becomes the URL slug. Add donut products (1 unit = 1 box).
2. **Collection metafields** (namespace `beadoughs` preferred — not Product metafields):
   - `goal_boxes` (integer) — e.g. 500 — required for the progress bar
   - `boxes_sold` (integer) — start at 0; updated by the webhook
   - `leaderboard` (json) — updated by the webhook
   - optional: `organization`, `end_date`
   
   For each definition: **Settings → Custom data → Collections** → open the metafield →
   **Storefront API access** must be **Read** (or Read and write). Without this, Admin shows
   the value but Storefront returns null.
   
   The site also dual-reads `custom.goal_boxes` (and related keys) and, when
   `SHOPIFY_ADMIN_ACCESS_TOKEN` is set, falls back to the Admin API if Storefront
   metafields are still missing.
3. List handles in `SHOPIFY_FUNDRAISER_COLLECTION_HANDLES` (comma-separated).
4. **Admin app token** — `SHOPIFY_ADMIN_ACCESS_TOKEN` with order + product metafield scopes.
5. **Webhook** — `orders/paid` → `https://YOUR_DOMAIN/api/webhooks/shopify/orders-paid`  
   Set `SHOPIFY_WEBHOOK_SECRET` to the app/webhook signing secret, and redeploy after
   changing any Vercel environment variable.

Cart checkout tags orders twice so sales count toward the right campaign:

- **line** attribute `Fundraiser slug` → order line-item **Properties** (primary; webhook reads this first)
- **cart** attribute `Fundraiser slug` → Shopify order **Additional details** / `note_attributes`

The webhook accepts `Fundraiser slug`, `fundraiser_slug`, `Fundraiser handle`, or
`fundraiser_handle`. If those are missing, it may still attribute when the product sits in
**exactly one** collection listed in `SHOPIFY_FUNDRAISER_COLLECTION_HANDLES`. For a
manually-created/native Shopify order, add an order tag `fundraiser:collection-handle`
or a discount code `FUNDRAISER-collection-handle`.

In Shopify Admin, open the paid order and confirm a line property / Additional detail
matches the fundraiser collection handle. Then inspect the `orders/paid` webhook
delivery: a `200` response includes `applied` or a skip reason such as
`no_fundraiser_slug`, `collection_not_found`, or `already_applied`.
Vercel logs include the webhook ID, topic, order number, attribution source, and result.

Optional recovery endpoint (set `FUNDRAISING_ADMIN_SECRET`):

```bash
curl -X POST https://YOUR_DOMAIN/api/admin/fundraising/replay-order \
  -H "Authorization: Bearer $FUNDRAISING_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"1234567890","dryRun":true}'
```

Omit `dryRun` to apply the order to `boxes_sold` / `leaderboard` if it has not already been marked `stats_applied`.

Every new collection you add to the handles list gets the same counter + leaderboard automatically once orders come in.

See comments in `lib/shopify/config.ts` for full Admin setup notes.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
```
