"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { useState } from "react"
import { InvoiceDetailDialog } from "./invoice-detail-dialog"
import { CreateInvoiceDialog } from "./create-invoice-dialog"
import { getStatusBadgeVariant } from "@/app/members/[id]/page"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"

export function InvoicesTable({ variant = "billing", invoices, customerData = null }) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  if (!invoices) {
    return ""
  }

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesSearch =
      variant == "billing"
        ? invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.member.toLowerCase().includes(searchQuery.toLowerCase())
        : invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleInvoiceClick = (invoice: (typeof invoices)[0]) => {
    if (!invoice.id) {
      console.error("Invalid invoice data (missing id):", invoice)
      return
    }
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const formatCellValue = (val: any) => {
    if (val === null || val === undefined) return ""
    if (typeof val === "object") {
      if (val.code || val.description) {
        return `${val.code ?? ""}${val.description ? ` - ${val.description}` : ""}`.trim()
      }
      try {
        return JSON.stringify(val)
      } catch (e) {
        return String(val)
      }
    }
    return String(val)
  }

  const handleInvoiceCreated = () => {
    console.log("[v0] Invoice created successfully")
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
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                {variant == "billing" ? <TableHead>Member</TableHead> : ""}
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices?.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">{formatCellValue(invoice.number ?? invoice.id)}</TableCell>
                  {variant == "billing" ? <TableCell>{formatCellValue(invoice.member)}</TableCell> : ""}
                  <TableCell className="font-medium">{formatCellValue(invoice.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <PaymentMethodIcon type={invoice.paymentMethod} className="h-4 w-4" />
                      <span>{formatCellValue(invoice.paymentMethod)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(String(invoice.status))}>
                      {formatCellValue(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCellValue(invoice.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isDetailOpen && selectedInvoice && (
        <InvoiceDetailDialog
          invoiceProp={selectedInvoice}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onUpdate={() => {
            console.log("[v0] Invoice updated, refreshing list")
          }}
        />
      )}

      <CreateInvoiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleInvoiceCreated}
        customerId={customerData?.id ? customerData.id : null}
        customerName={customerData?.name ? customerData.name : null}
      />
    </>
  )
}
