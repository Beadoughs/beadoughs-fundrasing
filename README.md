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
   Set `SHOPIFY_WEBHOOK_SECRET` to the signing secret.

Cart checkout already tags orders with `Fundraiser slug` so sales count toward the right campaign.

Every new collection you add to the handles list gets the same counter + leaderboard automatically once orders come in.

See comments in `lib/shopify/config.ts` for full Admin setup notes.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
```
