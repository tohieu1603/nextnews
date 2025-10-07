import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}/api`;
// const API_URL = "https://payment.operis.vn/api";

console.log("API_URLLLLL", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Lấy danh sách symbols
export const getSymbolData = async (symbol: string) => {
  try {
    console.log("symbol", symbol);
    const response = await api.get(`/stocks/symbols?limit=8`);

    if (!response?.data || response.data.length === 0) {
      return { message: "Đang cập nhật dữ liệu…" };
    }

    return response.data;
  } catch (error) {
    console.error("getSymbolData error:", error);
    return { message: "Đang cập nhật dữ liệu…" };
  }
};

// Lấy dữ liệu theo tên mã
export const getNameData = async (code: string) => {
  try {
    const response = await api.get(`/stocks/symbols/by-name/${code}`);

    if (!response?.data) {
      return { message: "Đang cập nhật dữ liệu…" };
    }

    return response.data;
  } catch (error) {
    console.error("getNameData error:", error);
    return { message: "Đang cập nhật dữ liệu…" };
  }
};
// export const getSymbolId = async (symbolId : string) => {
//   try {
//     const response = await api.get(`/stocks/symbols/${symbolId}`);

//     if (!response?.data) {
//       return { message: "Đang cập nhật dữ liệu…" };
//     }

//     return response.data;
//   } catch (error) {
//     console.error("getSymbolId error:", error);
//     return { message: "Đang cập nhật dữ liệu…" };
//   }
// };
// export const getSymbolByName = async (name: string) => {
//   try {
//     const response = await api.get(`/stocks/symbols/by-name/${name}`);
//   } catch (error) {
//     console.error("getSymbolByName error:", error);
//     return { message: "Đang cập nhật dữ liệu…" };
//   }
// Lấy chi tiết công ty
export const getCompanyDetails = async (symbolId: number) => {
  console.log("📞 getCompanyDetails called with symbolId:", symbolId);
  const endpoints = [
    { key: "symbolData", url: `/stocks/symbols/${symbolId}` },
    { key: "balanceData", url: `/calculate/balances/${symbolId}` },
    { key: "incomeData", url: `/calculate/incomes/${symbolId}` },
    { key: "cashflowData", url: `/calculate/cashflows/${symbolId}` },
    { key: "ratiosData", url: `/calculate/ratios/${symbolId}` },
  ];

  console.log("🌐 API endpoints:", endpoints.map(e => e.url));

  const results = await Promise.allSettled(
    endpoints.map((ep) => api.get(ep.url))
  );

  const data: Record<string, any> = {};

  results.forEach((res, i) => {
    if (res.status === "fulfilled" && res.value?.data) {
      data[endpoints[i].key] = res.value.data;
      console.log(`✅ ${endpoints[i].key}:`, Array.isArray(res.value.data) ? `${res.value.data.length} items` : 'object');
    } else {
      const error = res.status === "rejected" ? res.reason : "Unknown error";
      // Only log if it's not a 404 (expected for missing data)
      if (error?.response?.status !== 404) {
        console.warn(`⚠️ Failed to fetch ${endpoints[i].key}:`, {
          url: endpoints[i].url,
          status: error?.response?.status,
          message: error?.message,
        });
      }
      data[endpoints[i].key] = { message: "Đang cập nhật dữ liệu…" };
    }
  });

  console.log("📦 Final data:", data);
  return data;
};

// === PURCHASED LICENSES API ===

/**
 * Get all purchased licenses for the current user
 * @param token - JWT authentication token
 * @returns Array of PurchasedLicense objects
 */
export const getPurchasedLicenses = async (token: string) => {
  try {
    const response = await api.get("/sepay/symbol/licenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("getPurchasedLicenses error:", error);
    throw error;
  }
};

// === AUTO-RENEW SUBSCRIPTION API ===

/**
 * Get all auto-renew subscriptions for the current user
 * @param token - JWT authentication token
 */
export const getAutoRenewSubscriptions = async (token: string) => {
  try {
    const response = await api.get("/settings/symbol/subscriptions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("getAutoRenewSubscriptions error:", error);
    throw error;
  }
};

/**
 * Pause an auto-renew subscription
 * @param token - JWT authentication token
 * @param subscriptionId - The subscription ID
 */
export const pauseAutoRenew = async (token: string, subscriptionId: string) => {
  try {
    const response = await api.post(
      `/settings/symbol/subscriptions/${subscriptionId}/pause`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("pauseAutoRenew error:", error);
    throw error;
  }
};

/**
 * Resume an auto-renew subscription
 * @param token - JWT authentication token
 * @param subscriptionId - The subscription ID
 */
export const resumeAutoRenew = async (
  token: string,
  subscriptionId: string
) => {
  try {
    const response = await api.post(
      `/settings/symbol/subscriptions/${subscriptionId}/resume`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("resumeAutoRenew error:", error);
    throw error;
  }
};

/**
 * Cancel an auto-renew subscription
 * @param token - JWT authentication token
 * @param subscriptionId - The subscription ID
 */
export const cancelAutoRenew = async (
  token: string,
  subscriptionId: string
) => {
  try {
    const response = await api.post(
      `/settings/symbol/subscriptions/${subscriptionId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("cancelAutoRenew error:", error);
    throw error;
  }
};

/**
 * Get auto-renew attempts history
 * @param token - JWT authentication token
 * @param subscriptionId - The subscription ID
 * @param limit - Number of attempts to fetch (default: 20)
 */
export const getAutoRenewAttempts = async (
  token: string,
  subscriptionId: string,
  limit: number = 20
) => {
  try {
    const response = await api.get(
      `/settings/symbol/subscriptions/${subscriptionId}/attempts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getAutoRenewAttempts error:", error);
    throw error;
  }
};
