import { cn } from "@/lib/utils"

/** Yellow four-point sparkle accent used near section headings in the brand mockup. */
export function BrandSparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("inline-block size-5 shrink-0 text-[color:var(--brand-yellow)] sm:size-6", className)}
      fill="currentColor"
    >
      <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
    </svg>
  )
}
