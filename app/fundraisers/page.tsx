import { redirect } from "next/navigation"

export const metadata = {
  title: "Fundraiser Waitlist | Sunny's Donuts",
  robots: { index: false, follow: false },
}

/** Public Active Fundraisers directory is closed. Send visitors to the waitlist. */
export default function FundraisersDirectoryPage() {
  redirect("/book")
}
