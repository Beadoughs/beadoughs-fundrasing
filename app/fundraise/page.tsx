import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GroupsBanner } from "@/components/groups-banner"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ImpactSection } from "@/components/impact-section"
import { CTASection } from "@/components/cta-section"
import { EnquiryForm } from "@/components/enquiry-form"
import { FAQSection } from "@/components/faq-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Run a Fundraiser | Sunny's Donuts",
  description:
    "How Sunny's Donuts fundraisers work for Tasmanian schools, clubs, charities and workplaces — plus FAQs and how to get started.",
}

export default function FundraisePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-heading font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-yellow)]">
            Dough for Good
          </p>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary text-balance">
            Run a Sunny&apos;s Donuts Fundraiser
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, high-margin donut campaigns for schools, clubs, charities, community groups
            and workplaces across Tasmania.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 text-base h-12">
              <Link href="#enquiry">Submit a Fundraising Enquiry</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base h-12">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
      <GroupsBanner />
      <HowItWorksSection />
      <TestimonialsSection />
      <ImpactSection />
      <CTASection />
      <EnquiryForm />
      <FAQSection />
      <Footer />
    </main>
  )
}
