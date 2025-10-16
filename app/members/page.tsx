"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const members = [
  {
    id: "4dc71f12-2484-443e-85b0-eea29a3bd600",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    status: "active",
    plan: "Premium",
    joinDate: "2024-01-15",
    expiryDate: "2025-01-15",
  },
  {
    id: "e7507033-d9ca-4dcb-801b-1c8f850a1a26",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "(555) 234-5678",
    status: "active",
    plan: "Basic",
    joinDate: "2024-03-20",
    expiryDate: "2024-12-20",
  },
  {
    id: "cea17c36-00a5-4b86-8954-0282107cd954",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    phone: "(555) 345-6789",
    status: "expired",
    plan: "Premium",
    joinDate: "2023-06-10",
    expiryDate: "2024-06-10",
  },
  {
    id: "49deaec5-c9fd-4790-87e2-600d19c9b178",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    phone: "(555) 456-7890",
    status: "trial",
    plan: "Trial",
    joinDate: "2024-10-01",
    expiryDate: "2024-10-15",
  },
  {
    id: "432d6d92-8685-4c46-bc2f-62856e900b57",
    name: "David Brown",
    email: "david.b@example.com",
    phone: "(555) 567-8901",
    status: "active",
    plan: "Personal Training",
    joinDate: "2024-02-28",
    expiryDate: "2025-02-28",
  },
]

export default function MembersPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = members.filter((member) => {
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Members</h1>
                <p className="text-muted-foreground">Manage your gym members and their memberships</p>
              </div>
              <Link href="/members/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer hover:bg-muted/50"
                      tabIndex={0}
                      role="link"
                      aria-label={`View ${member.name} profile`}
                      onClick={() => router.push(`/members/${member.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/members/${member.id}`)
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{member.email}</span>
                          <span className="text-sm text-muted-foreground">{member.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active"
                              ? "default"
                              : member.status === "trial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.plan}</TableCell>
                      <TableCell>{member.joinDate}</TableCell>
                      <TableCell>{member.expiryDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            {/* Prevent trigger clicks from bubbling to the row */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/members/${member.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/members/${member.id}/edit`}>Edit Member</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete Member</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
