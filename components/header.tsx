"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CartNavLink } from "@/components/cart-nav-link"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/our-story", label: "Our Story" },
    { href: "/fundraisers", label: "Active Fundraisers" },
    { href: "/fundraise", label: "Run a Fundraiser" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] sm:h-[5.5rem] items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/sunnys-donuts-logo.png"
                alt="Sunny's Donuts logo"
                width={280}
                height={186}
                className="h-14 sm:h-[4.25rem] w-auto"
                priority
              />
            </Link>

            <Link
              href="/our-story"
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-primary/10 bg-[#EEF6FF] px-1.5 py-1 sm:px-2.5 sm:py-1.5 shadow-sm hover:bg-[#E4F1FF] transition-colors shrink-0"
              aria-label="Formerly Beadoughs Donuts — read our story"
            >
              <Image
                src="/images/beadoughs-legacy-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              />
              <span className="text-[10px] sm:text-xs font-medium leading-snug text-primary/75 whitespace-nowrap">
                Formerly Beadoughs Donuts
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <CartNavLink />
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/fundraise#enquiry">Start a Fundraiser</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border bg-white/95 backdrop-blur-md -mx-4 px-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="outline" className="rounded-full mt-2">
                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                  Cart
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/fundraise#enquiry" onClick={() => setIsMobileMenuOpen(false)}>
                  Start a Fundraiser
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
