import { Card } from "@/components/ui/card"
import { Quote } from "lucide-react"

const TESTIMONIALS = [
  {
    id: 1,
    quote: "We raised over $2,500 for our new playground equipment in just one week! The doughnuts practically sold themselves.",
    author: "Sarah J.",
    role: "P&C President",
    school: "Hobart Primary School"
  },
  {
    id: 2,
    quote: "The easiest fundraiser we've ever run. No upfront costs meant zero risk for our club, and the delivery was perfectly on time.",
    author: "Mark T.",
    role: "Club Secretary",
    school: "Launceston Football Club"
  },
  {
    id: 3,
    quote: "Everyone loved the quality. We had people asking when we were going to run the fundraiser again before it even finished!",
    author: "Emma R.",
    role: "Fundraising Coordinator",
    school: "Local Charity Group"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Hear From Our Community
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            See how Beadoughs has helped Tasmanian groups reach their fundraising goals without the usual stress.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="p-8 bg-card text-card-foreground border-none shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <Quote className="h-8 w-8 text-accent mb-6 opacity-50" />
              <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                <p className="text-sm text-primary font-medium mt-1">{testimonial.school}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
