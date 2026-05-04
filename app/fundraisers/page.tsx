import { FUNDRAISERS } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function FundraisersDirectoryPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-6">
            Support Local Fundraisers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse active fundraising campaigns in your community. Every box of doughnuts purchased goes directly towards helping these groups reach their goals!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FUNDRAISERS.map((campaign, index) => {
            const percentRaised = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
            
            return (
              <Card 
                key={campaign.id} 
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex flex-col"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {campaign.organization}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl mb-2 line-clamp-2 text-foreground">{campaign.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{campaign.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <Progress value={percentRaised} className="h-2" />
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-primary font-bold">${campaign.raisedAmount.toLocaleString()} raised</span>
                      <span className="text-muted-foreground">of ${campaign.goalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full rounded-full">
                    <Link href={`/fundraisers/${campaign.slug}`}>
                      Support This Cause
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
