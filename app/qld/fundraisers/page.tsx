import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import { listFundraiserCards } from "@/lib/shopify/fundraiser-data"
import {
  getFundraiserCollectionHandles,
  isShopifyConfigured,
} from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"
import { fundraiserBasePath } from "@/lib/fundraising/region"

export const revalidate = 30

export const metadata = {
  title: "Queensland Fundraisers | Sunny's Donuts",
  description: "Support Queensland fundraising campaigns with secure checkout.",
  robots: { index: false, follow: false },
}

export default async function QldFundraisersDirectoryPage() {
  if (!isShopifyConfigured()) {
    return (
      <>
        <Header />
        <ShopifyConfigMissing />
        <Footer />
      </>
    )
  }

  let cards: Awaited<ReturnType<typeof listFundraiserCards>> = []
  let loadError: string | null = null
  try {
    cards = await listFundraiserCards("qld")
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load fundraisers"
  }

  const handlesConfigured = getFundraiserCollectionHandles("qld").length > 0

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-primary mb-6">
              Support Local Fundraisers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse active campaigns. Purchases are fulfilled through Sunny&apos;s Donuts with secure
              checkout. Each campaign shows boxes sold toward its goal.
            </p>
          </div>

          {loadError && (
            <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
          )}

          {!handlesConfigured && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              This page only shows collections whose <strong>handles</strong> you list in{" "}
              <code className="text-xs bg-secondary px-1 rounded">
                SHOPIFY_FUNDRAISER_COLLECTION_HANDLES_QLD
              </code>{" "}
              (comma-separated). Create a collection in Shopify, set the same metafields as public
              campaigns, then add the handle here and redeploy.
            </p>
          )}

          {handlesConfigured && cards.length === 0 && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              No matching collections found. Each value in{" "}
              <code className="text-xs bg-secondary px-1 rounded">
                SHOPIFY_FUNDRAISER_COLLECTION_HANDLES_QLD
              </code>{" "}
              must exactly match a collection handle in your store (not the collection title).
            </p>
          )}

          <FundraiserCardGrid cards={cards} basePath={fundraiserBasePath("qld")} />
        </div>
      </main>
      <Footer />
    </>
  )
}
