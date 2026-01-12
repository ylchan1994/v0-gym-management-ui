"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { InvoiceDetailDialog } from "./invoice-detail-dialog";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { getStatusBadgeVariant } from "@/app/members/[id]/page";
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon";
import { Spinner } from "../ui/spinner";

export function InvoicesTable({
  variant = "billing",
  invoices,
  customerData = null,
  isLoading = true,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<
    (typeof invoices)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!invoices) {
    return "";
  }

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    const matchesSearch =
      variant == "billing"
        ? invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.member.toLowerCase().includes(searchQuery.toLowerCase())
        : invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleInvoiceClick = (invoice: (typeof invoices)[0]) => {
    if (!invoice.id) {
      console.error("Invalid invoice data (missing id):", invoice);
      return;
    }
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return "";
    const val = value?.replaceAll(/MASTERCARD|VISA|AMEX/gi, "CARD");
    if (typeof val === "object") {
      if (val.code || val.description) {
        return `${val.code ?? ""}${
          val.description ? ` - ${val.description}` : ""
        }`.trim();
      }
      try {
        return JSON.stringify(val);
      } catch (e) {
        return String(val);
      }
    }
    return String(val);
  };

  const handleInvoiceCreated = () => {
    console.log("[v0] Invoice created successfully");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Invoices</CardTitle>
              <CardDescription className="text-sm">
                Generate, send, and manage member invoices
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice ID or member..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm">
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Invoice ID</TableHead>
                  {variant == "billing" ? (
                    <TableHead className="min-w-[150px]">Member</TableHead>
                  ) : (
                    ""
                  )}
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                  <TableHead className="min-w-[150px]">
                    Payment Method
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[110px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Spinner className="h-6 w-6 mr-2" />
                        <span>Loading Invoices...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices?.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleInvoiceClick(invoice)}
                    >
                      <TableCell className="font-medium text-sm">
                        {formatCellValue(invoice.number ?? invoice.id)}
                      </TableCell>
                      {variant == "billing" ? (
                        <TableCell className="text-sm">
                          {formatCellValue(invoice.member)}
                        </TableCell>
                      ) : (
                        ""
                      )}
                      <TableCell className="font-medium text-sm">
                        {formatCellValue(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon
                            type={invoice.paymentMethod}
                            className="h-4 w-4 flex-shrink-0"
                          />
                          <span className="truncate">
                            {formatCellValue(invoice.paymentMethod)}
                          </span>
                          {invoice.paymentMethodInvalid && (
                            <Badge variant="destructive">invalid</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(
                            String(invoice.status)
                          )}
                          className="text-xs"
                        >
                          {formatCellValue(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCellValue(invoice.date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isDetailOpen && selectedInvoice && (
        <InvoiceDetailDialog
          invoiceProp={selectedInvoice}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onUpdate={() => {
            console.log("[v0] Invoice updated, refreshing list");
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
  );
}
