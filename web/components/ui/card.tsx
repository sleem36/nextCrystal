import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}
      {...props}
    />
  );
}
