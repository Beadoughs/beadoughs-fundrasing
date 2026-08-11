import Link from "next/link"
import { Facebook, Instagram, Mail } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[color:var(--brand-dark)] text-white py-12 sm:py-16">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <div className="inline-flex w-fit rounded-2xl bg-white p-2.5 shadow-sm">
              <Image
                src="/sunnys-donuts-logo.png"
                alt="Sunny's Donuts logo"
                width={220}
                height={146}
                className="h-14 w-auto"
              />
            </div>
            <p className="mt-4 text-sm font-heading font-semibold text-[color:var(--brand-yellow)]">
              Dough for Good
            </p>
            <p className="mt-3 max-w-xs text-sm text-white/70 leading-relaxed">
              Helping groups and workplaces across Australia raise more through easy, high-margin
              donut campaigns.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/our-story", label: "Our Story" },
                { href: "/fundraisers", label: "Active Fundraisers" },
                { href: "/fundraise", label: "Run a Fundraiser" },
                { href: "/fundraise#enquiry", label: "Start a Fundraiser" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:Sunny@sunnysdonuts.com.au"
                  className="transition-colors hover:text-white"
                >
                  Sunny@sunnysdonuts.com.au
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} Sunny&apos;s Donuts. All rights reserved.
            </p>
            <p className="text-sm text-white/50">Made with love in Australia 🇦🇺</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
