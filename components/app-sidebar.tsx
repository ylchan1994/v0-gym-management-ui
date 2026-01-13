"use client";

import {
  Home,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Dumbbell,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, normalisedEzypayCustomer } from "@/lib/utils";
import { useEffect, useState } from "react";
import { listCustomer } from "@/lib/passer-functions";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Members", href: "/members", icon: Users },
  { name: "Membership Plans", href: "/plans", icon: FileText },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar();
  const [branch, setBranch] = useState("main");

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main";
    setBranch(selectedBranch);
    let mounted = true;
    listCustomer(branch)
      .then((res) => {
        if (!mounted) return;
        const customers = res.data.map((customer) =>
          normalisedEzypayCustomer(customer)
        );
        sessionStorage.setItem(
          "defaultCustomerList",
          JSON.stringify(customers)
        );
      })
      .catch((err) => {
        console.error("[v0] Failed to load customer list for sidebar", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const pathname = usePathname();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <SidebarTrigger className="h-10 w-10">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </div>

      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link
            href="/"
            className="flex h-16 items-center gap-2 px-6 transition-opacity hover:opacity-80"
            onClick={handleNavClick}
          >
            <Dumbbell className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              GymFlow
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                    onClick={handleNavClick}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
