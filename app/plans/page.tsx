"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Check } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const plans = [
  {
    id: "1",
    name: "Basic",
    price: 49,
    duration: "Monthly",
    description: "Perfect for beginners starting their fitness journey",
    features: ["Access to gym equipment", "Locker room access", "Free fitness assessment", "Mobile app access"],
    activeMembers: 342,
    isPopular: false,
  },
  {
    id: "2",
    name: "Premium",
    price: 99,
    duration: "Monthly",
    description: "Our most popular plan with unlimited access",
    features: [
      "All Basic features",
      "Unlimited group classes",
      "Free guest passes (2/month)",
      "Nutrition consultation",
      "Priority booking",
    ],
    activeMembers: 567,
    isPopular: true,
  },
  {
    id: "3",
    name: "Annual",
    price: 999,
    duration: "Yearly",
    description: "Best value with 2 months free",
    features: [
      "All Premium features",
      "2 months free",
      "Free personal training session",
      "Exclusive member events",
      "Towel service",
    ],
    activeMembers: 189,
    isPopular: false,
  },
  {
    id: "4",
    name: "Personal Training",
    price: 149,
    duration: "Monthly",
    description: "One-on-one coaching for serious results",
    features: [
      "All Premium features",
      "4 personal training sessions/month",
      "Customized workout plan",
      "Weekly progress tracking",
      "Meal planning guidance",
    ],
    activeMembers: 94,
    isPopular: false,
  },
]

export default function PlansPage() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Membership Plans</h1>
                <p className="text-muted-foreground">Manage your gym's membership plans and pricing</p>
              </div>
              <Link href="/plans/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Plan
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative flex flex-col">
                  {plan.isPopular && (
                    <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">Most Popular</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.duration.toLowerCase()}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.activeMembers} active members</p>
                    </div>
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/plans/${plan.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the {plan.name} plan? This action cannot be undone and will
                            affect {plan.activeMembers} active members.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
