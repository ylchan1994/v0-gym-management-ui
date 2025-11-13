"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { listCustomer } from "@/lib/passer-functions"
import { Spinner } from "@/components/ui/spinner"
import { createInvoice } from "@/lib/invoice"
import { PaymentMethodsList } from "./payment-methods-list"

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (invoice: any) => void
  customerId?: string
  customerName?: string
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
  customerName,
}: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [showTapAnimation, setShowTapAnimation] = useState(false)
  const { toast } = useToast()
  const [customers, setCustomers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    description: "",
    paymentMethod: "ondemand" as "ondemand" | "tap-to-pay" | "checkout",
    terminalId: "",
    paymentMethodId: "",
  })

  useEffect(() => {
    if (open && !customerId) {
      setLoadingCustomers(true)
      listCustomer()
        .then((response) => {
          const customerList = response?.data || []
          setCustomers(customerList)
          sessionStorage.setItem("defaultCustomerList", JSON.stringify(customerList))
          setLoadingCustomers(false)
        })
        .catch((err) => {
          console.error("Failed to load customers:", err)
          toast({
            title: "Error",
            description: "Failed to load customer list.",
            variant: "destructive",
          })
          setLoadingCustomers(false)
        })
    } else if (open && customerId) {
      setFormData((prev) => ({ ...prev, memberId: customerId }))
    }
  }, [open, customerId, toast])

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

    if (formData.paymentMethod === "ondemand" && !formData.paymentMethodId) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method for on-demand payment.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let selectedMemberName = customerName
      if (!selectedMemberName) {
        const selectedCustomer = customers.find((c) => c.id === formData.memberId)
        selectedMemberName = selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "Unknown"
      }

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
        customerId: formData.memberId,
        member: selectedMemberName,
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

      if (formData.paymentMethod === "ondemand") {
          console.log('formData before submi', JSON.stringify(formData))
        await createInvoice({
          memberId: formData.memberId,
          amount: formData.amount,
          description: formData.description,
          paymentMethodId: formData.paymentMethodId,
        })

        toast({
          title: "Invoice Created",
          description: "Invoice created successfully with on-demand payment.",
        })
      }

      console.log("[v0] Creating invoice with payment method:", formData.paymentMethod)
      console.log("[v0] Invoice data:", invoiceData)

      setFormData({
        memberId: customerId || "",
        amount: "",
        description: "",
        paymentMethod: "ondemand",
        terminalId: "",
        paymentMethodId: "",
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice with pending status</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Member</Label>
                {customerId ? (
                  <Input id="member" value={customerName || ""} disabled className="bg-muted" />
                ) : (
                  <Select
                    value={formData.memberId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, memberId: value }))}
                    required
                    disabled={loadingCustomers}
                  >
                    <SelectTrigger id="member">
                      <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Select a member"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {loadingCustomers ? (
                        <div className="flex justify-center py-4">
                          <Spinner className="h-6 w-6" />
                        </div>
                      ) : customers.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">No customers found</div>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
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
                    setFormData((prev) => ({ ...prev, paymentMethod: value, terminalId: "", paymentMethodId: "" }))
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

              {formData.paymentMethod === "ondemand" && formData.memberId && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Select Payment Method</Label>
                  <PaymentMethodsList
                    customerId={formData.memberId}
                    variant="selection"
                    selectedMethodId={formData.paymentMethodId}
                    onMethodSelect={(methodId) => setFormData((prev) => ({ ...prev, paymentMethodId: methodId }))}
                  />
                </div>
              )}

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
              <Button type="submit" disabled={loading || loadingCustomers}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
