import { NextResponse } from "next/server"
import { isGiveawayEnabled } from "@/lib/fundraising/giveaway"
import { listGiveawayEntries } from "@/lib/shopify/giveaway-ledger"
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

function toCsv(rows: Awaited<ReturnType<typeof listGiveawayEntries>>): string {
  const header = ["name", "email", "totalBoxes", "entries", "lastOrderAt", "lastOrderId", "key"]
  const escape = (v: string | number | null) => {
    const s = v == null ? "" : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escape(r.name),
        escape(r.email),
        escape(r.totalBoxes),
        escape(r.entries),
        escape(r.lastOrderAt),
        escape(r.lastOrderId),
        escape(r.key),
      ].join(",")
    ),
  ]
  return lines.join("\n")
}

/**
 * Export giveaway entries for the offline $500 draw.
 *
 * GET /api/admin/fundraising/giveaway-entries
 * Authorization: Bearer <FUNDRAISING_ADMIN_SECRET>
 * Optional: ?format=csv
 */
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format")?.trim().toLowerCase()

  try {
    const buyers = await listGiveawayEntries()
    const withEntries = buyers.filter((b) => b.entries > 0)

    if (format === "csv") {
      return new NextResponse(toCsv(withEntries), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="giveaway-entries.csv"',
        },
      })
    }

    return NextResponse.json({
      ok: true,
      enabled: isGiveawayEnabled(),
      totalBuyers: buyers.length,
      entrants: withEntries.length,
      buyers: withEntries,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load giveaway ledger"
    return NextResponse.json(
      { ok: false, error: "giveaway_ledger_failed", detail: message },
      { status: 500 }
    )
  }
}
