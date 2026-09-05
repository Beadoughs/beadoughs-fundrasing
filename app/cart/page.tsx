import Link from "next/link"
import { getCartForDisplay } from "@/app/actions/cart"
import {
  fundraiserContinueHref,
  resolveCartFundraiserSlug,
} from "@/lib/fundraising/cart-fundraiser"
import { CartView } from "@/components/cart-view"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { isShopifyConfigured } from "@/lib/shopify/config"
import { ShopifyConfigMissing } from "@/components/shopify-config-missing"
import {
  GiveawayMarqueeBanner,
  giveawayMainPadClass,
} from "@/components/giveaway-marquee-banner"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Cart | Sunny's Donuts",
  description: "Review your order before checkout.",
}

export default async function CartPage() {
  if (!isShopifyConfigured()) {
    return (
      <>
        <Header />
        <ShopifyConfigMissing />
        <Footer />
      </>
    )
  }

  const cart = await getCartForDisplay()
  const continueHref = fundraiserContinueHref(resolveCartFundraiserSlug(cart))
  const lines = cart?.lines ?? []

  return (
    <>
      <Header />
      <GiveawayMarqueeBanner />
      <main className={`min-h-screen pb-16 ${giveawayMainPadClass()}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-8">Your cart</h1>

          {!cart || lines.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center max-w-lg mx-auto">
              <p className="text-muted-foreground mb-6">Your cart is empty.</p>
              <Button asChild className="rounded-full">
                <Link href={continueHref}>Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <CartView
              lines={lines}
              totalQuantity={cart.totalQuantity}
              totalAmount={cart.cost.totalAmount}
              continueHref={continueHref}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
