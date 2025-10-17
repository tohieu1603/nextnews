"use client";

import { create } from "zustand";

export type AppNotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  readonly id: string;
  readonly title?: string;
  readonly message: string;
  readonly type: AppNotificationType;
  readonly createdAt: string;
  readonly isRead: boolean;
}

const createNotificationId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface NotificationCenterState {
  readonly notifications: AppNotification[];
  addNotification: (payload: {
    message: string;
    title?: string;
    type?: AppNotificationType;
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationCenterStore = create<NotificationCenterState>(
  (set) => ({
    notifications: [],
    addNotification: ({ message, title, type = "info" }) =>
      set((state) => {
        const next: AppNotification = {
          id: createNotificationId(),
          title,
          message,
          type,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        return { notifications: [next, ...state.notifications] };
      }),
    markAsRead: (id: string) =>
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        ),
      })),
    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true }
        ),
      })),
    removeNotification: (id: string) =>
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id
        ),
      })),
    clearNotifications: () => set({ notifications: [] }),
  })
);
