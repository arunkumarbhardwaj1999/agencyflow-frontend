"use client";

import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error" | "info";

export type AppToast = {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
};

type ToastState = {
  toasts: AppToast[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

const MAX_TOASTS = 4;
const TOAST_MS = 5000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = "default") => {
    const text = message.trim();
    if (!text) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => {
      const withoutDup = state.toasts.filter((t) => t.message !== text);
      return {
        toasts: [{ id, message: text, variant, createdAt: Date.now() }, ...withoutDup].slice(
          0,
          MAX_TOASTS,
        ),
      };
    });
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, TOAST_MS);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, variant: ToastVariant = "default") {
  useToastStore.getState().push(message, variant);
}
