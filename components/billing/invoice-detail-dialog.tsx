"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, CheckCircle, XCircle, DollarSign } from "lucide-react"
import { refundInvoice, writeOffInvoice, retryInvoicePayment, trackExternalPayment } from "@/lib/payment-api"
import { toast } from "sonner"

interface PaymentAttempt {
  id: string
  date: string
  amount: string
  status: "success" | "failed"
  method: string
  errorMessage?: string
}

interface Invoice {
  id: string
  member: string
  amount: string
  status: "paid" | "pending" | "past due" | "failed"
  date: string
  dueDate: string
  paymentMethod: string
  paymentAttempts: PaymentAttempt[]
}

interface InvoiceDetailDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function InvoiceDetailDialog({ invoice, open, onOpenChange, onUpdate }: InvoiceDetailDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showExternalPayment, setShowExternalPayment] = useState(false)
  const [externalPaymentData, setExternalPaymentData] = useState({
    method: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
  })

  if (!invoice) return null

  const handleRefund = async () => {
    setIsProcessing(true)
    try {
      const amount = Number.parseFloat(invoice.amount.replace("$", ""))
      const result = await refundInvoice(invoice.id, amount)
      if (result.success) {
        toast.success(result.message)
        onUpdate?.()
        onOpenChange(false)
      }
    } catch (error) {
      toast.error("Failed to process refund")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWriteOff = async () => {
    setIsProcessing(true)
    try {
      const result = await writeOffInvoice(invoice.id)
      if (result.success) {
        toast.success(result.message)
        onUpdate?.()
        onOpenChange(false)
      }
    } catch (error) {
      toast.error("Failed to write off invoice")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = async () => {
    setIsProcessing(true)
    try {
      const result = await retryInvoicePayment(invoice.id)
      if (result.success) {
        toast.success(result.message)
        onUpdate?.()
        onOpenChange(false)
      }
    } catch (error) {
      toast.error("Failed to retry payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTrackExternal = async () => {
    if (!externalPaymentData.method || !externalPaymentData.reference) {
      toast.error("Please fill in all fields")
      return
    }

    setIsProcessing(true)
    try {
      const result = await trackExternalPayment(invoice.id, externalPaymentData)
      if (result.success) {
        toast.success(result.message)
        onUpdate?.()
        onOpenChange(false)
        setShowExternalPayment(false)
      }
    } catch (error) {
      toast.error("Failed to track external payment")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>View invoice information and payment history</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice ID</p>
              <p className="text-lg font-semibold">{invoice.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member</p>
              <p className="text-lg font-semibold">{invoice.member}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">{invoice.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge
                variant={
                  invoice.status === "paid" ? "default" : invoice.status === "pending" ? "secondary" : "destructive"
                }
              >
                {invoice.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
              <p className="text-base">{invoice.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
              <p className="text-base">{invoice.dueDate}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Payment Method</p>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{invoice.paymentMethod}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Attempts */}
          <div>
            <p className="text-sm font-medium mb-3">Payment History</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.paymentAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>{attempt.date}</TableCell>
                    <TableCell className="font-medium">{attempt.amount}</TableCell>
                    <TableCell>{attempt.method}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {attempt.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="capitalize">{attempt.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attempt.errorMessage && <span className="text-xs text-destructive">{attempt.errorMessage}</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* External Payment Form */}
          {showExternalPayment && (
            <>
              <Separator />
              <div className="space-y-4 rounded-lg border border-border p-4">
                <h4 className="font-medium">Track External Payment</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Input
                      id="paymentMethod"
                      placeholder="e.g., Cash, Bank Transfer"
                      value={externalPaymentData.method}
                      onChange={(e) => setExternalPaymentData({ ...externalPaymentData, method: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      placeholder="e.g., TXN123456"
                      value={externalPaymentData.reference}
                      onChange={(e) => setExternalPaymentData({ ...externalPaymentData, reference: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={externalPaymentData.date}
                      onChange={(e) => setExternalPaymentData({ ...externalPaymentData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleTrackExternal} disabled={isProcessing}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Confirm Payment
                  </Button>
                  <Button variant="outline" onClick={() => setShowExternalPayment(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {invoice.status === "paid" && (
              <Button variant="destructive" onClick={handleRefund} disabled={isProcessing}>
                Refund Invoice
              </Button>
            )}
            {(invoice.status === "failed" || invoice.status === "past due" || invoice.status === "pending") && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowExternalPayment(!showExternalPayment)}
                  disabled={isProcessing}
                >
                  Track External Payment
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
