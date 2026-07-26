import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  applyPaidOrderToFundraiserStats,
  countBoxesInOrder,
  resolveFundraiserAttribution,
  type ShopifyPaidOrderPayload,
} from "@/lib/fundraising/stats"
import { getPaidOrderPayloadById } from "@/lib/shopify/admin"
import { isShopifyAdminConfigured } from "@/lib/shopify/config"

export const runtime = "nodejs"

function getAdminSecret(): string | null {
  const secret = process.env.FUNDRAISING_ADMIN_SECRET?.trim()
  return secret || null
}

function isAuthorized(request: Request): boolean {
  const secret = getAdminSecret()
  if (!secret) return false
  const header = request.headers.get("authorization")
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length) === secret
  }
  return request.headers.get("x-fundraising-admin-secret") === secret
}

type ReplayBody = {
  orderId?: number | string
  order?: ShopifyPaidOrderPayload
  dryRun?: boolean
  force?: boolean
}

/**
 * Manual recovery / debug for fundraiser counters.
 *
 * POST /api/admin/fundraising/replay-order
 * Headers: Authorization: Bearer <FUNDRAISING_ADMIN_SECRET>
 * Body: { "orderId": "5678901234" } or { "order": { ...REST payload } }
 * Optional: { "dryRun": true } — inspect attribution without writing metafields
 * Optional: { "force": true } — clear-check only; still refuses already_applied
 *            (use Shopify metafield delete if you truly need a re-apply)
 */
export async function POST(request: Request) {
  if (!getAdminSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error: "admin_secret_not_configured",
        detail: "Set FUNDRAISING_ADMIN_SECRET in Vercel to enable this endpoint",
      },
      { status: 503 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  if (!isShopifyAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "admin_api_not_configured",
        detail: "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured",
      },
      { status: 500 }
    )
  }

  let body: ReplayBody
  try {
    body = (await request.json()) as ReplayBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  let order: ShopifyPaidOrderPayload | null = body.order ?? null
  if (!order && body.orderId != null) {
    try {
      order = await getPaidOrderPayloadById(body.orderId)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load order"
      return NextResponse.json(
        { ok: false, error: "order_fetch_failed", detail: message },
        { status: 500 }
      )
    }
  }

  if (!order || order.id == null) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_order",
        detail: "Provide orderId or a full REST-shaped order payload",
      },
      { status: 400 }
    )
  }

  const attribution = resolveFundraiserAttribution(order)
  const boxes = countBoxesInOrder(order, attribution?.slug)
  const diagnosis = {
    orderId: String(order.id),
    orderName: order.name ?? null,
    attribution,
    boxes,
    noteAttributes: order.note_attributes ?? [],
    linePropertySamples: (order.line_items ?? []).map((line) => ({
      quantity: line.quantity ?? 0,
      properties: line.properties ?? [],
    })),
    tags: order.tags ?? null,
    discountCodes: order.discount_codes ?? [],
  }

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, diagnosis })
  }

  try {
    const result = await applyPaidOrderToFundraiserStats(order)
    if (result.status === "applied") {
      revalidatePath("/fundraisers")
      revalidatePath(`/fundraisers/${result.slug}`)
    }
    return NextResponse.json({ ok: true, diagnosis, result, forceIgnored: Boolean(body.force) })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to apply order stats"
    return NextResponse.json(
      { ok: false, error: "stats_update_failed", detail: message, diagnosis },
      { status: 500 }
    )
  }
}
