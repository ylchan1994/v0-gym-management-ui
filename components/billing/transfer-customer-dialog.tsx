"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BRANCHES } from "@/lib/branches";
import Link from "next/link";
import {
  createCustomer,
  getCustomer,
  getCustomerPaymentMethods,
  linkPaymentMethod,
} from "@/lib/passer-functions";

interface TransferCustomerDialogProps {
  customer: {};
  customerName: string;
}

export function TransferCustomerDialog({
  customer,
  customerName,
}: TransferCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState("");
  const [country, setCountry] = useState("");

  const availableBranches = BRANCHES.filter(
    (b) => b.id !== branch && b.country === country
  );
  const handleTransfer = async () => {
    if (!selectedBranch) return;

    setIsLoading(true);
    try {
      const currentCustomerData = await getCustomer(customer.id, branch);
      const newCustomer = {
        firstName: currentCustomerData.firstName,
        lastName: currentCustomerData.lastName,
        email: customer.email,
        address: customer.address,
        mobilePhone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
        plan: customer.plan,
        status: customer.status,
        startDate: Date(customer.joinDate),
        existingCustomerNumber: customer.number,
      };
      const newCustomerCreate = await createCustomer(
        newCustomer,
        selectedBranch
      );

      const { data: currentPaymentMethods } = await getCustomerPaymentMethods(
        customer.id,
        branch
      );

      currentPaymentMethods.forEach(async (paymentMethod) => {
        const { paymentMethodToken } = paymentMethod;
        const result = await linkPaymentMethod(
          newCustomerCreate.id,
          paymentMethodToken,
          selectedBranch
        );
        console.log(result);
      });

      // Close dialog on success
      setOpen(false);
      setSelectedBranch("");
      setTransferPaymentMethods(true);
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main";
    setBranch(selectedBranch);

    const selectedCountry = localStorage.getItem("selectedCountry") || "AU";
    setCountry(selectedCountry);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Transfer Customer</DialogTitle>
          <DialogDescription>
            Transfer {customerName} to a different branch. Select the branch and
            choose whether to transfer existing payment methods.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="branch-select" className="text-base font-semibold">
              Select Branch
            </Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-select">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 py-3">
            <Checkbox
              id="transfer-methods"
              checked={transferPaymentMethods}
              onCheckedChange={(checked) =>
                setTransferPaymentMethods(checked as boolean)
              }
            />
            <Label htmlFor="transfer-methods" className="flex-1 cursor-pointer">
              Transfer existing payment methods?
            </Label>
          </div>

          <DialogDescription className="pb-20">
            The is essentially creating a new customer in the new branch with
            the customer number from existing branch. Exisitng payment method
            token can be linked to the new customer account if customer agree to
            it. Refer to&nbsp;
            <Link
              href="https://developer.ezypay.com/docs/customer-transfer#customer-transfer"
              target="_blank"
              className="underline"
            >
              detailed guide
            </Link>
            .
          </DialogDescription>
        </div>

        <DialogFooter className="pb-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedBranch || isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
