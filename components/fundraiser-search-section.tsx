"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FundraiserCardGrid } from "@/components/fundraiser-card-grid"
import type { FundraiserCollectionCard } from "@/lib/shopify/fundraiser-data"

type SearchResult = FundraiserCollectionCard & {
  region: string
  href: string
}

type Props = {
  onSearchingChange?: (isSearching: boolean) => void
}

export function FundraiserSearchSection({ onSearchingChange }: Props) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const isSearching = debouncedQuery.length >= 2

  useEffect(() => {
    onSearchingChange?.(isSearching)
  }, [isSearching, onSearchingChange])

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/fundraisers/search?q=${encodeURIComponent(q)}`)
      const data = (await res.json()) as {
        ok: boolean
        results?: SearchResult[]
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Search failed")
      }
      setResults(data.results ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    runSearch(debouncedQuery)
  }, [debouncedQuery, runSearch])

  const hrefByHandle = Object.fromEntries(results.map((r) => [r.handle, r.href]))
  const cards: FundraiserCollectionCard[] = results.map(({ href: _href, region: _region, ...card }) => card)

  return (
    <div className="mb-12">
      <div className="mx-auto max-w-xl">
        <label htmlFor="fundraiser-search" className="sr-only">
          Search fundraisers
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fundraiser-search"
            type="search"
            placeholder="Search by name, school, or cause…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 rounded-full border-border bg-white pl-12 pr-12 text-base shadow-sm"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {isSearching && (
        <div className="mt-10">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold text-primary">
            Search results
          </h2>

          {error && (
            <p className="text-center text-destructive mb-6">{error}</p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="text-center text-muted-foreground max-w-md mx-auto">
              No fundraisers matched &ldquo;{debouncedQuery}&rdquo;. Try a different name or cause.
            </p>
          )}

          {results.length > 0 && (
            <FundraiserCardGrid cards={cards} hrefByHandle={hrefByHandle} />
          )}
        </div>
      )}
    </div>
  )
}
