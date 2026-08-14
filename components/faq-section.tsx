import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Who can run a Sunny's Donuts fundraiser?",
      answer: "Any Australian community group can run a Sunny's Donuts fundraiser! This includes schools, P&Fs, sports clubs, charities, workplaces, community organisations, and more. If you're raising money for a good cause, we'd love to hear from you.",
    },
    {
      question: "How does the fundraiser work?",
      answer: "It's simple: your group collects pre-orders from supporters, we bake delicious donuts based on those orders, and then help coordinate delivery. Your group sells the donuts at a set price, keeps the profit margin, and supporters get delicious donuts. No upfront inventory, no waste, no stress.",
    },
    {
      question: "Do we need to pay upfront?",
      answer: "No upfront payment is required from your group. We operate on a pre-order model, which means donuts are only baked once orders are confirmed. This removes financial risk for your organisation.",
    },
    {
      question: "How much can our group raise?",
      answer: "Fundraising amounts vary based on your group's size and reach. Many groups raise between $1,000–$5,000 from a single fundraiser. We'll help you set realistic goals and maximise your results during the planning stage.",
    },
    {
      question: "Where is Sunny's Donuts available?",
      answer: "We work with groups across Australia. Reach and delivery options can vary by location — submit an enquiry and we'll confirm what we can support for your area.",
    },
    {
      question: "How do we get started?",
      answer: "Simply fill out the enquiry form on this page! Tell us about your group and your goals, and we'll be in touch within 1-2 business days to discuss the next steps. There's no obligation — it's just a friendly chat to see if we're the right fit.",
    },
  ]

  return (
    <section id="faq" className="py-16 sm:py-24 bg-secondary/30 scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
