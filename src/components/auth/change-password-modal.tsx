"use client";

import { KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ChangePasswordForm } from "./change-password-form";

export function ChangePasswordModal({
  open,
  required,
  onClose,
}: {
  open: boolean;
  required?: boolean;
  onClose?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose ?? (() => {})}
      closable={!required}
      title={required ? "Set your new password" : "Change password"}
      description="Enter your current password, then choose a new one. Skip this anytime if you prefer your email password."
      icon={KeyRound}
      size="sm"
    >
      <div className="py-2">
        <ChangePasswordForm onSuccess={onClose} />
      </div>
    </Modal>
  );
}
