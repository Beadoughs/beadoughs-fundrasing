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

const enquirySchema = z.object({
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
  fundraisingDate: z.string().trim().max(200),
  message: z.string().trim().max(5000),
})

export type EnquiryResult = { ok: true } | { ok: false; error: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function normalizeOptional(s: string | undefined): string | undefined {
  const t = s?.trim()
  return t ? t : undefined
}

export async function submitEnquiry(
  raw: z.infer<typeof enquirySchema>,
): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const first =
      fieldErrors.name?.[0] ??
      fieldErrors.organisation?.[0] ??
      fieldErrors.email?.[0] ??
      fieldErrors.phone?.[0] ??
      fieldErrors.groupType?.[0] ??
      fieldErrors.fundraisingDate?.[0] ??
      fieldErrors.message?.[0]
    const msg = first ?? "Please check the form and try again."
    return { ok: false, error: msg }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email is not configured (missing RESEND_API_KEY). Add it to your .env.local for local development, or set it in your hosting environment.",
    }
  }

  const from = process.env.RESEND_FROM?.trim()
  if (!from) {
    return {
      ok: false,
      error:
        "Email sender is not configured. Set RESEND_FROM in your environment (e.g. Sunny's Donuts Enquiries <onboarding@resend.dev>).",
    }
  }

  const toEmail =
    process.env.ENQUIRY_TO_EMAIL?.trim() || "sunny@beadoughs.com"

  const d = parsed.data
  const phone = normalizeOptional(d.phone)
  const fundraisingDate = normalizeOptional(d.fundraisingDate)
  const message = normalizeOptional(d.message)
  const groupLabel = GROUP_TYPE_LABELS[d.groupType] ?? d.groupType

  const textLines = [
    "New fundraising enquiry — Sunny's Donuts website",
    "",
    `Your name: ${d.name}`,
    `Organisation / group name: ${d.organisation}`,
    `Email: ${d.email}`,
    ...(phone ? [`Phone: ${phone}`] : []),
    `Type of group: ${groupLabel}`,
    ...(fundraisingDate
      ? [`Estimated fundraising date: ${fundraisingDate}`]
      : []),
    ...(message ? ["", "Message:", message] : []),
  ]

  const textBody = textLines.join("\n")

  const htmlRows: string[] = [
    `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;width:200px;">Your name</td><td style="padding:8px 0;">${escapeHtml(d.name)}</td></tr>`,
    `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Organisation / group name</td><td style="padding:8px 0;">${escapeHtml(d.organisation)}</td></tr>`,
    `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></td></tr>`,
  ]
  if (phone) {
    htmlRows.push(
      `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Phone</td><td style="padding:8px 0;">${escapeHtml(phone)}</td></tr>`,
    )
  }
  htmlRows.push(
    `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Type of group</td><td style="padding:8px 0;">${escapeHtml(groupLabel)}</td></tr>`,
  )
  if (fundraisingDate) {
    htmlRows.push(
      `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Estimated fundraising date</td><td style="padding:8px 0;">${escapeHtml(fundraisingDate)}</td></tr>`,
    )
  }
  if (message) {
    htmlRows.push(
      `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(message)}</td></tr>`,
    )
  }

  const htmlBody = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
<p style="margin:0 0 16px;font-size:16px;">New fundraising enquiry from the Sunny's Donuts website.</p>
<table style="border-collapse:collapse;max-width:560px;">${htmlRows.join("")}</table>
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
        subject: `Fundraising enquiry: ${d.organisation}`,
        html: htmlBody,
        text: textBody,
      }),
    })

    if (!res.ok) {
      return {
        ok: false,
        error:
          "We could not send your enquiry right now. Please try again in a moment or email us directly.",
      }
    }
  } catch {
    return {
      ok: false,
      error:
        "We could not send your enquiry right now. Please try again in a moment or email us directly.",
    }
  }

  return { ok: true }
}
