import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "Sunny's Donuts | Dough for Good — Tasmanian Donut Fundraising",
  description:
    "Sunny's Donuts helps Tasmanian schools, clubs, charities and community groups run simple, high-profit donut fundraisers. Run a campaign or support one today.",
  keywords: ['fundraising', 'donuts', 'Tasmania', 'schools', 'charities', 'community', "Sunny's Donuts"],
  openGraph: {
    title: "Sunny's Donuts | Dough for Good",
    description:
      'Raise more money with donuts people actually want. Run a fundraiser or support an active Tasmanian campaign.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
