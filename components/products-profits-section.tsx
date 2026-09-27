import Image from "next/image"
import { HandCoins, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

const products: {
  name: string
  image: string
  price: string
  yellow?: boolean
  flavours?: string[]
  flavoursLabel?: string
}[] = [
  {
    name: "Original Glazed",
    image: "/images/info-pack/original-glazed.jpg",
    price: "$20",
  },
  {
    name: "Assorted Box",
    image: "/images/info-pack/assorted-box.jpg",
    price: "$25",
    yellow: true,
    flavoursLabel: "Includes:",
    flavours: ["Chocolate", "Nutella", "Vanilla", "Salted Caramel", "Strawberry", "Double Chocolate"],
  },
  {
    name: "Filled Favourites",
    image: "/images/info-pack/filled-favourites.jpg",
    price: "$27",
    flavours: ["Nutella", "Custard", "Salted Caramel", "Tasmanian Jam"],
  },
]

export function ProductsProfitsSection() {
  return (
    <section className="relative overflow-hidden bg-[#fdf8f0] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0b2566]">
          Products &amp; Profits
        </h2>
        <div className="mt-5 h-1 w-20 rounded-full bg-[#f5a800]" />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.name}
              className={cn(
                "flex flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-sm",
                p.yellow ? "border-[#f5a800]" : "border-primary",
              )}
            >
              <div
                className={cn(
                  "px-4 py-4 text-center font-heading text-lg font-bold uppercase tracking-wide",
                  p.yellow ? "bg-[#f5a800] text-white" : "bg-primary text-white",
                )}
              >
                {p.name}
                <span className="block">6 Pack</span>
              </div>
              <div className="relative aspect-[4/5] w-full bg-[#fdf8f0]">
                <Image
                  src={p.image}
                  alt={`${p.name} 6 pack`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col items-center px-6 pb-7 pt-6 text-center">
                <p
                  className={cn(
                    "font-heading text-5xl font-bold",
                    p.yellow ? "text-[#f5a800]" : "text-primary",
                  )}
                >
                  {p.price}
                </p>
                <div
                  className={cn(
                    "mt-4 h-0.5 w-3/4",
                    p.yellow ? "bg-[#f5a800]" : "bg-primary",
                  )}
                />
                <div className="flex-1 w-full">
                  {p.flavours ? (
                    <div className="mt-4 text-left">
                      {p.flavoursLabel && (
                        <p className="mb-2 text-sm text-foreground">{p.flavoursLabel}</p>
                      )}
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-foreground">
                        {p.flavours.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                p.yellow ? "bg-[#f5a800]" : "bg-primary",
                              )}
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-foreground">Your organisation earns</p>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-5 rounded-lg px-6 py-2.5 font-heading text-lg font-bold text-white",
                    p.yellow ? "bg-[#f5a800]" : "bg-primary",
                  )}
                >
                  $5 PROFIT
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#f5ead8] px-6 py-6 text-center sm:flex-row sm:text-left">
          <HandCoins className="h-12 w-12 text-primary" strokeWidth={1.5} />
          <div className="sm:border-l-2 sm:border-[#f5a800] sm:pl-6">
            <p className="text-foreground">Funds are transferred within</p>
            <p className="font-heading text-3xl font-bold text-primary">7 DAYS</p>
            <p className="text-foreground">after delivery.</p>
          </div>
          <Truck className="hidden h-12 w-12 text-primary sm:block" strokeWidth={1.5} />
        </div>
      </div>
    </section>
  )
}
