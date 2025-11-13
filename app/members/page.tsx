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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { listCustomer } from "@/lib/passer-functions"
import { Spinner } from "@/components/ui/spinner"

export default function MembersPage() {

  useEffect(() => {
    const member: any[] = []
    console.log('Start Loading the customer page', new Date().toISOString())
    listCustomer().then(e => {
      let customers = e.data

      customers?.forEach(customer => {
        member.push({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.mobilePhone,
          status: customer.metadata?.status ?? 'trial',
          plan: customer.metadata?.plan ?? 'Trial',
          joinDate: customer.metadata?.joinDate ?? new Date(Date.now()).toISOString().split('T')[0],
          expiryDate: customer.metadata?.expiryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      })

      setMembers(member);
      setIsLoading(false);
      console.log('Complete Loading the customer page', new Date().toISOString())
    })
  }, [])

  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [members, setMembers] =useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          <div className="space-y-6 relative">
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

            {isLoading? 
              (<div className="absolute w-full h-full flex justify-center items-center pt-50">
                <Spinner className="mr-2 h-20 w-20" />
              </div>) : 
              (<div className="rounded-lg border border-border bg-card relative">
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
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
