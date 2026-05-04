import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FlavorsSection } from "@/components/flavors-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { BenefitsSection } from "@/components/benefits-section"
import { ImpactSection } from "@/components/impact-section"
import { CTASection } from "@/components/cta-section"
import { EnquiryForm } from "@/components/enquiry-form"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FlavorsSection />
      <TestimonialsSection />
      <BenefitsSection />
      <ImpactSection />
      <CTASection />
      <EnquiryForm />
      <FAQSection />
      <Footer />
    </main>
  )
}
