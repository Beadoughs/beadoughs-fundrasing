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
  const segment = (
    <>
      <span className="giveaway-marquee-dot" aria-hidden="true" />
      <span>{message}</span>
    </>
  )

  return (
    <div
      className="giveaway-marquee-bar fixed left-0 right-0 z-40 border-b border-white/10 bg-[color:var(--brand-dark)] text-white"
      style={{ top: "var(--site-header-height, 4.5rem)" }}
      role="status"
      aria-label={message}
    >
      <div className="giveaway-marquee-static hidden motion-reduce:flex items-center justify-center gap-3 px-4 py-2.5 text-center text-[11px] sm:text-xs font-heading font-medium tracking-wide">
        <span className="text-[color:var(--brand-yellow)]" aria-hidden="true">
          ◆
        </span>
        {message}
        <span className="text-[color:var(--brand-yellow)]" aria-hidden="true">
          ◆
        </span>
      </div>
      <div className="giveaway-marquee-track motion-reduce:hidden overflow-hidden py-2.5">
        <div className="giveaway-marquee-inner flex w-max items-center whitespace-nowrap text-[11px] sm:text-xs font-heading font-medium tracking-wide">
          <span className="flex items-center" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={`a-${i}`} className="flex items-center">
                {segment}
              </span>
            ))}
          </span>
          <span className="flex items-center" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={`b-${i}`} className="flex items-center">
                {segment}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Extra top padding when the giveaway banner is visible under the fixed header. */
export function giveawayMainPadClass(base = "pt-24"): string {
  if (!isGiveawayEnabled()) return base
  return "pt-36 sm:pt-40"
}
