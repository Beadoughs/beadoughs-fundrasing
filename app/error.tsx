"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-primary mb-3">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t finish that step. Please try again, or go back to the fundraisers
            and add the donuts to your cart once more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="rounded-full">
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/fundraisers">View fundraisers</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
