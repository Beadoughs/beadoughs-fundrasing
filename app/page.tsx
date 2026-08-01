import type { Metadata } from "next"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HomeStorySection } from "@/components/home-story-section"
import { FeaturedFundraisersSection } from "@/components/featured-fundraisers-section"
import { EnquiryForm } from "@/components/enquiry-form"
import { Footer } from "@/components/footer"

export const revalidate = 30

export const metadata: Metadata = {
  title: "Beadoughs | Deliciously Doing Good — Tasmanian Doughnut Fundraising",
  description:
    "Beadoughs helps Tasmanian schools, clubs and community groups raise money with doughnuts people love. Run a fundraiser or support an active campaign.",
  openGraph: {
    title: "Beadoughs | Deliciously Doing Good",
    description:
      "Run a doughnut fundraiser or support an active Tasmanian campaign. Premium doughnuts, real community impact.",
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
      <EnquiryForm />
      <Footer />
    </main>
  )
}
