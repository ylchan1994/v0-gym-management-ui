"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { day: "Mon", yoga: 45, spinning: 32, crossfit: 28 },
  { day: "Tue", yoga: 52, spinning: 38, crossfit: 31 },
  { day: "Wed", yoga: 48, spinning: 35, crossfit: 29 },
  { day: "Thu", yoga: 61, spinning: 42, crossfit: 35 },
  { day: "Fri", yoga: 55, spinning: 40, crossfit: 33 },
  { day: "Sat", yoga: 67, spinning: 48, crossfit: 41 },
  { day: "Sun", yoga: 58, spinning: 44, crossfit: 37 },
]

export function ClassAttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Attendance</CardTitle>
        <CardDescription>Weekly attendance by class type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            yoga: {
              label: "Yoga",
              color: "hsl(var(--chart-1))",
            },
            spinning: {
              label: "Spinning",
              color: "hsl(var(--chart-2))",
            },
            crossfit: {
              label: "CrossFit",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" tickLine={false} axisLine={false} />
            <YAxis className="text-xs" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="yoga" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spinning" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="crossfit" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
