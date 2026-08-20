import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { FundraiserCollectionCard } from "@/lib/shopify/fundraiser-data"
import { percentBoxesSold } from "@/lib/shopify/fundraiser-data"
import { cn } from "@/lib/utils"

type FundraiserCardGridProps = {
  cards: FundraiserCollectionCard[]
  /** Cap how many cards render (e.g. home featured strip). */
  limit?: number
  /** Grid columns — use 2 for large homepage cards. */
  columns?: 2 | 3
  /** Campaign link prefix — `/fundraisers`, `/qld/fundraisers`, or `/p`. */
  basePath?: string
  /** Per-handle href when cards span multiple regions (e.g. search results). */
  hrefByHandle?: Record<string, string>
}

export function FundraiserCardGrid({
  cards,
  limit,
  columns = 3,
  basePath = "/fundraisers",
  hrefByHandle,
}: FundraiserCardGridProps) {
  const visible = typeof limit === "number" ? cards.slice(0, limit) : cards
  const root = basePath.replace(/\/$/, "")

  return (
    <div
      className={cn(
        "grid gap-8",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {visible.map((campaign, index) => {
        const pct = percentBoxesSold(campaign.boxesSold, campaign.goalBoxes)
        const orgLabel = campaign.organization ?? campaign.title
        const hasGoal = campaign.goalBoxes != null && campaign.goalBoxes > 0
        const href = hrefByHandle?.[campaign.handle] ?? `${root}/${campaign.handle}`

        return (
          <Link
            key={campaign.id}
            href={href}
            aria-label={`Support ${campaign.title}`}
            className="block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card
              className="overflow-hidden rounded-[1.5rem] border-border/60 bg-white shadow-lg shadow-primary/5 hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex flex-col h-full p-0 gap-0"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={cn("relative w-full bg-secondary/50", columns === 2 ? "h-56" : "h-48")}>
                {campaign.imageUrl ? (
                  <Image
                    src={campaign.imageUrl}
                    alt={campaign.imageAlt ?? campaign.title}
                    fill
                    className="object-cover"
                    sizes={columns === 2 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Images coming soon
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-heading font-semibold shadow-sm max-w-[85%] truncate">
                  {orgLabel}
                </div>
              </div>

              <div className="p-6 sm:p-7 flex flex-col flex-grow">
                <h3 className="font-heading font-bold text-xl mb-2 line-clamp-2 text-foreground">
                  {campaign.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                  {campaign.description || "Open this campaign to see products and support the cause."}
                </p>

                <div className="space-y-3 mb-6">
                  {hasGoal ? (
                    <>
                      <Progress value={pct} className="h-2.5 rounded-full" />
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary font-heading font-semibold tabular-nums">
                          {campaign.boxesSold.toLocaleString()} sold
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          of {campaign.goalBoxes!.toLocaleString()} boxes
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground tabular-nums">
                      {campaign.boxesSold.toLocaleString()}{" "}
                      {campaign.boxesSold === 1 ? "box" : "boxes"} sold
                    </p>
                  )}
                </div>

                <Button asChild className="w-full rounded-full mt-auto pointer-events-none h-12">
                  <span aria-hidden="true">Support this cause</span>
                </Button>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
