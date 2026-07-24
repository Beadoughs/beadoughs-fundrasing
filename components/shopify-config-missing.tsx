import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ShopifyConfigMissing() {
  return (
    <main className="min-h-screen pt-28 pb-16 px-4">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-primary mb-3">Shopify not connected</h1>
        <p className="text-muted-foreground mb-4">
          Create <code className="text-xs bg-secondary px-1 py-0.5 rounded">.env.local</code> in the project root
          (or set the same keys on Vercel). Use the{" "}
          <strong className="font-medium text-foreground">private</strong> Storefront token from Shopify
          Admin → <strong className="font-medium text-foreground">Headless</strong> → your storefront (not the
          Partners dev dashboard).
        </p>
        <p className="text-muted-foreground mb-6 text-sm">
          Required: <code className="text-xs bg-secondary px-1 py-0.5 rounded">SHOPIFY_STORE_DOMAIN</code>,{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code>,{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">SHOPIFY_FUNDRAISER_COLLECTION_HANDLES</code>
          . For live box counters and leaderboards also set{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">SHOPIFY_ADMIN_ACCESS_TOKEN</code> and{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">SHOPIFY_WEBHOOK_SECRET</code>. See{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">.env.example</code> and{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">README.md</code>.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  )
}
