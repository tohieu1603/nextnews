// import axios, { AxiosHeaders } from "axios";
// export const API_BASE = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";

// export function attachTokenFromStorage() {
//   if (typeof window === "undefined") return;
//   const t = localStorage.getItem("access_token");
//   if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
// }
// attachTokenFromStorage();

// export const api = axios.create({ baseURL: API_BASE, withCredentials: true });
import axios, { AxiosHeaders } from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
});

let coreApiAuthToken: string | null = null;

export const setCoreApiAuthToken = (token?: string | null) => {
  coreApiAuthToken = token ?? null;
  if (coreApiAuthToken) {
    api.defaults.headers.common.Authorization = `Bearer ${coreApiAuthToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getCoreApiAuthToken = () => coreApiAuthToken;

api.interceptors.request.use(
  (config) => {
    if (coreApiAuthToken) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : AxiosHeaders.from(config.headers ?? {});

      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${coreApiAuthToken}`);
      }

      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getProfile = async () => {
  const res = await api.get("/api/auth/profile"); 
  return res.data;
};
