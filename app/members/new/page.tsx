"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

export default function NewMemberPage() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoadingIframe, setIsLoadingIframe] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeOriginRef = useRef<string | null>(null)

  useEffect(() => {
    loadIframeUrl()
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if we have it
      if (iframeOriginRef.current && event.origin !== iframeOriginRef.current) {
        return
      }

      // Handle payment method added successfully
      if (event.data?.type === "PAYMENT_METHOD_ADDED" || event.data?.success) {
        toast.success("Payment method added successfully")
      } else if (event.data?.type === "PAYMENT_METHOD_ERROR" || event.data?.error) {
        toast.error("Failed to add payment method")
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const loadIframeUrl = async () => {
    setIsLoadingIframe(true)
    try {
      // Request access token from our server-side token route
      const tokenRes = await fetch("/api/payment/token", { method: "POST" })

      if (!tokenRes.ok) {
        throw new Error(`Token endpoint failed: ${tokenRes.status}`)
      }

      const tokenData = await tokenRes.json()
      const token = tokenData.access_token
      // Use a temporary customer ID for new members
      const tempCustomerId = "new-member-" + Date.now()
      const pcpUrl = `https://hosted-global-sandbox.ezypay.com/embed?token=${token}&feepricing=true&submitbutton=true&customerId=${tempCustomerId}`
      setIframeUrl(pcpUrl)

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

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/members">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Add New Member</h1>
                <p className="text-muted-foreground">Create a new member profile</p>
              </div>
            </div>

            <form className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic member details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+61 412 345 678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="123 Collins Street, Melbourne VIC 3000, Australia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input id="emergencyContact" placeholder="Jane Doe - +61 498 765 432" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Membership Details</CardTitle>
                  <CardDescription>Select membership plan and start date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Membership Plan</Label>
                    <Select>
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="active">
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

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Add payment method for recurring billing</CardDescription>
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
                      className="h-[500px] w-full rounded-lg border border-border"
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

              <div className="flex justify-end gap-4">
                <Link href="/members">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">Create Member</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
