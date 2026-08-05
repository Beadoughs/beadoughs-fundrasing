import { Button } from "@/components/ui/button"
import { HeroDonutDecorations } from "@/components/donut-decorations"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      <HeroDonutDecorations />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground">
              <span className="text-[color:var(--brand-yellow)]">Dough for Good</span>
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance text-primary">
              Sunny&apos;s Donuts
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty">
              Tasmania-made donuts that help schools, clubs and community groups raise funds —
              or support a campaign that&apos;s already underway.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Link href="#fundraisers">Support a fundraiser</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base h-14 border-[color:var(--brand-yellow)] bg-[color:var(--brand-yellow)]/20 hover:bg-[color:var(--brand-yellow)]/35"
              >
                <Link href="/fundraise">Start a fundraiser</Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border-4 border-white/20">
              <Image
                src="/images/hero_donut_boxes.png"
                alt="Two open Sunny's Donuts boxes with assorted and glazed donuts"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/40 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
