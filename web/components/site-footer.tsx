"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { contactSite, telHref } from "@/lib/contact-site";

export function SiteFooter() {
  const pathname = usePathname();
  const phoneHref = telHref(contactSite.phoneDigits);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackError, setCallbackError] = useState("");
  const [callbackState, setCallbackState] = useState({ name: "", phone: "" });

  const canSubmitCallback = useMemo(
    () => callbackState.name.trim().length > 1 && callbackState.phone.trim().length >= 6,
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
      <footer className="mt-auto border-t border-slate-800/80 bg-[#1a1a1a] text-slate-400">
        <div className="container-wide grid w-full gap-6 py-8 text-xs md:grid-cols-3 md:gap-6 md:text-sm lg:gap-8">
          <div className="space-y-3">
            <p className="font-semibold text-white">Aurora Auto</p>
            <p className="max-w-sm text-slate-500">
              Надёжные автомобили с пробегом. Условия на странице носят информационный характер.
            </p>
            <div className="space-y-1 text-slate-300">
              <a className="block font-semibold text-white transition-colors hover:text-sky-300" href={phoneHref}>
                {contactSite.phoneDisplay}
              </a>
              <a className="block transition-colors hover:text-white" href={`mailto:${contactSite.email}`}>
                {contactSite.email}
              </a>
              <p className="text-slate-500">{contactSite.hoursLine}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCallbackError("");
                setCallbackOpen(true);
              }}
              className="inline-flex h-9 items-center rounded-[var(--radius-button,0.5rem)] border border-slate-500 px-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
            >
              Связаться с нами
            </button>
            <p className="text-slate-600">© {new Date().getFullYear()} Aurora Auto</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Документы</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              <Link className="text-xs text-slate-500 transition-colors hover:text-slate-300" href="/legal/privacy">
                Политика конфиденциальности
              </Link>
              <Link className="text-xs text-slate-500 transition-colors hover:text-slate-300" href="/legal/terms">
                Пользовательское соглашение
              </Link>
              <Link className="text-xs text-slate-500 transition-colors hover:text-slate-300" href="/legal/consent">
                Согласие на обработку ПДН
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Разделы</p>
              <div className="flex flex-col gap-1.5">
                <Link className="text-slate-500 transition-colors hover:text-slate-300" href="/about">
                  О компании
                </Link>
                <Link className="text-slate-500 transition-colors hover:text-slate-300" href="/contacts">
                  Контакты
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Мы в соцсетях</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={contactSite.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Открыть сообщество ВКонтакте"
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-600 bg-transparent px-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
                >
                  ВКонтакте
                </a>
                <a
                  href={contactSite.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Открыть Telegram"
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-600 bg-transparent px-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
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
            value={callbackState.phone}
            onChange={(event) => setCallbackState((prev) => ({ ...prev, phone: event.target.value }))}
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
