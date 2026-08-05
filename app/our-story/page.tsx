import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Our Story | Sunny's Donuts",
  description:
    "How Sunny's Donuts started in Burnie and grew into Tasmania-wide, community-driven fundraising.",
}

const milestones = [
  {
    title: "Mum's Kitchen",
    year: "2020",
    description:
      "Sunny's Donuts began in Sunny's mum's kitchen in Burnie, with handmade donuts and a big heart for community.",
    image: "/images/story/mums-kitchen.jpg",
  },
  {
    title: "Market Stall",
    year: "Early Growth",
    description:
      "Weekend markets turned into a local favourite, with queues forming for fresh batches and friendly service.",
    image: "/images/story/market-stall.png",
    imageClassName: "object-[center_20%]",
  },
  {
    title: "Shop",
    year: "Next Step",
    description:
      "The move into a dedicated shop gave Sunny's Donuts room to grow while keeping the same quality and energy.",
    image: "/images/story/shop.png",
  },
  {
    title: "Fundraising Pivot",
    year: "Community Focus",
    description:
      "Demand from schools, clubs, and families inspired a shift toward fundraising-first campaigns across Tasmania.",
    image: "/images/story/fundraising-pivot.png",
  },
  {
    title: "Helping People in Need",
    year: "Today",
    description:
      "In 2025, we helped raise $11,079 for Constable Keith Smith — one of many campaigns focused on uplifting Tasmanians in real need.",
    image: "/images/story/helping-people.png",
  },
]

export default function OurStoryPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-yellow)]">Dough for Good</p>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary text-balance">
              Our Story
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
              Sunny Beatson founded Sunny&apos;s Donuts in 2020 during COVID, starting in his mum&apos;s
              kitchen in Burnie, Tasmania, with a passion for bringing people together through handmade,
              quality donuts.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary">
                From Kitchen To Community
              </h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                A simple idea became a Tasmania-wide fundraising journey built on quality donuts, care, and
                local impact.
              </p>

              <div className="relative mt-8">
                <div className="absolute left-3 top-0 h-full w-px bg-primary/25 sm:left-4 lg:left-1/2 lg:-translate-x-1/2" />

                <div className="space-y-6 lg:space-y-10">
                  {milestones.map((milestone, index) => (
                    <article key={milestone.title} className="relative pl-8 sm:pl-10 lg:pl-0">
                      <div className="absolute left-[0.45rem] top-7 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm sm:left-[0.7rem] lg:left-1/2 lg:-translate-x-1/2" />
                      <div className={`lg:grid lg:grid-cols-2 ${index % 2 === 0 ? "lg:pr-8" : "lg:pl-8"}`}>
                        <div
                          className={
                            index % 2 === 0
                              ? "lg:col-start-1 lg:pr-10"
                              : "lg:col-start-2 lg:pl-10"
                          }
                        >
                          <div className="rounded-2xl border border-primary/20 bg-secondary/40 p-4 sm:p-5 shadow-sm backdrop-blur-sm">
                        <div className="relative overflow-hidden rounded-xl bg-background/80 ring-1 ring-primary/15">
                          <Image
                            src={milestone.image}
                            alt={`${milestone.title} milestone image`}
                            width={500}
                            height={320}
                            className={`h-32 w-full object-cover sm:h-36 ${milestone.imageClassName ?? ""}`}
                          />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {milestone.year}
                        </p>
                        <h3 className="mt-1 font-heading text-xl font-bold text-primary">{milestone.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{milestone.description}</p>
                        <p className="mt-3 text-xs font-medium text-primary/80">Milestone {index + 1} of 5</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-10 lg:p-12">
              <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-primary-foreground/10" />
              <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-primary-foreground/10" />
              <div className="relative z-10 max-w-3xl">
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground">
                  Our Mission
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/90">
                  Our mission is simple: to give back to the state that gave us so much.
                </p>
                <p className="mt-4 text-primary-foreground/85">
                  From upgrading basketball courts to supporting grieving families, every campaign is
                  built to uplift Tasmanians through meaningful, community-driven fundraising.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Link href="/fundraise#enquiry">Start a fundraiser</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
