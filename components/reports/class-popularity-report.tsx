"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Download, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const classData = [
  { class: "Yoga", attendance: 342, capacity: 400, utilization: 85.5 },
  { class: "Spinning", attendance: 298, capacity: 350, utilization: 85.1 },
  { class: "CrossFit", attendance: 256, capacity: 300, utilization: 85.3 },
  { class: "Pilates", attendance: 189, capacity: 250, utilization: 75.6 },
  { class: "Zumba", attendance: 167, capacity: 200, utilization: 83.5 },
  { class: "Boxing", attendance: 145, capacity: 180, utilization: 80.6 },
]

const timeSlotData = [
  { time: "6:00 AM", attendance: 145 },
  { time: "9:00 AM", attendance: 98 },
  { time: "12:00 PM", attendance: 112 },
  { time: "5:00 PM", attendance: 189 },
  { time: "7:00 PM", attendance: 167 },
]

export function ClassPopularityReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Popularity Analysis</h2>
          <p className="text-sm text-muted-foreground">Track class attendance and utilization rates</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="1month">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance</CardTitle>
            <CardDescription>Total attendance by class type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attendance: {
                  label: "Attendance",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="class" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="attendance" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Time Slots</CardTitle>
            <CardDescription>Attendance by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attendance: {
                  label: "Attendance",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="attendance" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Utilization Rates</CardTitle>
          <CardDescription>Capacity utilization for each class type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classData.map((item) => (
              <div key={item.class} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.class}</span>
                    {item.utilization >= 85 && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        High Demand
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.attendance}/{item.capacity} ({item.utilization.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${item.utilization >= 85 ? "bg-accent" : "bg-primary"}`}
                    style={{ width: `${item.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
