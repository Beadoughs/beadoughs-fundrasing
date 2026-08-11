import { revalidatePath } from "next/cache"
import { fundraiserBasePath, fundraiserCampaignHref } from "@/lib/fundraising/region"
import type { FundraiserRegion } from "@/lib/shopify/config"

const REGIONS: FundraiserRegion[] = ["tas", "qld", "private"]

/** Invalidate fundraiser directory + campaign pages across public, QLD, and private. */
export function revalidateFundraiserPaths(slug: string) {
  for (const region of REGIONS) {
    revalidatePath(fundraiserBasePath(region))
    revalidatePath(fundraiserCampaignHref(slug, region))
  }
}
