import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  listFundraiserCards,
  listFundraiserCardsFromStore,
  percentBoxesSold,
} from "@/lib/shopify/fundraiser-data"
import {
  getFundraiserCollectionHandles,
  isShopifyConfigured,
  listAllShopifyCollectionsEnabled,
} from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

export const revalidate = 30

export const metadata = {
  title: "Active Fundraisers | Beadoughs",
  description: "Support local fundraising campaigns with secure checkout.",
}

export default async function FundraisersDirectoryPage() {
  if (!isShopifyConfigured()) {
    return (
      <>
        <Header />
        <ShopifyConfigMissing />
        <Footer />
      </>
    )
  }

  const useListAll = listAllShopifyCollectionsEnabled()
  let cards: Awaited<ReturnType<typeof listFundraiserCards>> = []
  let loadError: string | null = null
  try {
    cards = useListAll ? await listFundraiserCardsFromStore() : await listFundraiserCards()
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load fundraisers"
  }

  const handlesConfigured = getFundraiserCollectionHandles().length > 0

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-6">
              Support Local Fundraisers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse active campaigns. Purchases are fulfilled through Beadoughs with secure
              checkout. Each campaign shows boxes sold toward its goal.
            </p>
          </div>

          {loadError && (
            <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
          )}

          {useListAll && !loadError && (
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto rounded-2xl border border-border bg-secondary/20 px-4 py-3">
              Showing all store collections. To only list specific fundraisers, set{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>{" "}
              with real handles and remove{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS</code>.
            </p>
          )}

          {!useListAll && !handlesConfigured && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto space-y-3">
              <span className="block">
                This page only shows collections whose <strong>handles</strong> you list in{" "}
                <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>{" "}
                (comma-separated). The sample handles in{" "}
                <code className="text-xs bg-secondary px-1 rounded">.env.example</code> are placeholders — replace
                them with your real collection handles from your store admin → Products → Collections → collection
                URL (the part after <code className="text-xs bg-secondary px-1 rounded">/collections/</code>).
              </span>
              <span className="block text-sm">
                Quick test: add{" "}
                <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS=true</code>{" "}
                to <code className="text-xs bg-secondary px-1 rounded">.env.local</code>, restart{" "}
                <code className="text-xs bg-secondary px-1 rounded">npm run dev</code>, reload this page.
              </span>
            </p>
          )}

          {!useListAll && handlesConfigured && cards.length === 0 && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              No matching collections found. Each value in{" "}
              <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code> must
              exactly match a collection handle in your store (not the collection title).
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((campaign, index) => {
              const pct = percentBoxesSold(campaign.boxesSold, campaign.goalBoxes)
              const orgLabel = campaign.organization ?? campaign.title
              const hasGoal = campaign.goalBoxes != null && campaign.goalBoxes > 0

              return (
                <Link
                  key={campaign.id}
                  href={`/fundraisers/${campaign.handle}`}
                  aria-label={`Support ${campaign.title}`}
                  className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex flex-col h-full"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative h-48 w-full bg-secondary/30">
                      {campaign.imageUrl ? (
                        <Image
                          src={campaign.imageUrl}
                          alt={campaign.imageAlt ?? campaign.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          Images coming soon
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm max-w-[85%] truncate">
                        {orgLabel}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-foreground">
                        {campaign.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                        {campaign.description || "Open this campaign to see products and support the cause."}
                      </p>

                      <div className="space-y-4 mb-6">
                        {hasGoal ? (
                          <>
                            <Progress value={pct} className="h-2" />
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-primary font-bold tabular-nums">
                                {campaign.boxesSold.toLocaleString()} sold
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                of {campaign.goalBoxes!.toLocaleString()} boxes
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground tabular-nums">
                            {campaign.boxesSold.toLocaleString()}{" "}
                            {campaign.boxesSold === 1 ? "box" : "boxes"} sold
                          </p>
                        )}
                      </div>

                      <Button asChild className="w-full rounded-full mt-auto pointer-events-none">
                        <span aria-hidden="true">Support this cause</span>
                      </Button>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
