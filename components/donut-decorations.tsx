"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type DonutItem = {
  src: string
  className: string
  delayMs: number
  durationMs: number
}

const HERO_DONUTS: DonutItem[] = [
  {
    src: "/images/donuts/donut-1.png",
    className:
      "bottom-24 right-3 left-auto top-auto w-10 sm:w-[5.5rem] lg:hidden",
    delayMs: 80,
    durationMs: 680,
  },
  {
    src: "/images/donuts/donut-3.png",
    className:
      "left-2 top-[40%] w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 hidden lg:block",
    delayMs: 140,
    durationMs: 620,
  },
  {
    src: "/images/donuts/donut-4.png",
    className:
      "right-2 top-[30%] w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 hidden lg:block",
    delayMs: 260,
    durationMs: 820,
  },
]

const HOW_DONUTS: DonutItem[] = [
  {
    src: "/images/donuts/donut-5.png",
    className:
      "left-0 top-1/2 -translate-x-[55%] -translate-y-1/2 w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] hidden lg:block",
    delayMs: 0,
    durationMs: 700,
  },
  {
    src: "/images/donuts/donut-6.png",
    className:
      "right-0 top-1/2 translate-x-[55%] -translate-y-1/2 w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] hidden lg:block",
    delayMs: 120,
    durationMs: 780,
  },
  {
    src: "/images/donuts/donut-9.png",
    className:
      "bottom-20 right-3 left-auto top-auto w-10 h-10 sm:w-20 sm:h-20 lg:hidden",
    delayMs: 220,
    durationMs: 640,
  },
]

const GROUPS_DONUTS: DonutItem[] = [
  {
    src: "/images/donuts/donut-7.png",
    className:
      "left-[2%] md:left-[3%] top-[14%] w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 max-sm:hidden",
    delayMs: 40,
    durationMs: 720,
  },
  {
    src: "/images/donuts/donut-2.png",
    className:
      "right-[3%] md:right-[5%] bottom-[8%] w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] hidden sm:block",
    delayMs: 160,
    durationMs: 680,
  },
]

const TESTIMONIALS_DONUTS: DonutItem[] = [
  {
    src: "/images/donuts/donut-8.png",
    className:
      "left-[3%] md:left-[5%] top-[18%] w-24 h-24 sm:w-28 sm:h-28 max-sm:hidden opacity-90",
    delayMs: 60,
    durationMs: 740,
  },
  {
    src: "/images/donuts/donut-4.png",
    className:
      "right-[4%] bottom-[12%] w-[5.5rem] h-[5.5rem] sm:w-[7.5rem] sm:h-[7.5rem] hidden sm:block opacity-90",
    delayMs: 180,
    durationMs: 800,
  },
  {
    src: "/images/donuts/donut-1.png",
    className:
      "left-[38%] top-[8%] w-[4.5rem] h-[4.5rem] hidden xl:block opacity-70",
    delayMs: 240,
    durationMs: 660,
  },
]

function DonutDecorations({
  items,
  containerClassName = "overflow-hidden",
}: {
  items: DonutItem[]
  containerClassName?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const node = containerRef.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 ${containerClassName}`}
      aria-hidden
    >
      {items.map((d, index) => (
        <div
          key={`${d.src}-${index}-${d.delayMs}`}
          className={`donut-fall-in ${
            isVisible ? "donut-fall-in-visible" : ""
          } pointer-events-none absolute z-0 ${d.className}`}
          style={{
            animationDelay: `${d.delayMs}ms`,
            animationDuration: `${d.durationMs}ms`,
          }}
          aria-hidden
        >
          <Image
            src={d.src}
            alt=""
            width={160}
            height={160}
            className="h-full w-full object-contain drop-shadow-sm"
          />
        </div>
      ))}
    </div>
  )
}

export function HeroDonutDecorations() {
  return <DonutDecorations items={HERO_DONUTS} />
}

export function HowItWorksDonutDecorations() {
  return (
    <DonutDecorations items={HOW_DONUTS} containerClassName="overflow-visible" />
  )
}

export function GroupsBannerDonutDecorations() {
  return <DonutDecorations items={GROUPS_DONUTS} />
}

export function TestimonialsDonutDecorations() {
  return <DonutDecorations items={TESTIMONIALS_DONUTS} />
}
