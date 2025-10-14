import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueReport } from "@/components/reports/revenue-report"
import { MembershipChurnReport } from "@/components/reports/membership-churn-report"
import { ClassPopularityReport } from "@/components/reports/class-popularity-report"
import { TrainerPerformanceReport } from "@/components/reports/trainer-performance-report"
import { TrendingUp, Users, Activity, Award } from "lucide-react"

const stats = [
  {
    title: "Total Revenue (YTD)",
    value: "$487,392",
    change: "+18.2% vs last year",
    icon: TrendingUp,
  },
  {
    title: "Member Retention",
    value: "92.4%",
    change: "+2.1% vs last month",
    icon: Users,
  },
  {
    title: "Avg. Class Attendance",
    value: "42",
    change: "+5 vs last month",
    icon: Activity,
  },
  {
    title: "Top Trainer Rating",
    value: "4.9/5.0",
    change: "Sarah Johnson",
    icon: Award,
  },
]

export default function ReportsPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Reports & Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights into your gym's performance</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="churn">Membership Churn</TabsTrigger>
                <TabsTrigger value="classes">Class Popularity</TabsTrigger>
                <TabsTrigger value="trainers">Trainer Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue">
                <RevenueReport />
              </TabsContent>
              <TabsContent value="churn">
                <MembershipChurnReport />
              </TabsContent>
              <TabsContent value="classes">
                <ClassPopularityReport />
              </TabsContent>
              <TabsContent value="trainers">
                <TrainerPerformanceReport />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
