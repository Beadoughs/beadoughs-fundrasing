"use client"

import { useState } from "react"
import { FundraiserSearchSection } from "@/components/fundraiser-search-section"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import type { FundraiserCollectionCard } from "@/lib/shopify/fundraiser-data"

type Props = {
  cards: FundraiserCollectionCard[]
  loadError: string | null
  useListAll: boolean
  handlesConfigured: boolean
}

export function FundraisersDirectory({
  cards,
  loadError,
  useListAll,
  handlesConfigured,
}: Props) {
  const [isSearching, setIsSearching] = useState(false)

  return (
    <>
      <FundraiserSearchSection onSearchingChange={setIsSearching} />

      {loadError && (
        <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
      )}

      {!isSearching && (
        <>
          {useListAll && !loadError && (
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto rounded-2xl border border-border bg-secondary/20 px-4 py-3">
              Showing all store collections. To only list specific fundraisers, set{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>{" "}
              with real handles and remove{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS</code>.
            </p>
          )}

          {!useListAll && !handlesConfigured && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto space-y-3">
              <span className="block">
                This page only shows collections whose <strong>handles</strong> you list in{" "}
                <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>{" "}
                (comma-separated). The sample handles in{" "}
                <code className="text-xs bg-secondary px-1 rounded">.env.example</code> are placeholders — replace
                them with your real collection handles from your store admin → Products → Collections → collection
                URL (the part after <code className="text-xs bg-secondary px-1 rounded">/collections/</code>).
              </span>
              <span className="block text-sm">
                Quick test: add{" "}
                <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS=true</code>{" "}
                to <code className="text-xs bg-secondary px-1 rounded">.env.local</code>, restart{" "}
                <code className="text-xs bg-secondary px-1 rounded">npm run dev</code>, reload this page.
              </span>
            </p>
          )}

          {!useListAll && handlesConfigured && cards.length === 0 && !loadError && (
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              No matching collections found. Each value in{" "}
              <code className="text-xs bg-secondary px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code> must
              exactly match a collection handle in your store (not the collection title).
            </p>
          )}

          {!loadError && cards.length > 0 && (
            <>
              <h2 className="mb-8 text-center font-heading text-2xl font-bold text-primary">
                Active fundraisers
              </h2>
              <FundraiserCardGrid cards={cards} />
            </>
          )}
        </>
      )}
    </>
  )
}
