export type CartAttribute = { key: string; value: string }

/** Prefer cart note "Fundraiser slug", then line item attributes. */
export function resolveCartFundraiserSlug(cart: {
  attributes?: CartAttribute[] | null
  lines?: {
    edges: { node: { attributes?: CartAttribute[] | null } }[]
  } | null
} | null): string | null {
  if (!cart) return null

  const fromCart = cart.attributes?.find((a) => a.key === "Fundraiser slug")?.value?.trim()
  if (fromCart) return fromCart

  for (const edge of cart.lines?.edges ?? []) {
    const fromLine = edge.node.attributes?.find((a) => a.key === "Fundraiser slug")?.value?.trim()
    if (fromLine) return fromLine
  }

  return null
}

export function fundraiserContinueHref(slug: string | null): string {
  return slug ? `/fundraisers/${slug}` : "/fundraisers"
}
