"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("mb-4", className)}>
        <label htmlFor={fieldId} className="auth-field-label">
          {label}
        </label>
        <div className="auth-field-wrap">
          <input ref={ref} id={fieldId} className="auth-field-input" {...props} />
          {icon && <span className="auth-field-icon">{icon}</span>}
        </div>
        {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="auth-field-error">{error}</p>}
      </div>
    );
  },
);
AuthField.displayName = "AuthField";
