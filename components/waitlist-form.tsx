"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Bell, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitWaitlist } from "@/app/actions/waitlist"

const inputClass = "h-12 rounded-xl border-border bg-secondary/60"

type Props = {
  /** Compact card for embedding in empty states. Default is full page style. */
  compact?: boolean
  id?: string
}

export function WaitlistForm({ compact = false, id = "waitlist" }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [organisation, setOrganisation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [groupType, setGroupType] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [website, setWebsite] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupType) {
      toast.error("Please select a type of group.")
      return
    }
    startTransition(async () => {
      const result = await submitWaitlist({
        name,
        organisation,
        email,
        phone,
        groupType,
        notes,
        website,
      })
      if (result.ok) {
        setIsSubmitted(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        toast.error(result.error)
      }
    })
  }

  if (isSubmitted) {
    return (
      <Card
        id={id}
        className={`scroll-mt-28 rounded-3xl border-border bg-card p-8 text-center shadow-lg shadow-primary/5 ${compact ? "mx-auto max-w-xl" : "mx-auto max-w-2xl sm:p-12"}`}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mb-4 font-heading text-2xl sm:text-3xl font-bold text-primary">
          You&apos;re on the list!
        </h2>
        <p className="text-muted-foreground">
          Thanks for joining. We&apos;ll email you as soon as Sunny&apos;s Donuts fundraiser
          bookings open again.
        </p>
      </Card>
    )
  }

  return (
    <Card
      id={id}
      className={`scroll-mt-28 rounded-3xl border-border bg-white p-6 sm:p-8 shadow-xl shadow-primary/5 ${compact ? "mx-auto max-w-xl" : "mx-auto max-w-2xl"}`}
    >
      {!compact && (
        <div className="mb-6 text-center sm:text-left">
          <p className="text-sm font-heading font-semibold uppercase tracking-[0.15em] text-[#f5a800]">
            Waitlist open
          </p>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-primary">
            Get notified when spots open again
          </h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re full right now. Leave your details and we&apos;ll be in touch when
            spots open again.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="hidden" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium text-foreground">
            Your name
          </label>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            required
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={`${id}-organisation`} className="text-sm font-medium text-foreground">
            Organisation / group name
          </label>
          <Input
            id={`${id}-organisation`}
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            placeholder="Riverside Primary School P&F"
            required
            autoComplete="organization"
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={`${id}-email`} className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id={`${id}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${id}-phone`} className="text-sm font-medium text-foreground">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id={`${id}-phone`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0412 345 678"
              autoComplete="tel"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor={`${id}-group-type`} className="text-sm font-medium text-foreground">
            Type of group
          </label>
          <Select value={groupType} onValueChange={setGroupType} required>
            <SelectTrigger id={`${id}-group-type`} className={`${inputClass} w-full`}>
              <SelectValue placeholder="Select your group type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">School / P&F</SelectItem>
              <SelectItem value="sports">Sports Club</SelectItem>
              <SelectItem value="charity">Charity / Not-for-profit</SelectItem>
              <SelectItem value="workplace">Workplace</SelectItem>
              <SelectItem value="community">Community Group</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor={`${id}-notes`} className="text-sm font-medium text-foreground">
            Anything else? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id={`${id}-notes`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Hoping for Term 2, around 200 boxes..."
            rows={3}
            className="resize-none rounded-xl border-border bg-secondary/60"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-14 w-full rounded-full text-base shadow-lg shadow-primary/20"
        >
          <Bell className="mr-2 h-5 w-5" />
          {isPending ? "Joining…" : "Join the waitlist"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll only use your details to tell you when spots open again.
        </p>
      </form>
    </Card>
  )
}
