"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Renders below the scroll area (e.g. Cancel / Save) so actions stay visible. */
  footer?: React.ReactNode;
  width?: string;
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "w-full max-w-lg",
}: SlidePanelProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 ${width} bg-[var(--mh-surface)] shadow-[var(--mh-shadow-panel)] transform transition-transform duration-300 ease-out flex flex-col border-l border-[var(--mh-border)] overflow-x-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-4 md:px-6 pb-3 md:pb-4 border-b border-[var(--mh-border)] shrink-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }}
        >
          <div>
            <h2 className="text-[16px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--mh-hover-overlay)] text-[var(--mh-text-subtle)] hover:text-[var(--mh-text-muted)] transition-colors -mr-1.5 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {footer != null ? (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">{children}</div>
        )}
      </div>
    </>
  );
}

/* ── Form helpers ─────────────────────────────────────────────── */

export function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.1em] text-[var(--mh-text-subtle)] uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label className="text-[12px] font-semibold text-[var(--mh-text-muted)]">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text)] focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all placeholder:text-[var(--mh-text-faint)] ${props.className || ""}`}
      style={props.style}
    />
  );
}

export function FormTextarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text)] focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all placeholder:text-[var(--mh-text-faint)] resize-none ${props.className || ""}`}
      style={props.style}
    />
  );
}

export function FormSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text)] focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all ${props.className || ""}`}
      style={props.style}
    >
      {children}
    </select>
  );
}

export function FormActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shrink-0 bg-[var(--mh-surface)] border-t border-[var(--mh-border)] px-6 py-4 flex items-center justify-end gap-2.5">
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
      style={props.style}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-5 py-2 text-[13px] font-semibold text-[var(--mh-text-muted)] bg-transparent border border-[var(--mh-border)] rounded-[4px] hover:bg-[var(--mh-hover-overlay)] hover:text-[var(--mh-text)] transition-colors ${props.className || ""}`}
      style={props.style}
    >
      {children}
    </button>
  );
}
