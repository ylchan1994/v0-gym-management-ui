"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const initialSettlements = [
  {
    id: "STL-001",
    date: "2024-10-15",
    amount: "$12,450.00",
    transactionCount: 45,
    status: "completed" as const,
    period: "Oct 1-15, 2024",
  },
  {
    id: "STL-002",
    date: "2024-09-30",
    amount: "$18,920.00",
    transactionCount: 67,
    status: "completed" as const,
    period: "Sep 16-30, 2024",
  },
  {
    id: "STL-003",
    date: "2024-09-15",
    amount: "$15,680.00",
    transactionCount: 52,
    status: "completed" as const,
    period: "Sep 1-15, 2024",
  },
  {
    id: "STL-004",
    date: "2024-08-31",
    amount: "$21,340.00",
    transactionCount: 78,
    status: "completed" as const,
    period: "Aug 16-31, 2024",
  },
  {
    id: "STL-005",
    date: "2024-08-15",
    amount: "$19,560.00",
    transactionCount: 71,
    status: "completed" as const,
    period: "Aug 1-15, 2024",
  },
]

export function SettlementTable() {
  const [settlements] = useState(initialSettlements)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      settlement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.period.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDownloadReport = (settlement: (typeof settlements)[0]) => {
    // Generate CSV content for the settlement report
    const csvContent = [
      ["Settlement Report"],
      ["Settlement ID", settlement.id],
      ["Period", settlement.period],
      ["Settlement Date", settlement.date],
      ["Total Amount", settlement.amount],
      ["Transaction Count", settlement.transactionCount.toString()],
      ["Status", settlement.status],
      [],
      ["Transaction Details"],
      ["Transaction ID", "Date", "Member", "Amount", "Type", "Status"],
      // Mock transaction data
      ["TXN-001", settlement.date, "John Doe", "$99.00", "Membership", "Completed"],
      ["TXN-002", settlement.date, "Sarah Smith", "$149.00", "Personal Training", "Completed"],
      ["TXN-003", settlement.date, "Mike Johnson", "$49.00", "Day Pass", "Completed"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `settlement-report-${settlement.id}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Report Downloaded",
      description: `Settlement report ${settlement.id} has been downloaded successfully.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement History</CardTitle>
        <CardDescription>View and download past settlement reports</CardDescription>
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
              <TableHead>Period</TableHead>
              <TableHead>Settlement Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettlements.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell className="font-medium">{settlement.id}</TableCell>
                <TableCell>{settlement.period}</TableCell>
                <TableCell>{settlement.date}</TableCell>
                <TableCell className="font-medium">{settlement.amount}</TableCell>
                <TableCell>{settlement.transactionCount}</TableCell>
                <TableCell>
                  <Badge variant="default">{settlement.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
