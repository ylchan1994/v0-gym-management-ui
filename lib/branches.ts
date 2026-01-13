// Global branches configuration shared across frontend and backend
export type BranchId = "main" | "branch2"

export interface Branch {
  id: BranchId
  name: string
}

export const BRANCHES: Branch[] = [
  { id: "main", name: "Main Branch" },
  { id: "branch2", name: "Branch 2" },
]

export function getBranchName(branchId: BranchId): string {
  return BRANCHES.find((b) => b.id === branchId)?.name || branchId
}
