"use client"

import { useState, useTransition } from "react"
import { addCartLines } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FundraiserProduct } from "@/lib/shopify/fundraiser-data"
import { Minus, Plus, ShoppingCart } from "lucide-react"

type Props = {
  product: FundraiserProduct
  fundraiserSlug: string
  fundraiserTitle: string
  /** Initial quantity when the quantity selector is shown (default 1). */
  defaultQuantity?: number
  /** Show a quantity stepper (product detail page). */
  showQuantitySelector?: boolean
  /** Larger primary CTA for the product page. */
  size?: "default" | "lg"
}

export function FundraiserProductAdd({
  product,
  fundraiserSlug,
  fundraiserTitle,
  defaultQuantity = 1,
  showQuantitySelector = false,
  size = "default",
}: Props) {
  const variants = product.variants.filter((v) => v.availableForSale)
  const [variantId, setVariantId] = useState(variants[0]?.id ?? product.variants[0]?.id ?? "")
  const [quantity, setQuantity] = useState(Math.max(1, Math.floor(defaultQuantity)))
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const activeVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0]

  function clampQuantity(n: number) {
    if (!Number.isFinite(n)) return 1
    return Math.max(1, Math.min(99, Math.floor(n)))
  }

  function handleAdd() {
    if (!variantId) return
    const qty = showQuantitySelector ? clampQuantity(quantity) : 1
    startTransition(async () => {
      setError(null)
      setDone(false)
      try {
        await addCartLines(
          [
            {
              merchandiseId: variantId,
              quantity: qty,
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
      <p className="text-sm text-muted-foreground">This product is currently unavailable.</p>
    )
  }

  const buttonSize = size === "lg" ? "lg" : "sm"
  const buttonClass =
    size === "lg" ? "w-full rounded-full text-lg h-14 shadow-lg shadow-primary/20" : "rounded-full"

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

      {showQuantitySelector && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Quantity</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={quantity <= 1 || pending}
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              max={99}
              inputMode="numeric"
              className="h-10 w-16 rounded-xl text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={quantity}
              onChange={(e) => setQuantity(clampQuantity(Number(e.target.value)))}
              aria-label="Quantity"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={quantity >= 99 || pending}
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-3 ${size === "lg" ? "flex-col items-stretch" : "justify-between"}`}>
        {activeVariant && (
          <span className={size === "lg" ? "text-2xl font-bold tabular-nums" : "text-sm font-semibold"}>
            {activeVariant.currencyCode} ${activeVariant.priceAmount}
            {showQuantitySelector && quantity > 1 && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                × {quantity}
              </span>
            )}
          </span>
        )}
        <Button
          type="button"
          size={buttonSize}
          className={buttonClass}
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
