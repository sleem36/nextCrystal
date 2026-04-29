import Link from "next/link";
import { getAllCities } from "@/lib/cities-db";
import { contactSite, telHref } from "@/lib/contact-site";
import { mergeContactBranchesWithCities } from "@/lib/contact-locations";
import { ContactsFeedbackForm } from "@/components/contacts/contacts-feedback-form";
import { ContactsMapSection } from "@/components/contacts/contacts-map-section";

function IconPhone(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M6.5 4.5h3l1.5 4.5-1.5 1a11 11 0 006 6l1-1.5 4.5 1.5v3a2 2 0 01-2 1.5A17 17 0 013 6a2 2 0 011.5-1.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconTelegram(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69l.01-.09c0-.06-.05-.11-.12-.12h-.02l-4.93 3.1c-.46.3-.98.46-1.5.45-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27v.38z" />
    </svg>
  );
}

function IconVk(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.32 4.03 7.978c0-.254.102-.491.593-.491h1.744c.44 0 .593.203.78.677.863 2.573 2.303 4.835 2.896 4.835.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v4.101c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.405 2.15-3.574 2.15-3.574.203-.254.356-.389.746-.389h1.744c.525 0 .644.27.525.643-.22 1.034-2.354 4.084-2.354 4.084-.254.424-.339.611 0 1.118.254.339 1.084 1.084 1.625 1.735.424.542.949 1.523.949 2.05 0 .305-.169.576-.744.576z" />
    </svg>
  );
}

const iconBox =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)] text-[color:var(--text-default)]";

export async function ContactsPageContent() {
  // Для страницы контактов используем полный справочник городов, иначе при
  // выборочной активности (is_active) данные из админки могут не применяться.
  const branches = mergeContactBranchesWithCities(await getAllCities(false));
  const tel = telHref(contactSite.phoneDigits);
  const mailto = `mailto:${contactSite.email}`;
  const hasRequisites = Boolean(
    contactSite.orgInn || contactSite.orgKpp || contactSite.orgOgrn || contactSite.orgRs || contactSite.orgBank,
  );

  return (
    <div className="container-wide flex-1 space-y-10 py-8 md:space-y-12 md:py-12">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-4xl">
          Контакты
        </h1>
        <p className="text-base text-[color:var(--text-muted)] md:text-lg">
          Свяжитесь с нами удобным способом — ответим в рабочее время.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-10">
        <div className="flex min-h-0 flex-col gap-5">
          <section aria-labelledby="contacts-channels-heading">
            <h2 id="contacts-channels-heading" className="sr-only">
              Способы связи
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <a
                  href={tel}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-card-muted)]"
                >
                  <span className={iconBox}>
                    <IconPhone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[color:var(--text-soft)]">
                      Телефон
                    </span>
                    <span className="font-semibold text-[color:var(--text-strong)]">{contactSite.phoneDisplay}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={mailto}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-card-muted)]"
                >
                  <span className={iconBox}>
                    <IconMail className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 break-all">
                    <span className="block text-xs font-medium uppercase tracking-wide text-[color:var(--text-soft)]">
                      Email
                    </span>
                    <span className="font-semibold text-[color:var(--text-strong)]">{contactSite.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={contactSite.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-card-muted)]"
                >
                  <span className={`${iconBox} text-[#229ED9]`}>
                    <IconTelegram className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[color:var(--text-soft)]">
                      Telegram
                    </span>
                    <span className="font-semibold text-[color:var(--text-strong)]">Написать в Telegram</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={contactSite.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-card-muted)]"
                >
                  <span className={`${iconBox} text-[#0077FF]`}>
                    <IconVk className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[color:var(--text-soft)]">
                      ВКонтакте
                    </span>
                    <span className="font-semibold text-[color:var(--text-strong)]">Группа и сообщения</span>
                  </span>
                </a>
              </li>
            </ul>
          </section>

          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            aria-labelledby="contacts-hours-heading"
          >
            <h2 id="contacts-hours-heading" className="text-sm font-semibold uppercase tracking-wide text-[color:var(--text-soft)]">
              Режим работы
            </h2>
            <p className="mt-2 text-lg font-medium text-[color:var(--text-strong)]">{contactSite.hoursLine}</p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Отдел продаж и приём заявок — без выходных.</p>
          </section>

          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            aria-labelledby="contacts-address-heading"
          >
            <h2 id="contacts-address-heading" className="text-sm font-semibold uppercase tracking-wide text-[color:var(--text-soft)]">
              Адрес
            </h2>
            <p className="mt-2 text-base font-medium text-[color:var(--text-strong)]">{contactSite.addressFull}</p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{contactSite.landmark}</p>
          </section>
        </div>

        <div className="flex h-full min-h-0 flex-col">
          <ContactsFeedbackForm />
        </div>
      </div>

      <ContactsMapSection branches={branches} />

      <section
        className="rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)] p-6 shadow-inner"
        aria-labelledby="contacts-req-heading"
      >
        <h2 id="contacts-req-heading" className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
          Реквизиты
        </h2>
        {hasRequisites ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {contactSite.orgInn ? (
              <div>
                <dt className="font-medium text-[color:var(--text-default)]">ИНН</dt>
                <dd className="mt-0.5 text-[color:var(--text-strong)]">{contactSite.orgInn}</dd>
              </div>
            ) : null}
            {contactSite.orgKpp ? (
              <div>
                <dt className="font-medium text-[color:var(--text-default)]">КПП</dt>
                <dd className="mt-0.5 text-[color:var(--text-strong)]">{contactSite.orgKpp}</dd>
              </div>
            ) : null}
            {contactSite.orgOgrn ? (
              <div>
                <dt className="font-medium text-[color:var(--text-default)]">ОГРН</dt>
                <dd className="mt-0.5 text-[color:var(--text-strong)]">{contactSite.orgOgrn}</dd>
              </div>
            ) : null}
            {contactSite.orgRs ? (
              <div className="sm:col-span-2">
                <dt className="font-medium text-[color:var(--text-default)]">Расчётный счёт</dt>
                <dd className="mt-0.5 text-[color:var(--text-strong)]">{contactSite.orgRs}</dd>
              </div>
            ) : null}
            {contactSite.orgBank ? (
              <div className="sm:col-span-2">
                <dt className="font-medium text-[color:var(--text-default)]">Банк</dt>
                <dd className="mt-0.5 text-[color:var(--text-strong)]">{contactSite.orgBank}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            ИНН, КПП, ОГРН и банковские реквизиты для договора и счёта высылаются по запросу на{" "}
            <a className="font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline" href={mailto}>
              {contactSite.email}
            </a>
            .
          </p>
        )}
        <p className="mt-4 text-xs text-[color:var(--text-soft)]">
          <Link href="/legal/terms" className="text-[color:var(--color-link)] underline-offset-2 hover:underline">
            Условия использования
          </Link>
          {" · "}
          <Link href="/legal/privacy" className="text-[color:var(--color-link)] underline-offset-2 hover:underline">
            Политика конфиденциальности
          </Link>
        </p>
      </section>
    </div>
  );
}
