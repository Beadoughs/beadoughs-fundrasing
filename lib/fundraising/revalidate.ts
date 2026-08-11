import { revalidatePath } from "next/cache"
import { fundraiserBasePath, fundraiserCampaignHref } from "@/lib/fundraising/region"

/** Invalidate fundraiser directory + campaign pages (TAS and QLD). */
export function revalidateFundraiserPaths(slug: string) {
  for (const region of ["tas", "qld"] as const) {
    revalidatePath(fundraiserBasePath(region))
    revalidatePath(fundraiserCampaignHref(slug, region))
  }
}
