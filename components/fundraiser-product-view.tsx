import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FundraiserProductAdd } from "@/components/fundraiser-product-add"
import { FundraiserCartActions, FundraiserCartActionsMobileBar } from "@/components/fundraiser-cart-actions"
import {
  GiveawayMarqueeBanner,
  giveawayMainPadClass,
} from "@/components/giveaway-marquee-banner"
import { ArrowLeft } from "lucide-react"
import { fundraiserCampaignHref, type FundraiserRegion } from "@/lib/fundraising/region"
import type { FundraiserProduct, FundraiserProductPage } from "@/lib/shopify/fundraiser-data"

type Props = {
  fundraiser: FundraiserProductPage["fundraiser"]
  product: FundraiserProduct
  region?: FundraiserRegion
}

export function FundraiserProductView({
  fundraiser,
  product,
  region = "tas",
}: Props) {
  const org = fundraiser.organization ?? "Community fundraiser"
  const campaignHref = fundraiserCampaignHref(fundraiser.handle, region)

  return (
    <>
      <Header />
      <GiveawayMarqueeBanner />
      <main className={`min-h-screen pb-28 md:pb-16 bg-secondary/10 ${giveawayMainPadClass()}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Button asChild variant="ghost" className="mb-4 -ml-2 rounded-full text-muted-foreground">
              <Link href={campaignHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {fundraiser.title}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground font-medium">
              Supporting <span className="text-primary font-bold">{fundraiser.title}</span>
              {" · "}
              Organized by <span className="font-semibold text-foreground">{org}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative aspect-square w-full min-h-[280px] sm:min-h-[360px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-secondary/40">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt ?? product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground p-6 text-center">
                  Images coming soon
                </div>
              )}
            </div>

            <Card className="p-6 sm:p-8 rounded-3xl border-border shadow-sm h-fit">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                {product.title}
              </h1>

              {product.descriptionHtml ? (
                <div
                  className="mb-8 max-w-none text-muted-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : product.description ? (
                <p className="mb-8 text-muted-foreground leading-relaxed">{product.description}</p>
              ) : (
                <p className="mb-8 text-muted-foreground leading-relaxed">
                  Delicious Sunny&apos;s Donuts — every purchase supports this fundraiser.
                </p>
              )}

              <FundraiserProductAdd
                product={product}
                fundraiserSlug={fundraiser.handle}
                fundraiserTitle={fundraiser.title}
                showQuantitySelector
                size="lg"
              />

              <div className="mt-6 pt-6 border-t border-border hidden md:block">
                <FundraiserCartActions />
              </div>

              <p className="text-xs text-center text-muted-foreground pt-6">
                Secure payment. This purchase is attributed to{" "}
                <span className="font-medium text-foreground">{fundraiser.title}</span>.
              </p>

              <div className="mt-6 pt-6 border-t border-border">
                <Button asChild variant="outline" className="rounded-full w-full">
                  <Link href={campaignHref}>Back to campaign</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <FundraiserCartActionsMobileBar />
      <Footer />
    </>
  )
}
