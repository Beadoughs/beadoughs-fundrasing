import { fundraiserCampaignHref, type FundraiserRegion } from "@/lib/fundraising/region"
import {
  listFundraiserCards,
  type FundraiserCollectionCard,
} from "@/lib/shopify/fundraiser-data"

export type FundraiserSearchResult = {
  card: FundraiserCollectionCard
  region: FundraiserRegion
  href: string
}

const SEARCHABLE_REGIONS: FundraiserRegion[] = ["tas", "private", "qld"]

function matchesQuery(card: FundraiserCollectionCard, query: string): boolean {
  const haystack = [card.title, card.handle, card.organization, card.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/-/g, " ")

  const tokens = query.split(/\s+/).filter(Boolean)
  return tokens.every((token) => haystack.includes(token))
}

/** Search public, private, and QLD campaigns by title, handle, org, or description. */
export async function searchFundraisers(query: string): Promise<FundraiserSearchResult[]> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const entries: { card: FundraiserCollectionCard; region: FundraiserRegion }[] = []
  for (const region of SEARCHABLE_REGIONS) {
    const cards = await listFundraiserCards(region)
    for (const card of cards) {
      entries.push({ card, region })
    }
  }

  return entries
    .filter(({ card }) => matchesQuery(card, q))
    .map(({ card, region }) => ({
      card,
      region,
      href: fundraiserCampaignHref(card.handle, region),
    }))
}
