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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TransferCustomerDialogProps {
  customerId: string
  currentBranch: string
  customerName: string
}

const BRANCHES = [
  { id: "main", name: "Main Branch" },
  { id: "branch2", name: "Branch 2" },
]

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
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Branch</Label>
            <RadioGroup value={selectedBranch} onValueChange={setSelectedBranch}>
              <div className="space-y-3">
                {availableBranches.map((branch) => (
                  <div key={branch.id} className="flex items-center gap-3 rounded-md border p-3">
                    <RadioGroupItem value={branch.id} id={branch.id} />
                    <Label htmlFor={branch.id} className="flex-1 cursor-pointer">
                      {branch.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
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
