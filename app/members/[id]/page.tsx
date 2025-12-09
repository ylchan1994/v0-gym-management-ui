"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import { AddPaymentMethodDialog } from "@/components/billing/add-payment-method-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PaymentMethodsList } from "@/components/billing/payment-methods-list"
import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerIdFromPath, normalisedEzypayInvoice } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { InvoicesTable } from "@/components/billing/invoices-table"

export const getStatusBadgeVariant = (status: string) => {
  if (status === "paid") return "default"
  if (status.includes("refund") || status.includes("written")) return "warning"
  if (status === "pending" || status === "unpaid") return "secondary"
  return "destructive"
}

export default function MemberProfilePage() {
  const [memberDataState, setMemberDataState] = useState<any>({})
  const [selectedInvoice, setSelectedInvoice] = useState<any[] | null>(null)
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const plans = [
    { id: "1", name: "Basic", price: 49, duration: "Monthly" },
    { id: "2", name: "Premium", price: 99, duration: "Monthly" },
    { id: "3", name: "Annual", price: 999, duration: "Yearly" },
    { id: "4", name: "Personal Training", price: 149, duration: "Monthly" },
  ]

  useEffect(() => {
    const customerId = getCustomerIdFromPath()

    const fetchData = async () => {
      try {
        const memberData = await normalisedEzypayInvoice(customerId)
        setMemberDataState(memberData)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsInvoiceDetailOpen(true)
  }

  const handleAddPaymentOpenChange = (open: boolean) => {
    if (!open) {
      const idFromPath = getCustomerIdFromPath() || memberDataState?.id
      if (idFromPath) setMemberDataState((prev) => ({ ...prev }))
    }
  }

  const handleAddPaymentSuccess = () => {
    const idFromPath = getCustomerIdFromPath() || memberDataState?.id
    if (idFromPath) setMemberDataState((prev) => ({ ...prev }))
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <TopBar />
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full absolute bg-background/80 z-10">
            <Spinner className="w-20 h-20" />
          </div>
        ) : null}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">{memberDataState?.name}</h1>
                <p className="text-sm md:text-base text-muted-foreground">Member profile and activity</p>
              </div>
              <Link href={`/members/${memberDataState?.id}/edit`}>
                <Button className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground truncate">{memberDataState?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{memberDataState?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">{memberDataState?.dateOfBirth}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground break-words">{memberDataState?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground break-words">{memberDataState?.emergencyContact}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Membership Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge
                      className="mt-1"
                      variant={
                        memberDataState?.status === "active"
                          ? "default"
                          : memberDataState?.status === "trial"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {memberDataState?.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">{memberDataState?.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">{memberDataState?.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expiry Date</p>
                    <p className="text-sm text-muted-foreground">{memberDataState?.expiryDate}</p>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
                      <DialogTrigger asChild>
                        <span>Renew Membership</span>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Renew Membership</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Select a plan to renew or change the member's plan.
                          </p>
                          <div className="grid gap-2">
                            {plans.map((plan) => (
                              <label key={plan.id} className="flex items-center gap-3 rounded-md border p-3">
                                <input
                                  type="radio"
                                  name="plan"
                                  value={plan.id}
                                  checked={selectedPlanId === plan.id}
                                  onChange={() => setSelectedPlanId(plan.id)}
                                />
                                <div>
                                  <div className="font-medium">{plan.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${plan.price} / {plan.duration}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <DialogFooter>
                          <div className="flex gap-2">
                            <Button onClick={() => setRenewOpen(false)} variant="outline">
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                const plan = plans.find((p) => p.id === selectedPlanId)
                                if (plan) {
                                  const now = new Date()
                                  const newExpiry = new Date(now)
                                  if (plan.duration.toLowerCase().includes("year")) {
                                    newExpiry.setFullYear(newExpiry.getFullYear() + 1)
                                  } else {
                                    newExpiry.setMonth(newExpiry.getMonth() + 1)
                                  }
                                  setMemberDataState((prev) => ({
                                    ...prev,
                                    plan: plan.name,
                                    expiryDate: newExpiry.toISOString().split("T")[0],
                                  }))
                                }
                                setRenewOpen(false)
                              }}
                            >
                              Confirm
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription className="italic">
                    This should appear in customer portal to allow customer to&nbsp;
                    <Link href={"https://developer.ezypay.com/docs/payment-method-management#/"} className="underline">
                      manage their payment methods
                    </Link>
                    .
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PaymentMethodsList customerId={memberDataState?.id} variant="display" />

                  <AddPaymentMethodDialog
                    customerId={memberDataState?.id}
                    onSuccess={handleAddPaymentSuccess}
                    onOpenChange={handleAddPaymentOpenChange}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-full bg-transparent" variant="outline" size="sm">
                            Add Payment Method
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Show the Ezypay's payment capture page</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </AddPaymentMethodDialog>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="invoices" className="space-y-4">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="invoices" className="flex-shrink-0">
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex-shrink-0">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex-shrink-0">
                  Attendance Logs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="invoices">
                <InvoicesTable variant="customer" invoices={memberDataState.invoices} customerData={memberDataState} />
              </TabsContent>
              <TabsContent value="upcoming">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Invoices</CardTitle>
                    <CardDescription>Planned invoices with pending status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberDataState.upcomingInvoices?.map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleInvoiceClick(invoice)}
                          >
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell className="font-medium">{invoice.amount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{invoice.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Logs</CardTitle>
                    <CardDescription>Recent gym and class attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Class</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(memberDataState?.attendanceLogs ?? []).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.date}</TableCell>
                            <TableCell>{log.time}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{log.class}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
