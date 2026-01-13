"use client";

import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { UpcomingInvoicesTable } from "@/components/billing/upcoming-invoices-table";
import { SettlementTable } from "@/components/billing/settlement-table";
import { useEffect, useState } from "react";
import { listInvoice } from "@/lib/passer-functions";
import { useToast } from "@/hooks/use-toast";

const stats = [
  {
    title: "Total Revenue",
    value: "$48,392",
    change: "+15.3%",
    icon: DollarSign,
    color: "text-accent",
  },
  {
    title: "Overdue Payments",
    value: "$3,240",
    change: "12 invoices",
    icon: AlertCircle,
    color: "text-destructive",
  },
  {
    title: "Upcoming Invoices",
    value: "$12,850",
    change: "87 invoices",
    icon: Clock,
    color: "text-chart-5",
  },
  {
    title: "This Month",
    value: "$48,392",
    change: "+$6,420",
    icon: TrendingUp,
    color: "text-accent",
  },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [branch, setBranch] = useState("");

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main";
    setBranch(selectedBranch);
  }, []);

  useEffect(() => {
    if (!branch) return;
    listInvoice(branch)
      .then((res) => {
        let customerData = sessionStorage.getItem("defaultCustomerList");
        let invoices;
        if (customerData) {
          customerData = JSON.parse(customerData);
        }

        invoices = res.map((invoice) => {
          const id = invoice.customerId;
          const customerName = customerData?.filter((cus) => cus.id == id)[0]
            ?.name;
          return { ...invoice, member: customerName };
        });
        setInvoices(invoices);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load invoices:", err);
        toast({
          title: "Error loading invoices",
          description:
            "Please check if the API endpoint is configured correctly.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [toast, branch]);

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
              Billing
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage invoices, payments, and billing settings
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="invoices" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="invoices" className="flex-shrink-0">
                Invoices
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-shrink-0">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="settlement" className="flex-shrink-0">
                Settlement
              </TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              <InvoicesTable invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="upcoming">
              <UpcomingInvoicesTable />
            </TabsContent>
            <TabsContent value="settlement">
              <SettlementTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
