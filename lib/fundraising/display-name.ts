/**
 * Privacy-safe public name: first name + last initial (e.g. "Sarah J.").
 */
export function formatBuyerDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = "Supporter"
): string {
  const first = (firstName ?? "").trim()
  const last = (lastName ?? "").trim()
  if (first && last) {
    return `${first} ${last.charAt(0).toUpperCase()}.`
  }
  if (first) return first
  if (last) return `${last.charAt(0).toUpperCase()}.`
  return fallback
}

export function buyerKeyFromOrder(input: {
  customerId?: number | string | null
  email?: string | null
  displayName: string
}): string {
  if (input.customerId != null && String(input.customerId)) {
    return `customer:${input.customerId}`
  }
  const email = (input.email ?? "").trim().toLowerCase()
  if (email) return `email:${email}`
  return `name:${input.displayName.toLowerCase()}`
}
