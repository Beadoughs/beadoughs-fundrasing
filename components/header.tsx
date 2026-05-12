"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, ShoppingCart, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    { href: "/our-story", label: "Our Story" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#why-fundraise", label: "Why Fundraise" },
    { href: "/#faq", label: "FAQ" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/beadoughs-logo.png"
              alt="Beadoughs logo"
              width={46}
              height={46}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-md object-cover"
              priority
            />
            <span className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Beadoughs
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground -mt-1">
                Deliciously Doing Good
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Cart + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="outline" size="lg" className="rounded-full px-4 gap-2">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                Cart
              </Link>
            </Button>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/#enquiry">Start a Fundraiser</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border bg-card/95 backdrop-blur-md -mx-4 px-4">
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
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/#enquiry" onClick={() => setIsMobileMenuOpen(false)}>
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
