// Global branches configuration shared across frontend and backend
export interface Branch {
  id: string;
  name: string;
  country: string;
}

export const BRANCHES: Branch[] = [
  { id: "main", name: "Main Branch", country: "AU" },
  { id: "branch2", name: "Branch 2", country: "AU" },
  { id: "ph", name: "PH Branch", country: "PH" },
];

export function getBranchName(branchId: string): string {
  return BRANCHES.find((b) => b.id === branchId)?.name || branchId;
}
