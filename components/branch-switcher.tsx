"use client";

import { Building2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const BRANCHES = [
  { id: "main", name: "Main Branch" },
  { id: "branch2", name: "Branch 2" },
];

export function BranchSwitcher() {
  const [currentBranch, setCurrentBranch] = useState(BRANCHES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved branch from localStorage
    const savedBranchId = localStorage.getItem("selectedBranch");
    if (savedBranchId) {
      const saved = BRANCHES.find((b) => b.id === savedBranchId);
      if (saved) {
        setCurrentBranch(saved);
      }
    }
  }, []);

  const handleBranchSwitch = (branch: (typeof BRANCHES)[0]) => {
    setCurrentBranch(branch);
    localStorage.setItem("selectedBranch", branch.id);
    toast.success(`Switched to ${branch.name}`);
    window.location.replace("/");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Building2 className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Current: ${currentBranch.name}`}
        >
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
  );
}
