import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function AutoBillingSettings() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payments</CardTitle>
          <CardDescription>Configure automatic billing for memberships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enable-recurring">Enable Recurring Payments</Label>
              <p className="text-sm text-muted-foreground">Automatically charge members on renewal date</p>
            </div>
            <Switch id="enable-recurring" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-day">Billing Day</Label>
            <Select defaultValue="1">
              <SelectTrigger id="billing-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st of the month</SelectItem>
                <SelectItem value="15">15th of the month</SelectItem>
                <SelectItem value="membership">Membership anniversary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="grace-period">Grace Period (days)</Label>
            <Input id="grace-period" type="number" defaultValue="3" />
            <p className="text-sm text-muted-foreground">Days before marking payment as overdue</p>
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Failed Payment Handling</CardTitle>
          <CardDescription>Configure retry logic and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="retry-failed">Retry Failed Payments</Label>
              <p className="text-sm text-muted-foreground">Automatically retry failed payment attempts</p>
            </div>
            <Switch id="retry-failed" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retry-attempts">Maximum Failed Attempts</Label>
            <Input id="retry-attempts" type="number" defaultValue="3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retry-interval">Retry Interval (days)</Label>
            <Input id="retry-interval" type="number" defaultValue="3" />
          </div>
          {/* <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allow-writeoff">Allow Write-off</Label>
              <p className="text-sm text-muted-foreground">Enable manual write-off for uncollectable payments</p>
            </div>
            <Switch id="allow-writeoff" />
          </div> */}
        </CardContent>
      </Card>

      {/* <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>External Payment Tracking</CardTitle>
          <CardDescription>Mark invoices as paid outside the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="external-payments">Allow External Payment Marking</Label>
              <p className="text-sm text-muted-foreground">
                Enable staff to mark invoices as paid for cash or external transactions
              </p>
            </div>
            <Switch id="external-payments" defaultChecked />
          </div>
          <p className="text-sm text-muted-foreground">
            When enabled, staff can manually mark invoices as paid and add notes about the payment method used outside
            the system.
          </p>
        </CardContent>
      </Card> */}

      <div className="lg:col-span-2">
        <Button size="lg">Save Settings</Button>
      </div>
    </div>
  )
}
