"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Download, TrendingDown, TrendingUp } from "lucide-react"

const churnData = [
  { month: "Jan", churnRate: 8.2, newMembers: 45, canceledMembers: 38 },
  { month: "Feb", churnRate: 7.8, newMembers: 52, canceledMembers: 41 },
  { month: "Mar", churnRate: 7.5, newMembers: 48, canceledMembers: 39 },
  { month: "Apr", churnRate: 6.9, newMembers: 61, canceledMembers: 35 },
  { month: "May", churnRate: 7.2, newMembers: 58, canceledMembers: 42 },
  { month: "Jun", churnRate: 6.8, newMembers: 67, canceledMembers: 38 },
]

const reasonsData = [
  { reason: "Relocation", count: 42, percentage: 28 },
  { reason: "Financial", count: 38, percentage: 25 },
  { reason: "Lack of time", count: 32, percentage: 21 },
  { reason: "Dissatisfaction", count: 24, percentage: 16 },
  { reason: "Other", count: 15, percentage: 10 },
]

export function MembershipChurnReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Membership Churn Analysis</h2>
          <p className="text-sm text-muted-foreground">Track member retention and cancellation trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.8%</div>
            <p className="text-xs text-accent">-0.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceled This Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">Out of 1,284 members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.2%</div>
            <p className="text-xs text-accent">+0.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Churn Rate Trend</CardTitle>
          <CardDescription>Monthly churn rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              churnRate: {
                label: "Churn Rate (%)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
              <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="churnRate" stroke="var(--color-chart-1)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Reasons</CardTitle>
          <CardDescription>Top reasons for membership cancellations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reasonsData.map((reason) => (
              <div key={reason.reason} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{reason.reason}</span>
                  <span className="text-muted-foreground">
                    {reason.count} ({reason.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${reason.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
