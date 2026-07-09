"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ChangePasswordModal } from "./change-password-modal";

type PasswordChangeContextValue = {
  openPasswordChange: () => void;
};

const PasswordChangeContext = createContext<PasswordChangeContextValue | null>(null);

export function PasswordChangeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPasswordChange = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <PasswordChangeContext.Provider value={{ openPasswordChange }}>
      {children}
      <ChangePasswordModal open={open} onClose={close} />
    </PasswordChangeContext.Provider>
  );
}

export function usePasswordChange() {
  const ctx = useContext(PasswordChangeContext);
  if (!ctx) {
    throw new Error("usePasswordChange must be used within PasswordChangeProvider");
  }
  return ctx;
}
