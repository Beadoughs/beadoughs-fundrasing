import { getShopifyConfig } from "./config"

type StorefrontFetchOptions = {
  /** Next.js fetch cache; use "no-store" for cart mutations */
  cache?: RequestCache
  revalidate?: number
}

export async function storefrontRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: StorefrontFetchOptions = {}
): Promise<T> {
  const { domain, token, apiVersion } = getShopifyConfig()
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`

  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  }

  if (options.cache === "no-store") {
    fetchOptions.cache = "no-store"
  } else if (options.revalidate != null) {
    ;(fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
      revalidate: options.revalidate,
    }
  } else {
    ;(fetchOptions as RequestInit & { next?: { revalidate: number } }).next = { revalidate: 120 }
  }

  const res = await fetch(endpoint, fetchOptions)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Storefront API HTTP ${res.status}: ${text.slice(0, 500)}`)
  }

  const body = (await res.json()) as {
    data?: T
    errors?: { message: string }[]
  }

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "))
  }

  if (body.data === undefined) {
    throw new Error("Storefront API returned no data")
  }

  return body.data
}
