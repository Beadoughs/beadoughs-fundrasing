"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
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
import { Send, CheckCircle2 } from "lucide-react"
import { submitEnquiry } from "@/app/actions/enquiry"

export function EnquiryForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [organisation, setOrganisation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [groupType, setGroupType] = useState<string | undefined>(undefined)
  const [fundraisingDate, setFundraisingDate] = useState("")
  const [message, setMessage] = useState("")

  const resetFields = () => {
    setName("")
    setOrganisation("")
    setEmail("")
    setPhone("")
    setGroupType(undefined)
    setFundraisingDate("")
    setMessage("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupType) {
      toast.error("Please select a type of group.")
      return
    }
    startTransition(async () => {
      const result = await submitEnquiry({
        name,
        organisation,
        email,
        phone,
        groupType,
        fundraisingDate,
        message,
      })
      if (result.ok) {
        setIsSubmitted(true)
        resetFields()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (isSubmitted) {
    return (
      <section id="enquiry" className="py-16 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-12 bg-card border-border rounded-3xl text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-4">
              Thank you for your enquiry!
            </h3>
            <p className="text-muted-foreground mb-6">
              We&apos;ve received your fundraising enquiry and will be in touch within 1-2 business days.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                resetFields()
              }}
              variant="outline"
              className="rounded-full"
            >
              Submit another enquiry
            </Button>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="enquiry" className="py-16 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left - Info */}
          <div className="lg:sticky lg:top-32">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
              Let&apos;s Get Your Fundraiser Rolling
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Pop in your details and we&apos;ll be in touch in 1-2 business days to shape the right plan for your group, school, charity or workplace.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-foreground">No obligation — just a friendly chat about your goals</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-foreground">We&apos;ll help you figure out if a doughnut fundraiser is right for you</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-foreground">Get a clear picture of how the process works</p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <Card className="p-6 sm:p-8 bg-card border-border rounded-3xl shadow-xl shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Your name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                  className="h-12 rounded-xl bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="organisation" className="text-sm font-medium text-foreground">
                  Organisation / group name
                </label>
                <Input
                  id="organisation"
                  name="organisation"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="Hobart Primary School P&F"
                  required
                  autoComplete="organization"
                  className="h-12 rounded-xl bg-secondary/50 border-border"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    autoComplete="email"
                    className="h-12 rounded-xl bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0412 345 678"
                    autoComplete="tel"
                    className="h-12 rounded-xl bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="group-type" className="text-sm font-medium text-foreground">
                  Type of group
                </label>
                <Select
                  value={groupType}
                  onValueChange={setGroupType}
                  required
                >
                  <SelectTrigger
                    id="group-type"
                    className="h-12 rounded-xl bg-secondary/50 border-border"
                  >
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
                <label htmlFor="date" className="text-sm font-medium text-foreground">
                  Estimated fundraising date (optional)
                </label>
                <Input
                  id="date"
                  name="fundraisingDate"
                  type="text"
                  value={fundraisingDate}
                  onChange={(e) => setFundraisingDate(e.target.value)}
                  placeholder="e.g. March 2025, Term 2, or flexible"
                  className="h-12 rounded-xl bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message (optional)
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us a bit about your group and what you're hoping to raise money for..."
                  rows={4}
                  className="rounded-xl bg-secondary/50 border-border resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full rounded-full h-14 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Send className="h-5 w-5 mr-2" />
                {isPending ? "Sending…" : "Send Fundraising Enquiry"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to be contacted about your fundraising enquiry.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
