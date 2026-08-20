import Link from "next/link"
import { redirectToShopifyCheckout } from "@/app/actions/cart"
import { Button } from "@/components/ui/button"

/** Single cart + checkout actions for a fundraiser page sidebar. */
export function FundraiserCartActions() {
  return (
    <div className="space-y-3">
      <Button asChild variant="outline" size="lg" className="w-full rounded-full h-12">
        <Link href="/cart">View cart</Link>
      </Button>
      <form action={redirectToShopifyCheckout}>
        <Button type="submit" size="lg" className="w-full rounded-full h-12 text-base">
          Checkout
        </Button>
      </form>
    </div>
  )
}
