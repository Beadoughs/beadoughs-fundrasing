import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserCampaignView } from "@/components/fundraiser-campaign-view"
import { getFundraiserByHandle } from "@/lib/shopify/fundraiser-data"
import { isFundraiserHandleInRegion, isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  if (!isShopifyConfigured() || !isFundraiserHandleInRegion(slug, "private")) {
    return {
      title: "Fundraiser | Sunny's Donuts",
      robots: { index: false, follow: false },
    }
  }
  try {
    const campaign = await getFundraiserByHandle(slug)
    if (!campaign) {
      return {
        title: "Fundraiser | Sunny's Donuts",
        robots: { index: false, follow: false },
      }
    }
    return {
      title: `${campaign.title} | Sunny's Donuts`,
      robots: { index: false, follow: false },
    }
  } catch {
    return {
      title: "Fundraiser | Sunny's Donuts",
      robots: { index: false, follow: false },
    }
  }
}

export default async function PrivateFundraiserPage({ params }: Props) {
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

  if (!isFundraiserHandleInRegion(slug, "private")) {
    notFound()
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

  return <FundraiserCampaignView campaign={campaign} region="private" />
}
