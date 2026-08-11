import { NextResponse } from "next/server"
import {
  applyPaidOrderToFundraiserStats,
  type ShopifyPaidOrderPayload,
} from "@/lib/fundraising/stats"
import { revalidateFundraiserPaths } from "@/lib/fundraising/revalidate"
import {
  getAllFundraiserCollectionHandles,
  getShopifyWebhookSecret,
  isShopifyAdminConfigured,
} from "@/lib/shopify/config"
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook"

export const runtime = "nodejs"

/**
 * Public health check — no secrets returned.
 * Open in a browser: /api/webhooks/shopify/orders-paid
 * Expect webhookSecret + adminApi both true once Vercel env is set.
 */
export async function GET() {
  const webhookSecret = Boolean(getShopifyWebhookSecret())
  const adminApi = isShopifyAdminConfigured()
  const fundraiserHandles = getAllFundraiserCollectionHandles().length
  const ready = webhookSecret && adminApi

  return NextResponse.json({
    ok: true,
    endpoint: "orders/paid",
    ready,
    configured: {
      webhookSecret,
      adminApi,
      fundraiserHandles,
    },
    shopifyWebhookUrl:
      "https://www.beadoughs.com/api/webhooks/shopify/orders-paid",
    tip: ready
      ? "Site secrets look set. In Shopify Admin → Settings → Notifications → Webhooks, confirm an orders/paid webhook points at shopifyWebhookUrl, then open a recent delivery for HTTP 200."
      : "Add SHOPIFY_WEBHOOK_SECRET and SHOPIFY_ADMIN_ACCESS_TOKEN in Vercel, redeploy, then create the Shopify orders/paid webhook.",
  })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const hmac = request.headers.get("x-shopify-hmac-sha256")
  const topic = request.headers.get("x-shopify-topic")
  const shop = request.headers.get("x-shopify-shop-domain")
  const webhookId = request.headers.get("x-shopify-webhook-id")
  const logContext = { topic, shop, webhookId }

  if (!getShopifyWebhookSecret()) {
    console.error("[shopify webhook] Missing signing secret", logContext)
    return NextResponse.json(
      {
        ok: false,
        error: "webhook_not_configured",
        detail: "SHOPIFY_WEBHOOK_SECRET is not configured",
      },
      { status: 500 }
    )
  }

  if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
    console.warn("[shopify webhook] Invalid HMAC", logContext)
    return NextResponse.json(
      { ok: false, error: "invalid_hmac", detail: "Invalid Shopify webhook signature" },
      { status: 401 }
    )
  }

  if (topic && topic !== "orders/paid") {
    console.warn("[shopify webhook] Unexpected topic", logContext)
    return NextResponse.json(
      { ok: false, error: "unexpected_topic", expected: "orders/paid", received: topic },
      { status: 400 }
    )
  }

  if (!isShopifyAdminConfigured()) {
    console.error("[shopify webhook] Missing Admin API token", logContext)
    return NextResponse.json(
      {
        ok: false,
        error: "admin_api_not_configured",
        detail: "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured",
      },
      { status: 500 }
    )
  }

  let order: ShopifyPaidOrderPayload
  try {
    order = JSON.parse(rawBody) as ShopifyPaidOrderPayload
  } catch {
    console.warn("[shopify webhook] Invalid JSON", logContext)
    return NextResponse.json(
      { ok: false, error: "invalid_json", detail: "Request body is not valid JSON" },
      { status: 400 }
    )
  }

  if (order.id == null) {
    console.warn("[shopify webhook] Missing order id", logContext)
    return NextResponse.json(
      { ok: false, error: "missing_order_id", detail: "Webhook payload has no order id" },
      { status: 400 }
    )
  }

  try {
    const result = await applyPaidOrderToFundraiserStats(order)

    if (result.status === "applied") {
      revalidateFundraiserPaths(result.slug)
    }

    console.info("[shopify webhook] Processed paid order", {
      ...logContext,
      orderId: String(order.id),
      orderName: order.name ?? null,
      result,
    })
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to apply order stats"
    console.error("[shopify webhook] Failed to process paid order", {
      ...logContext,
      orderId: String(order.id),
      orderName: order.name ?? null,
      error: message,
    })
    return NextResponse.json(
      { ok: false, error: "stats_update_failed", detail: message },
      { status: 500 }
    )
  }
}
