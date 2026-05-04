import { Card } from "@/components/ui/card"
import { ThumbsUp, Users, ListChecks, MapPin, Cookie, Smile } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: ThumbsUp,
      title: "Easy to sell",
      description: "Everyone loves fresh doughnuts. Your supporters will actually be excited to buy.",
    },
    {
      icon: Users,
      title: "Community-friendly",
      description: "Perfect for sharing with friends, family, and workmates. Great for any occasion.",
    },
    {
      icon: ListChecks,
      title: "Simple pre-order system",
      description: "No upfront costs or leftover inventory. Only order what you&apos;ve already sold.",
    },
    {
      icon: MapPin,
      title: "Great for local causes",
      description: "Supporting Tasmanian groups with a product made right here in Tasmania.",
    },
    {
      icon: Cookie,
      title: "Fresh premium doughnuts",
      description: "Hand-made with quality ingredients. A product your group can be proud to sell.",
    },
    {
      icon: Smile,
      title: "Less volunteer stress",
      description: "We handle the hard parts so your volunteers can focus on their community.",
    },
  ]

  return (
    <section id="why-fundraise" className="py-16 sm:py-24 bg-primary text-primary-foreground scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            Why Groups Choose Beadoughs
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            We&apos;ve designed our fundraising model to make life easier for community groups.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="p-6 sm:p-8 bg-primary-foreground/10 border-primary-foreground/20 rounded-2xl hover:bg-primary-foreground/15 transition-colors backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
