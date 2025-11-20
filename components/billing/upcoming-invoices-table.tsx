"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InvoiceDetailDialog } from "./invoice-detail-dialog"

const upcomingInvoicesData = [
  {
    id: "INV-UP-001",
    member: "John Doe",
    date: new Date().toISOString().split("T")[0],
    amount: "$99.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "Visa ****4242",
    paymentAttempts: [],
  },
  {
    id: "INV-UP-002",
    member: "Sarah Smith",
    date: new Date().toISOString().split("T")[0],
    amount: "$49.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "Mastercard ****5678",
    paymentAttempts: [],
  },
  {
    id: "INV-UP-003",
    member: "Mike Johnson",
    date: new Date().toISOString().split("T")[0],
    amount: "$149.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "Visa ****9012",
    paymentAttempts: [],
  },
  {
    id: "INV-UP-004",
    member: "Emma Wilson",
    date: new Date().toISOString().split("T")[0],
    amount: "$99.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "Visa ****3456",
    paymentAttempts: [],
  },
]

export function UpcomingInvoicesTable() {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Invoices</CardTitle>
            <CardDescription>Scheduled invoices pending payment</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingInvoicesData.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.member}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="font-medium">{invoice.amount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isDetailOpen && selectedInvoice && (
        <InvoiceDetailDialog invoiceProp={selectedInvoice} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
      )}
    </>
  )
}
