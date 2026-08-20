import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Clock, Users } from "lucide-react"
import { FundraiserProductAdd } from "@/components/fundraiser-product-add"
import {
  daysLeftFromEndDate,
  percentBoxesSold,
  type FundraiserDetail,
} from "@/lib/shopify/fundraiser-data"
import {
  fundraiserProductHref,
  type FundraiserRegion,
} from "@/lib/fundraising/region"

type Props = {
  campaign: FundraiserDetail
  region?: FundraiserRegion
}

export function FundraiserCampaignView({ campaign, region = "tas" }: Props) {
  const goalBoxes = campaign.goalBoxes
  const boxesSold = campaign.boxesSold
  const pct = percentBoxesSold(boxesSold, goalBoxes)
  const daysLeft = daysLeftFromEndDate(campaign.endDate)
  const supporterCount =
    campaign.leaderboard.length > 0
      ? campaign.leaderboard.length
      : campaign.supportersCount

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-secondary/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-center text-4xl sm:text-5xl font-heading font-bold text-foreground">
              {campaign.title}
            </h1>
            {(campaign.descriptionHtml ||
              campaign.description ||
              campaign.imageUrl) && (
              <div
                className={
                  (campaign.descriptionHtml || campaign.description) &&
                  campaign.imageUrl
                    ? "mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-2 md:items-center md:gap-8"
                    : "mx-auto mt-4 max-w-2xl"
                }
              >
                {(campaign.descriptionHtml || campaign.description) && (
                  <div
                    className={
                      campaign.imageUrl ? "text-left" : "text-center"
                    }
                  >
                    {campaign.descriptionHtml ? (
                      <div
                        className="text-base sm:text-lg text-muted-foreground leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-left"
                        dangerouslySetInnerHTML={{
                          __html: campaign.descriptionHtml,
                        }}
                      />
                    ) : (
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                )}
                {campaign.imageUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg border-4 border-white">
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.imageAlt ?? campaign.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                ) : null}
              </div>
            )}
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
                      const detailHref = fundraiserProductHref(
                        campaign.handle,
                        product.handle,
                        region
                      )
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
                    <Link href="/cart">View cart</Link>
                  </Button>

                  <p className="text-xs text-center text-muted-foreground pt-4">
                    Review your cart, then checkout securely.
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
