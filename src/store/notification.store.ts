"use client";

import { create } from "zustand";
import {
  CreateNotificationEndpointPayload,
  NotificationEndpoint,
  UpdateNotificationEndpointPayload,
  VerifyNotificationEndpointPayload,
} from "@/types";
import {
  createNotificationEndpoint,
  deleteNotificationEndpoint,
  getNotificationEndpoints,
  updateNotificationEndpoint,
  verifyNotificationEndpoint,
} from "@/services/api";

const extractErrorFromPayload = (payload: unknown): string | undefined => {
  if (!payload) {
    return undefined;
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const prioritizedKeys = ["error", "detail", "message"];
    for (const key of prioritizedKeys) {
      const value = data[key];
      if (typeof value === "string") {
        return value;
      }
    }
  }
  return undefined;
};

const toErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: unknown };
      message?: string;
    };

    return (
      extractErrorFromPayload(err.response?.data) ||
      (typeof err.message === "string" ? err.message : undefined) ||
      "Đã xảy ra lỗi không xác định"
    );
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return "Đã xảy ra lỗi không xác định";
};

const isNotificationEndpointResponse = (
  data: unknown
): data is NotificationEndpoint => {
  if (!data || typeof data !== "object") {
    return false;
  }
  return "endpoint_id" in data;
};

interface NotificationState {
  endpoints: NotificationEndpoint[];
  isFetching: boolean;
  isMutating: boolean;
  error: string | null;
  fetchEndpoints: (token: string) => Promise<NotificationEndpoint[]>;
  registerEndpoint: (
    token: string,
    payload: CreateNotificationEndpointPayload
  ) => Promise<NotificationEndpoint>;
  editEndpoint: (
    token: string,
    endpointId: string,
    payload: UpdateNotificationEndpointPayload
  ) => Promise<NotificationEndpoint>;
  removeEndpoint: (token: string, endpointId: string) => Promise<void>;
  triggerVerify: (
    token: string,
    endpointId: string,
    payload: VerifyNotificationEndpointPayload
  ) => Promise<NotificationEndpoint>;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  endpoints: [],
  isFetching: false,
  isMutating: false,
  error: null,

  fetchEndpoints: async (token: string) => {
    set({ isFetching: true, error: null });
    try {
      const endpoints = await getNotificationEndpoints(token);
      set({ endpoints, isFetching: false });
      return endpoints;
    } catch (error) {
      set({ isFetching: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  registerEndpoint: async (token, payload) => {
    set({ isMutating: true, error: null });
    try {
      const endpoint = await createNotificationEndpoint(token, payload);
      set((state) => ({
        endpoints: [...state.endpoints, endpoint],
        isMutating: false,
      }));
      return endpoint;
    } catch (error) {
      set({ isMutating: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  editEndpoint: async (token, endpointId, payload) => {
    set({ isMutating: true, error: null });
    try {
      const updated = await updateNotificationEndpoint(
        token,
        endpointId,
        payload
      );
      set((state) => ({
        endpoints: state.endpoints.map((endpoint) =>
          endpoint.endpoint_id === updated.endpoint_id ? updated : endpoint
        ),
        isMutating: false,
      }));
      return updated;
    } catch (error) {
      set({ isMutating: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  removeEndpoint: async (token, endpointId) => {
    set({ isMutating: true, error: null });
    try {
      await deleteNotificationEndpoint(token, endpointId);
      set((state) => ({
        endpoints: state.endpoints.filter(
          (endpoint) => endpoint.endpoint_id !== endpointId
        ),
        isMutating: false,
      }));
    } catch (error) {
      set({ isMutating: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  triggerVerify: async (token, endpointId, payload) => {
    set({ isMutating: true, error: null });
    try {
      const result = await verifyNotificationEndpoint(
        token,
        endpointId,
        payload
      );
      set((state) => ({
        endpoints: isNotificationEndpointResponse(result)
          ? state.endpoints.map((endpoint) =>
              endpoint.endpoint_id === result.endpoint_id ? result : endpoint
            )
          : state.endpoints,
        isMutating: false,
      }));
      return result;
    } catch (error) {
      set({ isMutating: false, error: toErrorMessage(error) });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ endpoints: [], error: null, isFetching: false, isMutating: false }),
}));
