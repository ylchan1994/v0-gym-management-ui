"use server";
import { getEzypayToken } from "./passer-functions";
import { logApiCall } from "./api-logger";
import { getBranchCredentials } from "./branch-config";

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/settlements`;
const fileEndpoint = `${process.env.API_ENDPOINT}/v2/files`;

export type Settlement = {
  id: string;
  date: string;
  amount: string;
  status: string;
};

export type SettlementList = Settlement[];

export type documentType = "tax_invoice" | "detail_report" | "summary_report";

function normalisedEzypaySettlement(settlements) {
  const normalisedSettlements: SettlementList = settlements.map(
    (settlement) => ({
      id: settlement.number,
      date: settlement.date,
      amount: "$" + settlement.amount.value,
      status: settlement.status,
    })
  );

  return normalisedSettlements.filter(
    (settlement) => settlement.amount != "$0" && settlement.amount != "$0.00"
  );
}

export async function downloadDocument(
  settlementId,
  documentType,
  branch
): Promise<any> {
  const { merchantId } = await getBranchCredentials(
    branch as "main" | "branch2"
  );
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Generate file failed: No access_token from token utility`
      );
    }

    const body = { documentType: documentType };

    const url = `${apiEndpoint}/${settlementId}/file`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
      body: JSON.stringify(body),
    });

    const settlementDoc = response.ok
      ? await response.json()
      : await response.text();
    await logApiCall("POST", url, settlementDoc, response.status, body);

    if (!response.ok) {
      console.error(
        "Created settlement file failed:",
        response.status,
        settlementDoc
      );
      throw new Error(`Create settlement file failed: ${response.status}`);
    }

    const fileId = settlementDoc.fileId;

    const fileUrl = `${fileEndpoint}/${fileId}`;
    const getFile = await fetch(fileUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    });

    const fileData = getFile.ok ? await getFile.json() : await getFile.text();
    await logApiCall("GET", fileUrl, fileData, getFile.status);

    if (!getFile.ok) {
      console.error(
        "Download settlement file failed:",
        getFile.status,
        fileData
      );
      throw new Error(`Download settlement file failed: ${getFile.status}`);
    }

    const downloadUrl = fileData.url;

    return downloadUrl;
  } catch (err) {
    console.error("Download settlement file error:", err);
    throw err;
  }
}

export async function listSettlements(branch): Promise<any> {
  const { merchantId } = await getBranchCredentials(
    branch as "main" | "branch2"
  );
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `List settlement failed: No access_token from token utility`
      );
    }

    const url = `${apiEndpoint}?limit=100`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    });

    const settlements = response.ok
      ? await response.json()
      : await response.text();
    await logApiCall("GET", url, settlements, response.status);

    if (!response.ok) {
      console.error("List settlement failed:", response.status, settlements);
      throw new Error(`List settlement failed: ${response.status}`);
    }

    return normalisedEzypaySettlement(settlements.data);
  } catch (err) {
    console.error("List settlement error:", err);
    throw err;
  }
}
