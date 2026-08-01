import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    title: "Mum's Kitchen",
    year: "2020",
    description:
      "Beadoughs began in Sunny's mum's kitchen in Burnie — handmade donuts with a heart for community.",
    image: "/images/story/mums-kitchen.jpg",
  },
  {
    title: "Markets to Shop",
    year: "Growth",
    description:
      "Weekend markets became a local favourite, then a dedicated shop — same quality, bigger reach.",
    image: "/images/story/market-stall.png",
    imageClassName: "object-[center_20%]",
  },
  {
    title: "Fundraising First",
    year: "Today",
    description:
      "Schools, clubs and families across Tasmania raise meaningful money with doughnuts people love.",
    image: "/images/story/fundraising-pivot.png",
  },
]

export function HomeStorySection() {
  return (
    <section id="story" className="py-16 sm:py-24 scroll-mt-20 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Deliciously Doing Good
          </p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Our Story
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            From a Burnie kitchen to Tasmania-wide fundraising — Beadoughs exists to give back to
            the state that gave us so much.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item) => (
            <article key={item.title} className="group">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-secondary/40 ring-1 ring-primary/10">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.imageClassName ?? ""}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {item.year}
              </p>
              <h3 className="mt-1 font-serif text-xl font-bold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link href="/our-story">Read our full story</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
