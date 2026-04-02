import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(2,6,23,0.06)] ${className}`}
      {...props}
    />
  );
}
