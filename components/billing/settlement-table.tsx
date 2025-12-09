"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Search, Loader2 } from 'lucide-react'
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { listSettlements, downloadDocument } from "@/lib/passer-functions"
import Link from 'next/link'

export function SettlementTable() {
  const [settlements, setSettlements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(true)
    listSettlements().then(settlements => {
      setSettlements(settlements)
      setIsLoading(false)
    })
  }, [])

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      settlement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.period.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(numAmount)
  }

  const handleDownloadDocument = async (settlementId: string, docType: documentType) => {
    setIsDownloading(settlementId)
    try {
      const downloadUrl = await downloadDocument(settlementId, docType)

      window.open(downloadUrl, '_blank')

      const typeLabels = {
        'tax_invoice': 'Tax Invoice',
        'detail_report': 'Detail Report',
        'summary_report': 'Summary Report'
      }

      toast({
        title: "Report Downloaded",
        description: `${typeLabels[docType]} for settlement ${settlementId} is ready.`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the settlement document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement History</CardTitle>
        <CardDescription>View and download past settlement reports</CardDescription>
        <CardDescription className="italic">
          This page allows merchant to quickly check their&nbsp;
          <Link href={"https://developer.ezypay.com/docs/reports-1#retrieve-settlement-reports"} className="underline">
            settlement summary
          </Link>
          &nbsp;and allows them to download the settlement report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by settlement ID or period..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Settlement ID</TableHead>
              <TableHead>Settlement Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading settlements...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSettlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No settlements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">{settlement.id}</TableCell>
                  <TableCell>{settlement.date}</TableCell>
                  <TableCell className="font-medium">{formatAmount(settlement.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="default">{settlement.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          disabled={isDownloading === settlement.id}
                        >
                          <Download className="h-4 w-4" />
                          {isDownloading === settlement.id ? "Downloading..." : "Download Report"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDownloadDocument(settlement.id, 'tax_invoice')}
                        >
                          Tax Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadDocument(settlement.id, 'detail_report')}
                        >
                          Detail Report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadDocument(settlement.id, 'summary_report')}
                        >
                          Summary Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
