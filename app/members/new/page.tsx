"use client"

import type React from "react"

import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { getEzypayToken, createCustomer } from "@/lib/passer-functions"
import { logApiCall } from "@/lib/api-logger"

const pcpEndpoint = process.env.NEXT_PUBLIC_PCP_ENDPOINT
const defaultformData = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: null,
  address: null,
  emergencyContact: null,
  startDate: Date.now(),
  plan: "Trial",
  status: "trial",
  existingCustomerNumber: "", // Added optional existing customer number field
}

export default function NewMemberPage() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoadingIframe, setIsLoadingIframe] = useState(false)
  const [isCustomerCreated, setIsCustomerCreated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailPreviewLink, setEmailPreviewLink] = useState("")
  const [formData, setFormData] = useState(defaultformData)

  // Track selected values from Select components separately for easier UI updates
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeOriginRef = useRef<string | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if we have it
      // if (iframeOriginRef.current && event.origin !== iframeOriginRef.current) {
      //   return
      // }
      // // Handle payment method added successfully
      // if (event.data) {
      //   console.log(event.data);
      // } else if (event.data?.type === "PAYMENT_METHOD_ERROR" || event.data?.error) {
      //   toast.error("Failed to add payment method")
      // }
      //console.log(event.data ?? null)
    }

    // window.addEventListener("message", handleMessage)
    // return () => window.removeEventListener("message", handleMessage)
  }, [])

  const loadIframeUrl = async (customerId: string | null = null) => {
    setIsLoadingIframe(true)
    try {
      // Request access token from our server-side token route
      const tokenRes = await getEzypayToken()

      if (tokenRes.error) {
        throw new Error(`Token endpoint failed`)
      }

      const token = await tokenRes.access_token
      // Use a temporary customer ID for new members

      const pcpUrl = `${pcpEndpoint}/paymentmethod/embed?token=${token}&feepricing=true&submitbutton=true${customerId ? "&customerId=" + customerId : ""}`
      setIframeUrl(pcpUrl)
      await logApiCall("GET", pcpUrl.replace(/token=[^&]*&/i, `token={truncated}&`), "Payment capture page UI", 200)

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
    } finally {
      setIsLoadingIframe(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const field = (e.target as HTMLInputElement).id
    const value = (e.target as HTMLInputElement).value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const field = (e.target as HTMLInputElement).id
    const value = (e.target as HTMLInputElement).value
    setFormData((prev) => ({ ...prev, [field]: new Date(value).getTime() }))
  }

  function handlePlanChange(value: string) {
    setFormData((prev) => ({ ...prev, plan: value }))
  }

  function handleStatusChange(value: string) {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    let customerId = ""

    try {
      const response = await createCustomer(formData)
      toast.success("Member created successfully")
      if (!response?.id) {
        console.error("Failed to create customer")
        throw new Error("Failed to create customer")
      }
      customerId = response.id
    } catch (error) {
      toast.error("Failed to create member")
      console.error("Error creating member:", error)
      setIsSubmitting(false)
    }

    setEmailPreviewLink(
      `${window.location.origin}/email-preview?id=${customerId}&name=${formData.firstName} ${formData.lastName}`,
    )
    await loadIframeUrl(customerId)
    setIsSubmitting(false)
    setIsCustomerCreated(true)
    setFormData(defaultformData)
  }

  const handleEmailCustomer = () => {
    window.open(emailPreviewLink, "_blank")
    toast.success("Email draft opened in new tab")
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute w-full h-full bg-gray-900/50 z-10 flex items-center justify-center" hidden>
        <Spinner className="mr-2 h-20 w-20" />
      </div>
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/members">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">Add New Member</h1>
              <p className="text-sm md:text-base text-muted-foreground">Create a new member profile</p>
              {!iframeRef && (
                <>
                  <br></br>
                  <p className="text-sm text-muted-foreground italic">
                    You would want to&nbsp;
                    <Link
                      href={"https://developer.ezypay.com/docs/customer-creation#/"}
                      target="_blank"
                      className="underline"
                    >
                      create customer with Ezypay
                    </Link>
                    &nbsp;also at this step. The next step will be collecting payment methods from customer and an
                    Ezypay customer ID is required. It you have a disjoined process on customer creation and payment
                    method collecton, you could create the customer later.
                  </p>
                </>
              )}
              {iframeRef && (
                <>
                  <br></br>
                  <p className="text-sm text-muted-foreground italic">
                    After you get the Ezypay customer ID, you could collect the payment method from customer by&nbsp;
                    <Link
                      href={"https://developer.ezypay.com/docs/payment-capture-page#/"}
                      target="_blank"
                      className="underline"
                    >
                      hosting Ezypay's Payment capture page
                    </Link>
                    &nbsp;as an iframe in your page. You could also email this page to customer for them to fill in
                    their payment method.
                  </p>
                </>
              )}
            </div>
          </div>

          {!isCustomerCreated ? (
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Personal Information</CardTitle>
                  <CardDescription className="text-sm">Basic member details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name<span className="text-red-500">*</span>
                      </Label>
                      <Input id="firstName" placeholder="John" required onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name<span className="text-red-500">*</span>
                      </Label>
                      <Input id="lastName" placeholder="Doe" required onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobilePhone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+61 412 345 678" onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Collins Street, Melbourne VIC 3000, Australia"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Jane Doe - +61 498 765 432"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="existingCustomerNumber">Existing Customer Number (Optional)</Label>
                    <Input id="existingCustomerNumber" placeholder="e.g., CUST-12345" onChange={handleInputChange} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Membership Details</CardTitle>
                  <CardDescription className="text-sm">Select membership plan and start date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Membership Plan</Label>
                    <Select onValueChange={handlePlanChange} value={formData.plan ?? undefined}>
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $49/month</SelectItem>
                        <SelectItem value="premium">Premium - $99/month</SelectItem>
                        <SelectItem value="annual">Annual - $999/year</SelectItem>
                        <SelectItem value="personal">Personal Training - $149/month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" onChange={handleDateChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={handleStatusChange} value={formData.status}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <Link href="/members" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          "Create Member"
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        It will simultanenously called Ezypay create customer API. Then, Ezypay payment method capture
                        page is called with the customer ID returned from the API
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Payment Information</CardTitle>
                <CardDescription className="text-sm">Add payment method for recurring billing</CardDescription>
                <Button variant="outline" onClick={handleEmailCustomer} className="gap-2 bg-transparent">
                  <Mail className="h-4 w-4" />
                  Email Customer
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingIframe ? (
                  <div className="flex h-[500px] items-center justify-center">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : iframeUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className="h-[70vh] w-full rounded-lg border border-border"
                    title="Add Payment Method"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="flex h-[500px] items-center justify-center text-muted-foreground">
                    Failed to load payment form
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
