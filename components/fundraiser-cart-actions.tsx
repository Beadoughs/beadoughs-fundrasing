import Link from "next/link"
import { redirectToShopifyCheckout } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Side-by-side buttons for the mobile sticky bar. */
  horizontal?: boolean
}

/** Cart + checkout actions — inline in sidebar/card on desktop. */
export function FundraiserCartActions({ className, horizontal = false }: Props) {
  return (
    <div className={cn(horizontal ? "flex gap-3" : "space-y-3", className)}>
      <Button
        asChild
        variant="outline"
        size="lg"
        className={cn("rounded-full h-12", horizontal ? "flex-1" : "w-full")}
      >
        <Link href="/cart">View cart</Link>
      </Button>
      <form action={redirectToShopifyCheckout} className={horizontal ? "flex-1" : undefined}>
        <Button
          type="submit"
          size="lg"
          className={cn("rounded-full h-12 text-base", horizontal ? "w-full" : "w-full")}
        >
          Checkout
        </Button>
      </form>
    </div>
  )
}

/** Fixed bottom bar on mobile — follows scroll on iPhone. Hidden on md+. */
export function FundraiserCartActionsMobileBar() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md px-4 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-lg">
        <FundraiserCartActions horizontal />
      </div>
    </div>
  )
}
