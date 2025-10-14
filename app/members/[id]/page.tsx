import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Mail, Phone, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

const memberData = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  dateOfBirth: "1990-05-15",
  emergencyContact: "Jane Doe - (555) 987-6543",
  status: "active",
  plan: "Premium",
  joinDate: "2024-01-15",
  expiryDate: "2025-01-15",
  paymentHistory: [
    { id: "1", date: "2024-10-01", amount: "$99.00", status: "paid", method: "Credit Card" },
    { id: "2", date: "2024-09-01", amount: "$99.00", status: "paid", method: "Credit Card" },
    { id: "3", date: "2024-08-01", amount: "$99.00", status: "paid", method: "Credit Card" },
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
                  <Button className="w-full bg-transparent" variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="payments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Complete payment transaction history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberData.paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell className="font-medium">{payment.amount}</TableCell>
                            <TableCell>
                              <Badge variant="default">{payment.status}</Badge>
                            </TableCell>
                            <TableCell>{payment.method}</TableCell>
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
    </div>
  )
}
