import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <textarea
        className={`min-h-28 rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-rose-300 focus-visible:ring-rose-300"
            : "border-slate-300 focus-visible:ring-[color:var(--color-brand-accent)]"
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
