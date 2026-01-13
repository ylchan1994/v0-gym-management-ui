"use server";

import { getEzypayToken } from "./ezypay-token";
import { logApiCall } from "./api-logger";
import { getBranchCredentials } from "./branch-config";

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`;

export async function replacePaymentMethod(
  customerId,
  paymentMethod,
  newPaymentMethod,
  branch
) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod || !newPaymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Replace Payment Method failed: No access_token from token utility`
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}/new`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"newPaymentMethodToken":"${newPaymentMethod}"}`,
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("PUT", url, data, response.status, {
      newPaymentMethodToken: newPaymentMethod,
    });

    if (!response.ok) {
      console.error("Replace Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Replace Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Replace Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function deletePaymentMethod(customerId, paymentMethod, branch) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Delete Payment Method failed: No access_token from token utility`
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("DELETE", url, data, response.status);

    if (!response.ok) {
      console.error("Delete Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Delete Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Delete Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function linkPaymentMethod(customerId, paymentMethod, branch) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Link Payment Method failed: No access_token from token utility`
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"paymentMethodToken":"${paymentMethod}"}`,
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("POST", url, data, response.status, {
      paymentMethodToken: paymentMethod,
    });

    if (!response.ok) {
      console.error("Link Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Link Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Link Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}
