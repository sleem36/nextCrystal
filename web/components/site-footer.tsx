import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>© {new Date().getFullYear()} Crystal Motors. Все права защищены.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="hover:text-slate-700" href="/legal/privacy">
            Политика конфиденциальности
          </Link>
          <Link className="hover:text-slate-700" href="/legal/terms">
            Пользовательское соглашение
          </Link>
          <Link className="hover:text-slate-700" href="/legal/consent">
            Согласие на обработку ПДн
          </Link>
        </div>
      </div>
    </footer>
  );
}
