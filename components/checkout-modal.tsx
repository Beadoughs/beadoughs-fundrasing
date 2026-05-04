"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Minus, Plus, ShoppingCart } from "lucide-react"

export function CheckoutModal({ fundraiserTitle }: { fundraiserTitle: string }) {
  const [quantity, setQuantity] = useState(1)
  const pricePerBox = 25 // $25 per box of doughnuts

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-lg h-14 rounded-full shadow-lg shadow-primary/20">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Doughnuts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Support this Fundraiser!</DialogTitle>
          <DialogDescription>
            You are purchasing doughnuts to support <strong>{fundraiserTitle}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Classic Assorted Box</p>
              <p className="text-sm text-muted-foreground">12 freshly baked doughnuts</p>
            </div>
            <p className="font-bold">${pricePerBox}</p>
          </div>

          <div className="flex items-center justify-center gap-4 py-4 bg-secondary/30 rounded-xl">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="font-bold text-lg">Total</p>
            <p className="font-bold text-2xl text-primary">${quantity * pricePerBox}</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full h-12 text-lg rounded-full"
            onClick={() => alert(`Redirecting to Stripe to pay $${quantity * pricePerBox} for ${quantity} boxes!`)}
          >
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
