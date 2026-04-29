"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactsFeedbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const phoneError = useMemo(() => {
    if (!phone) return "Укажите телефон";
    if (phone.replace(/\D/g, "").length < 10) return "Введите корректный номер";
    return "";
  }, [phone]);

  const nameError = useMemo(() => {
    if (!name.trim()) return "Укажите имя";
    return "";
  }, [name]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (nameError || phoneError) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: name.trim(),
          phone,
          message: message.trim() || undefined,
          antiSpam: { website, startedAt },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Не удалось отправить. Попробуйте позже.");
        return;
      }

      if (data.ok) {
        setStatus("success");
        setName("");
        setPhone("");
        setMessage("");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Сеть недоступна или время ожидания истекло.");
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="flex h-full min-h-0 flex-col rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-5"
      aria-labelledby="contacts-form-heading"
    >
      <div className="shrink-0">
        <h2 id="contacts-form-heading" className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
          Обратная связь
        </h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Оставьте контакты — перезвоним в рабочее время. Сообщение по желанию.
        </p>
      </div>

      <form className="relative mt-4 flex min-h-0 flex-1 flex-col gap-4 pt-0" onSubmit={onSubmit} noValidate>
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-px w-px opacity-0"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
          <Input label="Имя" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={status === "error" ? nameError : ""} />

          <Input
            label="Телефон"
            name="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+7 (___) ___-__-__"
            error={status === "error" ? phoneError : ""}
          />
        </div>

        <label className="flex min-h-0 flex-1 flex-col gap-2 text-sm text-[color:var(--text-default)]">
          <span className="shrink-0 font-medium">Сообщение</span>
          <textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={4000}
            className="min-h-[6rem] flex-1 resize-y rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-3 text-sm text-[color:var(--text-strong)] transition placeholder:text-[color:var(--text-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
            placeholder="Например: удобное время для звонка или вопрос по проезду"
          />
        </label>

        {status === "error" && errorMessage ? (
          <p className="text-sm text-rose-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === "success" ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-auto w-full shrink-0">
          {isSubmitting ? "Отправка…" : "Отправить"}
        </Button>
      </form>
    </section>
  );
}
