"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreditCard, CheckCircle, XCircle, DollarSign, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { RefundDialog } from "./refund-dialog"
import { getStatusBadgeVariant } from "@/app/members/[id]/page"
import {
  listTransactionByInvoice,
  retryInvoice,
  writeOffInvoice,
  recordExternalInvoice,
  refundInvoice,
} from "@/lib/passer-functions"
import { Spinner } from "../ui/spinner"
import { PaymentMethodsList } from "./payment-methods-list"

interface PaymentAttempt {
  id: string
  date: string
  amount: string
  status: "success" | "failed" | "pending" | "settled"
  method: string
  errorMessage?: string
}

export interface Invoice {
  id: string
  member: string
  amount: string
  status: string
  date: string
  dueDate: string
  paymentMethod?: string
  items?: any[]
  number: string
  paymentAttempts?: PaymentAttempt[]
  refundAmount?: string
  refundDate?: string
  refundType?: "full" | "partial"
  customerId?: string
  failedPaymentReason?: any
  paymentProviderResponse?: any
  payNowUrl?: string
}

interface InvoiceDetailDialogProps {
  invoiceProp: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function InvoiceDetailDialog({ invoiceProp, open, onOpenChange, onUpdate }: InvoiceDetailDialogProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(invoiceProp)
  const [isTransactionLoading, setIsTransactionLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showExternalPayment, setShowExternalPayment] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showRetryPaymentSelection, setShowRetryPaymentSelection] = useState(false)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [externalPaymentMethod, setExternalPaymentMethod] = useState<string>("")
  const [refundError, setRefundError] = useState<string | null>(null)
  
  useEffect(() => {
    setInvoice(invoiceProp)
  }, [invoiceProp])

  useEffect(() => {
    listTransactionByInvoice(invoiceProp?.id, invoiceProp?.paymentMethod).then((transactions) => {
      setInvoice((prev) => ({ ...prev, paymentAttempts: transactions }))
      setIsTransactionLoading(false)
    })
  }, [])

  if (!invoice) return null

  const handleRefund = async (amount: number | null) => {
    setIsProcessing(true)
    setIsRetrying(true)
    setRefundError(null)

    try {
      const refundAmount = amount === null ? null : amount

      const result = await refundInvoice(invoice.id, refundAmount)

      if (result.success) {
        toast.success("Refund initiated successfully")
        onUpdate?.()
        onOpenChange(false)
        window.location.reload()
      } else {
        setRefundError(result.error?.message || "Failed to refund payment")
      }
    } catch (error) {
      setRefundError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
      setIsRetrying(false)
    }
  }

  const handleWriteOff = async () => {
    setIsProcessing(true)
    setIsRetrying(true)
    try {
      const result = await writeOffInvoice(invoice.id)
      toast.success("Write off initiated successfully")
      onUpdate?.()
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to write off payment")
    } finally {
      setIsProcessing(false)
      setIsRetrying(false)
    }
  }

  const handleRetry = async () => {
    if (!showRetryPaymentSelection) {
      setShowRetryPaymentSelection(true)
      return
    }

    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method")
      return
    }

    setIsProcessing(true)
    setIsRetrying(true)
    try {
      const result = await retryInvoice(invoice.id, selectedPaymentMethodId)
      toast.success("Payment retry initiated successfully")
      onUpdate?.()
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to retry payment")
    } finally {
      setIsProcessing(false)
      setIsRetrying(false)
    }
  }

  const handlePayNow = async () => {
    if (!invoice?.payNowUrl) {
      toast.error("No Pay Now URL available for this invoice")
      return
    }

    try {
      if (typeof invoice.payNowUrl !== "string") throw new Error("Invalid URL")
      // validate URL
      // eslint-disable-next-line no-new
      new URL(invoice.payNowUrl)

      if (typeof window !== "undefined") {
        window.open(invoice.payNowUrl, "_blank", "noopener,noreferrer")
      }
    } catch (err) {
      console.error("[v0] Failed to open Pay Now URL", err, invoice.payNowUrl)
      toast.error("Failed to open Pay Now URL")
    }
  }

  const handleTrackExternal = async () => {
    if (!invoice.id) {
      toast.error("No Invoice ID")
      return
    }

    if (!externalPaymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    setIsProcessing(true)
    setIsRetrying(true)
    try {
      const result = await recordExternalInvoice(invoice.id, externalPaymentMethod)
      toast.success("External payment recorded successfully")
      onUpdate?.()
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to record external payment")
    } finally {
      setIsProcessing(false)
      setIsRetrying(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>View invoice information and payment history</DialogDescription>
            <DialogDescription className="italic">
              Transparency on the invoice status and information is important to both customer and merchant. They should be able to view all the fees charged to the customer and the failed reasons.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-12">
            {/* Invoice Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice ID</p>
                <p className="text-lg font-semibold">{invoice.number}</p>
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
                <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                <p className="text-base">{invoice.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                <p className="text-base">{invoice.dueDate}</p>
              </div>
            </div>

            {invoice.status === "refunded" && invoice.refundAmount && (
              <>
                <Separator />
                <div className="rounded-lg border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400">Refund Information</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Refund Type</p>
                      <p className="text-base font-semibold capitalize">{invoice.refundType || "Full"} Refund</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Refund Amount</p>
                      <p className="text-base font-semibold text-orange-600 dark:text-orange-400">
                        {invoice.refundAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Refund Date</p>
                      <p className="text-base">{invoice.refundDate}</p>
                    </div>
                    {invoice.refundType === "partial" && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                        <p className="text-base font-semibold">
                          $
                          {(
                            Number.parseFloat(invoice.amount.replace("$", "")) -
                            Number.parseFloat(invoice.refundAmount.replace("$", ""))
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Invoice Item breakdown */}
            <div>
              <p className="mb-3">Breakdown</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow key={item.description}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="font-medium">{item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Failed Payment Reasons */}
            {invoice.failedPaymentReason ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Failed Reasons</p>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <p className="font-medium">{invoice.failedPaymentReason.code}:</p>
                  <p className="font-medium">{invoice.paymentProviderResponse.description}</p>
                </div>
              </div>
            ) : (
              ""
            )}

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

              {isTransactionLoading ? (
                <div className="relative flex justify-center items-center">
                  <Spinner className="w-10 h-10" />
                </div>
              ) : (
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
                            {attempt.status === "success" || attempt.status === "settled" ? (
                              <CheckCircle className="h-4 w-4 text-accent" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="capitalize">{attempt.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {attempt.errorMessage && (
                            <span className="text-xs text-destructive">{attempt.errorMessage}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {showRetryPaymentSelection && invoice.customerId && (
              <>
                <Separator />
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h4 className="font-medium">Select Payment Method for Retry</h4>
                  <PaymentMethodsList
                    customerId={invoice.customerId}
                    variant="selection"
                    selectedMethodId={selectedPaymentMethodId}
                    onMethodSelect={setSelectedPaymentMethodId}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleRetry} disabled={isProcessing || !selectedPaymentMethodId}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Confirm Retry
                    </Button>
                    <Button variant="outline" onClick={() => setShowRetryPaymentSelection(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* External Payment Form */}
            {showExternalPayment && (
              <>
                <Separator />
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h4 className="font-medium">Track External Payment</h4>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={externalPaymentMethod} onValueChange={setExternalPaymentMethod}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleTrackExternal} disabled={isProcessing || !externalPaymentMethod}>
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
                <Button variant="destructive" onClick={() => setShowRefundDialog(true)} disabled={isProcessing}>
                  Refund Invoice
                </Button>
              )}
              {(invoice.status === "failed" || invoice.status === "past_due" || invoice.status === "unpaid") && (
                <>
                  <Button variant="secondary" onClick={handleRetry} disabled={isProcessing}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>

                  {invoice.payNowUrl && <Button variant="secondary" onClick={handlePayNow} disabled={isProcessing}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>}

                  <Button
                    variant="secondary"
                    onClick={() => setShowExternalPayment(!showExternalPayment)}
                    disabled={isProcessing}
                  >
                    Track External Payment
                  </Button>

                  <Button variant="destructive" onClick={handleWriteOff} disabled={isProcessing}>
                    Write off
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RefundDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        invoiceAmount={Number.parseFloat(invoice.amount.replace("$", ""))}
        onConfirm={handleRefund}
        isProcessing={isProcessing}
        error={refundError}
      />
    </>
  )
}
