import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Package, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance text-primary">
              Tasmania, let&apos;s turn delicious donuts into donations.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty">
              Beadoughs helps schools, clubs, charities, community groups and workplaces run uplifting doughnut fundraisers that feel easy and raise serious money.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-full px-8 text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link href="#enquiry">Submit a Fundraising Enquiry</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 text-base h-14 border-primary/30"
              >
                <Link href="/fundraisers">Support a fundraiser (shop)</Link>
              </Button>
            </div>

          </div>

          {/* Right - Hero Image & Stats */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border-4 border-white/20">
              <Image 
                src="/images/hero_doughnuts_1777851722550.png"
                alt="Delicious fresh doughnuts"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <Card className="absolute -bottom-6 -left-6 sm:-left-12 p-4 sm:p-6 bg-card/95 backdrop-blur-sm border-border shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Average Raised</p>
                  <p className="text-2xl font-bold text-foreground">$3,000</p>
                </div>
              </div>
            </Card>

            {/* Floating accent elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/30 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
