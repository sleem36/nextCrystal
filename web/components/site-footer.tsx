import Link from "next/link";

export function SiteFooter() {
  const vkHref = "https://vk.com/crystal_motors";
  const telegramHref = "https://t.me/+GKMqd1w1BcdhOTEy";

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
          <Link className="text-slate-400 transition-colors hover:text-white" href="/about">
            О компании
          </Link>
          <Link className="text-slate-400 transition-colors hover:text-white" href="/reviews">
            Отзывы
          </Link>
          <Link className="text-slate-400 transition-colors hover:text-white" href="/contacts">
            Контакты
          </Link>
          <Link className="text-slate-400 transition-colors hover:text-white" href="/faq">
            FAQ
          </Link>
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
            href="https://aurora-auto.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aurora-auto.ru
          </a>
        </div>
      </div>
      <div className="container-wide border-t border-slate-800/70 pb-8 pt-4">
        <p className="text-sm font-semibold text-white">Мы в соцсетях</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={vkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-600 bg-transparent px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          >
            ВКонтакте
          </a>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-600 bg-transparent px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          >
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}
