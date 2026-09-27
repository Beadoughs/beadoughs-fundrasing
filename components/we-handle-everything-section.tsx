import Image from "next/image"
import {
  ShoppingCart,
  CreditCard,
  ChefHat,
  Package,
  Truck,
  Tag,
  Users,
  Calculator,
  Landmark,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const items: { icon: LucideIcon; label: string }[] = [
  { icon: ShoppingCart, label: "Online ordering" },
  { icon: CreditCard, label: "Customer payments" },
  { icon: ChefHat, label: "Donut production" },
  { icon: Package, label: "Packing" },
  { icon: Truck, label: "Delivery" },
  { icon: Tag, label: "Labelling every order" },
  { icon: Users, label: "Collection day support" },
  { icon: Calculator, label: "Profit calculations" },
  { icon: Landmark, label: "Transfer of funds" },
]

export function WeHandleEverythingSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#0b2566]">
            We Handle Everything
          </h2>
          <div className="mt-5 h-1 w-20 rounded-full bg-[#f5a800]" />
          <p className="mt-6 font-heading text-xl sm:text-2xl font-bold text-[#0b2566]">
            You focus on promoting.
            <br />
            <span className="text-[#f5a800]">We&apos;ll take care of the rest.</span>
          </p>

          <ul className="mt-8 divide-y divide-dashed divide-[#f5a800]/50">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-5 py-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5ead8]">
                  <item.icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
                </span>
                <span className="font-medium text-foreground">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="relative aspect-[1161/1100] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/images/info-pack/donut-van.jpg"
              alt="Sunny's Donuts van at a fundraiser collection day"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <p className="mt-8 text-center font-heading text-2xl sm:text-3xl font-bold text-[#0b2566]">
            It&apos;s fundraising{" "}
            <span className="text-[#f5a800]">made easy.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
