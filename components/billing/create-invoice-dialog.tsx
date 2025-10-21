"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { TapToPayAnimation } from "./tap-to-pay-animation"

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (invoice: any) => void
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showTapAnimation, setShowTapAnimation] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    description: "",
    paymentMethod: "ondemand" as "ondemand" | "tap-to-pay" | "checkout",
    terminalId: "",
  })

  // Mock members list
  const members = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Sarah Smith" },
    { id: "3", name: "Mike Johnson" },
    { id: "4", name: "Emma Wilson" },
    { id: "5", name: "David Brown" },
  ]

  const terminalDevices = [
    {
      id: "1",
      name: "Front Desk Terminal",
      deviceId: "TERM-001",
      status: "active",
    },
    {
      id: "2",
      name: "Reception Terminal",
      deviceId: "TERM-002",
      status: "active",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.paymentMethod === "tap-to-pay" && !formData.terminalId) {
      toast({
        title: "Terminal Required",
        description: "Please select a terminal device for tap-to-pay.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const selectedMember = members.find((m) => m.id === formData.memberId)
      const selectedTerminal = terminalDevices.find((t) => t.id === formData.terminalId)

      let invoiceStatus: "pending" | "paid" = "pending"

      if (formData.paymentMethod === "tap-to-pay") {
        console.log("[v0] Initiating tap-to-pay with terminal:", selectedTerminal?.name)

        // Show tap-to-pay animation
        setShowTapAnimation(true)

        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Hide animation
        setShowTapAnimation(false)

        // Set status to paid for tap-to-pay
        invoiceStatus = "paid"

        console.log("[v0] Tap-to-pay completed successfully")
      }

      const invoiceData = {
        id: `INV-${String(Date.now()).slice(-3)}`,
        member: selectedMember?.name || "Unknown",
        amount: `$${Number.parseFloat(formData.amount).toFixed(2)}`,
        status: invoiceStatus,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Visa ****4242",
        description: formData.description,
        terminal: formData.paymentMethod === "tap-to-pay" ? selectedTerminal?.name : undefined,
        paymentAttempts:
          invoiceStatus === "paid"
            ? [
                {
                  id: "1",
                  date: new Date().toISOString().split("T")[0],
                  amount: `$${Number.parseFloat(formData.amount).toFixed(2)}`,
                  status: "success" as const,
                  method: "Visa ****4242",
                  terminal: selectedTerminal?.name,
                },
              ]
            : [],
      }

      console.log("[v0] Creating invoice with payment method:", formData.paymentMethod)

      // Different logic for each payment method
      switch (formData.paymentMethod) {
        case "ondemand":
          console.log("[v0] Processing on-demand payment...")
          toast({
            title: "Invoice Created - On Demand",
            description: "Invoice created and ready for on-demand payment.",
          })
          break
        case "tap-to-pay":
          toast({
            title: "Payment Successful",
            description: `Payment processed successfully via ${selectedTerminal?.name}.`,
          })
          break
        case "checkout":
          try {
            console.log("[v0] Generating checkout link...")

            // POST to internal API which proxies to Ezypay Checkout
            const res = await fetch(`/api/payment/checkout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              // Ezypay expects amount in cents/lowest currency unit in many APIs;
              // the server route will forward this along. Keep original amount as number here.
              body: JSON.stringify({ amount: Number.parseFloat(formData.amount), desciption: formData.description }),
            })

            const data = await res.json()

            // Support several possible fields for the returned URL
            const checkoutUrl =  data?.checkoutUrl 

            if (checkoutUrl && typeof window !== "undefined") {
              window.open(checkoutUrl, "_blank")
              toast({
                title: "Invoice Created - Checkout",
                description: "Checkout opened in a new tab.",
              })
            } else {
              console.warn("[v0] Checkout API did not return a URL", data)
              toast({
                title: "Invoice Created",
                description: "Invoice created but no checkout URL was returned.",
              })
            }
          } catch (err) {
            console.error("[v0] Error generating checkout link:", err)
            toast({
              title: "Checkout Error",
              description: "Failed to generate checkout link. Please try again.",
              variant: "destructive",
            })
          }
          break
      }

      // Reset form and close dialog
      setFormData({
        memberId: "",
        amount: "",
        description: "",
        paymentMethod: "ondemand",
        terminalId: "",
      })
      onOpenChange(false)
      onSuccess?.(invoiceData)
    } catch (error) {
      console.error("[v0] Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
      setShowTapAnimation(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TapToPayAnimation open={showTapAnimation} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice with pending status</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Member</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, memberId: value }))}
                  required
                >
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Monthly membership fee"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value, terminalId: "" }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ondemand" id="ondemand" />
                    <Label htmlFor="ondemand" className="font-normal cursor-pointer">
                      On Demand
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tap-to-pay" id="tap-to-pay" />
                    <Label htmlFor="tap-to-pay" className="font-normal cursor-pointer">
                      Tap to Pay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkout" id="checkout" />
                    <Label htmlFor="checkout" className="font-normal cursor-pointer">
                      Checkout
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.paymentMethod === "tap-to-pay" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="terminal">Select Terminal Device</Label>
                  <Select
                    value={formData.terminalId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, terminalId: value }))}
                    required
                  >
                    <SelectTrigger id="terminal">
                      <SelectValue placeholder="Select a terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {terminalDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.deviceId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Only active terminals are available for selection</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
