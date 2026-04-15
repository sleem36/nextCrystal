import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--color-brand-accent)] text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] hover:-translate-y-[1px] hover:bg-[color:var(--color-brand-accent-hover)] hover:shadow-[0_8px_18px_rgba(0,118,234,0.28)] focus-visible:ring-[color:var(--color-brand-accent)] transition-all duration-300 ease-out",
  secondary:
    "bg-white text-[color:var(--color-brand-primary)] border border-slate-300 hover:-translate-y-[1px] hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_6px_14px_rgba(15,23,42,0.08)] focus-visible:ring-[color:var(--color-brand-primary)] transition-all duration-300 ease-out",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
