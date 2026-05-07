"use client"

import { useState, useTransition } from "react"
import { addCartLines } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FundraiserProduct } from "@/lib/shopify/fundraiser-data"
import { ShoppingCart } from "lucide-react"

type Props = {
  product: FundraiserProduct
  fundraiserSlug: string
  fundraiserTitle: string
}

export function FundraiserProductAdd({
  product,
  fundraiserSlug,
  fundraiserTitle,
}: Props) {
  const variants = product.variants.filter((v) => v.availableForSale)
  const [variantId, setVariantId] = useState(variants[0]?.id ?? product.variants[0]?.id ?? "")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const activeVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0]

  function handleAdd() {
    if (!variantId) return
    startTransition(async () => {
      setError(null)
      setDone(false)
      try {
        await addCartLines(
          [
            {
              merchandiseId: variantId,
              quantity: 1,
              attributes: [{ key: "Fundraiser", value: fundraiserTitle }],
            },
          ],
          [
            { key: "Fundraiser slug", value: fundraiserSlug },
            { key: "Fundraiser", value: fundraiserTitle },
          ]
        )
        setDone(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add to cart")
      }
    })
  }

  if (product.variants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">This product has no variants in Shopify.</p>
    )
  }

  return (
    <div className="space-y-3">
      {variants.length > 1 && (
        <Select value={variantId} onValueChange={setVariantId}>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.title} — {v.currencyCode} ${v.priceAmount}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center justify-between gap-3">
        {activeVariant && (
          <span className="text-sm font-semibold">
            {activeVariant.currencyCode} ${activeVariant.priceAmount}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={pending || !variantId || variants.length === 0}
          onClick={handleAdd}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {pending ? "Adding…" : "Add to cart"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && !error && (
        <p className="text-sm text-primary font-medium">Added — view your cart to checkout.</p>
      )}
    </div>
  )
}
