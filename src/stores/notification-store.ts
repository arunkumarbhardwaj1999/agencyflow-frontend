import { create } from "zustand";
import { persist } from "zustand/middleware";

type NotificationPrefs = {
  sound: boolean;
  desktop: boolean;
  setSound: (on: boolean) => void;
  setDesktop: (on: boolean) => void;
};

export const useNotificationStore = create<NotificationPrefs>()(
  persist(
    (set) => ({
      sound: true,
      desktop: false,
      setSound: (on) => set({ sound: on }),
      setDesktop: (on) => set({ desktop: on }),
    }),
    { name: "agencyflow-notification-prefs" },
  ),
);
