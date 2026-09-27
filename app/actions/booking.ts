"use server"

import { z } from "zod"
import {
  BOOKING_DURATIONS,
  BOOKING_HEARD_ABOUT,
  BOOKING_POSITIONS,
  BOOKING_STATES,
} from "@/lib/fundraising/booking-options"

const addressSchema = z.object({
  street: z.string().trim().min(1, "Street address is required").max(300),
  line2: z.string().trim().max(300),
  suburb: z.string().trim().min(1, "Suburb is required").max(120),
  state: z.enum(BOOKING_STATES, { message: "Please select a state" }),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Post code must be 4 digits"),
})

const bookingSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    mobile: z.string().trim().min(8, "Mobile number is required").max(30),
    email: z.string().trim().email("Please enter a valid email").max(320),
    position: z.enum(BOOKING_POSITIONS, { message: "Please select your position" }),
    organisation: z.string().trim().min(1, "Organisation name is required").max(300),
    organisationState: z.enum(BOOKING_STATES, {
      message: "Please select the organisation's state",
    }),
    organisationAddress: addressSchema,
    participants: z.coerce
      .number({ message: "Number of participants is required" })
      .int()
      .min(1, "Number of participants is required")
      .max(100000),
    boxGoal: z.coerce
      .number({ message: "Box goal is required" })
      .int()
      .min(1, "Box goal is required")
      .max(1000000),
    duration: z.enum(BOOKING_DURATIONS, { message: "Please choose how long to fundraise" }),
    deliveryDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a delivery date"),
    deliveryDifferent: z.enum(["yes", "no"], {
      message: "Please tell us if the delivery address is different",
    }),
    deliveryAddress: addressSchema.optional(),
    promoCode: z.string().trim().max(100),
    heardAbout: z.enum(BOOKING_HEARD_ABOUT, { message: "Please tell us how you heard about us" }),
    acceptedTerms: z.literal(true, { message: "Please accept the Terms & Conditions" }),
    newsletter: z.boolean(),
    // Honeypot — real people never see or fill this field.
    website: z.string().max(0).optional(),
  })
  .refine((d) => d.deliveryDifferent === "no" || d.deliveryAddress, {
    message: "Please enter the delivery address",
    path: ["deliveryAddress"],
  })

type AddressValues = {
  street: string
  line2: string
  suburb: string
  state: string
  postcode: string
}

export type BookingFormValues = {
  firstName: string
  lastName: string
  mobile: string
  email: string
  position: string
  organisation: string
  organisationState: string
  organisationAddress: AddressValues
  participants: string
  boxGoal: string
  duration: string
  deliveryDate: string
  deliveryDifferent: string
  deliveryAddress?: AddressValues
  promoCode: string
  heardAbout: string
  acceptedTerms: boolean
  newsletter: boolean
  website: string
}

export type BookingResult = { ok: true } | { ok: false; error: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function formatAddress(a: z.infer<typeof addressSchema>): string {
  return [a.street, a.line2, `${a.suburb} ${a.state} ${a.postcode}`]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ")
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export async function submitBooking(raw: BookingFormValues): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    }
  }
  const d = parsed.data

  if (d.website) {
    return { ok: true }
  }

  const todayIso = new Date().toISOString().slice(0, 10)
  if (d.deliveryDate <= todayIso) {
    return { ok: false, error: "Delivery date must be in the future." }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim()
  if (!apiKey || !from) {
    return {
      ok: false,
      error: "Bookings are not available right now. Please email us directly.",
    }
  }
  const toEmail = process.env.ENQUIRY_TO_EMAIL?.trim() || "Sunny@sunnysdonuts.com.au"

  const orgAddress = formatAddress(d.organisationAddress)
  const deliveryAddress =
    d.deliveryDifferent === "yes" && d.deliveryAddress
      ? formatAddress(d.deliveryAddress)
      : "Same as organisation address"

  const rows: [string, string][] = [
    ["Name", `${d.firstName} ${d.lastName}`],
    ["Mobile", d.mobile],
    ["Email", d.email],
    ["Position", d.position],
    ["Organisation", d.organisation],
    ["Organisation state", d.organisationState],
    ["Organisation address", orgAddress],
    ["Number of participants", String(d.participants)],
    ["Box goal", String(d.boxGoal)],
    ["Fundraising length", d.duration],
    ["Requested delivery date", formatDate(d.deliveryDate)],
    ["Delivery address", deliveryAddress],
    ["Promo code", d.promoCode || "—"],
    ["Heard about us", d.heardAbout],
    ["Accepted Terms & Conditions", "Yes"],
    ["Newsletter", d.newsletter ? "Yes" : "No"],
  ]

  const textBody = [
    "New fundraiser booking — Sunny's Donuts website",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n")

  const htmlBody = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
<p style="margin:0 0 16px;font-size:16px;">New fundraiser booking from the Sunny's Donuts website.</p>
<table style="border-collapse:collapse;max-width:600px;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;font-weight:600;vertical-align:top;width:220px;">${escapeHtml(k)}</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
</body></html>`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        reply_to: d.email,
        subject: `Fundraiser booking: ${d.organisation} (${d.boxGoal} boxes)`,
        html: htmlBody,
        text: textBody,
      }),
    })
    if (!res.ok) {
      return {
        ok: false,
        error: "We could not send your booking right now. Please try again or email us directly.",
      }
    }
  } catch {
    return {
      ok: false,
      error: "We could not send your booking right now. Please try again or email us directly.",
    }
  }

  return { ok: true }
}
