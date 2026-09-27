import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingForm } from "@/components/booking-form"

export const metadata: Metadata = {
  title: "Book a Fundraiser | Sunny's Donuts",
  description:
    "Book your Sunny's Donuts fundraiser — tell us about your group, goal and preferred delivery date.",
}

export default function BookPage() {
  return (
    <main className="min-h-screen bg-secondary/10">
      <Header />
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-10">
          <p className="text-sm font-heading font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-yellow)]">
            Donuts for Charity
          </p>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-primary text-balance">
            Let&apos;s Make a Booking!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Fill in your details below and we&apos;ll be in touch to lock in your fundraiser.
          </p>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
