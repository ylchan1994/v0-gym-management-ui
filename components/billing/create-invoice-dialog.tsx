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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateInvoiceDialogProps {
  onSuccess?: () => void
}

export function CreateInvoiceDialog({ onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    dueDate: "",
    description: "",
    attemptPayment: false, // Default to false so invoice stays pending
  })

  // Mock members list
  const members = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Sarah Smith" },
    { id: "3", name: "Mike Johnson" },
    { id: "4", name: "Emma Wilson" },
    { id: "5", name: "David Brown" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const invoiceData = {
        ...formData,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      console.log("[v0] Creating invoice with pending status:", invoiceData)

      // Simulate API call to create invoice
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // If attemptPayment is true, simulate payment attempt
      if (formData.attemptPayment) {
        console.log("[v0] Attempting payment immediately...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({
          title: "Invoice Created & Payment Attempted",
          description: "The invoice has been created and payment was attempted.",
        })
      } else {
        toast({
          title: "Invoice Created",
          description: "The invoice has been created with pending status.",
        })
      }

      // Reset form and close dialog
      setFormData({
        memberId: "",
        amount: "",
        dueDate: "",
        description: "",
        attemptPayment: false,
      })
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </DialogTrigger>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="attemptPayment"
                checked={formData.attemptPayment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    attemptPayment: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="attemptPayment" className="text-sm font-normal">
                Attempt payment immediately
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
