"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { TapToPayAnimation } from "./tap-to-pay-animation";
import {
  createCheckout,
  listCustomer,
  createInvoice,
} from "@/lib/passer-functions";
import { Spinner } from "@/components/ui/spinner";
import { PaymentMethodsList } from "./payment-methods-list";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logApiCall } from "@/lib/api-logger";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  customerId?: string;
  customerName?: string;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
  customerName,
}: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showTapAnimation, setShowTapAnimation] = useState(false);
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    description: "",
    paymentMethod: "ondemand" as "ondemand" | "tap-to-pay" | "checkout",
    terminalId: "",
    paymentMethodId: "",
    accountingCode: "",
  });
  const branch = localStorage.getItem("selectedBranch") || "main";

  useEffect(() => {
    if (open && !customerId) {
      setLoadingCustomers(true);
      listCustomer(branch)
        .then((response) => {
          const customerList = response?.data || [];
          setCustomers(customerList);
          sessionStorage.setItem(
            "defaultCustomerList",
            JSON.stringify(customerList)
          );
          setLoadingCustomers(false);
        })
        .catch((err) => {
          console.error("Failed to load customers:", err);
          toast({
            title: "Error",
            description: "Failed to load customer list.",
            variant: "destructive",
          });
          setLoadingCustomers(false);
        });
    } else if (open && customerId) {
      setFormData((prev) => ({ ...prev, memberId: customerId }));
    }
  }, [open, customerId, toast]);

  const terminalDevices = [
    {
      id: "1",
      name: "Front Desk Terminal",
      deviceId: "TERM-001",
      status: "active",
    },
    {
      id: "2",
      name: "Reception Terminal",
      deviceId: "TERM-002",
      status: "active",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === "tap-to-pay" && !formData.terminalId) {
      toast({
        title: "Terminal Required",
        description: "Please select a terminal device for tap-to-pay.",
        variant: "destructive",
      });
      return;
    }

    if (formData.paymentMethod === "ondemand" && !formData.paymentMethodId) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method for on-demand payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let selectedMemberName = customerName;
      if (!selectedMemberName) {
        const selectedCustomer = customers.find(
          (c) => c.id === formData.memberId
        );
        selectedMemberName = selectedCustomer
          ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
          : "Unknown";
      }

      const selectedTerminal = terminalDevices.find(
        (t) => t.id === formData.terminalId
      );

      let invoiceStatus: "pending" | "paid" = "pending";

      if (formData.paymentMethod === "tap-to-pay") {
        console.log(
          "[v0] Initiating tap-to-pay with terminal:",
          selectedTerminal?.name
        );

        // Show tap-to-pay animation
        setShowTapAnimation(true);

        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Hide animation
        setShowTapAnimation(false);

        // Set status to paid for tap-to-pay
        invoiceStatus = "paid";

        console.log("[v0] Tap-to-pay completed successfully");
        const url =
          "https://api-sandbox.ezypay.com/v2/billing/terminal/invoices";
        const requestBody = {
          items: [
            {
              amount: {
                currency: "AUD",
                value: formData.amount,
              },
              description: formData.description,
            },
          ],
          customerId: formData.memberId,
        };
        const todayDate = new Date(Date.now()).toISOString().split("T")[0];
        const responseBody = {
          id: "c911a6ca-8318-45b7-a165-a955c053448a",
          creditNoteId: null,
          documentNumber: "IN0000000000000998",
          date: todayDate,
          dueDate: todayDate,
          scheduledPaymentDate: null,
          status: "PENDING_TERMINAL_PAYMENT",
          memo: null,
          items: [
            {
              description: formData.description,
              amount: {
                currency: "AUD",
                value: formData.amount,
                type: null,
              },
              tax: {
                rate: 0,
              },
              id: "d71a77a1-bdda-488a-90b6-b1d9e3670b3f",
              type: "on_demand_payment",
              discounted: {
                currency: "AUD",
                value: 0,
                type: null,
              },
              accountingCode: null,
              reference: null,
            },
            {
              description: "Transaction fee Terminal",
              amount: {
                currency: "AUD",
                value: 2,
                type: null,
              },
              tax: {
                rate: 10,
              },
              id: "38946064-cc28-46b3-93f0-3f77b81ae1b1",
              type: "transaction_fee",
              discounted: {
                currency: "AUD",
                value: 0,
                type: null,
              },
              accountingCode: null,
              reference: null,
            },
          ],
          amount: {
            currency: "AUD",
            value: formData.amount + 2,
            type: null,
          },
          amountWithoutDiscount: {
            currency: "AUD",
            value: formData.amount + 2,
            type: null,
          },
          totalDiscounted: {
            currency: "AUD",
            value: 0,
            type: null,
          },
          totalRefunded: {
            currency: "AUD",
            value: 0,
            type: null,
          },
          totalTax: {
            currency: "AUD",
            value: 0.45,
            type: null,
          },
          customerId: formData.memberId,
          subscriptionId: null,
          checkoutId: null,
          subscriptionName: null,
          paymentMethodToken: null,
          paymentMethodData: null,
          autoPayment: false,
          processingModel: "IN_PERSON_PAYMENT",
          transactionSource: null,
          createdOn: "2025-10-07T06:38:39.674",
          payNowUrl: null,
          channel: "MOBILE_POINT_OF_SALE",
          checkoutResult: null,
          customerFirstName: null,
          customerLastName: null,
          terminalId: "0dea8104-02cd-4931-bca0-ea34bb7eac8b",
          invoiceCategory: "ONE_OFF",
          invoiceSubCategory: "TERMINAL",
        };
        logApiCall("POST", url, requestBody, 200, responseBody);
        console.log("POST", url, requestBody, 200, responseBody);
      }

      if (formData.paymentMethod === "ondemand") {
        await createInvoice(
          {
            memberId: formData.memberId,
            amount: formData.amount,
            description: formData.description,
            paymentMethodId: formData.paymentMethodId,
            ...(formData.accountingCode && {
              accountingCode: formData.accountingCode,
            }),
          },
          branch
        );

        toast({
          title: "Invoice Created",
          description: "Invoice created successfully with on-demand payment.",
        });
      }

      if (formData.paymentMethod === "checkout") {
        const response = await createCheckout(
          {
            memberId: formData.memberId,
            amount: formData.amount,
            description: formData.description,
          },
          branch
        );
        const checkoutUrl = response?.data;

        // Validate checkoutUrl is a proper URL and open it in a new tab
        try {
          if (typeof checkoutUrl !== "string")
            throw new Error("checkoutUrl is not a string");
          // This will throw if the URL is invalid
          // eslint-disable-next-line no-new
          new URL(checkoutUrl);

          toast({
            title: "Invoice Created",
            description: "Opening checkout page...",
          });

          // Open in a new tab/window; use noopener and noreferrer for security
          if (typeof window !== "undefined") {
            window.open(checkoutUrl, "_blank", "noopener,noreferrer");
          }
        } catch (err) {
          console.error("[v0] Invalid checkout URL:", err, checkoutUrl);
          toast({
            title: "Checkout Error",
            description: "Failed to open checkout URL.",
            variant: "destructive",
          });
        }
      }

      setFormData({
        memberId: customerId || "",
        amount: "",
        description: "",
        paymentMethod: "ondemand",
        terminalId: "",
        paymentMethodId: "",
        accountingCode: "",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("[v0] Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
      setShowTapAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TapToPayAnimation open={showTapAnimation} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-sm">
              Create a new invoice with pending status
            </DialogDescription>
            <DialogDescription className="italic text-xs md:text-sm">
              You would create invoice in Ezypay with this also and depends on
              whether is&nbsp;
              <Link
                href={"https://developer.ezypay.com/docs/on-demand#/"}
                target="_blank"
                className="underline"
              >
                on-demand invoice,
              </Link>
              &nbsp;
              <Link
                href={"https://developer.ezypay.com/docs/checkout#/"}
                target="_blank"
                className="underline"
              >
                tap to pay invoice,
              </Link>
              &nbsp;
              <Link
                href={
                  "https://developer.ezypay.com/docs/terminal-integration#/"
                }
                target="_blank"
                className="underline"
              >
                checkout session,
              </Link>
              &nbsp;you would need to use different APIs to create the relevant
              session with Ezypay
            </DialogDescription>
          </DialogHeader>
          <form className="mt-4 md:mt-9" onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm">
                  Member
                </Label>
                {customerId ? (
                  <Input
                    id="member"
                    value={customerName || ""}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={formData.memberId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, memberId: value }))
                    }
                    required
                    disabled={loadingCustomers}
                  >
                    <SelectTrigger id="member">
                      <SelectValue
                        placeholder={
                          loadingCustomers
                            ? "Loading customers..."
                            : "Select a member"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {loadingCustomers ? (
                        <div className="flex justify-center py-4">
                          <Spinner className="h-6 w-6" />
                        </div>
                      ) : customers.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No customers found
                        </div>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Monthly membership fee"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Payment Method</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: value,
                      terminalId: "",
                      paymentMethodId: "",
                    }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ondemand" id="ondemand" />
                    <Label
                      htmlFor="ondemand"
                      className="font-normal cursor-pointer"
                    >
                      On Demand
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tap-to-pay" id="tap-to-pay" />
                    <Label
                      htmlFor="tap-to-pay"
                      className="font-normal cursor-pointer"
                    >
                      Tap to Pay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkout" id="checkout" />
                    <Label
                      htmlFor="checkout"
                      className="font-normal cursor-pointer"
                    >
                      Checkout
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.paymentMethod === "ondemand" && formData.memberId && (
                <>
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Select Payment Channel</Label>
                    <PaymentMethodsList
                      customerId={formData.memberId}
                      variant="selection"
                      selectedMethodId={formData.paymentMethodId}
                      onMethodSelect={(methodId) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethodId: methodId,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountingCode" className="text-sm">
                      Accounting Code (Optional)
                    </Label>
                    <Input
                      id="accountingCode"
                      placeholder="Enter accounting code"
                      value={formData.accountingCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountingCode: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for tracking and reconciliation in your accounting
                      system
                    </p>
                  </div>
                </>
              )}

              {formData.paymentMethod === "tap-to-pay" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="terminal">Select Terminal Device</Label>
                  <Select
                    value={formData.terminalId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, terminalId: value }))
                    }
                    required
                  >
                    <SelectTrigger id="terminal">
                      <SelectValue placeholder="Select a terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {terminalDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.deviceId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only active terminals are available for selection
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={loading || loadingCustomers}
                      className="w-full sm:w-auto"
                    >
                      {loading ? "Creating..." : "Create"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Each payment channel will trigger different Ezypay API
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
