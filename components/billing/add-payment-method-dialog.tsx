"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { getEzypayToken } from "@/lib/ezypay-token"
import Link from "next/link"
import { logApiCall } from "@/lib/api-logger"

interface AddPaymentMethodDialogProps {
  customerId: string
  onSuccess?: () => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddPaymentMethodDialog({
  customerId,
  onSuccess,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
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
      // Call onOpenChange even in uncontrolled mode if provided
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
      // Request access token from our server-side token route
      const tokenRes = await getEzypayToken()
      const token = tokenRes.access_token

      if (!token) {
        throw new Error(`Token endpoint failed`)
      }

      const pcpUrl = `${process.env.NEXT_PUBLIC_PCP_ENDPOINT}/embed?token=${token}&feepricing=true&submitbutton=true&customerId=${customerId}`
      setIframeUrl(pcpUrl)
      await logApiCall("GET", pcpUrl, "truncated response", 200)

      try {
        // Record origin from the iframe URL so we can validate messages
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset iframe URL when dialog closes
      setIframeUrl(null)
      onSuccess?.()
    }
  }

  const content = (
    <DialogContent className="min-w-[80vw] h-[90vh]">
      <DialogHeader className="p-2 pb-0">
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>Add a new payment method for automatic billing</DialogDescription>
        <DialogDescription className="italic">
          Host&nbsp;
          <Link href={"https://developer.ezypay.com/docs/payment-capture-page#/"} className="underline">
            Ezypay's Payment Capture Page
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
            className="h-full w-full rounded-lg border border-border"
            title="Add Payment Method"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Failed to load payment form
          </div>
        )}
      </div>
    </DialogContent>
  )

  // If children are provided, use them as the trigger
  if (children) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {content}
      </Dialog>
    )
  }

  // Otherwise, render as a controlled dialog
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </Dialog>
  )
}
