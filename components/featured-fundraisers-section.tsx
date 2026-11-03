import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandSparkle } from "@/components/brand-sparkle"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import {
  listFundraiserCards,
  listFundraiserCardsFromStore,
} from "@/lib/shopify/fundraiser-data"
import {
  isShopifyConfigured,
  listAllShopifyCollectionsEnabled,
} from "@/lib/shopify/config"

const FEATURED_LIMIT = 2

export async function FeaturedFundraisersSection() {
  let cards: Awaited<ReturnType<typeof listFundraiserCards>> = []
  let loadError: string | null = null
  const shopifyReady = isShopifyConfigured()

  if (shopifyReady) {
    try {
      cards = listAllShopifyCollectionsEnabled()
        ? await listFundraiserCardsFromStore()
        : await listFundraiserCards("tas")
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Could not load fundraisers"
    }
  }

  return (
    <section id="fundraisers" className="relative scroll-mt-20 overflow-hidden bg-secondary py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <h2 className="inline-flex items-center justify-center gap-2 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Active Fundraisers
            <BrandSparkle />
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Support a campaign happening now. Every box sold helps a local group raise more.
          </p>
        </div>

        {!shopifyReady && (
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-muted-foreground">
              We&apos;re full right now. Join the waitlist to hear when spots open again.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="rounded-full">
                <Link href="/book">Join the waitlist</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/fundraise">How it works</Link>
              </Button>
            </div>
          </div>
        )}

        {shopifyReady && loadError && (
          <p className="mx-auto mb-8 max-w-xl text-center text-destructive">{loadError}</p>
        )}

        {shopifyReady && !loadError && cards.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white px-6 py-10 text-center shadow-sm">
            <h3 className="font-heading text-xl font-bold text-primary mb-3">
              No active fundraisers right now
            </h3>
            <p className="text-muted-foreground">
              We&apos;re full right now. Join the waitlist and we&apos;ll notify you when
              fundraiser bookings reopen.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="rounded-full">
                <Link href="/book">Join the waitlist</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/fundraise">How it works</Link>
              </Button>
            </div>
          </div>
        )}

        {shopifyReady && cards.length > 0 && (
          <>
            <FundraiserCardGrid cards={cards} limit={FEATURED_LIMIT} columns={2} />
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12">
                <Link href="/fundraisers">View all fundraisers</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
