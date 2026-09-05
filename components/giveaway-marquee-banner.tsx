import {
  giveawayBannerMessage,
  isGiveawayEnabled,
} from "@/lib/fundraising/giveaway"

/**
 * Sliding announcement bar under the fixed header on fundraiser + cart pages.
 */
export function GiveawayMarqueeBanner() {
  if (!isGiveawayEnabled()) return null

  const message = giveawayBannerMessage()
  const segment = `${message}  ·  `

  return (
    <div
      className="giveaway-marquee-bar fixed left-0 right-0 z-40 border-b border-[color:var(--brand-dark)]/15 bg-[color:var(--brand-yellow)] text-[color:var(--brand-dark)]"
      style={{ top: "var(--site-header-height, 4.5rem)" }}
      role="status"
      aria-label={message}
    >
      <div className="giveaway-marquee-static hidden motion-reduce:flex items-center justify-center px-4 py-2 text-center text-xs sm:text-sm font-heading font-semibold">
        {message}
      </div>
      <div className="giveaway-marquee-track motion-reduce:hidden overflow-hidden py-2">
        <div className="giveaway-marquee-inner flex w-max whitespace-nowrap text-xs sm:text-sm font-heading font-semibold">
          <span aria-hidden="true">{segment.repeat(8)}</span>
          <span aria-hidden="true">{segment.repeat(8)}</span>
        </div>
      </div>
    </div>
  )
}

/** Extra top padding when the giveaway banner is visible under the fixed header. */
export function giveawayMainPadClass(base = "pt-24"): string {
  if (!isGiveawayEnabled()) return base
  // header (~4.5–5.5rem) + banner (~2.25rem)
  return "pt-36 sm:pt-40"
}
