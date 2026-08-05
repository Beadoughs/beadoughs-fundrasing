import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandSparkle } from "@/components/brand-sparkle"
import { Home, Store, HeartHandshake } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const highlights: {
  title: string
  year: string
  description: string
  icon: LucideIcon
}[] = [
  {
    title: "Mum's Kitchen",
    year: "2020",
    description:
      "Sunny's Donuts began in Sunny's mum's kitchen in Burnie — handmade donuts with a heart for community.",
    icon: Home,
  },
  {
    title: "Markets to Shop",
    year: "Growth",
    description:
      "Weekend markets became a local favourite, then a dedicated shop — same quality, bigger reach.",
    icon: Store,
  },
  {
    title: "Fundraising First",
    year: "Today",
    description:
      "Schools, clubs and families across Tasmania raise meaningful money with donuts people love.",
    icon: HeartHandshake,
  },
]

export function HomeStorySection() {
  return (
    <section id="story" className="relative scroll-mt-20 overflow-hidden bg-white py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-secondary blur-2xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 sm:mb-16 flex flex-col items-center gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <h2 className="inline-flex items-center gap-2 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
              Our Story
              <BrandSparkle />
            </h2>
          </div>
          <p className="max-w-md text-base sm:text-lg text-muted-foreground">
            From a Burnie kitchen to Tasmania-wide fundraising — Sunny&apos;s Donuts exists to give
            back to the state that gave us so much.
          </p>
        </div>

        <div className="relative">
          {/* Connecting dotted line (desktop) */}
          <div
            className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-10 hidden h-0 border-t-2 border-dashed border-primary/35 md:block"
            aria-hidden
          />

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {highlights.map((item) => (
              <article key={item.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary shadow-sm ring-4 ring-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <item.icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-[color:var(--brand-yellow)] px-2 py-0.5 text-[10px] font-heading font-bold text-foreground shadow-sm">
                    {item.year}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-primary">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12">
            <Link href="/our-story">Read our full story</Link>
          </Button>
        </div>
      </div>

      {/* Soft wave into fundraisers */}
      <div className="brand-wave absolute bottom-0 translate-y-[99%]" aria-hidden>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  )
}
