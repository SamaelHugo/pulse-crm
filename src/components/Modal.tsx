"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-base shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Reusable form field ──────────────────────────────────

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function FormInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField label={label} error={error}>
      <input
        {...props}
        className={`w-full rounded-lg border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none ${
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-accent/40"
        }`}
      />
    </FormField>
  );
}

export function FormSelect({
  label,
  error,
  options,
  ...props
}: {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FormField label={label} error={error}>
      <select
        {...props}
        className={`w-full rounded-lg border bg-bg-card px-3 py-2 text-sm text-text-primary transition-colors duration-150 focus:outline-none ${
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-accent/40"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
