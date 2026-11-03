"use client"

import Link from "next/link"
import { useState } from "react"
import { FundraiserSearchSection } from "@/components/fundraiser-search-section"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import { Button } from "@/components/ui/button"
import type { FundraiserCollectionCard } from "@/lib/shopify/fundraiser-data"

type Props = {
  cards: FundraiserCollectionCard[]
  loadError: string | null
  useListAll: boolean
}

export function FundraisersDirectory({
  cards,
  loadError,
  useListAll,
}: Props) {
  const [isSearching, setIsSearching] = useState(false)

  return (
    <>
      {cards.length > 0 && (
        <FundraiserSearchSection onSearchingChange={setIsSearching} />
      )}

      {loadError && (
        <p className="text-center text-destructive mb-8 max-w-xl mx-auto">{loadError}</p>
      )}

      {!isSearching && (
        <>
          {useListAll && !loadError && cards.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto rounded-2xl border border-border bg-secondary/20 px-4 py-3">
              Showing all store collections. To only list specific fundraisers, set{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>{" "}
              with real handles and remove{" "}
              <code className="text-xs bg-background px-1 rounded">SHOPIFY_FUNDRAISER_LIST_ALL_COLLECTIONS</code>.
            </p>
          )}

          {!loadError && cards.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border border-border bg-white px-6 py-10 text-center shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-primary mb-3">
                No active fundraisers right now
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re full right now. Join the waitlist and we&apos;ll email you when
                Sunny&apos;s Donuts fundraisers open again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="rounded-full">
                  <Link href="/book">Join the waitlist</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/fundraise">How fundraisers work</Link>
                </Button>
              </div>
            </div>
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
