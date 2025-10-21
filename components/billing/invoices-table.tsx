"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Send, Search, Plus } from "lucide-react"
import { useState } from "react"
import { InvoiceDetailDialog } from "./invoice-detail-dialog"
import { CreateInvoiceDialog } from "./create-invoice-dialog"

const initialInvoices = [
  {
    id: "INV-001",
    member: "John Doe",
    amount: "$99.00",
    status: "paid" as const,
    date: "2024-10-01",
    dueDate: "2024-10-15",
    paymentMethod: "Visa ****4242",
    paymentAttempts: [
      { id: "1", date: "2024-10-01", amount: "$99.00", status: "success" as const, method: "Visa ****4242" },
    ],
  },
  {
    id: "INV-002",
    member: "Sarah Smith",
    amount: "$49.00",
    status: "paid" as const,
    date: "2024-10-03",
    dueDate: "2024-10-17",
    paymentMethod: "Mastercard ****5678",
    paymentAttempts: [
      { id: "1", date: "2024-10-03", amount: "$49.00", status: "success" as const, method: "Mastercard ****5678" },
    ],
  },
  {
    id: "INV-003",
    member: "Mike Johnson",
    amount: "$99.00",
    status: "past due" as const,
    date: "2024-09-15",
    dueDate: "2024-09-29",
    paymentMethod: "Visa ****1234",
    paymentAttempts: [
      {
        id: "1",
        date: "2024-09-29",
        amount: "$99.00",
        status: "failed" as const,
        method: "Visa ****1234",
        errorMessage: "Insufficient funds",
      },
      {
        id: "2",
        date: "2024-10-05",
        amount: "$99.00",
        status: "failed" as const,
        method: "Visa ****1234",
        errorMessage: "Card declined",
      },
    ],
  },
  {
    id: "INV-004",
    member: "Emma Wilson",
    amount: "$149.00",
    status: "pending" as const,
    date: "2024-10-10",
    dueDate: "2024-10-24",
    paymentMethod: "Bank Transfer - ANZ ****5678",
    paymentAttempts: [],
  },
  {
    id: "INV-005",
    member: "David Brown",
    amount: "$149.00",
    status: "paid" as const,
    date: "2024-10-05",
    dueDate: "2024-10-19",
    paymentMethod: "Amex ****9012",
    paymentAttempts: [
      { id: "1", date: "2024-10-05", amount: "$149.00", status: "success" as const, method: "Amex ****9012" },
    ],
  },
  {
    id: "INV-006",
    member: "John Doe",
    amount: "$99.00",
    status: "chargeback" as const,
    date: "2024-10-01",
    dueDate: "2024-10-04",
    paymentMethod: "Amex ****9012",
    paymentAttempts: [
      { id: "6", date: "2024-10-04", amount: "$99.00", status: "failed" as const, method: "Amex ****9012" },
    ],
  },
]

export function InvoicesTable() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.member.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleInvoiceClick = (invoice: (typeof invoices)[0]) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const handleInvoiceCreated = (newInvoice: any) => {
    console.log("[v0] Adding new invoice to list:", newInvoice)
    setInvoices((prev) => [newInvoice, ...prev])
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status === "paid") return "default"
    if (status === "refunded") return "warning"
    if (status === "pending") return "secondary"
    return "destructive"
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Generate, send, and manage member invoices</CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice ID or member..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="past due">Past Due</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.member}</TableCell>
                  <TableCell className="font-medium">{invoice.amount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{invoice.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(invoice.status)}
                      // className={invoice.status === "refunded" ? "border-orange-500 text-orange-500" : ""}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Download logic
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Send logic
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={() => {
          console.log("[v0] Invoice updated, refreshing list")
        }}
      />

      <CreateInvoiceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={handleInvoiceCreated} />
    </>
  )
}
