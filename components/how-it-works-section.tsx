import { Card } from "@/components/ui/card"
import { Send, Handshake, ClipboardList, Truck } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Send,
      title: "Submit enquiry",
      description: "Tell us about your group and your fundraising goals. We&apos;ll get back to you quickly.",
    },
    {
      number: "02",
      icon: Handshake,
      title: "We help set up",
      description: "We&apos;ll work with you to plan your fundraiser, set dates, and provide all the materials you need.",
    },
    {
      number: "03",
      icon: ClipboardList,
      title: "Collect pre-orders",
      description: "Your group collects orders from supporters using our simple system. No inventory risk.",
    },
    {
      number: "04",
      icon: Truck,
      title: "We bake & deliver",
      description: "We bake fresh doughnuts and help coordinate delivery so your group can distribute them.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            How A Beadoughs Fundraiser Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four simple steps to a successful fundraiser for your community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="relative p-6 sm:p-8 bg-card border-border rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              {/* Step Number */}
              <span className="absolute top-4 right-4 text-6xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {step.number}
              </span>
              
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <step.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
