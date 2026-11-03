"use server"

import { z } from "zod"

const GROUP_TYPE_LABELS: Record<string, string> = {
  school: "School / P&F",
  sports: "Sports Club",
  charity: "Charity / Not-for-profit",
  workplace: "Workplace",
  community: "Community Group",
  other: "Other",
}

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Your name is required").max(200),
  organisation: z
    .string()
    .trim()
    .min(1, "Organisation / group name is required")
    .max(300),
  email: z.string().trim().email("Please enter a valid email").max(320),
  phone: z.string().trim().max(50),
  groupType: z.enum([
    "school",
    "sports",
    "charity",
    "workplace",
    "community",
    "other",
  ]),
  notes: z.string().trim().max(2000),
  // Honeypot: leave empty
  website: z.string().max(0).optional(),
})

export type WaitlistFormValues = {
  name: string
  organisation: string
  email: string
  phone: string
  groupType: string
  notes: string
  website: string
}

export type WaitlistResult = { ok: true } | { ok: false; error: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function submitWaitlist(raw: WaitlistFormValues): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(raw)
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

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim()
  if (!apiKey || !from) {
    return {
      ok: false,
      error: "Waitlist signup is not available right now. Please email us directly.",
    }
  }

  const toEmail = process.env.ENQUIRY_TO_EMAIL?.trim() || "Sunny@sunnysdonuts.com.au"
  const groupLabel = GROUP_TYPE_LABELS[d.groupType] ?? d.groupType
  const phone = d.phone.trim() || undefined
  const notes = d.notes.trim() || undefined

  const rows: [string, string][] = [
    ["Name", d.name],
    ["Organisation", d.organisation],
    ["Email", d.email],
    ...(phone ? ([["Phone", phone]] as [string, string][]) : []),
    ["Type of group", groupLabel],
    ...(notes ? ([["Notes", notes]] as [string, string][]) : []),
  ]

  const textBody = [
    "New fundraiser waitlist signup from the Sunny's Donuts website",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n")

  const htmlBody = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
<p style="margin:0 0 16px;font-size:16px;">Someone joined the fundraiser waitlist on the Sunny's Donuts website.</p>
<table style="border-collapse:collapse;max-width:560px;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;font-weight:600;vertical-align:top;width:180px;">${escapeHtml(k)}</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
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
        subject: `Waitlist: ${d.organisation}`,
        html: htmlBody,
        text: textBody,
      }),
    })
    if (!res.ok) {
      return {
        ok: false,
        error: "We could not save your spot right now. Please try again or email us directly.",
      }
    }
  } catch {
    return {
      ok: false,
      error: "We could not save your spot right now. Please try again or email us directly.",
    }
  }

  return { ok: true }
}
