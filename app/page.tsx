import type { Metadata } from "next"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HomeStorySection } from "@/components/home-story-section"
import { FeaturedFundraisersSection } from "@/components/featured-fundraisers-section"
import { WaitlistForm } from "@/components/waitlist-form"
import { Footer } from "@/components/footer"

export const revalidate = 30

export const metadata: Metadata = {
  title: "Sunny's Donuts | Donuts for Charity",
  description:
    "Sunny's Donuts helps schools, clubs and community groups across Australia raise money with donuts people love. Join the waitlist or support an active campaign.",
  openGraph: {
    title: "Sunny's Donuts | Donuts for Charity",
    description:
      "Join the waitlist for the next Sunny's Donuts fundraiser round, or support an active campaign.",
    type: "website",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <HomeStorySection />
      <FeaturedFundraisersSection />
      <section className="relative scroll-mt-28 overflow-hidden bg-secondary/20 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <WaitlistForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
