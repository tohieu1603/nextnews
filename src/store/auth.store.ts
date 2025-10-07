import { UserProfile, WalletInfo, TopUpIntent, TopUpStatus, PaymentHistoryResponse, SymbolOrderResponse, SepayPaymentIntent } from "@/types";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = "http://127.0.0.1:8000";

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  access_token: string | null;
  refresh_token: string | null;
  wallet: WalletInfo | null;
  // login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  // Wallet methods
  fetchWallet: () => Promise<WalletInfo | null>;
  createTopUp: (amount: number, bankCode?: string) => Promise<TopUpIntent | null>;
  checkTopUpStatus: (intentId: string) => Promise<TopUpStatus | null>;
  fetchPaymentHistory: (page?: number, limit?: number, status?: string) => Promise<PaymentHistoryResponse | null>;
  // Symbol purchase methods
  purchaseSymbol: (params: {
    symbolId: number;
    price: number;
    licenseDays: number;
    paymentMethod: "wallet" | "sepay_transfer";
    description: string;
  }) => Promise<SymbolOrderResponse | null>;
  paySymbolOrderWithSepay: (orderId: string) => Promise<SepayPaymentIntent | null>;
  paySymbolOrderWithTopup: (orderId: string) => Promise<SepayPaymentIntent | null>;
  checkPaymentIntentStatus: (intentId: string) => Promise<any | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      user: null,
      wallet: null,
      isLoggedIn: false,

      // login: async (email: string, password: string) => {
      //   // Simulate API call
      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      //   // Mock authentication - in real app, this would call your backend
      //   if (email === "khoa.ndk.nene@gmail.com" && password === "123456") {
      //     set({
      //       isLoggedIn: true,
      //       user: mockUser,
      //     });
      //     return true;
      //   }
      //   return false;
      // },
      loginWithGoogle: async (code: string) => {
        try {
          // Decode URL-encoded code if needed
          const decodedCode = decodeURIComponent(code);
          console.log("📤 Sending code to BE:", decodedCode);

          const { data } = await axios.post(
            `${API_BASE_URL}/api/auth/google/login`,
            { code: decodedCode },
            { withCredentials: true }
          );

          const access =
            data?.access_token ||
            data?.token ||
            data?.id_token ||
            data?.data?.access_token;

          const refresh = data?.refresh_token || data?.data?.refresh_token;

          const user = data?.user || data?.data?.user || null;

          if (!access || !user) return false;

          axios.defaults.headers.common.Authorization = `Bearer ${access}`;

          set({
            access_token: access,
            refresh_token: refresh,
            user,
            isLoggedIn: true,
          });

          return true;
        } catch (err) {
          console.error("❌ Lỗi đăng nhập Google:", err);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          wallet: null,
          isLoggedIn: false,
        });
        delete axios.defaults.headers.common.Authorization;
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // Wallet methods
      fetchWallet: async () => {
        try {
          const token = get().access_token;
          if (!token) {
            console.warn("⚠️ No access token for wallet fetch");
            return null;
          }

          const { data } = await axios.get<WalletInfo>(
            `${API_BASE_URL}/api/sepay/wallet/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          set({ wallet: data });
          console.log("✅ Wallet fetched:", data);
          return data;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.warn("⚠️ Wallet API not available (404). Backend may not be running.");
          } else {
            console.error("❌ Lỗi lấy thông tin ví:", err);
          }
          return null;
        }
      },

      createTopUp: async (amount: number, bankCode = "BIDV") => {
        try {
          const token = get().access_token;
          if (!token) {
            console.error("❌ No access token");
            return null;
          }

          const { data } = await axios.post<TopUpIntent>(
            `${API_BASE_URL}/api/sepay/wallet/topup/`,
            {
              amount,
              currency: "VND",
              bank_code: bankCode,
              expires_in_minutes: 60,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("✅ Top-up created:", data.intent_id);
          return data;
        } catch (err) {
          console.error("❌ Lỗi tạo yêu cầu nạp tiền:", err);
          return null;
        }
      },

      checkTopUpStatus: async (intentId: string) => {
        try {
          const token = get().access_token;
          if (!token) {
            console.error("❌ No access token");
            return null;
          }

          const { data } = await axios.get<TopUpStatus>(
            `${API_BASE_URL}/api/sepay/wallet/topup/${intentId}/status`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // If succeeded, refresh wallet
          if (data.status === "succeeded") {
            await get().fetchWallet();
          }

          return data;
        } catch (err) {
          console.error("❌ Lỗi kiểm tra trạng thái nạp tiền:", err);
          return null;
        }
      },

      fetchPaymentHistory: async (page = 1, limit = 10, status = "succeeded") => {
        try {
          const token = get().access_token;
          if (!token) {
            console.error("❌ No access token");
            return null;
          }

          const { data } = await axios.get<PaymentHistoryResponse>(
            `${API_BASE_URL}/api/sepay/payments/user`,
            {
              params: { page, limit, status },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return data;
        } catch (err) {
          console.error("❌ Lỗi lấy lịch sử thanh toán:", err);
          return null;
        }
      },

      // Symbol purchase methods
      purchaseSymbol: async (params) => {
        try {
          const token = get().access_token;
          if (!token) {
            console.warn("⚠️ No access token for symbol purchase");
            return null;
          }

          const { data } = await axios.post<SymbolOrderResponse>(
            `${API_BASE_URL}/api/sepay/symbol/orders/`,
            {
              items: [
                {
                  symbol_id: params.symbolId,
                  price: params.price,
                  license_days: params.licenseDays,
                  metadata: {},
                  auto_renew: false,
                  auto_renew_price: null,
                  auto_renew_cycle_days: null,
                },
              ],
              payment_method: params.paymentMethod,
              description: params.description,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("✅ Symbol order created:", data.order_id);
          return data;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.warn("⚠️ Symbol purchase API not available (404).");
          } else {
            console.error("❌ Lỗi mua Symbol:", err);
          }
          return null;
        }
      },

      paySymbolOrderWithSepay: async (orderId: string) => {
        try {
          const token = get().access_token;
          if (!token) {
            console.warn("⚠️ No access token");
            return null;
          }

          const { data } = await axios.post<SepayPaymentIntent>(
            `${API_BASE_URL}/api/sepay/symbol/orders/${orderId}/pay-sepay`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("✅ SePay payment intent created:", data.intent_id);
          return data;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.warn("⚠️ Pay with SePay API not available (404).");
          } else {
            console.error("❌ Lỗi thanh toán SePay:", err);
          }
          return null;
        }
      },

      paySymbolOrderWithTopup: async (orderId: string) => {
        try {
          const token = get().access_token;
          if (!token) {
            console.warn("⚠️ No access token");
            return null;
          }

          const { data } = await axios.post<SepayPaymentIntent>(
            `${API_BASE_URL}/api/sepay/symbol/orders/${orderId}/topup-sepay`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("✅ SePay topup intent created:", data.intent_id);
          return data;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            console.warn("⚠️ Topup with SePay API not available (404).");
          } else {
            console.error("❌ Lỗi tạo topup SePay:", err);
          }
          return null;
        }
      },

      checkPaymentIntentStatus: async (intentId: string) => {
        try {
          const token = get().access_token;
          if (!token) {
            console.warn("⚠️ No access token");
            return null;
          }

          const { data } = await axios.get(
            `${API_BASE_URL}/api/sepay/intent/${intentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000, // 10s timeout
            }
          );

          return data;
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 404) {
              console.warn("⚠️ Payment intent not found (404).");
            } else if (status === 500) {
              console.warn("⚠️ Backend error checking intent (500). Will retry...");
            } else {
              console.error("❌ Lỗi kiểm tra trạng thái payment intent:", err.message);
            }
          } else {
            console.error("❌ Network error:", err);
          }
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        user: state.user,
        wallet: state.wallet,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
