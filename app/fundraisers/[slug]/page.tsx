import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserCampaignView } from "@/components/fundraiser-campaign-view"
import { getFundraiserByHandle } from "@/lib/shopify/fundraiser-data"
import { isFundraiserHandleInRegion, isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"
import { fundraiserCampaignHref } from "@/lib/fundraising/region"

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  if (!isShopifyConfigured()) {
    return { title: "Fundraiser | Sunny's Donuts" }
  }
  try {
    const campaign = await getFundraiserByHandle(slug)
    if (!campaign) return { title: "Fundraiser | Sunny's Donuts" }
    return { title: `${campaign.title} | Sunny's Donuts` }
  } catch {
    return { title: "Fundraiser | Sunny's Donuts" }
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

  // Private / QLD-only campaigns live under /p or /qld — send people to the right URL.
  if (!isFundraiserHandleInRegion(slug, "tas")) {
    if (isFundraiserHandleInRegion(slug, "private")) {
      redirect(fundraiserCampaignHref(slug, "private"))
    }
    if (isFundraiserHandleInRegion(slug, "qld")) {
      redirect(fundraiserCampaignHref(slug, "qld"))
    }
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

  return <FundraiserCampaignView campaign={campaign} region="tas" />
}
