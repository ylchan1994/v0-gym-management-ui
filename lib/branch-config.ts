"use server";

// Branch configuration with environment variable mapping
// Each branch has its own set of Ezypay credentials stored in env vars

type BranchId = "main" | "branch2";

interface BranchConfig {
  id: BranchId;
  name: string;
}

// Helper function to get branch credentials from environment variables
export async function getBranchCredentials(branchId: BranchId) {
  const isMainBranch = branchId === "main";
  console.log(branchId, isMainBranch);
  return {
    clientId: process.env.EZYPAY_CLIENT_ID,
    clientSecret: process.env.EZYPAY_CLIENT_SECRET,
    username:
      process.env[
        isMainBranch ? "EZYPAY_USERNAME" : "BRANCH2_EZYPAY_USERNAME"
      ] || "",
    password:
      process.env[
        isMainBranch ? "EZYPAY_PASSWORD" : "BRANCH2_EZYPAY_PASSWORD"
      ] || "",
    merchantId:
      process.env[
        isMainBranch ? "EZYPAY_MERCHANT_ID" : "BRANCH2_EZYPAY_MERCHANT_ID"
      ] || "",
  };
}
