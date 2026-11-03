import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import { listFundraiserCards } from "@/lib/shopify/fundraiser-data"
import { isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"
import { fundraiserBasePath } from "@/lib/fundraising/region"
import { Button } from "@/components/ui/button"

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

          {!loadError && cards.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white px-6 py-10 text-center shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-primary mb-3">
                No active fundraisers right now
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re between campaigns. Join the waitlist and we&apos;ll email you when
                Sunny&apos;s Donuts fundraisers open again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="rounded-full">
                  <Link href="/book">Join the waitlist</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/fundraise">How fundraisers work</Link>
                </Button>
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <FundraiserCardGrid cards={cards} basePath={fundraiserBasePath("qld")} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
