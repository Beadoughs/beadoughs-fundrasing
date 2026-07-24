import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  applyPaidOrderToFundraiserStats,
  type ShopifyPaidOrderPayload,
} from "@/lib/fundraising/stats"
import { isShopifyAdminConfigured, getShopifyWebhookSecret } from "@/lib/shopify/config"
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const rawBody = await request.text()
  const hmac = request.headers.get("x-shopify-hmac-sha256")

  if (!getShopifyWebhookSecret()) {
    return NextResponse.json(
      { ok: false, error: "SHOPIFY_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    )
  }

  if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
    return NextResponse.json({ ok: false, error: "Invalid HMAC" }, { status: 401 })
  }

  if (!isShopifyAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured" },
      { status: 500 }
    )
  }

  let order: ShopifyPaidOrderPayload
  try {
    order = JSON.parse(rawBody) as ShopifyPaidOrderPayload
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  if (order.id == null) {
    return NextResponse.json({ ok: false, error: "Missing order id" }, { status: 400 })
  }

  try {
    const result = await applyPaidOrderToFundraiserStats(order)

    if (result.status === "applied") {
      revalidatePath("/fundraisers")
      revalidatePath(`/fundraisers/${result.slug}`)
    }

    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to apply order stats"
    console.error("[shopify orders/paid webhook]", message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
