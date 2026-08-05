import { Button } from "@/components/ui/button"
import { BrandSparkle } from "@/components/brand-sparkle"
import { Check, Mail, Send } from "lucide-react"

const CONTACT_EMAIL = "Sunny@sunnysdonuts.com.au"
const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Fundraising enquiry")}&body=${encodeURIComponent("Hi Sunny's,\n\nI'd like to start a fundraising enquiry.\n\n")}`

const benefits = [
  "No obligation — just a friendly chat about your goals",
  "We'll help you figure out if a donut fundraiser is right for you",
  "Get a clear picture of how the process works",
]

export function EnquirySection() {
  return (
    <section id="enquiry" className="relative scroll-mt-20 overflow-hidden bg-white py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-32 -top-20 h-80 w-80 rounded-full bg-secondary blur-2xl" aria-hidden />
      <div className="brand-blob absolute left-0 top-0 h-[360px] w-[360px] opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          <h2 className="inline-flex flex-wrap items-center justify-center gap-2 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance lg:justify-start">
            Let&apos;s Get Your Fundraiser Rolling
            <BrandSparkle className="mt-1" />
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Email us about your group, school, charity or workplace and we&apos;ll reply within 1–2
            business days to shape the right plan for you.
          </p>

          <div className="mt-8 space-y-4 text-left">
            {benefits.map((text) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-yellow)] text-foreground shadow-sm">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </div>
                <p className="pt-0.5 leading-relaxed text-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap lg:justify-start">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-base shadow-lg shadow-primary/20">
              <a href={MAILTO_HREF} className="inline-flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Fundraising Enquiry
              </a>
            </Button>
            <a
              href={MAILTO_HREF}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
