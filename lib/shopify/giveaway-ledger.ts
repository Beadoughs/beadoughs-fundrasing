import { adminGraphql } from "@/lib/shopify/admin"
import { BEADOUGHS_METAFIELD_NAMESPACE } from "@/lib/shopify/config"
import {
  emptyGiveawayLedger,
  GIVEAWAY_METAFIELD_KEY,
  upsertBuyerBoxes,
  type GiveawayBuyerRecord,
  type GiveawayLedger,
} from "@/lib/fundraising/giveaway"

const APP_INSTALLATION_LEDGER = `
  query GiveawayLedgerOwner {
    currentAppInstallation {
      id
      metafield(namespace: "${BEADOUGHS_METAFIELD_NAMESPACE}", key: "${GIVEAWAY_METAFIELD_KEY}") {
        id
        value
      }
    }
  }
`

const METAFIELDS_SET = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        message
        field
      }
    }
  }
`

function parseLedger(raw: string | null | undefined): GiveawayLedger {
  if (!raw?.trim()) return emptyGiveawayLedger()
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return emptyGiveawayLedger()
    const obj = parsed as Record<string, unknown>
    const buyersRaw = Array.isArray(obj.buyers) ? obj.buyers : []
    const buyers: GiveawayBuyerRecord[] = buyersRaw
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const r = row as Record<string, unknown>
        const key = typeof r.key === "string" ? r.key : null
        if (!key) return null
        const totalBoxes = Math.max(
          0,
          Math.floor(typeof r.totalBoxes === "number" ? r.totalBoxes : Number(r.totalBoxes) || 0)
        )
        const entries = Math.max(
          0,
          Math.floor(typeof r.entries === "number" ? r.entries : Number(r.entries) || 0)
        )
        return {
          key,
          email: typeof r.email === "string" ? r.email : null,
          name: typeof r.name === "string" ? r.name : "Supporter",
          totalBoxes,
          entries,
          lastOrderAt: typeof r.lastOrderAt === "string" ? r.lastOrderAt : "",
          lastOrderId: typeof r.lastOrderId === "string" ? r.lastOrderId : "",
        } satisfies GiveawayBuyerRecord
      })
      .filter((b): b is GiveawayBuyerRecord => b != null)

    return {
      updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString(),
      buyers,
    }
  } catch {
    return emptyGiveawayLedger()
  }
}

export async function getGiveawayLedger(): Promise<{
  ownerId: string
  ledger: GiveawayLedger
}> {
  const data = await adminGraphql<{
    currentAppInstallation: {
      id: string
      metafield?: { value?: string | null } | null
    } | null
  }>(APP_INSTALLATION_LEDGER)

  const ownerId = data.currentAppInstallation?.id
  if (!ownerId) {
    throw new Error("Could not resolve currentAppInstallation id for giveaway ledger")
  }

  return {
    ownerId,
    ledger: parseLedger(data.currentAppInstallation?.metafield?.value),
  }
}

export async function saveGiveawayLedger(
  ownerId: string,
  ledger: GiveawayLedger
): Promise<void> {
  const data = await adminGraphql<{
    metafieldsSet: { userErrors: { message: string }[] }
  }>(METAFIELDS_SET, {
    metafields: [
      {
        ownerId,
        namespace: BEADOUGHS_METAFIELD_NAMESPACE,
        key: GIVEAWAY_METAFIELD_KEY,
        type: "json",
        value: JSON.stringify(ledger),
      },
    ],
  })

  if (data.metafieldsSet.userErrors.length) {
    throw new Error(data.metafieldsSet.userErrors.map((e) => e.message).join("; "))
  }
}

export async function creditGiveawayBoxes(input: {
  key: string
  email: string | null
  name: string
  boxesAdded: number
  orderId: string
}): Promise<GiveawayBuyerRecord | null> {
  if (!input.boxesAdded || input.boxesAdded <= 0) return null

  const { ownerId, ledger } = await getGiveawayLedger()
  const next = upsertBuyerBoxes(ledger, input)
  await saveGiveawayLedger(ownerId, next)
  return next.buyers.find((b) => b.key === input.key) ?? null
}

export async function listGiveawayEntries(): Promise<GiveawayBuyerRecord[]> {
  const { ledger } = await getGiveawayLedger()
  return [...ledger.buyers].sort(
    (a, b) => b.entries - a.entries || b.totalBoxes - a.totalBoxes
  )
}
