"use client"

import { useState, useEffect } from "react"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerPaymentMethods } from "@/lib/passer-functions"
import { cn } from "@/lib/utils"

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          <div className="flex gap-2">
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
          </div>
        </div>
      ))}
    </div>
  )
}
