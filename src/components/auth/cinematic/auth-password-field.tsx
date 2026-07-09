"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthPasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
};

export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("mb-4", className)}>
        <label htmlFor={fieldId} className="auth-field-label">
          {label}
        </label>
        <div className="auth-field-wrap">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            className="auth-field-input pr-16"
            {...props}
          />
          {icon && <span className="auth-field-icon right-9">{icon}</span>}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:text-indigo-600"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="auth-field-error">{error}</p>}
      </div>
    );
  },
);
AuthPasswordField.displayName = "AuthPasswordField";
