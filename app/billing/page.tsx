"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { BillingOverview } from "@/components/billing/billing-overview"
import { InvoicesTable } from "@/components/billing/invoices-table"
import { AutoBillingSettings } from "@/components/billing/auto-billing-settings"

const stats = [
  {
    title: "Total Revenue",
    value: "$48,392",
    change: "+15.3%",
    icon: DollarSign,
    color: "text-accent",
  },
  {
    title: "Overdue Payments",
    value: "$3,240",
    change: "12 invoices",
    icon: AlertCircle,
    color: "text-destructive",
  },
  {
    title: "Upcoming Invoices",
    value: "$12,850",
    change: "87 invoices",
    icon: Clock,
    color: "text-chart-5",
  },
  {
    title: "This Month",
    value: "$48,392",
    change: "+$6,420",
    icon: TrendingUp,
    color: "text-accent",
  },
]

export default function BillingPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Billing & Payments</h1>
              <p className="text-muted-foreground">Manage invoices, payments, and billing settings</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="auto-billing">Auto-Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <BillingOverview />
              </TabsContent>
              <TabsContent value="invoices">
                <InvoicesTable />
              </TabsContent>
              <TabsContent value="auto-billing">
                <AutoBillingSettings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
