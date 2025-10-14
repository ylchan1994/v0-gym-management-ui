"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Download, Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const trainers = [
  {
    id: "1",
    name: "Sarah Johnson",
    specialty: "Yoga & Pilates",
    rating: 4.9,
    totalClasses: 124,
    avgAttendance: 42,
    memberSatisfaction: 98,
    initials: "SJ",
  },
  {
    id: "2",
    name: "Mike Chen",
    specialty: "CrossFit",
    rating: 4.8,
    totalClasses: 118,
    avgAttendance: 38,
    memberSatisfaction: 96,
    initials: "MC",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    specialty: "Spinning",
    rating: 4.7,
    totalClasses: 132,
    avgAttendance: 45,
    memberSatisfaction: 94,
    initials: "ER",
  },
  {
    id: "4",
    name: "James Wilson",
    specialty: "Personal Training",
    rating: 4.9,
    totalClasses: 96,
    avgAttendance: 8,
    memberSatisfaction: 99,
    initials: "JW",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    specialty: "Zumba",
    rating: 4.6,
    totalClasses: 108,
    avgAttendance: 35,
    memberSatisfaction: 92,
    initials: "LA",
  },
]

export function TrainerPerformanceReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trainer Performance</h2>
          <p className="text-sm text-muted-foreground">Evaluate trainer effectiveness and member satisfaction</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="1month">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Rated Trainer</CardTitle>
            <Star className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sarah Johnson</div>
            <p className="text-xs text-muted-foreground">4.9/5.0 rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Class Attendance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Members per class</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.8%</div>
            <p className="text-xs text-accent">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trainer Rankings</CardTitle>
          <CardDescription>Performance metrics for all trainers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {trainers.map((trainer, index) => (
              <div key={trainer.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {trainer.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{trainer.name}</p>
                        {index === 0 && (
                          <Badge variant="default" className="bg-chart-5 text-chart-5-foreground">
                            Top Performer
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-chart-5 text-chart-5" />
                    <span className="font-semibold">{trainer.rating}</span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Classes</span>
                      <span className="font-medium">{trainer.totalClasses}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Attendance</span>
                      <span className="font-medium">{trainer.avgAttendance}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Satisfaction</span>
                      <span className="font-medium">{trainer.memberSatisfaction}%</span>
                    </div>
                    <Progress value={trainer.memberSatisfaction} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
