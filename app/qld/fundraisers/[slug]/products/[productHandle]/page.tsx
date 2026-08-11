import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FundraiserProductView } from "@/components/fundraiser-product-view"
import { getFundraiserProduct } from "@/lib/shopify/fundraiser-data"
import { isFundraiserHandleInRegion, isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"

type Props = {
  params: Promise<{ slug: string; productHandle: string }>
}

export const revalidate = 30

export async function generateMetadata({ params }: Props) {
  const { slug, productHandle } = await params
  if (!isShopifyConfigured() || !isFundraiserHandleInRegion(slug, "qld")) {
    return {
      title: "Product | Sunny's Donuts",
      robots: { index: false, follow: false },
    }
  }
  try {
    const data = await getFundraiserProduct(slug, productHandle)
    if (!data) {
      return {
        title: "Product | Sunny's Donuts",
        robots: { index: false, follow: false },
      }
    }
    return {
      title: `${data.product.title} | ${data.fundraiser.title} | Sunny's Donuts`,
      robots: { index: false, follow: false },
    }
  } catch {
    return {
      title: "Product | Sunny's Donuts",
      robots: { index: false, follow: false },
    }
  }
}

export default async function QldFundraiserProductPage({ params }: Props) {
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

  if (!isFundraiserHandleInRegion(slug, "qld")) {
    notFound()
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
      region="qld"
    />
  )
}
