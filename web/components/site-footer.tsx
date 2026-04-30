"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { contactSite, telHref } from "@/lib/contact-site";
import { formatRuPhoneInput, isValidRuPhone } from "@/lib/phone";

const ANY_LEAD_SUBMITTED_KEY = "aurora_any_lead_submitted_v1";

export function SiteFooter() {
  const pathname = usePathname();
  const phoneHref = telHref(contactSite.phoneDigits);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackError, setCallbackError] = useState("");
  const [callbackState, setCallbackState] = useState({ name: "", phone: "" });

  const canSubmitCallback = useMemo(
    () => callbackState.name.trim().length > 1 && isValidRuPhone(callbackState.phone),
    [callbackState],
  );

  const submitCallback = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitCallback || callbackSubmitting) return;

    setCallbackError("");
    setCallbackSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const payload = {
      name: callbackState.name.trim(),
      phone: callbackState.phone.trim(),
      source: "footer_callback",
      page: pathname,
    };

    fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Не удалось отправить форму.");
        }
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ANY_LEAD_SUBMITTED_KEY, "1");
        }
        setCallbackOpen(false);
        setCallbackState({ name: "", phone: "" });
      })
      .catch((error) => {
        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? "Сервер долго отвечает. Попробуйте ещё раз."
            : error instanceof Error
              ? error.message
              : "Не удалось отправить форму.";
        setCallbackError(message);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setCallbackSubmitting(false);
      });
  };

  return (
    <>
      <footer className="mt-auto border-t border-[color:var(--footer-border)] bg-[color:var(--footer-bg)] text-[color:var(--footer-text)]">
        <div className="container-wide grid w-full gap-6 py-8 text-xs md:grid-cols-3 md:gap-6 md:text-sm lg:gap-8">
          <div className="space-y-3">
            <p className="font-semibold text-white">Aurora Auto</p>
            <p className="max-w-sm text-[color:var(--footer-text-muted)]">
              Надёжные автомобили с пробегом. Условия на странице носят информационный характер.
            </p>
            <div className="space-y-1 text-[color:var(--footer-link)]">
              <a className="block font-semibold text-white transition-colors hover:text-sky-300" href={phoneHref}>
                {contactSite.phoneDisplay}
              </a>
              <a className="block transition-colors hover:text-white" href={`mailto:${contactSite.email}`}>
                {contactSite.email}
              </a>
              <p className="text-[color:var(--footer-text-muted)]">{contactSite.hoursLine}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCallbackError("");
                setCallbackOpen(true);
              }}
              className="inline-flex h-9 items-center rounded-[var(--radius-button,0.5rem)] border border-[color:var(--footer-button-border)] px-3 text-sm font-semibold text-[color:var(--footer-link-hover)] transition-colors hover:border-[color:var(--footer-button-border-hover)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--footer-bg)]"
            >
              Связаться с нами
            </button>
            <p className="text-[color:var(--footer-text-soft)]">© {new Date().getFullYear()} Aurora Auto</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--footer-text-soft)]">Документы</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              <Link className="text-xs text-[color:var(--footer-text-muted)] transition-colors hover:text-[color:var(--footer-link)]" href="/legal/privacy">
                Политика конфиденциальности
              </Link>
              <Link className="text-xs text-[color:var(--footer-text-muted)] transition-colors hover:text-[color:var(--footer-link)]" href="/legal/terms">
                Пользовательское соглашение
              </Link>
              <Link className="text-xs text-[color:var(--footer-text-muted)] transition-colors hover:text-[color:var(--footer-link)]" href="/legal/consent">
                Согласие на обработку ПДН
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--footer-text-soft)]">Разделы</p>
              <div className="flex flex-col gap-1.5">
                <Link className="text-[color:var(--footer-text-muted)] transition-colors hover:text-[color:var(--footer-link)]" href="/about">
                  О компании
                </Link>
                <Link className="text-[color:var(--footer-text-muted)] transition-colors hover:text-[color:var(--footer-link)]" href="/contacts">
                  Контакты
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--footer-text-soft)]">Мы в соцсетях</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={contactSite.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Открыть сообщество ВКонтакте"
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-[color:var(--footer-button-border)] bg-transparent px-3 text-sm font-semibold text-[color:var(--footer-link)] transition-colors hover:border-[color:var(--footer-button-border-hover)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--footer-bg)]"
                >
                  ВКонтакте
                </a>
                <a
                  href={contactSite.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Открыть Telegram"
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-[color:var(--footer-button-border)] bg-transparent px-3 text-sm font-semibold text-[color:var(--footer-link)] transition-colors hover:border-[color:var(--footer-button-border-hover)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--footer-bg)]"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Modal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        title="Связаться с нами"
        description="Оставьте контакты, менеджер перезвонит в рабочее время."
      >
        <form onSubmit={submitCallback} className="space-y-4">
          <Input
            label="Ваше имя"
            value={callbackState.name}
            onChange={(event) => setCallbackState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Например, Алексей"
            required
          />
          <Input
            label="Телефон"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={callbackState.phone}
            onChange={(event) =>
              setCallbackState((prev) => ({ ...prev, phone: formatRuPhoneInput(event.target.value) }))
            }
            placeholder="+7 (___) ___-__-__"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!canSubmitCallback || callbackSubmitting}>
              {callbackSubmitting ? "Отправка..." : "Отправить"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setCallbackOpen(false)}>
              Отмена
            </Button>
          </div>
          {callbackError ? <p className="text-sm text-rose-600">{callbackError}</p> : null}
        </form>
      </Modal>
    </>
  );
}
