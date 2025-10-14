import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { MemberGrowthChart } from "@/components/dashboard/member-growth-chart"
import { ClassAttendanceChart } from "@/components/dashboard/class-attendance-chart"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's an overview of your gym's performance.</p>
            </div>
            <OverviewCards />
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart />
              <MemberGrowthChart />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ClassAttendanceChart />
              </div>
              <NotificationsPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
