import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, UserPlus } from "lucide-react"

const notifications = [
  {
    type: "error",
    icon: AlertCircle,
    title: "Payment Failed",
    description: "John Doe's payment of $99 failed",
    time: "5 min ago",
  },
  {
    type: "warning",
    icon: Clock,
    title: "Expiring Memberships",
    description: "5 memberships expiring in 3 days",
    time: "1 hour ago",
  },
  {
    type: "success",
    icon: UserPlus,
    title: "New Sign-up",
    description: "Sarah Smith joined Premium Plan",
    time: "2 hours ago",
  },
  {
    type: "warning",
    icon: Clock,
    title: "Membership Renewal",
    description: "Mike Johnson's membership renews tomorrow",
    time: "3 hours ago",
  },
  {
    type: "error",
    icon: AlertCircle,
    title: "Payment Failed",
    description: "Emma Wilson's payment of $149 failed",
    time: "5 hours ago",
  },
]

export function NotificationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
        <CardDescription>Important updates and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div
              className={`rounded-full p-2 ${
                notification.type === "error"
                  ? "bg-destructive/10 text-destructive"
                  : notification.type === "warning"
                    ? "bg-chart-5/10 text-chart-5"
                    : "bg-accent/10 text-accent"
              }`}
            >
              <notification.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{notification.title}</p>
                <Badge variant="outline" className="text-xs">
                  {notification.time}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
