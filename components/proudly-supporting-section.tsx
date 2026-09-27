import Image from "next/image"
import { Users } from "lucide-react"

const organisers = [
  { name: "Zodiacs Gymnastics Club", logo: "zodiacs-gymnastics-club" },
  { name: "Ulverstone Secondary College", logo: "ulverstone-secondary-college" },
  { name: "TechStep Dance Studio", logo: "techstep-dance-studio" },
  { name: "East Ulverstone Primary School", logo: "east-ulverstone-primary" },
  { name: "Circular Head Little Athletics Centre", logo: "circular-head-little-athletics" },
  { name: "Smithton Primary School", logo: "smithton-primary" },
  { name: "Romaine Park Primary School", logo: "romaine-park-primary" },
  { name: "Sheffield School", logo: "sheffield-school" },
  { name: "Latrobe Primary School", logo: "latrobe-primary" },
  { name: "Dance Revolution", logo: "dance-revolution" },
]

export function ProudlySupportingSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#0b2566]">
          Proudly Supporting
          <br />
          <span className="text-[#f5a800]">Our Community</span>
        </h2>
        <div className="mt-5 h-1 w-20 rounded-full bg-[#f5a800]" />
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          We partner with amazing organisations making a real impact in our community.
        </p>

        <div className="mt-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#f5a800]" />
          <p className="text-center text-sm sm:text-base font-heading font-semibold uppercase tracking-[0.15em] text-primary">
            Successful fundraiser organisers
          </p>
          <span className="h-px flex-1 bg-[#f5a800]" />
        </div>

        <ul className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-6">
          {organisers.map((o) => (
            <li key={o.logo} className="flex justify-center">
              <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-full bg-white shadow-md ring-1 ring-border">
                <Image
                  src={`/images/info-pack/logos/${o.logo}.png`}
                  alt={`${o.name} logo`}
                  title={o.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-6 rounded-3xl bg-[#f5ead8] px-6 py-8 text-center sm:flex-row sm:px-10 sm:text-left">
          <Users className="h-14 w-14 shrink-0 text-primary" strokeWidth={1.5} />
          <div className="sm:border-l-2 sm:border-[#f5a800] sm:pl-8">
            <p className="font-heading text-2xl sm:text-3xl font-bold text-[#0b2566]">
              Stronger together.
              <br />
              Better communities.
            </p>
            <p className="mt-2 font-medium text-[#f5a800]">
              Thank you to our amazing fundraiser organisers!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
