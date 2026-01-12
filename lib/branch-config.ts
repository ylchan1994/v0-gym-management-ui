"use server"

// Branch configuration with environment variable mapping
// Each branch has its own set of Ezypay credentials stored in env vars

export type BranchId = "main" | "branch2"

export interface BranchConfig {
  id: BranchId
  name: string
}

export const BRANCHES: Record<BranchId, BranchConfig> = {
  main: {
    id: "main",
    name: "Main Branch",
  },
  branch2: {
    id: "branch2",
    name: "Branch 2",
  },
}

// Helper function to get branch credentials from environment variables
export function getBranchCredentials(branchId: BranchId) {
  const isMainBranch = branchId === "main"

  return {
    clientId: process.env[isMainBranch ? "EZYPAY_CLIENT_ID" : "BRANCH2_EZYPAY_CLIENT_ID"] || "",
    clientSecret: process.env[isMainBranch ? "EZYPAY_CLIENT_SECRET" : "BRANCH2_EZYPAY_CLIENT_SECRET"] || "",
    username: process.env[isMainBranch ? "EZYPAY_USERNAME" : "BRANCH2_EZYPAY_USERNAME"] || "",
    password: process.env[isMainBranch ? "EZYPAY_PASSWORD" : "BRANCH2_EZYPAY_PASSWORD"] || "",
    merchantId: process.env[isMainBranch ? "EZYPAY_MERCHANT_ID" : "BRANCH2_EZYPAY_MERCHANT_ID"] || "",
  }
}

// Helper to validate credentials exist
export function validateBranchCredentials(branchId: BranchId): boolean {
  const creds = getBranchCredentials(branchId)
  return !!(creds.clientId && creds.clientSecret && creds.username && creds.password && creds.merchantId)
}
