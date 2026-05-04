type FactItem = {
  label: string;
  value: string;
};

const iconClass = "h-4 w-4 shrink-0 text-[color:var(--color-brand-accent)]";

function factIcon(label: string) {
  switch (label) {
    case "Год":
    case "Год выпуска":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 2.8v3.6M16 2.8v3.6M3.5 9.2h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8.5 13h2.8M12.7 13h2.8M8.5 16.2h2.8M12.7 16.2h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Пробег":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M4.5 15.5a7.5 7.5 0 1 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 15.5l3.7-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
          <path d="M7.2 13.6l.01-.01M16.8 13.6l.01-.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "Кузов":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M4.5 16.2l1.2-5.1c.3-1.1 1.2-1.8 2.3-1.8h2.2l1.3-2.5c.3-.5.8-.8 1.4-.8h5.2c.8 0 1.5.5 1.8 1.2l1.6 4.2c.2.4.2.8.2 1.3v1.5"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.2" cy="16.5" r="1.8" stroke="currentColor" strokeWidth="1.65" />
          <circle cx="18.2" cy="16.5" r="1.8" stroke="currentColor" strokeWidth="1.65" />
        </svg>
      );
    case "Двигатель":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M5 14.5V10h3.2l2-2.2h4.6l2.4 2.2H19v4.5h-2.2l-1.8 2.2H12l-2.4-2.2H5z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path d="M8.5 12.5h4M14 10.8v5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "Город":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M3.5 20.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="5" y="10" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.7" />
          <rect x="11.5" y="6.5" width="7.5" height="13.5" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.8 12.4h1.4M6.8 15.2h1.4M13.3 9.6h1.7M16.1 9.6h1.2M13.3 12.4h1.7M16.1 12.4h1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "КПП":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="12" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7.7V19M7.5 10.8h9M7.5 14.8h9M9.5 19h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "Привод":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="6.2" cy="17.2" r="2.3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17.8" cy="17.2" r="2.3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="9.3" r="2.1" stroke="currentColor" strokeWidth="1.7" />
          <path d="M7.8 15.8l2.7-4.4M16.2 15.8l-2.7-4.4M8.5 17.2h6.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "Руль":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="12" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.65" />
          <path d="M12 9.5V6M8.5 11h-2M15.5 11h2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
          <path d="M12 18.5v2.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
        </svg>
      );
    case "Владельцы":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="12" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.2 18.8c.7-2.7 3-4.4 5.8-4.4 2.8 0 5.1 1.7 5.8 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M4.2 11.7l3.1 1.1M19.8 11.7l-3.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Мощность":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M13 3.2L6.4 12.6h4.8l-1.1 8.2 7.5-10.8h-4.8l.2-6.8z" fill="currentColor" />
        </svg>
      );
    case "VIN":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <rect x="3.8" y="7" width="16.4" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.5 10.3h1.8l.9 3.5.9-3.5h1.8M12.6 10.3h2.1l1.2 3.5 1.2-3.5h1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}

export function CarFactsGrid({ facts }: { facts: FactItem[] }) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">Характеристики</h2>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        {facts.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <dt className="flex items-center gap-2 text-xs text-slate-500">
              {factIcon(item.label)}
              <span>{item.label}</span>
            </dt>
            <dd className="mt-1 pl-6 text-[15px] font-semibold leading-snug text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
