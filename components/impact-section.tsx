import { Card } from "@/components/ui/card"
import { Award, DollarSign, Heart } from "lucide-react"

export function ImpactSection() {
  const stats = [
    {
      icon: Award,
      value: "30+",
      label: "fundraisers completed",
    },
    {
      icon: DollarSign,
      value: "$250,000+",
      label: "in fundraiser sales",
    },
    {
      icon: Heart,
      value: "Trusted",
      label: "by Tasmanian community groups",
    },
  ]

  return (
    <section id="why-fundraise" className="py-16 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Built For Community-First Results
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-8 sm:p-10 bg-card border-border rounded-2xl text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto p-8 sm:p-10 bg-secondary/50 border-border rounded-2xl text-center">
          <p className="text-lg text-foreground leading-relaxed">
            Every fundraiser is designed to help local groups and workplaces raise meaningful money while supporters get doughnuts they are genuinely excited to buy. We keep the process practical, uplifting and people-first from first enquiry to final handover.
          </p>
        </Card>
      </div>
    </section>
  )
}
