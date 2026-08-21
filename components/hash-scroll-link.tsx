"use client"

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react"

type Props = {
  href: string
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "className">

/**
 * Same-page hash links that scroll reliably under a fixed header.
 * Next.js <Link href="#…"> often fails to scroll on the current route.
 */
export function HashScrollLink({ href, children, className, onClick, ...rest }: Props) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (!href.startsWith("#")) return

    const id = href.slice(1)
    const el = document.getElementById(id)
    if (!el) return

    e.preventDefault()
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.pushState(null, "", href)
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
