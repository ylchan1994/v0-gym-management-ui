"use client"

import { Home, Users, CreditCard, FileText, BarChart3, Settings, Dumbbell } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, normalisedEzypayCustomer } from "@/lib/utils"
import { useEffect } from "react"
import { listCustomer } from "@/lib/passer-functions"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Members", href: "/members", icon: Users },
  { name: "Membership Plans", href: "/plans", icon: FileText },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  
  useEffect(() => {
    let mounted = true
    listCustomer()
      .then((res) => {
        if (!mounted) return
        const customers = res.data.map((customer) => normalisedEzypayCustomer(customer))
        sessionStorage.setItem('defaultCustomerList', JSON.stringify(customers))
      })
      .catch((err) => {
        // fail silently - sidebar should not break the app
        console.error('[v0] Failed to load customer list for sidebar', err)
      })

    return () => {
      mounted = false
    }
  }, [])

  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Dumbbell className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-semibold text-sidebar-foreground">GymFlow</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
