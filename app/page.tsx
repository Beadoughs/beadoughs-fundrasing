import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { GroupsBanner } from "@/components/groups-banner"
import { TestimonialsSection } from "@/components/testimonials-section"
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
      <GroupsBanner />
      <HowItWorksSection />
      <GroupsBanner variant="muted" />
      <TestimonialsSection />
      <ImpactSection />
      <CTASection />
      <EnquiryForm />
      <FAQSection />
      <Footer />
    </main>
  )
}
