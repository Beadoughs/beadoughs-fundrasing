"use client"

import Image from "next/image"

type GroupsBannerProps = {
  variant?: "primary" | "muted"
}

const groups = [
  { name: "Brighton Basketball Club", logo: "/placeholder-logo.svg" },
  { name: "Southern Surf Life Saving", logo: "/placeholder-logo.svg" },
  { name: "Hobart City Netball", logo: "/placeholder-logo.svg" },
  { name: "Tassie Junior Football", logo: "/placeholder-logo.svg" },
  { name: "Kingston Dance Academy", logo: "/placeholder-logo.svg" },
  { name: "Northside Scout Group", logo: "/placeholder-logo.svg" },
  { name: "Huon Valley Soccer Club", logo: "/placeholder-logo.svg" },
  { name: "Derwent Valley School P&C", logo: "/placeholder-logo.svg" },
]

export function GroupsBanner({ variant = "primary" }: GroupsBannerProps) {
  const sectionClass = variant === "muted" ? "bg-muted/40" : "bg-background"
  const scrollerGroups = [...groups, ...groups]

  return (
    <section className={`py-10 md:py-12 ${sectionClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Groups we&apos;ve worked with
        </p>
        <div className="groups-mask">
          <div className="groups-track hover:[animation-play-state:paused] motion-reduce:animate-none">
            {scrollerGroups.map((group, index) => (
              <div
                key={`${group.name}-${index}`}
                className="mx-2 flex min-w-[180px] shrink-0 flex-col items-center rounded-xl border border-border/60 bg-card px-5 py-4 text-center shadow-sm md:min-w-[220px]"
              >
                <Image
                  src={group.logo}
                  alt={group.name}
                  width={150}
                  height={60}
                  className="h-12 w-auto object-contain grayscale transition duration-300 hover:grayscale-0 md:h-16"
                />
                <p className="mt-3 text-xs font-medium text-muted-foreground md:text-sm">{group.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
