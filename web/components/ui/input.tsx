import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[color:var(--color-brand-muted)]">
      <span className="font-medium">{label}</span>
      <input
        className={`h-12 rounded-xl border bg-[color:var(--surface-card)] px-4 text-sm text-[color:var(--color-brand-primary)] transition placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background-soft-start)] disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-rose-300 focus-visible:ring-rose-300"
            : "border-[color:var(--border-soft)] focus-visible:ring-[color:var(--color-brand-accent)]"
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
