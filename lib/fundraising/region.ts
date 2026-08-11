import {
  getFundraiserCollectionHandles,
  type FundraiserRegion,
} from "@/lib/shopify/config"

export type { FundraiserRegion }

/** Base path for fundraiser URLs in a region (no trailing slash). */
export function fundraiserBasePath(region: FundraiserRegion = "tas"): string {
  return region === "qld" ? "/qld/fundraisers" : "/fundraisers"
}

export function fundraiserCampaignHref(
  handle: string,
  region: FundraiserRegion = "tas"
): string {
  return `${fundraiserBasePath(region)}/${handle}`
}

export function fundraiserProductHref(
  campaignHandle: string,
  productHandle: string,
  region: FundraiserRegion = "tas"
): string {
  return `${fundraiserCampaignHref(campaignHandle, region)}/products/${productHandle}`
}

/** Resolve region from a campaign handle (QLD list wins if listed in both). */
export function resolveFundraiserRegion(handle: string | null): FundraiserRegion {
  if (!handle) return "tas"
  const key = handle.trim().toLowerCase()
  if (getFundraiserCollectionHandles("qld").some((h) => h.toLowerCase() === key)) {
    return "qld"
  }
  return "tas"
}
