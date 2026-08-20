import { NextResponse } from "next/server"
import { searchFundraisers } from "@/lib/shopify/fundraiser-search"
import { isShopifyConfigured } from "@/lib/shopify/config"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ ok: false, results: [] }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) {
    return NextResponse.json({ ok: true, results: [] })
  }

  try {
    const results = await searchFundraisers(q)
    return NextResponse.json({
      ok: true,
      results: results.map(({ card, region, href }) => ({
        id: card.id,
        handle: card.handle,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt,
        goalBoxes: card.goalBoxes,
        boxesSold: card.boxesSold,
        organization: card.organization,
        region,
        href,
      })),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed"
    return NextResponse.json({ ok: false, error: message, results: [] }, { status: 500 })
  }
}
