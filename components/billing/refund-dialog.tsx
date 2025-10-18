"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

interface RefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceAmount: number
  onConfirm: (amount: number | null) => void
  isProcessing?: boolean
}

export function RefundDialog({ open, onOpenChange, invoiceAmount, onConfirm, isProcessing }: RefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState("")

  const handleConfirm = () => {
    // If no amount entered or amount equals invoice amount, it's a full refund
    const amount = refundAmount.trim() === "" ? null : Number.parseFloat(refundAmount)

    if (amount !== null && (isNaN(amount) || amount <= 0 || amount > invoiceAmount)) {
      return
    }

    onConfirm(amount)
    setRefundAmount("")
  }

  const handleCancel = () => {
    setRefundAmount("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refund Invoice</DialogTitle>
          <DialogDescription>
            Enter a refund amount for partial refund, or leave empty for full refund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="refundAmount">Refund Amount (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="refundAmount"
                type="number"
                placeholder={`${invoiceAmount.toFixed(2)} (Full refund)`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="pl-9"
                step="0.01"
                min="0"
                max={invoiceAmount}
              />
            </div>
            <p className="text-xs text-muted-foreground">Invoice amount: ${invoiceAmount.toFixed(2)}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm font-medium">
              {refundAmount.trim() === "" || Number.parseFloat(refundAmount) === invoiceAmount
                ? "Full Refund"
                : "Partial Refund"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Amount to refund: $
              {refundAmount.trim() === ""
                ? invoiceAmount.toFixed(2)
                : (Number.parseFloat(refundAmount) || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Confirm Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
