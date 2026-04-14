import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#1a1a1a] text-slate-400">
      <div className="container-wide flex w-full flex-col gap-4 py-8 text-xs md:flex-row md:items-start md:justify-between md:text-sm">
        <div className="space-y-1">
          <p className="font-semibold text-white">Aurora Auto</p>
          <p className="max-w-sm text-slate-500">
            Надёжные автомобили с пробегом. Условия на странице носят информационный характер.
          </p>
          <p className="text-slate-600">© {new Date().getFullYear()} Aurora Auto</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
          <Link className="text-slate-400 transition-colors hover:text-white" href="/legal/privacy">
            Политика конфиденциальности
          </Link>
          <Link className="text-slate-400 transition-colors hover:text-white" href="/legal/terms">
            Пользовательское соглашение
          </Link>
          <Link className="text-slate-400 transition-colors hover:text-white" href="/legal/consent">
            Согласие на обработку ПДн
          </Link>
          <a
            className="text-slate-400 transition-colors hover:text-white"
            href="https://crystal-motors.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            crystal-motors.ru
          </a>
        </div>
      </div>
    </footer>
  );
}
