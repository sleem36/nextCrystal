import { ButtonHTMLAttributes } from "react";

type OptionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  label: string;
  multiple?: boolean;
};

export function OptionCard({
  selected,
  label,
  multiple = false,
  className = "",
  ...props
}: OptionCardProps) {
  const onKeyDown: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["onKeyDown"]> = (event) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || multiple) return;
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;

    const current = event.currentTarget;
    const group = current.closest('[role="radiogroup"]');
    if (!group) return;

    const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
    if (radios.length <= 1) return;

    const currentIndex = radios.indexOf(current);
    if (currentIndex < 0) return;
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + radios.length) % radios.length;
    const next = radios[nextIndex];
    event.preventDefault();
    next.focus();
    next.click();
  };

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={multiple ? 0 : selected ? 0 : -1}
      onKeyDown={onKeyDown}
      className={`flex min-h-12 items-center gap-2 rounded-[var(--radius-button)] border px-4 py-2 text-left text-sm leading-5 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 ${
        selected
          ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      } ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className={`inline-block h-4 w-4 shrink-0 border ${
          multiple ? "rounded-[4px]" : "rounded-full"
        } ${selected ? "border-white bg-white/25" : "border-slate-400 bg-white"}`}
      />
      <span className="line-clamp-2">{label}</span>
    </button>
  );
}
