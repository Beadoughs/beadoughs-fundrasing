"use client"

import Image from "next/image"

type GroupsBannerProps = {
  variant?: "primary" | "muted"
}

const groups = [
  { name: "Zodicas Dance Academy Burnie", logo: "/images/groups/zodicas-dance-academy-burnie.png" },
  { name: "Ulverstone Secondary College", logo: "/images/groups/ulverstone-secondary-college.png" },
  { name: "Tech Steps Dance Studio Devonport", logo: "/images/groups/tech-steps-dance-studio-devonport.png" },
  { name: "East Ulverstone Primary School", logo: "/images/groups/east-ulverstone-primary-school.png" },
  { name: "Circular Head Little Athletics", logo: "/images/groups/circular-head-little-athletics.png" },
  { name: "Boat Harbour Primary School", logo: "/images/groups/boat-harbour-primary-school.png" },
  { name: "Smithton Primary School", logo: "/images/groups/smithton-primary-school.png" },
  { name: "Parklands State High School", logo: "/images/groups/parklands-state-high-school.png" },
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
                  alt={`${group.name} logo`}
                  width={150}
                  height={60}
                  className="h-12 w-[150px] object-contain grayscale transition duration-300 hover:grayscale-0 md:h-16"
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
