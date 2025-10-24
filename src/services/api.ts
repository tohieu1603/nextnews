import axios, { AxiosHeaders } from "axios";
import { toast } from "react-hot-toast";
import {
  CreateNotificationEndpointPayload,
  EnableAutoRenewRequest,
  NotificationEndpoint,
  UpdateNotificationEndpointPayload,
  VerifyNotificationEndpointPayload,
} from "@/types";
const API_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}/api`;
// const API_URL = "https://payment.operis.vn/api";
console.log("API_URLLLLL", API_URL);
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let serviceApiAuthToken: string | null = null;

export const setServiceApiAuthToken = (token?: string | null) => {
  serviceApiAuthToken = token ?? null;
  if (serviceApiAuthToken) {
    api.defaults.headers.common.Authorization = `Bearer ${serviceApiAuthToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getServiceApiAuthToken = () => serviceApiAuthToken;

api.interceptors.request.use(
  (config) => {
    if (serviceApiAuthToken) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : AxiosHeaders.from(config.headers ?? {});

      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${serviceApiAuthToken}`);
      }

      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let lastErrorMessage = "";
let lastErrorTime = 0;
let errorCount = 0;
let hasShownServerError = false;


api.interceptors.response.use(
  (response) => {
    // ✅ Nếu response có message success thì hiển thị luôn
    if (response?.data?.message && response?.status >= 200 && response?.status < 300) {
      toast.success(response.data.message, {
        icon: "✅",
      });
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Đã xảy ra lỗi, vui lòng thử lại.";

    // ⛔ Chặn spam lỗi trùng trong vòng 2 giây
    const now = Date.now();
    if (message === lastErrorMessage && now - lastErrorTime < 2000) {
      return Promise.reject(error);
    }

    lastErrorMessage = message;
    lastErrorTime = now;

    // 🧩 Xử lý theo status code
    if (status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    } else if (status === 403) {
      toast.error("Bạn không có quyền thực hiện hành động này!");
    } else if (status === 400) {
      toast.error("Dữ liệu gửi lên không hợp lệ!");
    } else if (status === 404) {
      toast.error("Không tìm thấy dữ liệu!");
    } else if (status === 500) {
      // 🔁 Gom lỗi 500 nếu có nhiều API cùng lỗi
      errorCount++;
      if (!hasShownServerError) {
        hasShownServerError = true;
        setTimeout(() => {
          toast.error(
            errorCount > 1
              ? `${errorCount} API gặp lỗi máy chủ, vui lòng thử lại sau!`
              : "Lỗi máy chủ, vui lòng thử lại sau!"
          );
          errorCount = 0;
          hasShownServerError = false;
        }, 1000);
      }
    } else {
      toast.error(`(${status || "??"}) ${message}`);
    }

    return Promise.reject(error);
  }
);

export interface EconomicCalendarApiEvent {
  date: string;
  time: string;
  all_day: boolean;
  country: string;
  country_code: string;
  currency: string;
  importance: number;
  title: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  source_url: string | null;
  event_id: string;
  event_datetime: string;
  category: string;
}
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
    const response = await api.get(`/stocks/symbols/by-name/${code}?`);
    console.log("✅ getNameData response:", response);
    if (!response?.data) {
      return { message: "Đang cập nhật dữ liệu…" };
    }
    return response.data;
  } catch (error) {
    console.error("getNameData error:", error);
    return { message: "Đang cập nhật dữ liệu…" };
  }
};

export const getCompanyDetails = async (symbolId: number): Promise<Record<string, unknown>> => {
  console.log("🔍 getCompanyDetails called with symbolId:", symbolId);
  const endpoints = [
    { key: "symbolData", url: `/stocks/symbols/${symbolId}` },
    { key: "balanceData", url: `/calculate/balances/${symbolId}` },
    { key: "incomeData", url: `/calculate/incomes/${symbolId}` },
    { key: "cashflowData", url: `/calculate/cashflows/${symbolId}` },
    { key: "ratiosData", url: `/calculate/ratios/${symbolId}` },
    { key: "bots", url: `/symbols/${symbolId}/bots` },

  ];

  console.log("🔍 API endpoints:", endpoints.map(e => e.url));

  const results = await Promise.allSettled(
    endpoints.map((ep) => api.get(ep.url))
  );

  const data: Record<string, unknown> = {};

  results.forEach((res, i) => {
    if (res.status === "fulfilled" && res.value?.data) {
      data[endpoints[i].key] = res.value.data;
      console.log(`✅ ${endpoints[i].key}:`, Array.isArray(res.value.data) ? `${res.value.data.length} items` : 'object');
    } else {
      const error = res.status === "rejected" ? res.reason : "Unknown error";
      // Only log if it's not a 404 (expected for missing data)
      if (error?.response?.status !== 404) {
        console.warn(`🔍 Failed to fetch ${endpoints[i].key}:`, {
          url: endpoints[i].url,
          status: error?.response?.status,
          message: error?.message,
        });
      }
      data[endpoints[i].key] = { message: "Đang cập nhật dữ liệu…" };
    }
  });

  console.log("🔍 Final data:", data);
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
 * Enable auto-renew for a symbol/license
 * @param token - JWT authentication token
 * @param payload - EnableAutoRenewRequest body
 */
export const enableAutoRenewSubscription = async (
  token: string,
  payload: EnableAutoRenewRequest
) => {
  try {
    const body: Record<string, unknown> = {
      ...payload,
      payment_method: payload.payment_method ?? "wallet",
    };

    if (body.price !== undefined && body.price !== null) {
      body.price = body.price.toString();
    }

    const response = await api.post(
      "/settings/symbol/subscriptions/enable",
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("enableAutoRenewSubscription error:", error);
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
type EconomicCalendarResponse =
  | EconomicCalendarApiEvent[]
  | {
    value?: EconomicCalendarApiEvent[];
    events?: EconomicCalendarApiEvent[];
    data?: EconomicCalendarApiEvent[];
    results?: EconomicCalendarApiEvent[];
    Count?: number;
    count?: number;
    total?: number;
  };

const pickCalendarEvents = (
  payload: EconomicCalendarResponse | undefined
): { events: EconomicCalendarApiEvent[]; total: number } => {
  if (!payload) {
    return { events: [], total: 0 };
  }

  if (Array.isArray(payload)) {
    return { events: payload, total: payload.length };
  }

  const events =
    (Array.isArray(payload.value) && payload.value) ||
    (Array.isArray(payload.events) && payload.events) ||
    (Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload.results) && payload.results) ||
    [];

  const total =
    typeof payload.Count === "number"
      ? payload.Count
      : typeof payload.count === "number"
        ? payload.count
        : typeof payload.total === "number"
          ? payload.total
          : events.length;

  return { events, total };
};

export const getEconomicCalendar = async (
  date_from: string,
  date_to: string
) => {
  try {
    const response = await api.get<EconomicCalendarResponse>(`/calendar/`, {
      params: { date_from, date_to },
    });

    const { events, total } = pickCalendarEvents(response?.data);

    if (!Array.isArray(events) || events.length === 0) {
      return { message: "Không có dữ liệu lịch kinh tế." };
    }

    return {
      events,
      total,
    };
  } catch (error) {
    console.error("getEconomicCalendar Lịch error:", error);
    return { message: "Lỗi khi tải lịch kinh tế." };
  }
};
// === NOTIFICATION API ===

const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getNotificationEndpoints = async (
  token: string
): Promise<NotificationEndpoint[]> => {
  try {
    const response = await api.get(
      "/notifications/endpoints",
      withAuth(token)
    );
    return response.data;
  } catch (error) {
    console.error("getNotificationEndpoints error:", error);
    throw error;
  }
};

export const createNotificationEndpoint = async (
  token: string,
  payload: CreateNotificationEndpointPayload
): Promise<NotificationEndpoint> => {
  try {
    const response = await api.post(
      "/notifications/endpoints",
      payload,
      withAuth(token)
    );
    return response.data;
  } catch (error) {
    console.error("createNotificationEndpoint error:", error);
    throw error;
  }
};
export const updateNotificationEndpoint = async (
  token: string,
  endpointId: string,
  payload: UpdateNotificationEndpointPayload
): Promise<NotificationEndpoint> => {
  try {
    const response = await api.patch(
      `/notifications/endpoints/${endpointId}`,
      payload,
      withAuth(token)
    );
    return response.data;
  } catch (error) {
    console.error("updateNotificationEndpoint error:", error);
    throw error;
  }
};

export const deleteNotificationEndpoint = async (
  token: string,
  endpointId: string
): Promise<void> => {
  try {
    await api.delete(
      `/notifications/endpoints/${endpointId}`,
      withAuth(token)
    );
  } catch (error) {
    console.error("deleteNotificationEndpoint error:", error);
    throw error;
  }
};
export const verifyNotificationEndpoint = async (
  token: string,
  endpointId: string,
  payload: VerifyNotificationEndpointPayload
): Promise<NotificationEndpoint> => {
  try {
    const response = await api.post(
      `/notifications/endpoints/${endpointId}/verify`,
      payload,
      withAuth(token)
    );
    return response.data;
  } catch (error) {
    console.error("verifyNotificationEndpoint error:", error);
    throw error;
  }
};
// === AUTHENTICATION API ===
/**
 * Get Google OAuth authentication URL
 * @returns Object containing auth_url
 */
export const getGoogleAuthUrl = async () => {
  try {
    // const response = await api.get("/auth/google/auth-url?state=a&redirect_uri=http://localhost:3001/auth/google/callback", {
      const response = await api.get("/auth/google/auth-url?state=a&redirect_uri=https://devnews.togogo.vn/auth/google/callback",{
    // const response = await api.get("/auth/google/auth-url?state=",{  

    withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("getGoogleAuthUrl error:", error);
    throw error;
  }
};

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @param rememberMe - Remember user login
 * @returns Authentication response with token
 */
export const loginWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = false
) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });
    return response.data;
  } catch (error) {
    console.error("loginWithEmail error:", error);
    throw error;
  }
};

export interface BotTrade {
  id: string;
  trans_id: number;
  trade_type: string;
  direction: string;
  price: string;
  entry_date: string;
  exit_price: string;
  stop_loss: string;
  take_profit: string;
  position_size: number;
  profit: number;
  max_duration: number;
  win_loss_status: string;
  action: string;
  created_at: string;
}

export interface SymbolBotSummary {
  id: number;
  name: string;
  bot_type: string;
  bot_type_display: string;
  symbol_id: number;
  symbol_name: string;
  trades?: BotTrade[];
}

export interface TradingBotSuggestionResponse {
  symbol_id: number;
  symbol_name: string;
  bots: SymbolBotSummary[];
}

const resolveSymbolParam = (symbol: number | string): string => {
  if (typeof symbol === "number") {
    return String(symbol);
  }
  const trimmed = symbol.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export const getSymbolBots = async (
  symbol: number | string,
  token?: string | null
): Promise<TradingBotSuggestionResponse | { message: string }> => {
  try {
    const symbolParam = resolveSymbolParam(symbol);
    if (!symbolParam) {
      return { message: "Symbol is required." };
    }

    const resolvedToken = token ?? getServiceApiAuthToken();

    if (!resolvedToken) {
      return { message: "Bạn cần đăng nhập để xem bot." };
    }

    const response = await api.get<TradingBotSuggestionResponse>(
      `/symbols/${symbolParam}/bots`,
      {
        ...withAuth(resolvedToken),
        withCredentials: true,
      }
    );

    if (!response?.data || !Array.isArray(response.data.bots)) {
      return { message: "Dang cap nhat du lieu." };
    }

    return response.data;
  } catch (error) {
    console.error("getSymbolBots error:", error);
    return { message: "Dang cap nhat du lieu." };
  }
};

