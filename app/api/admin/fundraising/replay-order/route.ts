import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  applyPaidOrderToFundraiserStats,
  countBoxesInOrder,
  resolveFundraiserAttributionWithFallbacks,
  type ShopifyPaidOrderPayload,
} from "@/lib/fundraising/stats"
import {
  getPaidOrderPayloadById,
  listRecentUnappliedPaidOrderIds,
} from "@/lib/shopify/admin"
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
  /** Apply the most recent unapplied paid order(s). */
  recent?: boolean
  limit?: number
}

function diagnoseOrder(order: ShopifyPaidOrderPayload) {
  return (async () => {
    const attribution = await resolveFundraiserAttributionWithFallbacks(order)
    const boxes = countBoxesInOrder(order, attribution?.slug, {
      matchedProductIds: attribution?.matchedProductIds,
    })
    return {
      orderId: String(order.id),
      orderName: order.name ?? null,
      attribution,
      boxes,
      noteAttributes: order.note_attributes ?? [],
      linePropertySamples: (order.line_items ?? []).map((line) => ({
        quantity: line.quantity ?? 0,
        productId: line.product_id ?? null,
        properties: line.properties ?? [],
      })),
      tags: order.tags ?? null,
      discountCodes: order.discount_codes ?? [],
    }
  })()
}

/**
 * Manual recovery / debug for fundraiser counters.
 *
 * POST /api/admin/fundraising/replay-order
 * Headers: Authorization: Bearer <FUNDRAISING_ADMIN_SECRET>
 * Body: { "orderId": "5678901234" } or { "order": { ...REST payload } }
 * Optional: { "dryRun": true } — inspect attribution without writing metafields
 * Optional: { "recent": true, "limit": 5 } — apply latest unapplied paid orders
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

  if (body.recent) {
    const limit = body.limit ?? 5
    try {
      const candidates = await listRecentUnappliedPaidOrderIds(limit)
      const results: Array<{
        orderId: string
        orderName: string | null
        diagnosis?: unknown
        result?: unknown
        error?: string
      }> = []

      for (const candidate of candidates) {
        try {
          const order = await getPaidOrderPayloadById(candidate.id)
          if (!order) {
            results.push({
              orderId: candidate.id,
              orderName: candidate.name,
              error: "order_not_found",
            })
            continue
          }
          const diagnosis = await diagnoseOrder(order)
          if (body.dryRun) {
            results.push({
              orderId: candidate.id,
              orderName: candidate.name,
              diagnosis,
            })
            continue
          }
          const result = await applyPaidOrderToFundraiserStats(order)
          if (result.status === "applied") {
            revalidatePath("/fundraisers")
            revalidatePath(`/fundraisers/${result.slug}`)
          }
          results.push({
            orderId: candidate.id,
            orderName: candidate.name,
            diagnosis,
            result,
          })
        } catch (e) {
          results.push({
            orderId: candidate.id,
            orderName: candidate.name,
            error: e instanceof Error ? e.message : "Failed to process order",
          })
        }
      }

      return NextResponse.json({
        ok: true,
        recent: true,
        dryRun: Boolean(body.dryRun),
        candidates: candidates.length,
        results,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to list recent orders"
      return NextResponse.json(
        { ok: false, error: "recent_orders_failed", detail: message },
        { status: 500 }
      )
    }
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
        detail:
          'Provide orderId, a full REST-shaped order payload, or { "recent": true }',
      },
      { status: 400 }
    )
  }

  const diagnosis = await diagnoseOrder(order)

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, diagnosis })
  }

  try {
    const result = await applyPaidOrderToFundraiserStats(order)
    if (result.status === "applied") {
      revalidatePath("/fundraisers")
      revalidatePath(`/fundraisers/${result.slug}`)
    }
    return NextResponse.json({
      ok: true,
      diagnosis,
      result,
      forceIgnored: Boolean(body.force),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to apply order stats"
    return NextResponse.json(
      { ok: false, error: "stats_update_failed", detail: message, diagnosis },
      { status: 500 }
    )
  }
}
