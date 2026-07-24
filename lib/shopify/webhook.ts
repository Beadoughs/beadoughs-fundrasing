import { createHmac, timingSafeEqual } from "crypto"
import { getShopifyWebhookSecret } from "./config"

/**
 * Verify Shopify webhook HMAC (base64 of HMAC-SHA256 over raw body).
 */
export function verifyShopifyWebhookHmac(rawBody: string, hmacHeader: string | null): boolean {
  const secret = getShopifyWebhookSecret()
  if (!secret || !hmacHeader) return false

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")

  try {
    const a = Buffer.from(digest)
    const b = Buffer.from(hmacHeader)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
