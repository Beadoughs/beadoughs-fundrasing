import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserProductView } from "@/components/fundraiser-product-view"
import { getFundraiserProduct } from "@/lib/shopify/fundraiser-data"
import { isFundraiserHandleInRegion, isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"
import { fundraiserProductHref } from "@/lib/fundraising/region"

type Props = {
  params: Promise<{ slug: string; productHandle: string }>
}

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  const { slug, productHandle } = await params
  if (!isShopifyConfigured()) {
    return { title: "Product | Sunny's Donuts" }
  }
  try {
    const data = await getFundraiserProduct(slug, productHandle)
    if (!data) return { title: "Product | Sunny's Donuts" }
    return { title: `${data.product.title} | ${data.fundraiser.title} | Sunny's Donuts` }
  } catch {
    return { title: "Product | Sunny's Donuts" }
  }
}

export default async function FundraiserProductPage({ params }: Props) {
  const { slug, productHandle } = await params

  if (!isShopifyConfigured()) {
    return (
      <>
        <Header />
        <ShopifyConfigMissing />
        <Footer />
      </>
    )
  }

  if (!isFundraiserHandleInRegion(slug, "tas")) {
    if (isFundraiserHandleInRegion(slug, "private")) {
      redirect(fundraiserProductHref(slug, productHandle, "private"))
    }
    if (isFundraiserHandleInRegion(slug, "qld")) {
      redirect(fundraiserProductHref(slug, productHandle, "qld"))
    }
  }

  let data: Awaited<ReturnType<typeof getFundraiserProduct>> = null
  try {
    data = await getFundraiserProduct(slug, productHandle)
  } catch {
    throw new Error("Failed to load product from Shopify. Check API token and Storefront scopes.")
  }

  if (!data) {
    notFound()
  }

  return (
    <FundraiserProductView
      fundraiser={data.fundraiser}
      product={data.product}
      region="tas"
    />
  )
}
