import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Total Members",
    value: "1,284",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Memberships",
    value: "1,156",
    change: "+8.2%",
    trend: "up",
    icon: UserCheck,
  },
  {
    title: "Revenue This Month",
    value: "$48,392",
    change: "+15.3%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Upcoming Renewals",
    value: "87",
    change: "-3.1%",
    trend: "down",
    icon: Calendar,
  },
  {
    title: "Forecast Revenue",
    value: "$52,100",
    change: "+9.8%",
    trend: "up",
    icon: TrendingUp,
  },
]

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-accent" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={stat.trend === "up" ? "text-accent" : "text-destructive"}>{stat.change}</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
