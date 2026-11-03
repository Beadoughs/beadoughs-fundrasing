import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WaitlistForm } from "@/components/waitlist-form"

export const metadata: Metadata = {
  title: "Fundraiser Waitlist | Sunny's Donuts",
  description:
    "Join the Sunny's Donuts fundraiser waitlist and get notified when bookings reopen.",
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
            Fundraiser bookings are paused
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re not taking new Sunny&apos;s Donuts fundraiser bookings right now. Join the
            waitlist and we&apos;ll email you as soon as the next round opens.
          </p>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <WaitlistForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
