/**
 * Site-wide $500 cash giveaway: every 5 boxes (cumulative across all fundraisers) = 1 entry.
 */

export const GIVEAWAY_BOXES_PER_ENTRY = 5
export const GIVEAWAY_PRIZE_LABEL = "$500 cash"
export const GIVEAWAY_METAFIELD_KEY = "giveaway_ledger"

export function isGiveawayEnabled(): boolean {
  const v = process.env.GIVEAWAY_ENABLED?.trim().toLowerCase()
  return v === "1" || v === "true" || v === "yes"
}

export function entriesFromBoxes(totalBoxes: number): number {
  const n = Math.max(0, Math.floor(totalBoxes))
  return Math.floor(n / GIVEAWAY_BOXES_PER_ENTRY)
}

export function boxesUntilNextEntry(totalBoxes: number): number {
  const n = Math.max(0, Math.floor(totalBoxes))
  const rem = n % GIVEAWAY_BOXES_PER_ENTRY
  return rem === 0 ? GIVEAWAY_BOXES_PER_ENTRY : GIVEAWAY_BOXES_PER_ENTRY - rem
}

export function giveawayBannerMessage(): string {
  return "EVERY 5 BOXES PURCHASED = 1 ENTRY TO WIN $500 CASH!"
}

export type GiveawayBuyerRecord = {
  key: string
  email: string | null
  name: string
  totalBoxes: number
  entries: number
  lastOrderAt: string
  lastOrderId: string
}

export type GiveawayLedger = {
  updatedAt: string
  buyers: GiveawayBuyerRecord[]
}

export function emptyGiveawayLedger(): GiveawayLedger {
  return { updatedAt: new Date().toISOString(), buyers: [] }
}

export function upsertBuyerBoxes(
  ledger: GiveawayLedger,
  input: {
    key: string
    email: string | null
    name: string
    boxesAdded: number
    orderId: string
    orderAt?: string
  }
): GiveawayLedger {
  const boxesAdded = Math.max(0, Math.floor(input.boxesAdded))
  if (boxesAdded <= 0) return ledger

  const orderAt = input.orderAt ?? new Date().toISOString()
  const buyers = [...ledger.buyers]
  const idx = buyers.findIndex((b) => b.key === input.key)

  if (idx >= 0) {
    const prev = buyers[idx]!
    const totalBoxes = prev.totalBoxes + boxesAdded
    buyers[idx] = {
      ...prev,
      email: input.email ?? prev.email,
      name: input.name || prev.name,
      totalBoxes,
      entries: entriesFromBoxes(totalBoxes),
      lastOrderAt: orderAt,
      lastOrderId: input.orderId,
    }
  } else {
    const totalBoxes = boxesAdded
    buyers.push({
      key: input.key,
      email: input.email,
      name: input.name,
      totalBoxes,
      entries: entriesFromBoxes(totalBoxes),
      lastOrderAt: orderAt,
      lastOrderId: input.orderId,
    })
  }

  buyers.sort((a, b) => b.entries - a.entries || b.totalBoxes - a.totalBoxes)

  return {
    updatedAt: new Date().toISOString(),
    buyers,
  }
}
