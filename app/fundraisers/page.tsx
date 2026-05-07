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
  percentRaised,
} from "@/lib/shopify/fundraiser-data"
import {
  getFundraiserCollectionHandles,
  isShopifyConfigured,
  listAllShopifyCollectionsEnabled,
} from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

export const revalidate = 120

export const metadata = {
  title: "Active Fundraisers | Beadoughs",
  description: "Support local fundraising campaigns — powered by Shopify.",
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
              Browse active campaigns. Purchases are fulfilled through Beadoughs with secure Shopify
              checkout.
            </p>
          </div>

          {loadError && (
            <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
          )}

          {useListAll && !loadError && (
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto rounded-2xl border border-border bg-secondary/20 px-4 py-3">
              Showing collections from your Shopify store (Storefront API). To only list specific
              fundraisers, set{" "}
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
                them with your real collection handles from Shopify Admin → Products → Collections → collection
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
              exactly match a collection handle in Shopify (not the collection title).
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((campaign, index) => {
              const pct = percentRaised(campaign.raisedAmount, campaign.goalAmount)
              const orgLabel = campaign.organization ?? campaign.title

              return (
                <Card
                  key={campaign.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex flex-col"
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
                        Add a collection image in Shopify
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

                    {campaign.goalAmount != null && campaign.raisedAmount != null && (
                      <div className="space-y-4 mb-6">
                        <Progress value={pct} className="h-2" />
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-primary font-bold">
                            ${campaign.raisedAmount.toLocaleString()} raised
                          </span>
                          <span className="text-muted-foreground">
                            of ${campaign.goalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button asChild className="w-full rounded-full mt-auto">
                      <Link href={`/fundraisers/${campaign.handle}`}>Support this cause</Link>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
