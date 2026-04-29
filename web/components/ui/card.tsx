import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] shadow-[0_2px_8px_rgba(15,23,42,0.06)] ${className}`}
      {...props}
    />
  );
}
