// import axios from "axios";
// export const API_BASE = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";

// export function attachTokenFromStorage() {
//   if (typeof window === "undefined") return;
//   const t = localStorage.getItem("access_token");
//   if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
// }
// attachTokenFromStorage();

// export const api = axios.create({ baseURL: API_BASE, withCredentials: true });
import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
});

export const getProfile = async () => {
  const res = await api.get("/api/auth/profile"); 
  return res.data;
};
