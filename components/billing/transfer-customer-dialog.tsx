"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BRANCHES } from "@/lib/branches"

interface TransferCustomerDialogProps {
  customerId: string
  currentBranch: string
  customerName: string
}

export function TransferCustomerDialog({ customerId, currentBranch, customerName }: TransferCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const availableBranches = BRANCHES.filter((b) => b.id !== currentBranch)

  const handleTransfer = async () => {
    if (!selectedBranch) return

    setIsLoading(true)
    try {
      // TODO: Call backend API to transfer customer to selected branch
      // const response = await transferCustomer({
      //   customerId,
      //   targetBranch: selectedBranch,
      //   transferPaymentMethods,
      // });

      console.log("Transfer customer:", {
        customerId,
        targetBranch: selectedBranch,
        transferPaymentMethods,
      })

      // Close dialog on success
      setOpen(false)
      setSelectedBranch("")
      setTransferPaymentMethods(false)
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Customer</DialogTitle>
          <DialogDescription>
            Transfer {customerName} to a different branch. Select the branch and choose whether to transfer existing
            payment methods.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          <div className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
              id="transfer-methods"
              checked={transferPaymentMethods}
              onCheckedChange={(checked) => setTransferPaymentMethods(checked as boolean)}
            />
            <Label htmlFor="transfer-methods" className="flex-1 cursor-pointer">
              Transfer existing payment methods?
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedBranch || isLoading}>
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
