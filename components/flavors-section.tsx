import Image from "next/image"

const FLAVORS = [
  {
    id: 1,
    name: "Classic Glazed",
    description: "Our signature light, fluffy yeast ring with a sweet vanilla glaze.",
    image: "/images/glazed_doughnut_1777852019288.png",
  },
  {
    id: 2,
    name: "Chocolate Iced",
    description: "Rich chocolate frosting topped with colorful rainbow sprinkles.",
    image: "/images/chocolate_doughnut_1777852073378.png",
  },
  {
    id: 3,
    name: "Strawberry Dream",
    description: "Vibrant strawberry icing finished with a generous dash of sprinkles.",
    image: "/images/strawberry_doughnut_1777852134601.png",
  }
]

export function FlavorsSection() {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-4">
            Flavors People Will Love
          </h2>
          <p className="text-lg text-muted-foreground">
            We only offer the most popular, crowd-pleasing flavors to ensure your fundraiser is a massive hit. Freshly made in Tasmania.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          {FLAVORS.map((flavor, index) => (
            <div 
              key={flavor.id} 
              className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl group hover:scale-105 transition-transform duration-300">
                <Image
                  src={flavor.image}
                  alt={flavor.name}
                  fill
                  className="object-cover group-hover:rotate-3 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{flavor.name}</h3>
              <p className="text-muted-foreground">{flavor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
