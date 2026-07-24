import { Trophy } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/fundraising/types"

type Props = {
  entries: LeaderboardEntry[]
  className?: string
}

export function FundraiserLeaderboard({ entries, className }: Props) {
  const top = entries.slice(0, 10)

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Leaderboard</h3>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No boxes sold yet — be the first on the board!
        </p>
      ) : (
        <ol className="space-y-2">
          {top.map((entry, index) => (
            <li
              key={entry.key}
              className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-primary w-6 shrink-0 tabular-nums">
                  {index + 1}
                </span>
                <span className="font-medium truncate">{entry.name}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {entry.boxes} {entry.boxes === 1 ? "box" : "boxes"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
