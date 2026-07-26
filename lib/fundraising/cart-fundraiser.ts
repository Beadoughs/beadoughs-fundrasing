export type CartAttribute = { key: string; value: string }

const FUNDRAISER_SLUG_KEYS = new Set(
  ["Fundraiser slug", "Fundraiser handle", "fundraiser_slug", "fundraiser_handle"].map((k) =>
    k.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
  )
)

function attrMatchesFundraiserSlug(key: string | null | undefined): boolean {
  const normalized = (key ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "")
  return FUNDRAISER_SLUG_KEYS.has(normalized)
}

/** Prefer cart attributes, then line item attributes. */
export function resolveCartFundraiserSlug(cart: {
  attributes?: CartAttribute[] | null
  lines?: {
    edges: { node: { attributes?: CartAttribute[] | null } }[]
  } | null
} | null): string | null {
  if (!cart) return null

  const fromCart = cart.attributes?.find((a) => attrMatchesFundraiserSlug(a.key))?.value?.trim()
  if (fromCart) return fromCart

  for (const edge of cart.lines?.edges ?? []) {
    const fromLine = edge.node.attributes
      ?.find((a) => attrMatchesFundraiserSlug(a.key))
      ?.value?.trim()
    if (fromLine) return fromLine
  }

  return null
}

export function fundraiserContinueHref(slug: string | null): string {
  return slug ? `/fundraisers/${slug}` : "/fundraisers"
}
