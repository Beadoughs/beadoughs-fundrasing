"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { getCartItemCount } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"

export function CartNavLink() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function refresh() {
      getCartItemCount()
        .then(setCount)
        .catch(() => setCount(0))
    }

    refresh()
    window.addEventListener("cart-updated", refresh)
    return () => window.removeEventListener("cart-updated", refresh)
  }, [])

  return (
    <Button asChild variant="ghost" size="lg" className="rounded-full px-4 gap-2 text-foreground relative">
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        Cart
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
