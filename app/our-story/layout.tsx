import type { Metadata } from "next"
import Link from "next/link"

const STORY_ON_MAIN_SITE = "https://www.beadoughs.com/pages/about-us"

/**
 * Canonical tells search engines the primary story/about URL lives on the main
 * Beadoughs site. The banner makes the same link visible on this fundraiser page.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: STORY_ON_MAIN_SITE,
  },
}

export default function OurStoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="border-b border-border bg-secondary/40 px-4 py-2.5 text-center text-sm text-muted-foreground">
        <span className="mr-1.5">Full story and about us on the main site:</span>
        <Link
          href={STORY_ON_MAIN_SITE}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {STORY_ON_MAIN_SITE.replace(/^https:\/\//, "")}
        </Link>
      </div>
      {children}
    </>
  )
}
