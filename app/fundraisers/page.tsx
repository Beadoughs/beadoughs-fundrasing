import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraisersDirectory } from "@/components/fundraisers-directory"
import {
  listFundraiserCards,
  listFundraiserCardsFromStore,
} from "@/lib/shopify/fundraiser-data"
import {
  getFundraiserCollectionHandles,
  isShopifyConfigured,
  listAllShopifyCollectionsEnabled,
} from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

export const revalidate = 30

export const metadata = {
  title: "Active Fundraisers | Sunny's Donuts",
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
    cards = useListAll ? await listFundraiserCardsFromStore() : await listFundraiserCards("tas")
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
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-primary mb-6">
              Support Local Fundraisers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse active campaigns or search by name. Purchases are fulfilled through Sunny&apos;s Donuts with
              secure checkout. Each campaign shows boxes sold toward its goal.
            </p>
          </div>

          <FundraisersDirectory
            cards={cards}
            loadError={loadError}
            useListAll={useListAll}
            handlesConfigured={handlesConfigured}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
