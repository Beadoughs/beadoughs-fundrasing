"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  removeCartLine,
  updateCartLineQuantity,
  redirectToShopifyCheckout,
  type CartDisplayLine,
} from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

type Props = {
  lines: CartDisplayLine[]
  totalQuantity: number
  totalAmount: { amount: string; currencyCode: string }
  continueHref?: string
}

function formatMoney(currencyCode: string, amount: string) {
  return `${currencyCode} $${amount}`
}

export function CartView({
  lines,
  totalQuantity,
  totalAmount,
  continueHref = "/fundraisers",
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function runCartAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update your cart")
      }
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <section aria-label="Cart items" className="space-y-4">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {lines.map((line) => (
            <li key={line.id} className="p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                  {line.merchandise.imageUrl ? (
                    <Image
                      src={line.merchandise.imageUrl}
                      alt={line.merchandise.imageAlt ?? line.merchandise.product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground px-2 text-center">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground leading-snug">
                        {line.merchandise.product.title}
                      </p>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {line.merchandise.title}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-2 sm:hidden">
                        {formatMoney(
                          line.cost.totalAmount.currencyCode,
                          line.cost.totalAmount.amount
                        )}
                      </p>
                    </div>

                    <p className="hidden sm:block text-sm font-semibold tabular-nums whitespace-nowrap">
                      {formatMoney(
                        line.cost.totalAmount.currencyCode,
                        line.cost.totalAmount.amount
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-border bg-background">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        disabled={pending}
                        aria-label={line.quantity === 1 ? "Remove item" : "Decrease quantity"}
                        onClick={() =>
                          runCartAction(() =>
                            line.quantity <= 1
                              ? removeCartLine(line.id)
                              : updateCartLineQuantity(line.id, line.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        disabled={pending || line.quantity >= 99}
                        aria-label="Increase quantity"
                        onClick={() =>
                          runCartAction(() =>
                            updateCartLineQuantity(line.id, line.quantity + 1)
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runCartAction(() => removeCartLine(line.id))}
                      className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="lg:hidden">
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href={continueHref}>Continue shopping</Link>
          </Button>
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-4 lg:sticky lg:top-24">
        <h2 className="font-heading text-lg font-bold text-foreground">Order summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({totalQuantity} item{totalQuantity === 1 ? "" : "s"})
          </span>
          <span className="font-semibold tabular-nums">
            {formatMoney(totalAmount.currencyCode, totalAmount.amount)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes are calculated at checkout.
        </p>

        <form action={redirectToShopifyCheckout} className="pt-2">
          <Button type="submit" className="w-full rounded-full h-12 text-base" size="lg">
            Checkout
          </Button>
        </form>

        <Button asChild variant="outline" className="hidden lg:flex w-full rounded-full">
          <Link href={continueHref}>Continue shopping</Link>
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment via Shopify checkout.
        </p>
      </aside>
    </div>
  )
}
