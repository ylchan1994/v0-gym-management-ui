"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Mail, Phone, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { AddPaymentMethodDialog } from "@/components/billing/add-payment-method-dialog"
import { InvoiceDetailDialog } from "@/components/billing/invoice-detail-dialog"
import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerIdFromPath } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getCustomer } from "@/lib/customer"
import { listInvoiceByCustomer, getCustomerPaymentMethods } from "@/lib/passer-functions"

const getStatusBadgeVariant = (status: string) => {
  if (status === "paid") return "default"
  if (status.includes("refund") || status.includes("written") ) return "warning"
  if (status === "pending" || status === 'unpaid') return "secondary"
  return "destructive"
}

export default function MemberProfilePage() {

  useEffect(() => {
    
    const customerId = getCustomerIdFromPath()
    let customerName

    try {
      getCustomer(customerId).then((customer) => {
        if (!customer.id) {
          throw new Error('Customer not found')
        }

        customerName = `${customer.firstName} ${customer.lastName}`

        setMemberDataState ({
          id: customer.id,
          name: customerName,
          email: customer.email,
          phone: customer.mobilePhone,
          address: Object.values(customer.address).join(' '),
          dateOfBirth: customer.dateofBirth,
          emergencyContact: customer.homePhone,
          status: customer.metadata?.status ?? 'trial',
          plan: customer.metadata?.plan ?? 'Trial',
          joinDate: customer.metadata?.joinDate ?? new Date(Date.now()).toISOString().split('T')[0],
          expiryDate: customer.metadata?.expiryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          invoices: [],
          attendanceLogs: [
            { id: "1", date: "2024-10-14", time: "06:30 AM", class: "Yoga" },
            { id: "2", date: "2024-10-13", time: "05:00 PM", class: "CrossFit" },
            { id: "3", date: "2024-10-12", time: "07:00 AM", class: "Spinning" },
            { id: "4", date: "2024-10-11", time: "06:30 AM", class: "Yoga" },
          ],
          paymentMethods: [],
        })      

      })

      listInvoiceByCustomer(customerId, customerName).then( res => {
        console.log(res)
        setMemberDataState(prev => ({...prev, invoices: res}))
        
        setIsLoading(false)
        fetchPaymentMethods(customerId)
        
      })

    } catch (error) {
      console.error(error)
    }

  }, [])

  // memberData is loaded from fullMemberData based on URL id when available
  const [memberDataState, setMemberDataState] = useState<any>({})
  const [selectedInvoice, setSelectedInvoice] = useState<any[] | null>(null)
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false)
  const [paymentMethodData, setPaymentMethodData] = useState<any[] | null>(null)
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false)
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  // Mock plans (keep in sync with /app/plans/page.tsx if needed)
  const plans = [
    { id: "1", name: "Basic", price: 49, duration: "Monthly" },
    { id: "2", name: "Premium", price: 99, duration: "Monthly" },
    { id: "3", name: "Annual", price: 999, duration: "Yearly" },
    { id: "4", name: "Personal Training", price: 149, duration: "Monthly" },
  ]

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsInvoiceDetailOpen(true)
  }

  // Mock upcoming invoices (pending)
  const upcomingInvoices: any[] = [
    {
      id: "INV-UP-200",
      member: memberDataState?.name,
      date: new Date().toISOString().split("T")[0],
      amount: "$120.00",
      status: "pending" as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentMethod: "",
      paymentAttempts: [],
    },
    {
      id: "INV-UP-201",
      member: memberDataState?.name,
      date: new Date().toISOString().split("T")[0],
      amount: "$45.00",
      status: "pending" as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentMethod: "",
      paymentAttempts: [],
    },
  ]

  // Fetch payment methods for a customer using our token route then the Ezypay sandbox API
  async function fetchPaymentMethods(customerId) {
    setPaymentMethodsLoading(true)
    setPaymentMethodsError(null)
    try {      

      const response = await getCustomerPaymentMethods(customerId)

      // Some proxies or APIs nest the actual items under different keys - try common shapes
      let items: any[] | null = null
      if (Array.isArray(response)) items = response
      else if (Array.isArray(response?.paymentMethods)) items = response.paymentMethods
      else if (Array.isArray(response?.results)) items = response.results
      else if (Array.isArray(response?.data)) items = response.data
      else if (response) items = [response]

      // Normalize items into the UI-friendly shape if Ezypay returns SDK-like objects
      const normalized = (items || []).map((pm: any) => ({
        id: pm.paymentMethodToken ?? pm.id ,
        type: pm.type ?? "",
        last4: pm.card?.last4 ?? pm.bank?.last4 ?? pm.last4 ?? null,
        expiry: pm.card ? `${pm.card.expiryMonth}/${pm.card.expiryYear}` : pm.expiry ?? null,
        isDefault: pm.primary ?? false,
        account: pm.payTo?.aliasId ?? (pm.payTo?.bbanAccountNo ? pm.payTo.bbanAccountNo.slice(-4) : undefined) ?? pm.account,
      }))

      setPaymentMethodData(normalized)
    } catch (error: any) {
      const msg = error?.message || String(error)
      console.error("Error fetching payment methods via proxy", msg)
      setPaymentMethodData(null)
      setPaymentMethodsError(msg)
    } finally {
      setPaymentMethodsLoading(false)
    }
  }

  const handleInvoiceDialogOpenChange = (open: boolean) => {
    setIsInvoiceDetailOpen(open)
    if (!open) {
      const idFromPath = getCustomerIdFromPath() || memberDataState?.id
      if (idFromPath) fetchPaymentMethods(idFromPath)
    }
  }

  // Handlers for AddPaymentMethodDialog
  const handleAddPaymentOpenChange = (open: boolean) => {
    if (!open) {
      const idFromPath = getCustomerIdFromPath() || memberDataState?.id
      if (idFromPath) fetchPaymentMethods(idFromPath)
    }
  }

  const handleAddPaymentSuccess = () => {
    const idFromPath = getCustomerIdFromPath() || memberDataState?.id
    if (idFromPath) fetchPaymentMethods(idFromPath)
  }

  const handleInvoiceUpdate = () => {
    const idFromPath = getCustomerIdFromPath() || memberDataState?.id
    if (idFromPath) fetchPaymentMethods(idFromPath)
  }

  return (
    
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <TopBar />
        {isLoading ? 
        <div className="flex justify-center items-center w-full h-full absolute">
          <Spinner 
            className="w-30 h-30"
          />
        </div> : ""}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">{memberDataState?.name}</h1>
                <p className="text-muted-foreground">Member profile and activity</p>
              </div>
              <Link href={`/members/${memberDataState?.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{memberDataState?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{memberDataState?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">{memberDataState?.dateOfBirth}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{memberDataState?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">{memberDataState?.emergencyContact}</p>
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
                    <Badge className="mt-1" variant={
                            memberDataState?.status === "active"
                              ? "default"
                              : memberDataState?.status === "trial"
                                ? "secondary"
                                : "destructive"
                          }>
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
                          <p className="text-sm text-muted-foreground">Select a plan to renew or change the member's plan.</p>
                          <div className="grid gap-2">
                            {plans.map((plan) => (
                              <label key={plan.id} className="flex items-center gap-3 rounded-md border p-3">
                                <input type="radio" name="plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} />
                                <div>
                                  <div className="font-medium">{plan.name}</div>
                                  <div className="text-sm text-muted-foreground">${plan.price} / {plan.duration}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <DialogFooter>
                          <div className="flex gap-2">
                            <Button onClick={() => setRenewOpen(false)} variant="outline">Cancel</Button>
                            <Button
                              onClick={() => {
                                const plan = plans.find((p) => p.id === selectedPlanId)
                                if (plan) {
                                  // Update plan and expiry date (simple logic)
                                  const now = new Date()
                                  let newExpiry = new Date(now)
                                  if (plan.duration.toLowerCase().includes("year")) {
                                    newExpiry.setFullYear(newExpiry.getFullYear() + 1)
                                  } else {
                                    newExpiry.setMonth(newExpiry.getMonth() + 1)
                                  }
                                  setMemberDataState((prev) => ({ ...prev, plan: plan.name, expiryDate: newExpiry.toISOString().split("T")[0] }))
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
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : paymentMethodsError ? (
                    <div className="text-sm text-destructive py-4">Failed to load payment methods: {paymentMethodsError}</div>
                  ) : (
                    <>
                      <div className="max-h-[240px] overflow-y-auto space-y-2">
                        {(paymentMethodData ?? memberDataState.paymentMethods ?? []).map((method: any) => (
                          <div
                            key={method.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3"
                          >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{method.type}</p>
                              <p className="text-xs text-muted-foreground">{`${method.last4 ? `****${method.last4}` : ""}  ${method.expiry || method.account || ""}`}</p>
                            </div>
                          </div>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          </div>
                        ))}
                      </div>

                      <AddPaymentMethodDialog customerId={memberDataState?.id} onSuccess={handleAddPaymentSuccess} onOpenChange={handleAddPaymentOpenChange}>
                        <Button className="w-full bg-transparent" variant="outline" size="sm">
                          Add Payment Method
                        </Button>
                      </AddPaymentMethodDialog>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="invoices" className="space-y-4">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Complete invoice and payment history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(memberDataState.invoices ?? []).map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleInvoiceClick(invoice)}
                          >
                            <TableCell className="font-medium">{invoice.number}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell className="font-medium">{invoice.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{invoice.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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
                        {upcomingInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleInvoiceClick(invoice)}>
                            <TableCell className="font-medium">{invoice.number}</TableCell>
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

      <InvoiceDetailDialog invoice={selectedInvoice} open={isInvoiceDetailOpen} onOpenChange={handleInvoiceDialogOpenChange} onUpdate={handleInvoiceUpdate} />
    </div>
  )
}
