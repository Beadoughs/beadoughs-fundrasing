import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Monitor, Megaphone, Smartphone, Truck, FileDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const steps: {
  icon: LucideIcon
  title: string
  description: string
  bullets?: string[]
}[] = [
  {
    icon: Monitor,
    title: "We create your fundraiser",
    description: "We provide everything you need to get started.",
    bullets: ["QR code", "Online ordering page", "Posters", "Order forms", "Social media graphics"],
  },
  {
    icon: Megaphone,
    title: "You share it",
    description: "Share with your students, members, friends, family and supporters.",
  },
  {
    icon: Smartphone,
    title: "Supporters order online",
    description: "They simply scan your QR code or visit your online page to order.",
  },
  {
    icon: Truck,
    title: "We handle everything else",
    description: "We bake, pack, organise delivery and prepare for an easy collection day.",
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#fdf8f0] py-16 sm:py-24 scroll-mt-28 sm:scroll-mt-32"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0b2566]">
          How It Works
        </h2>
        <div className="mt-5 h-1 w-20 rounded-full bg-[#f5a800]" />
        <p className="mt-6 text-sm sm:text-base font-heading font-semibold uppercase tracking-[0.15em] text-primary">
          Fundraising in 4 simple steps
        </p>

        <ol className="mt-10 space-y-2">
          {steps.map((step, index) => {
            const yellow = index % 2 === 1
            return (
              <li key={step.title} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full font-heading text-xl sm:text-2xl font-bold text-white shadow-md",
                      yellow ? "bg-[#f5a800]" : "bg-primary",
                    )}
                  >
                    {index + 1}
                  </span>
                  {index < steps.length - 1 && (
                    <span
                      className="mt-2 flex-1 border-l-2 border-dotted border-[#f5a800]"
                      aria-hidden
                    />
                  )}
                </div>

                <div className="hidden sm:flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#f5ead8]">
                  <step.icon className="h-11 w-11 text-primary" strokeWidth={1.5} />
                </div>

                <div className="pt-1 sm:pt-3">
                  <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wide text-[#0b2566]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{step.description}</p>
                  {step.bullets && (
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#f5a800]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mt-8 sm:ml-[8.5rem] border-t-2 border-[#f5a800] w-24" />
        <p className="mt-4 sm:ml-[8.5rem] font-heading text-lg font-bold uppercase tracking-wide text-primary">
          You receive the profits!
        </p>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-full px-8 text-base h-12">
            <a
              href="/downloads/sunnys-donuts-fundraiser-info-pack.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileDown className="mr-2 h-5 w-5" />
              Download our Fundraiser Info Pack
            </a>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">PDF · opens in a new tab</p>
        </div>
      </div>
    </section>
  )
}
