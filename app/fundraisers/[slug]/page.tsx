import { FUNDRAISERS } from "@/lib/data"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Users, Clock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutModal } from "@/components/checkout-modal"

export default async function FundraiserPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = FUNDRAISERS.find(f => f.slug === slug)

  if (!campaign) {
    notFound()
  }

  const percentRaised = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))

  return (
    <main className="min-h-screen pt-24 pb-16 bg-secondary/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium flex items-center justify-center gap-2">
            Organized by <span className="text-primary font-bold">{campaign.organization}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Story & Image */}
          <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <Image 
                src={campaign.image}
                alt={campaign.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
              
              <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Purchasing a box of Beadoughs doughnuts guarantees that a large portion of the profit goes directly to our cause.
                </p>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Donation/Purchase Card */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6 sm:p-8 shadow-2xl border-border bg-card rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">${campaign.raisedAmount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-2">raised of ${campaign.goalAmount.toLocaleString()} goal</span>
                </div>

                <Progress value={percentRaised} className="h-3 mb-6 bg-secondary" />

                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{campaign.supporters} supporters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <CheckoutModal fundraiserTitle={campaign.title} />
                  
                  <p className="text-xs text-center text-muted-foreground pt-4">
                    Secure payments via Stripe. Fresh doughnuts delivered locally.
                  </p>
                </div>

              </Card>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
