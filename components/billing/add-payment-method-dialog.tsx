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

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  // Only call parent's onOpenChange when the component is actually controlled via `open` prop.
  // If parent passed an onOpenChange without supplying `open`, treat the component as uncontrolled
  // and update internal state instead. This prevents the DialogTrigger from invoking the
  // parent's handler while the internal `open` remains false (which would make the dialog not open).
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen !== undefined) {
      controlledOnOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
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
      setIframeUrl(pcpUrl);

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
      </DialogHeader>
  <div className="flex-1 p-4 pt-4">
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
