import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Clock, Users } from "lucide-react"
import { FundraiserLeaderboard } from "@/components/fundraiser-leaderboard"
import { FundraiserProductAdd } from "@/components/fundraiser-product-add"
import {
  getFundraiserByHandle,
  daysLeftFromEndDate,
  percentBoxesSold,
} from "@/lib/shopify/fundraiser-data"
import { isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  if (!isShopifyConfigured()) {
    return { title: "Fundraiser | Beadoughs" }
  }
  try {
    const campaign = await getFundraiserByHandle(slug)
    if (!campaign) return { title: "Fundraiser | Beadoughs" }
    return { title: `${campaign.title} | Beadoughs` }
  } catch {
    return { title: "Fundraiser | Beadoughs" }
  }
}

export default async function FundraiserPage({ params }: Props) {
  const { slug } = await params

  if (!isShopifyConfigured()) {
    return (
      <>
        <Header />
        <ShopifyConfigMissing />
        <Footer />
      </>
    )
  }

  let campaign: Awaited<ReturnType<typeof getFundraiserByHandle>> = null
  try {
    campaign = await getFundraiserByHandle(slug)
  } catch {
    throw new Error("Failed to load fundraiser from Shopify. Check API token and Storefront scopes.")
  }

  if (!campaign) {
    notFound()
  }

  const goalBoxes = campaign.goalBoxes
  const boxesSold = campaign.boxesSold
  const pct = percentBoxesSold(boxesSold, goalBoxes)
  const daysLeft = daysLeftFromEndDate(campaign.endDate)
  const org = campaign.organization ?? "Community fundraiser"
  const supporterCount =
    campaign.leaderboard.length > 0
      ? campaign.leaderboard.length
      : campaign.supportersCount

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-secondary/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
              {campaign.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium flex items-center justify-center gap-2 flex-wrap">
              Organized by <span className="text-primary font-bold">{org}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Products</h2>
                {campaign.products.length === 0 ? (
                  <p className="text-muted-foreground">
                    Products for this campaign will appear here soon.
                  </p>
                ) : (
                  <ul className="grid gap-5 sm:grid-cols-2">
                    {campaign.products.map((product) => {
                      const detailHref = `/fundraisers/${campaign.handle}/products/${product.handle}`
                      return (
                        <li key={product.id}>
                          <Card className="h-full overflow-hidden flex flex-col rounded-2xl border-border transition-shadow hover:shadow-md p-0 gap-0">
                            <Link
                              href={detailHref}
                              className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.imageAlt ?? product.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, 320px"
                                />
                              ) : null}
                            </Link>
                            <div className="p-4 flex flex-col gap-3 min-w-0 flex-1">
                              <div className="space-y-1">
                                <Link
                                  href={detailHref}
                                  className="font-semibold leading-tight hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                                >
                                  {product.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  From {product.minPriceCurrency} ${product.minPriceAmount}
                                </p>
                              </div>
                              <FundraiserProductAdd
                                product={product}
                                fundraiserSlug={campaign.handle}
                                fundraiserTitle={campaign.title}
                                showQuantitySelector
                              />
                            </div>
                          </Card>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border">
                <h2 className="text-2xl font-bold mb-4">About this campaign</h2>
                {campaign.descriptionHtml ? (
                  <div
                    className="max-w-none text-muted-foreground leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{ __html: campaign.descriptionHtml }}
                  />
                ) : (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {campaign.description ||
                      "More about this campaign coming soon."}
                  </p>
                )}

                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Secure checkout. Fresh doughnuts delivered per your store settings.
                  </p>
                </div>
              </div>

              <Card className="p-6 sm:p-8 rounded-3xl border-border shadow-sm">
                <FundraiserLeaderboard entries={campaign.leaderboard} />
              </Card>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="p-6 sm:p-8 shadow-2xl border-border bg-card rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <div className="mb-6">
                    <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                      <span className="text-4xl font-bold text-foreground tabular-nums">
                        {boxesSold.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {goalBoxes != null
                          ? `sold of ${goalBoxes.toLocaleString()} box goal`
                          : "boxes sold"}
                      </span>
                    </div>
                  </div>

                  {goalBoxes != null && goalBoxes > 0 ? (
                    <Progress value={pct} className="h-3 mb-6 bg-secondary" />
                  ) : (
                    <p className="text-xs text-muted-foreground mb-6">
                      Progress bar needs collection metafield{" "}
                      <code className="text-[11px]">beadoughs.goal_boxes</code> (integer &gt; 0)
                      with Storefront API access set to Read. If the value was saved under{" "}
                      <code className="text-[11px]">custom.goal_boxes</code>, that works too.
                      Product metafields will not appear here. With{" "}
                      <code className="text-[11px]">SHOPIFY_ADMIN_ACCESS_TOKEN</code> set, the
                      site can also read the goal via Admin when Storefront returns null.
                      Changes can take up to ~30s to refresh.
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-8 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span>
                        {boxesSold.toLocaleString()}{" "}
                        {boxesSold === 1 ? "box" : "boxes"} sold
                      </span>
                    </div>
                    {supporterCount != null && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          {supporterCount}{" "}
                          {supporterCount === 1 ? "supporter" : "supporters"}
                        </span>
                      </div>
                    )}
                    {daysLeft != null && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{daysLeft} days left</span>
                      </div>
                    )}
                  </div>

                  <Button asChild size="lg" className="w-full text-lg h-14 rounded-full shadow-lg shadow-primary/20">
                    <Link href="/cart">View cart & checkout</Link>
                  </Button>

                  <p className="text-xs text-center text-muted-foreground pt-4">
                    Secure checkout.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
