import Link from "next/link";

const STATS = [
  { value: "12+", label: "лет на рынке подборов и продаж" },
  { value: "18 000+", label: "довольных клиентов" },
  { value: "9 500+", label: "автомобилей проверено и продано" },
  { value: "15", label: "городов присутствия сети" },
  { value: "4,9", label: "средняя оценка после сделки" },
] as const;

const ADVANTAGES = [
  {
    title: "Своя программа trade‑in",
    text: "Оцениваем ваш автомобиль по рынку и дилерским стандартам, оформляем выкуп и зачёт без лишних визитов.",
    icon: "swap",
  },
  {
    title: "Кредит и страхование",
    text: "Помогаем подобрать программы банков-партнёров и полис КАСКО/ОСАГО под ваш сценарий эксплуатации.",
    icon: "credit",
  },
  {
    title: "Гарантия на проверку",
    text: "Фиксируем результаты диагностики и юридической экспертизы — вы понимаете состояние авто до подписания договора.",
    icon: "shield",
  },
  {
    title: "Тест‑драйв по записи",
    text: "Бесплатный выезд на дорогу с инженером или менеджером — без давления и навязанных опций.",
    icon: "wheel",
  },
  {
    title: "Юридическая чистота",
    text: "Проверяем ограничения, залоги, историю ДТП и пробега; сопровождаем сделку до постановки на учёт.",
    icon: "doc",
  },
  {
    title: "Прозрачная история авто",
    text: "Сводим данные из независимых источников и собственной диагностики в понятный отчёт для покупателя.",
    icon: "chart",
  },
] as const;

const TEAM = [
  { name: "Алексей Морозов", role: "Генеральный директор", initials: "АМ" },
  { name: "Елена Сафронова", role: "Руководитель отдела продаж", initials: "ЕС" },
  { name: "Дмитрий Волков", role: "Ведущий менеджер по подбору", initials: "ДВ" },
  { name: "Игорь Панин", role: "Мастер‑приёмщик сервиса", initials: "ИП" },
] as const;

const CERTS = [
  "Официальный партнёр диагностики",
  "Сертификат соответствия процессам продаж",
  "Благодарность от ассоциации автодилеров",
  "Партнёр страховой программы КАСКО",
  "Диплом за клиентский сервис 2024",
] as const;

const REVIEWS = [
  {
    name: "Марина К.",
    city: "Барнаул",
    text: "Купила кроссовер через trade‑in: оценка честная, документы собрали за один день, на связи были до постановки на учёт.",
    date: "март 2025",
  },
  {
    name: "Сергей Н.",
    city: "Новосибирск",
    text: "Искал авто с «чистой» историей — показали отчёты, пустили на подъёмник. Без навязанных допов, всё по делу.",
    date: "январь 2025",
  },
  {
    name: "Ольга Т.",
    city: "Омск",
    text: "Оформили кредит и страховку удалённо, приехала только на выдачу. Менеджер сопровождал на каждом шаге.",
    date: "декабрь 2024",
  },
] as const;

const BRANCHES = [
  "Барнаул — Павловский тракт, 251В",
  "Новосибирск — ул. Богдана Хмельницкого, 100",
  "Омск — ул. 10 лет Октября, 43",
  "Красноярск — ул. Авиаторов, 19",
  "Екатеринбург — ул. Машинная, 31",
] as const;

function AdvantageIcon({ name }: { name: (typeof ADVANTAGES)[number]["icon"] }) {
  const common = "h-10 w-10 shrink-0 text-[color:var(--color-brand-accent)]";
  switch (name) {
    case "swap":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M7 4v16M7 4l3 3M7 4L4 7M17 20V4M17 20l3-3M17 20l-3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "credit":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" strokeLinejoin="round" />
        </svg>
      );
    case "wheel":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
      );
    case "doc":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "chart":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function AboutPageContent() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative isolate min-h-[280px] overflow-hidden md:min-h-[380px]">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-[url('/hero/poster.svg')] bg-cover bg-center"
            role="img"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[var(--hero-overlay-top)] via-[var(--hero-overlay-mid)] to-[var(--hero-overlay-bottom)]"
            aria-hidden
          />
          <div className="hero-grain absolute inset-0" aria-hidden />
        </div>
        <div className="container-wide relative flex min-h-[280px] flex-col justify-end gap-3 py-10 md:min-h-[380px] md:py-14">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">Aurora Auto</p>
          <h1 className="hero-text-shadow max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            О компании
          </h1>
          <p className="hero-text-shadow max-w-2xl text-base text-white/95 md:text-lg">
            Сеть автомобилей с пробегом, где важны честная диагностика, прозрачные условия сделки и сервис без сюрпризов
            после покупки.
          </p>
        </div>
      </section>

      <div className="container-wide flex-1 space-y-12 py-10 md:space-y-16 md:py-14">
        {/* Stats */}
        <section aria-labelledby="about-stats-heading">
          <h2 id="about-stats-heading" className="sr-only">
            Ключевые показатели
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STATS.map((s) => (
              <li
                key={s.label}
                className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <p className="text-2xl font-semibold text-[color:var(--color-brand-accent)] md:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-slate-600 md:text-sm">{s.label}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* History + mission */}
        <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="about-story-heading">
          <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 id="about-story-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)]">
              История и развитие
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Aurora Auto вырос из небольшого отдела подбора автомобилей с пробегом. Мы накопили экспертизу в
              диагностике, оценке рисков и сопровождении сделок — и масштабировали процессы на несколько регионов,
              сохраняя единый стандарт проверки и общения с клиентом.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Сегодня команда объединяет инженеров, юристов и менеджеров, которые говорят на одном языке с покупателем:
              без воды, с цифрами и фактами по каждому лоту.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Миссия</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Сделать покупку автомобиля с пробегом предсказуемой: чтобы вы знали, за что платите, какие риски закрыты и
              какие шаги остались до ключей в руке.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Мы не продаём «картинку в объявлении» — мы отвечаем за процесс от первого звонка до постановки на учёт и
              дальнейшей поддержки.
            </p>
          </div>
        </section>

        {/* Advantages */}
        <section aria-labelledby="about-adv-heading">
          <div className="mb-6 max-w-2xl">
            <h2 id="about-adv-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
              Почему клиенты выбирают нас
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Шесть опорных преимуществ, которые отражают реальный опыт сделок и сервиса в сети Aurora Auto.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((a) => (
              <li
                key={a.title}
                className="flex gap-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <AdvantageIcon name={a.icon} />
                <div>
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Team */}
        <section aria-labelledby="about-team-heading">
          <h2 id="about-team-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
            Команда
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Люди, с которыми вы встретитесь в салоне и по телефону. Фотографии профессиональные — замените на съёмку
            вашего коллектива перед запуском.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <li
                key={m.name}
                className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--color-brand-accent)] text-2xl font-semibold text-white">
                    {m.initials}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Certificates */}
        <section aria-labelledby="about-certs-heading">
          <h2 id="about-certs-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
            Сертификаты и награды
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Здесь размещаются сканы дипломов и логотипы партнёров. До загрузки реальных файлов — ориентиры по блокам.
          </p>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {CERTS.map((c) => (
              <div
                key={c}
                className="flex min-w-[200px] shrink-0 flex-col justify-center rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-medium text-slate-700 md:min-w-0"
              >
                {c}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section aria-labelledby="about-reviews-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="about-reviews-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
                Отзывы клиентов
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Короткие истории покупателей. Имена и города — примеры для вёрстки; перед публикацией замените на
                согласованные отзывы с разрешением.
              </p>
            </div>
            <Link
              href="/reviews"
              className="inline-flex w-fit items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brand-accent-hover)]"
            >
              Все отзывы
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <li
                key={r.name + r.date}
                className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
                    aria-hidden
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      {r.city} · {r.date}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{r.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Branches accordion */}
        <section aria-labelledby="about-branches-heading">
          <h2 id="about-branches-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
            География сети
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Адреса и графики уточняйте на странице контактов — здесь компактный список для ориентира.
          </p>
          <details className="group mt-4 rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <summary className="cursor-pointer list-none px-5 py-4 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Показать филиалы
                <span className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden>
                  ▼
                </span>
              </span>
            </summary>
            <ul className="space-y-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
              {BRANCHES.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </details>
        </section>

        {/* Video */}
        <section aria-labelledby="about-video-heading">
          <h2 id="about-video-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
            Видео о салоне
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            После съёмки вставьте embed YouTube или Rutube: достаточно заменить блок ниже на iframe с вашим роликом.
          </p>
          <div className="mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-slate-900/5 shadow-inner">
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500">
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                Место для видео
              </span>
              <p>Короткий тур по шоуруму, интервью с директором или процесс приёмки автомобиля.</p>
            </div>
          </div>
        </section>

        {/* Requisites */}
        <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" aria-labelledby="about-legal-heading">
          <h2 id="about-legal-heading" className="text-xl font-semibold text-[color:var(--color-brand-primary)]">
            Реквизиты и контакты
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Юридический адрес и режим работы совпадают с карточкой контактов. Полный пакет реквизитов (ИНН, ОГРН,
            банковские данные) выдаётся по запросу для юридических лиц и бухгалтерии.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-900">Адрес</dt>
              <dd className="mt-1 text-slate-600">Барнаул, Павловский тракт, 251В</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Телефон</dt>
              <dd className="mt-1 text-slate-600">+7 (3852) 55-45-45</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Email</dt>
              <dd className="mt-1 text-slate-600">sales@aurora-auto.ru</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Режим</dt>
              <dd className="mt-1 text-slate-600">Ежедневно с 09:00 до 20:00</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Контакты и проезд
            </Link>
            <Link href="/legal/privacy" className="text-sm font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline">
              Политика конфиденциальности
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
