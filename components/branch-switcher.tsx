"use client"

import { Building2, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Mock branch data - in production, this would come from an API
const BRANCHES = [
  { id: "main", name: "Main Branch", username: "main_user", password: "main_pass", merchantId: "MAIN001" },
  { id: "branch2", name: "Branch 2", username: "branch2_user", password: "branch2_pass", merchantId: "BRANCH002" },
  { id: "branch3", name: "Branch 3", username: "branch3_user", password: "branch3_pass", merchantId: "BRANCH003" },
]

export function BranchSwitcher() {
  const [currentBranch, setCurrentBranch] = useState(BRANCHES[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved branch from localStorage
    const savedBranchId = localStorage.getItem("selectedBranch")
    if (savedBranchId) {
      const saved = BRANCHES.find((b) => b.id === savedBranchId)
      if (saved) {
        setCurrentBranch(saved)
      }
    }
  }, [])

  const handleBranchSwitch = (branch: (typeof BRANCHES)[0]) => {
    setCurrentBranch(branch)
    localStorage.setItem("selectedBranch", branch.id)
    // Store credentials for API usage
    localStorage.setItem("merchantUsername", branch.username)
    localStorage.setItem("merchantPassword", branch.password)
    localStorage.setItem("merchantId", branch.merchantId)
    toast.success(`Switched to ${branch.name}`)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Building2 className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={`Current: ${currentBranch.name}`}>
          <Building2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BRANCHES.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleBranchSwitch(branch)}
            className="flex items-center justify-between"
          >
            <span>{branch.name}</span>
            {currentBranch.id === branch.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
