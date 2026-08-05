import type { Metadata } from "next"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HomeStorySection } from "@/components/home-story-section"
import { FeaturedFundraisersSection } from "@/components/featured-fundraisers-section"
import { EnquirySection } from "@/components/enquiry-section"
import { Footer } from "@/components/footer"

export const revalidate = 30

export const metadata: Metadata = {
  title: "Sunny's Donuts | Dough for Good — Tasmanian Donut Fundraising",
  description:
    "Sunny's Donuts helps Tasmanian schools, clubs and community groups raise money with donuts people love. Run a fundraiser or support an active campaign.",
  openGraph: {
    title: "Sunny's Donuts | Dough for Good",
    description:
      "Run a donut fundraiser or support an active Tasmanian campaign. Premium donuts, real community impact.",
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
      <EnquirySection />
      <Footer />
    </main>
  )
}
