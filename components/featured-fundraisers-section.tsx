import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import {
  listFundraiserCards,
  listFundraiserCardsFromStore,
} from "@/lib/shopify/fundraiser-data"
import {
  isShopifyConfigured,
  listAllShopifyCollectionsEnabled,
} from "@/lib/shopify/config"

const FEATURED_LIMIT = 6

export async function FeaturedFundraisersSection() {
  let cards: Awaited<ReturnType<typeof listFundraiserCards>> = []
  let loadError: string | null = null
  const shopifyReady = isShopifyConfigured()

  if (shopifyReady) {
    try {
      cards = listAllShopifyCollectionsEnabled()
        ? await listFundraiserCardsFromStore()
        : await listFundraiserCards()
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Could not load fundraisers"
    }
  }

  return (
    <section id="fundraisers" className="py-16 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Active Fundraisers
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Support a campaign happening now — every box sold helps a local group raise more.
          </p>
        </div>

        {!shopifyReady && (
          <div className="mx-auto max-w-xl text-center rounded-2xl border border-border bg-secondary/20 px-6 py-10">
            <p className="text-muted-foreground">
              Active fundraisers will appear here once the store is connected. In the meantime, you
              can browse the full directory or start your own campaign.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/fundraisers">View all fundraisers</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/fundraise#enquiry">Run a fundraiser</Link>
              </Button>
            </div>
          </div>
        )}

        {shopifyReady && loadError && (
          <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
        )}

        {shopifyReady && !loadError && cards.length === 0 && (
          <div className="mx-auto max-w-xl text-center rounded-2xl border border-border bg-secondary/20 px-6 py-10">
            <p className="text-muted-foreground">
              No active campaigns right now. Check back soon, or start one for your group.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/fundraisers">View all fundraisers</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/fundraise#enquiry">Run a fundraiser</Link>
              </Button>
            </div>
          </div>
        )}

        {shopifyReady && cards.length > 0 && (
          <>
            <FundraiserCardGrid cards={cards} limit={FEATURED_LIMIT} />
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link href="/fundraisers">View all fundraisers</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
