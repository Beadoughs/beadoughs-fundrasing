import { Button } from "@/components/ui/button"
import { BrandSparkle } from "@/components/brand-sparkle"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 sm:pt-32 pb-16 sm:pb-24">
      {/* Soft blue decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
        <div className="brand-blob absolute -bottom-24 -left-24 h-[420px] w-[420px]" />
        <div className="absolute top-24 right-[40%] h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-[color:var(--brand-yellow)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-balance">
              <span className="text-primary">Dough</span>{" "}
              <span className="relative inline-block text-[color:var(--brand-yellow)]">
                for Good
                <BrandSparkle className="absolute -right-7 -top-2 sm:-right-8 sm:-top-3" />
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed">
              Delicious donuts that help schools, clubs and community groups raise funds —
              or support a campaign that&apos;s already underway.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 text-base h-14 shadow-lg shadow-primary/20"
              >
                <Link href="#fundraisers">Support a fundraiser</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base h-14"
              >
                <Link href="/fundraise">Start a fundraiser</Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 fill-mode-both">
            <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] shadow-2xl shadow-primary/10 ring-1 ring-black/5">
              <Image
                src="/images/hero_sunnys_donuts.png"
                alt="Two open Sunny's Donuts boxes filled with assorted donuts"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
