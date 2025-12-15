"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { getEzypayToken } from "@/lib/ezypay-token"
import Link from "next/link"
import { logApiCall } from "@/lib/api-logger"
import { Button } from "@/components/ui/button"

interface AddPaymentMethodDialogProps {
  customerId: string
  onSuccess?: () => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  customerEmail?: string
  customerName?: string
}

export function AddPaymentMethodDialog({
  customerId,
  onSuccess,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  customerEmail,
  customerName,
}: AddPaymentMethodDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeOriginRef = useRef<string | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
      controlledOnOpenChange?.(newOpen)
    }
  }

  useEffect(() => {
    if (open && !iframeUrl) {
      loadIframeUrl()
    }
  }, [open])

  const loadIframeUrl = async () => {
    setIsLoading(true)
    try {
      const tokenRes = await getEzypayToken()
      const token = tokenRes.access_token

      if (!token) {
        throw new Error(`Token endpoint failed`)
      }

      const pcpUrl = `${process.env.NEXT_PUBLIC_PCP_ENDPOINT}/paymentmethod/embed?token=${token}&feepricing=true&submitbutton=true&customerId=${customerId}`
      setIframeUrl(pcpUrl)
      await logApiCall("GET", pcpUrl, "Payment Capture Page UI", 200)

      try {
        const url = new URL(pcpUrl)
        iframeOriginRef.current = url.origin
      } catch (e) {
        iframeOriginRef.current = null
      }
    } catch (error) {
      console.error("[v0] Error loading iframe URL:", error)
      toast.error("Failed to load payment form")
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailCustomer = () => {
    if (!customerEmail) {
      toast.error("Customer email not available")
      return
    }

    const memberPageUrl = `${window.location.origin}/members/${customerId}?addPayment=true`

    const subject = "Update Your Payment Method - GymFlow"
    const body = `Dear ${customerName || "Valued Member"},

We hope this message finds you well!

We noticed that your payment method may need to be updated. To ensure uninterrupted service and avoid any disruption to your membership, please take a moment to update your payment information.

You can securely add or update your payment method by clicking the link below:
${memberPageUrl}

Why update your payment method?
• Keep your membership active without interruption
• Ensure automatic billing for your convenience
• Secure and PCI-compliant payment processing

If you have any questions or need assistance, please don't hesitate to contact us.

Thank you for being a valued member of GymFlow!

Best regards,
The GymFlow Team

---
This is an automated message. Please do not reply to this email.
For support, contact us at support@gymflow.com`

    const mailtoLink = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    window.open(mailtoLink, "_blank")
    toast.success("Email draft opened in new tab")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setIframeUrl(null)
      onSuccess?.()
    }
  }

  const content = (
    <DialogContent className="min-w-[50vw] h-[90vh]">
      <DialogHeader className="p-2 pb-0">
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>Add a new payment method for automatic billing</DialogDescription>
        <DialogDescription className="italic">
          Host&nbsp;
          <Link href={"https://developer.ezypay.com/docs/payment-capture-page#/"} target="_blank" className="underline">
            Ezypay's Payment capture page
          </Link>
          &nbsp;here and allow customer to update their payment method. This should be on the customer portal if
          available.
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 p-4 mt-10">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="h-full w-full rounded-lg border border-border p-4"
            title="Add Payment Method"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Failed to load payment form
          </div>
        )}
      </div>
      {/* Moved email button to dialog footer */}
      {customerEmail && (
        <DialogFooter>
          <Button variant="outline" onClick={handleEmailCustomer} className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email Customer
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  )

  if (children) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </Dialog>
  )
}
