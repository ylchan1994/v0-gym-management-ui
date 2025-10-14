"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { generatePaymentMethodIframeUrl, type PaymentMethodIframeResponse } from "@/lib/payment-api"
import { toast } from "sonner"

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

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  useEffect(() => {
    if (open && !iframeUrl) {
      loadIframeUrl()
    }
  }, [open])

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PaymentMethodIframeResponse>) => {
      // In production, verify event.origin matches your payment provider's domain
      // Example: if (event.origin !== 'https://payment-provider.example.com') return

      console.log("[v0] Received message from iframe:", event.data)

      // Check if the message is from our payment iframe
      if (event.data && typeof event.data === "object" && "success" in event.data) {
        const response = event.data

        if (response.success) {
          toast.success(response.message || "Payment method added successfully")
          setOpen(false)
          setIframeUrl(null) // Reset iframe URL for next time
          onSuccess?.()
        } else {
          toast.error(response.error || "Failed to add payment method")
        }
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [onSuccess, setOpen])

  const loadIframeUrl = async () => {
    setIsLoading(true)
    try {
      const url = await generatePaymentMethodIframeUrl(customerId)
      setIframeUrl(url)
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
    }
  }

  const content = (
    <DialogContent className="max-w-[80vw] h-[60vh] p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>Add a new payment method for automatic billing</DialogDescription>
      </DialogHeader>
      <div className="flex-1 p-6 pt-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : iframeUrl ? (
          <iframe
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
