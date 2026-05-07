"use client"

import { useTransition } from "react"
import Link from "next/link"
import { removeCartLine, updateCartLineQuantity, redirectToShopifyCheckout } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"

type Line = {
  id: string
  quantity: number
  cost: { totalAmount: { amount: string; currencyCode: string } }
  merchandise: {
    id: string
    title: string
    product: { title: string; handle: string }
  }
}

type Props = {
  lines: Line[]
  totalQuantity: number
  totalAmount: { amount: string; currencyCode: string }
}

export function CartView({ lines, totalQuantity, totalAmount }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">{line.merchandise.product.title}</p>
              {line.merchandise.title !== "Default Title" && (
                <p className="text-sm text-muted-foreground">{line.merchandise.title}</p>
              )}
              <p className="text-sm font-medium mt-1">
                {line.cost.totalAmount.currencyCode} ${line.cost.totalAmount.amount}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                disabled={pending || line.quantity <= 1}
                onClick={() =>
                  startTransition(() => updateCartLineQuantity(line.id, line.quantity - 1))
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{line.quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                disabled={pending}
                onClick={() =>
                  startTransition(() => updateCartLineQuantity(line.id, line.quantity + 1))
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-destructive"
                disabled={pending}
                onClick={() => startTransition(() => removeCartLine(line.id))}
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-secondary/20 p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
          </p>
          <p className="text-2xl font-bold">
            Total {totalAmount.currencyCode} ${totalAmount.amount}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/fundraisers">Continue supporting</Link>
          </Button>
          <form action={redirectToShopifyCheckout}>
            <Button type="submit" className="w-full rounded-full sm:w-auto" size="lg">
              Checkout with Shopify
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
