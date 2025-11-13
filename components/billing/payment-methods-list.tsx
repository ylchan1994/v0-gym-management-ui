"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CreditCard, Trash2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { deletePaymentMethod, getCustomerPaymentMethods, replacePaymentMethod } from "@/lib/passer-functions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface PaymentMethod {
  id: string
  type: string
  last4?: string | null
  expiry?: string | null
  account?: string
  isDefault: boolean
  valid: boolean
}

interface PaymentMethodsListProps {
  customerId: string
  variant?: "display" | "selection"
  selectedMethodId?: string
  onMethodSelect?: (methodId: string) => void
  showInvalid?: boolean
}

export function PaymentMethodsList({
  customerId,
  variant = "display",
  selectedMethodId,
  onMethodSelect,
  showInvalid = false,
}: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [methodToReplace, setMethodToReplace] = useState<PaymentMethod | null>(null)
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<PaymentMethod | null>(null)

  useEffect(() => {
    if (customerId) {
      fetchPaymentMethods()
    }
  }, [customerId])

  async function fetchPaymentMethods() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getCustomerPaymentMethods(customerId)

      // Normalize response structure
      let items: any[] | null = null
      if (Array.isArray(response)) items = response
      else if (Array.isArray(response?.paymentMethods)) items = response.paymentMethods
      else if (Array.isArray(response?.results)) items = response.results
      else if (Array.isArray(response?.data)) items = response.data
      else if (response) items = [response]

      // Normalize items into UI-friendly shape
      const normalized = (items || []).map((pm: any) => ({
        id: pm.paymentMethodToken ?? pm.id,
        type: pm.type ?? "",
        last4: pm.card?.last4 ?? pm.bank?.last4 ?? pm.last4 ?? null,
        expiry: pm.card ? `${pm.card.expiryMonth}/${pm.card.expiryYear}` : (pm.expiry ?? null),
        isDefault: pm.primary ?? false,
        account:
          pm.payTo?.aliasId ?? (pm.payTo?.bbanAccountNo ? pm.payTo.bbanAccountNo.slice(-4) : undefined) ?? pm.account,
        valid: pm.valid,
      }))

      setPaymentMethods(normalized)
      setDefaultPaymentMethod(normalized.filter(pm => pm.isDefault)[0])
    } catch (error: any) {
      const msg = error?.message || String(error)
      console.error("Error fetching payment methods", msg)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-destructive py-4">Failed to load payment methods: {error}</div>
  }

  if (paymentMethods.length === 0) {
    return <div className="text-sm text-muted-foreground py-4">No payment methods found</div>
  }

  const handleDeleteClick = (method: PaymentMethod, e: React.MouseEvent) => {
    e.stopPropagation()
    setMethodToDelete(method)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return

    // Delete payment method API call
    const deleteResult = await deletePaymentMethod(customerId, methodToDelete?.id)

    if (deleteResult.error) {
      //TODO: Show error on screen just like when refund is fail
    }

    setDeleteDialogOpen(false)
    setMethodToDelete(null)

    // Refresh payment methods after delete
    await fetchPaymentMethods()
  }

  const handleReplaceClick = (method: PaymentMethod, e: React.MouseEvent) => {
    e.stopPropagation()
    setMethodToReplace(method)
    setReplaceDialogOpen(true)
  }

  const handleReplaceConfirm = async () => {
    if (!methodToReplace) return
    console.log(defaultPaymentMethod)
    // Replace payment method API call
    const replaceResult = await replacePaymentMethod(customerId, defaultPaymentMethod?.id, methodToReplace?.id)

    if (replaceResult.error) {
      //TODO: Show error on screen just like when refund is fail
    }

    setReplaceDialogOpen(false)
    setDefaultPaymentMethod(methodToReplace)
    setMethodToReplace(null)

    // Refresh payment methods after replace
    await fetchPaymentMethods()
  }

  if (variant === "selection") {
    return (
      <RadioGroup value={selectedMethodId} onValueChange={onMethodSelect}>
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const isInvalid = !method.valid
            const isDisabled = isInvalid && !showInvalid

            return (
              <div
                key={method.id}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-3",
                  isInvalid && "opacity-50 bg-muted",
                  !isDisabled && "cursor-pointer hover:bg-accent",
                )}
              >
                <RadioGroupItem value={method.id} id={method.id} disabled={isDisabled} />
                <Label
                  htmlFor={method.id}
                  className={cn(
                    "flex flex-1 items-center justify-between cursor-pointer",
                    isDisabled && "cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{method.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.last4 ? `****${method.last4}` : ""} {method.expiry || method.account || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {isInvalid && (
                      <Badge variant="destructive" className="text-xs">
                        Invalid
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    )
  }

  // Display variant
  return (
    <>
      <div className="max-h-[240px] overflow-y-auto space-y-2">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{method.type}</p>
                <p className="text-xs text-muted-foreground">
                  {method.last4 ? `****${method.last4}` : ""} {method.expiry || method.account || ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {method.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
              {!method.valid && (
                <Badge variant="destructive" className="text-xs">
                  Invalid
                </Badge>
              )}
              {!method.isDefault && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => handleReplaceClick(method, e)}
                    title="Replace payment method"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => handleDeleteClick(method, e)}
                    title="Delete payment method"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              All future payments will be defaulted to this payment method.
              {methodToReplace && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">{methodToReplace.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {methodToReplace.last4 ? `****${methodToReplace.last4}` : ""}{" "}
                    {methodToReplace.expiry || methodToReplace.account || ""}
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
              {methodToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">{methodToDelete.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {methodToDelete.last4 ? `****${methodToDelete.last4}` : ""}{" "}
                    {methodToDelete.expiry || methodToDelete.account || ""}
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
