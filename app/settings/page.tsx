"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Plus, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type DeviceStatus = "active" | "inactive" | "pending"

interface Device {
  id: string
  name: string
  deviceId: string
  code: string
  status: DeviceStatus
  lastSeen: string
}

// Mock registered devices
const initialDevices: Device[] = [
  {
    id: "1",
    name: "Front Desk Terminal",
    deviceId: "TERM-001",
    code: "123456",
    status: "active",
    lastSeen: "2024-10-17 09:30 AM",
  },
  {
    id: "2",
    name: "Reception Terminal",
    deviceId: "TERM-002",
    code: "789012",
    status: "active",
    lastSeen: "2024-10-17 09:25 AM",
  },
  {
    id: "3",
    name: "Gym Floor Terminal",
    deviceId: "TERM-003",
    code: "345678",
    status: "inactive",
    lastSeen: "2024-10-15 03:45 PM",
  },
]

export default function SettingsPage() {
  const [ezypayUsername, setEzypayUsername] = useState("")
  const [ezypayPassword, setEzypayPassword] = useState("")
  const [ezypayMerchantId, setEzypayMerchantId] = useState("")
  const [devices, setDevices] = useState<Device[]>(initialDevices)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isRegistrationCodeOpen, setIsRegistrationCodeOpen] = useState(false)
  const [registrationCode, setRegistrationCode] = useState("")
  const [newDeviceName, setNewDeviceName] = useState("")
  const [newDeviceId, setNewDeviceId] = useState("")
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())

  const handleSaveEzypay = () => {
    // TODO: Implement API call to save Ezypay credentials
    console.log("[v0] Saving Ezypay credentials:", {
      username: ezypayUsername,
      merchantId: ezypayMerchantId,
    })
    alert("Ezypay credentials saved successfully!")
  }

  const generateRegistrationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleAddDevice = () => {
    if (!newDeviceName || !newDeviceId) {
      alert("Please fill in all fields")
      return
    }

    const code = generateRegistrationCode()
    const newDevice: Device = {
      id: String(devices.length + 1),
      name: newDeviceName,
      deviceId: newDeviceId,
      code: code,
      status: "pending",
      lastSeen: new Date().toLocaleString("en-AU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }

    setDevices([...devices, newDevice])
    setNewDeviceName("")
    setNewDeviceId("")
    setIsAddDeviceOpen(false)

    // Show registration code popup
    setRegistrationCode(code)
    setIsRegistrationCodeOpen(true)
  }

  const handleDeleteDevice = (deviceId: string) => {
    if (confirm("Are you sure you want to delete this device?")) {
      setDevices(devices.filter((d) => d.id !== deviceId))
    }
  }

  const toggleCodeVisibility = (deviceId: string) => {
    setVisibleCodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId)
      } else {
        newSet.add(deviceId)
      }
      return newSet
    })
  }

  const getStatusBadgeVariant = (status: DeviceStatus) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: DeviceStatus) => {
    switch (status) {
      case "active":
        return "Active"
      case "inactive":
        return "Inactive"
      case "pending":
        return "Pending Registration"
      default:
        return status
    }
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Settings</h1>
              <p className="text-muted-foreground">Manage integrations and device registrations</p>
            </div>

            <Tabs defaultValue="ezypay" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ezypay">Ezypay Integration</TabsTrigger>
                <TabsTrigger value="terminals">Terminal Registration</TabsTrigger>
              </TabsList>

              <TabsContent value="ezypay">
                <Card>
                  <CardHeader>
                    <CardTitle>Ezypay Integration</CardTitle>
                    <CardDescription>Configure your Ezypay payment gateway credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ezypay-username">Username</Label>
                      <Input
                        id="ezypay-username"
                        type="text"
                        placeholder="Enter Ezypay username"
                        value={ezypayUsername}
                        onChange={(e) => setEzypayUsername(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ezypay-password">Password</Label>
                      <Input
                        id="ezypay-password"
                        type="password"
                        placeholder="Enter Ezypay password"
                        value={ezypayPassword}
                        onChange={(e) => setEzypayPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ezypay-merchant-id">Merchant ID</Label>
                      <Input
                        id="ezypay-merchant-id"
                        type="text"
                        placeholder="Enter Merchant ID"
                        value={ezypayMerchantId}
                        onChange={(e) => setEzypayMerchantId(e.target.value)}
                      />
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleSaveEzypay} size="lg">
                        Save Credentials
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terminals">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Terminal Registration</CardTitle>
                      <CardDescription>Manage registered payment terminals and devices</CardDescription>
                    </div>
                    <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Device
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Device</DialogTitle>
                          <DialogDescription>Register a new payment terminal or device</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="device-name">Device Name</Label>
                            <Input
                              id="device-name"
                              placeholder="e.g., Front Desk Terminal"
                              value={newDeviceName}
                              onChange={(e) => setNewDeviceName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="device-id">Device ID</Label>
                            <Input
                              id="device-id"
                              placeholder="e.g., TERM-004"
                              value={newDeviceId}
                              onChange={(e) => setNewDeviceId(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddDevice}>Add Device</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRegistrationCodeOpen} onOpenChange={setIsRegistrationCodeOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Device Registration Code</DialogTitle>
                          <DialogDescription>
                            Use this code to complete the device registration on your terminal
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-sm text-muted-foreground mb-4">Registration Code</p>
                          <div className="text-5xl font-bold tracking-wider text-primary mb-2">{registrationCode}</div>
                          <p className="text-sm text-muted-foreground mt-4 text-center">
                            Enter this code on your device to complete registration
                          </p>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setIsRegistrationCodeOpen(false)}>Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device Name</TableHead>
                          <TableHead>Device ID</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Seen</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.name}</TableCell>
                            <TableCell>{device.deviceId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">
                                  {visibleCodes.has(device.id) ? device.code : "••••••"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCodeVisibility(device.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {visibleCodes.has(device.id) ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(device.status)}>
                                {getStatusText(device.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{device.lastSeen}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteDevice(device.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
