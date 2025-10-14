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
import { useState } from "react"

const memberData = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+61 412 345 678",
  address: "123 Collins Street, Melbourne VIC 3000, Australia",
  dateOfBirth: "1990-05-15",
  emergencyContact: "Jane Doe - +61 498 765 432",
  status: "active",
  plan: "Premium",
  joinDate: "2024-01-15",
  expiryDate: "2025-01-15",
  invoices: [
    {
      id: "INV-001",
      member: "John Doe",
      date: "2024-10-01",
      amount: "$99.00",
      status: "paid" as const,
      dueDate: "2024-10-15",
      paymentMethod: "Visa ****4242",
      paymentAttempts: [
        { id: "1", date: "2024-10-01", amount: "$99.00", status: "success" as const, method: "Visa ****4242" },
      ],
    },
    {
      id: "INV-002",
      member: "John Doe",
      date: "2024-09-01",
      amount: "$99.00",
      status: "paid" as const,
      dueDate: "2024-09-15",
      paymentMethod: "Visa ****4242",
      paymentAttempts: [
        { id: "1", date: "2024-09-01", amount: "$99.00", status: "success" as const, method: "Visa ****4242" },
      ],
    },
    {
      id: "INV-003",
      member: "John Doe",
      date: "2024-08-01",
      amount: "$99.00",
      status: "paid" as const,
      dueDate: "2024-08-15",
      paymentMethod: "Visa ****4242",
      paymentAttempts: [
        { id: "1", date: "2024-08-01", amount: "$99.00", status: "success" as const, method: "Visa ****4242" },
      ],
    },
  ],
  attendanceLogs: [
    { id: "1", date: "2024-10-14", time: "06:30 AM", class: "Yoga" },
    { id: "2", date: "2024-10-13", time: "05:00 PM", class: "CrossFit" },
    { id: "3", date: "2024-10-12", time: "07:00 AM", class: "Spinning" },
    { id: "4", date: "2024-10-11", time: "06:30 AM", class: "Yoga" },
  ],
  paymentMethods: [
    { id: "1", type: "Credit Card", last4: "4242", expiry: "12/25", isDefault: true },
    { id: "2", type: "Bank Transfer", account: "****1234", isDefault: false },
  ],
}

export default function MemberProfilePage() {
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof memberData.invoices)[0] | null>(null)
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false)

  const handleInvoiceClick = (invoice: (typeof memberData.invoices)[0]) => {
    setSelectedInvoice(invoice)
    setIsInvoiceDetailOpen(true)
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">{memberData.name}</h1>
                <p className="text-muted-foreground">Member profile and activity</p>
              </div>
              <Link href={`/members/${memberData.id}/edit`}>
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
                      <p className="text-sm text-muted-foreground">{memberData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{memberData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">{memberData.dateOfBirth}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{memberData.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">{memberData.emergencyContact}</p>
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
                    <Badge className="mt-1" variant="default">
                      {memberData.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">{memberData.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">{memberData.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expiry Date</p>
                    <p className="text-sm text-muted-foreground">{memberData.expiryDate}</p>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Renew Membership
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {memberData.paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {method.type} {method.last4 && `****${method.last4}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{method.expiry || method.account}</p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                  <AddPaymentMethodDialog
                    customerId={memberData.id}
                    onSuccess={() => {
                      console.log("[v0] Payment method added successfully")
                      // Refresh payment methods list
                    }}
                  >
                    <Button className="w-full bg-transparent" variant="outline" size="sm">
                      Add Payment Method
                    </Button>
                  </AddPaymentMethodDialog>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="invoices" className="space-y-4">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
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
                        {memberData.invoices.map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleInvoiceClick(invoice)}
                          >
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell className="font-medium">{invoice.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{invoice.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant="default">{invoice.status}</Badge>
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
                        {memberData.attendanceLogs.map((log) => (
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

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isInvoiceDetailOpen}
        onOpenChange={setIsInvoiceDetailOpen}
        onUpdate={() => {
          console.log("[v0] Invoice updated, refreshing list")
        }}
      />
    </div>
  )
}
