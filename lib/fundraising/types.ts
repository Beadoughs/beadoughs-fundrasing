export type LeaderboardEntry = {
  /** Stable buyer key (customer id or hashed email). */
  key: string
  /** Public display name, e.g. "Sarah J." */
  name: string
  boxes: number
}

export type FundraiserStats = {
  boxesSold: number
  leaderboard: LeaderboardEntry[]
}
