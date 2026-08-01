import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { FundraiserCollectionCard } from "@/lib/shopify/fundraiser-data"
import { percentBoxesSold } from "@/lib/shopify/fundraiser-data"

type FundraiserCardGridProps = {
  cards: FundraiserCollectionCard[]
  /** Cap how many cards render (e.g. home featured strip). */
  limit?: number
}

export function FundraiserCardGrid({ cards, limit }: FundraiserCardGridProps) {
  const visible = typeof limit === "number" ? cards.slice(0, limit) : cards

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {visible.map((campaign, index) => {
        const pct = percentBoxesSold(campaign.boxesSold, campaign.goalBoxes)
        const orgLabel = campaign.organization ?? campaign.title
        const hasGoal = campaign.goalBoxes != null && campaign.goalBoxes > 0

        return (
          <Link
            key={campaign.id}
            href={`/fundraisers/${campaign.handle}`}
            aria-label={`Support ${campaign.title}`}
            className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex flex-col h-full"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-48 w-full bg-secondary/30">
                {campaign.imageUrl ? (
                  <Image
                    src={campaign.imageUrl}
                    alt={campaign.imageAlt ?? campaign.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Images coming soon
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm max-w-[85%] truncate">
                  {orgLabel}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-xl mb-2 line-clamp-2 text-foreground">
                  {campaign.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                  {campaign.description || "Open this campaign to see products and support the cause."}
                </p>

                <div className="space-y-4 mb-6">
                  {hasGoal ? (
                    <>
                      <Progress value={pct} className="h-2" />
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary font-bold tabular-nums">
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

                <Button asChild className="w-full rounded-full mt-auto pointer-events-none">
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
