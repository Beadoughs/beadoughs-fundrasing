import { Card } from "@/components/ui/card"
import { Clock, ShoppingBag, Heart, ArrowRight } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: "Hard to organise",
      description: "Traditional fundraisers require endless coordination, spreadsheets, and volunteer time.",
    },
    {
      icon: ShoppingBag,
      title: "Low-profit products",
      description: "Selling items people don&apos;t actually want means lower sales and frustrated supporters.",
    },
    {
      icon: Heart,
      title: "Volunteer burnout",
      description: "Too much pressure falls on a few dedicated volunteers trying to make it all work.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Fundraising Shouldn&apos;t Be Complicated
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We know the challenges community groups face when trying to raise money.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem) => (
            <Card
              key={problem.title}
              className="p-6 sm:p-8 bg-card border-border rounded-2xl hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                <problem.icon className="h-7 w-7" style={{ color: '#000000' }} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground">
                {problem.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Solution Bridge */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="inline-flex items-center gap-4 px-6 sm:px-8 py-4 bg-primary text-primary-foreground rounded-full">
            <span className="font-medium">
              Beadoughs makes fundraising simple
            </span>
            <ArrowRight className="h-5 w-5" />
          </Card>
        </div>
      </div>
    </section>
  )
}
