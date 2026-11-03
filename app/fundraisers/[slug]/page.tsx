import { redirect } from "next/navigation"

type Props = { params: Promise<{ slug: string }> }

export const metadata = {
  title: "Fundraiser Waitlist | Sunny's Donuts",
  robots: { index: false, follow: false },
}

/** Public fundraiser campaign pages are closed. Send visitors to the waitlist. */
export default async function FundraiserPage(_props: Props) {
  redirect("/book")
}
