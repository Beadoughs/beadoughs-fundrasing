import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export function ShopifyLoadError() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-primary mb-3">
            This page didn&apos;t load
          </h1>
          <p className="text-muted-foreground mb-6">
            We&apos;re having a short hiccup talking to the shop. Please refresh and try again.
            If it keeps happening, email Sunny@sunnysdonuts.com.au and we&apos;ll help you place
            the order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-full">
              <Link href="/fundraisers">View fundraisers</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/cart">Go to cart</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
