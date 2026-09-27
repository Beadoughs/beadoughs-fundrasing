"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitBooking } from "@/app/actions/booking"
import {
  BOOKING_DURATIONS,
  BOOKING_HEARD_ABOUT,
  BOOKING_POSITIONS,
  BOOKING_STATES,
} from "@/lib/fundraising/booking-options"

type Address = {
  street: string
  line2: string
  suburb: string
  state: string
  postcode: string
}

const emptyAddress: Address = { street: "", line2: "", suburb: "", state: "", postcode: "" }

const inputClass = "h-12 rounded-xl border-border bg-secondary/60"

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  )
}

function Required() {
  return <span className="text-destructive"> *</span>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary border-b border-border pb-3">
      {children}
    </h2>
  )
}

function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder: string
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className={`${inputClass} w-full`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function AddressFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string
  value: Address
  onChange: (a: Address) => void
}) {
  const set = (key: keyof Address) => (v: string) => onChange({ ...value, [key]: v })
  return (
    <div className="space-y-3">
      <Input
        id={`${idPrefix}-street`}
        value={value.street}
        onChange={(e) => set("street")(e.target.value)}
        placeholder="Street address"
        autoComplete="address-line1"
        required
        className={inputClass}
      />
      <Input
        id={`${idPrefix}-line2`}
        value={value.line2}
        onChange={(e) => set("line2")(e.target.value)}
        placeholder="Address line 2 (optional)"
        autoComplete="address-line2"
        className={inputClass}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          id={`${idPrefix}-suburb`}
          value={value.suburb}
          onChange={(e) => set("suburb")(e.target.value)}
          placeholder="Suburb"
          autoComplete="address-level2"
          required
          className={inputClass}
        />
        <OptionSelect
          id={`${idPrefix}-state`}
          value={value.state}
          onChange={set("state")}
          options={BOOKING_STATES}
          placeholder="State"
        />
        <Input
          id={`${idPrefix}-postcode`}
          value={value.postcode}
          onChange={(e) => set("postcode")(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Post code"
          inputMode="numeric"
          autoComplete="postal-code"
          required
          className={inputClass}
        />
      </div>
    </div>
  )
}

function minDeliveryDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function BookingForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [organisation, setOrganisation] = useState("")
  const [organisationState, setOrganisationState] = useState("")
  const [organisationAddress, setOrganisationAddress] = useState<Address>(emptyAddress)
  const [participants, setParticipants] = useState("")
  const [boxGoal, setBoxGoal] = useState("")
  const [duration, setDuration] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryDifferent, setDeliveryDifferent] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState<Address>(emptyAddress)
  const [promoCode, setPromoCode] = useState("")
  const [heardAbout, setHeardAbout] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [website, setWebsite] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitBooking({
        firstName,
        lastName,
        mobile,
        email,
        position,
        organisation,
        organisationState,
        organisationAddress,
        participants,
        boxGoal,
        duration,
        deliveryDate,
        deliveryDifferent,
        deliveryAddress: deliveryDifferent === "yes" ? deliveryAddress : undefined,
        promoCode,
        heardAbout,
        acceptedTerms,
        newsletter,
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
      <Card className="mx-auto max-w-2xl rounded-3xl border-border bg-card p-8 sm:p-12 text-center shadow-lg shadow-primary/5">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mb-4 font-heading text-2xl sm:text-3xl font-bold text-primary">
          Booking received — thank you!
        </h2>
        <p className="mb-6 text-muted-foreground">
          We&apos;ll be in touch within 1-2 business days to confirm your fundraiser details and
          delivery date.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Back to home</Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl rounded-3xl border-border bg-white p-6 sm:p-10 shadow-xl shadow-primary/5">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <section className="space-y-5">
          <SectionHeading>About You</SectionHeading>
          <div className="space-y-2">
            <Label>
              Name<Required />
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                autoComplete="given-name"
                required
                className={inputClass}
              />
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                autoComplete="family-name"
                required
                className={inputClass}
              />
            </div>
            <p className="text-xs text-muted-foreground">Must be at least 18 years old.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mobile">
                Mobile<Required />
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0412 345 678"
                autoComplete="tel"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email<Required />
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">
              Title that best describes your position<Required />
            </Label>
            <OptionSelect
              id="position"
              value={position}
              onChange={setPosition}
              options={BOOKING_POSITIONS}
              placeholder="Please select"
            />
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading>About Your Organisation</SectionHeading>
          <div className="space-y-2">
            <Label htmlFor="organisation">
              Organisation name<Required />
            </Label>
            <Input
              id="organisation"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              placeholder="Riverside Primary School P&F"
              autoComplete="organization"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-state">
              In which state is the organisation?<Required />
            </Label>
            <OptionSelect
              id="org-state"
              value={organisationState}
              onChange={setOrganisationState}
              options={BOOKING_STATES}
              placeholder="Please select"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-street">
              Address<Required />
            </Label>
            <AddressFields
              idPrefix="org"
              value={organisationAddress}
              onChange={setOrganisationAddress}
            />
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading>Fundraiser Details</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="participants">
                Number of participants<Required />
              </Label>
              <Input
                id="participants"
                type="number"
                min={1}
                inputMode="numeric"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="e.g. 30"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="box-goal">
                Box goal<Required />
              </Label>
              <Input
                id="box-goal"
                type="number"
                min={1}
                inputMode="numeric"
                value={boxGoal}
                onChange={(e) => setBoxGoal(e.target.value)}
                placeholder="e.g. 200"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              How long do you wish to fundraise for?<Required />
            </Label>
            <RadioGroup value={duration} onValueChange={setDuration} className="flex flex-wrap gap-3">
              {BOOKING_DURATIONS.map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                >
                  <RadioGroupItem value={d} />
                  {d}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-date">
              Preferred delivery date for donuts<Required />
            </Label>
            <Input
              id="delivery-date"
              type="date"
              min={minDeliveryDate()}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
              className={`${inputClass} sm:max-w-xs`}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll confirm the final delivery date with you after your fundraiser closes.
            </p>
          </div>

          <div className="space-y-3">
            <Label>
              Is the delivery address different to the organisation&apos;s address above?
              <Required />
            </Label>
            <RadioGroup
              value={deliveryDifferent}
              onValueChange={setDeliveryDifferent}
              className="flex gap-3"
            >
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                >
                  <RadioGroupItem value={o.value} />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
          </div>

          {deliveryDifferent === "yes" && (
            <div className="space-y-2">
              <Label htmlFor="delivery-street">
                Delivery address<Required />
              </Label>
              <AddressFields
                idPrefix="delivery"
                value={deliveryAddress}
                onChange={setDeliveryAddress}
              />
            </div>
          )}
        </section>

        <section className="space-y-5">
          <SectionHeading>Final Details</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo code</Label>
              <Input
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="If applicable"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heard-about">
                How did you hear about us?<Required />
              </Label>
              <OptionSelect
                id="heard-about"
                value={heardAbout}
                onChange={setHeardAbout}
                options={BOOKING_HEARD_ABOUT}
                placeholder="Please select"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              Terms &amp; Conditions<Required />
            </Label>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>
                By submitting this booking you agree to run a Sunny&apos;s Donuts fundraiser on
                behalf of the organisation named above.
              </p>
              <p>
                <strong className="text-foreground">Pre-orders:</strong> Your supporters order and
                pay online through your fundraiser page. Donuts are only baked for confirmed paid
                orders, so your group never holds unsold stock.
              </p>
              <p>
                <strong className="text-foreground">Payments:</strong> No upfront payment is
                required from your group. Your group&apos;s fundraising profit is calculated from
                the boxes sold and paid to your nominated bank account after the fundraiser closes.
              </p>
              <p>
                <strong className="text-foreground">Delivery:</strong> Once your fundraiser closes
                we&apos;ll confirm the final order and arrange delivery or collection with your
                coordinator. Delivery options vary by location.
              </p>
              <p>
                <strong className="text-foreground">Changes &amp; cancellations:</strong> Please
                let us know as soon as possible if you need to change dates or cancel your
                fundraiser.
              </p>
              <p>
                I warrant that I am over the age of 18 years and that I have the authority to book
                this fundraiser on behalf of the stated organisation.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(v) => setAcceptedTerms(v === true)}
                className="mt-0.5"
              />
              <span>I have read and accept the Terms &amp; Conditions</span>
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              checked={newsletter}
              onCheckedChange={(v) => setNewsletter(v === true)}
              className="mt-0.5"
            />
            <span>Subscribe to our newsletter</span>
          </label>
        </section>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-14 w-full rounded-full text-base shadow-lg shadow-primary/20"
        >
          {isPending ? "Sending…" : "Book Now!"}
        </Button>
      </form>
    </Card>
  )
}
