import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-primary-foreground py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/beadoughs-logo.png"
                alt="Beadoughs logo"
                width={52}
                height={52}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight">
                  Beadoughs
                </span>
                <span className="text-sm text-primary-foreground/70 mt-1">
                  Deliciously Doing Good
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70 max-w-xs">
              Helping Tasmania-wide groups and workplaces raise more through easy, high-margin doughnut campaigns.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/fundraisers" 
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Active Fundraisers
                </Link>
              </li>
              <li>
                <Link 
                  href="/#how-it-works" 
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/#why-fundraise" 
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Why Fundraise
                </Link>
              </li>
              <li>
                <Link 
                  href="/#faq" 
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/#enquiry" 
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Start a Fundraiser
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>sunny@beadoughs.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>57 Punchbowl Road, Launceston</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              © {new Date().getFullYear()} Beadoughs. All rights reserved.
            </p>
            <p className="text-sm text-primary-foreground/50">
              Made with love in Tasmania 🇦🇺
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
