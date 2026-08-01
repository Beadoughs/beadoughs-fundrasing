import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'Beadoughs | Deliciously Doing Good — Tasmanian Doughnut Fundraising',
  description: 'Beadoughs helps Tasmanian schools, clubs, charities and community groups run simple, high-profit doughnut fundraisers. Run a campaign or support one today.',
  keywords: ['fundraising', 'doughnuts', 'Tasmania', 'schools', 'charities', 'community', 'Beadoughs'],
  openGraph: {
    title: 'Beadoughs | Deliciously Doing Good',
    description: 'Raise more money with doughnuts people actually want. Run a fundraiser or support an active Tasmanian campaign.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
