"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { CarBodyType } from "@/types/car";
import type {
  DriveFilter,
  FuelFilter,
  PaymentMethod,
  TransmissionFilter,
} from "@/components/landing/quick-selector";

type LeadFormProps = {
  variant?: "card" | "plain";
  /** Заголовок скрыт (например, заголовок в модалке) */
  hideTitle?: boolean;
  onSuccess?: () => void;
  context: {
    city: string;
    /** Единый id авто для всех экранов (если выбрано конкретное авто) */
    carId?: string;
    paymentMethod: PaymentMethod;
    monthlyBudget?: number;
    maxPriceRub: number;
    bodyType: CarBodyType | "any";
    transmission: TransmissionFilter;
    drive: DriveFilter;
    fuel: FuelFilter;
    yearFrom: number;
    maxMileageKm: number;
    /** Источник потребности (если есть в сценарии) */
    purchaseGoal?: string;
    utm: Record<string, string>;
  };
};

export function LeadForm({ context, variant = "card", hideTitle = false, onSuccess }: LeadFormProps) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const prepaymentTermsUrl = process.env.NEXT_PUBLIC_PREPAYMENT_TERMS_URL;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [prepaymentAccepted, setPrepaymentAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const phoneError = useMemo(() => {
    if (!phone) {
      return "Телефон обязателен";
    }

    if (phone.replace(/\D/g, "").length < 10) {
      return "Введите корректный номер";
    }

    return "";
  }, [phone]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (phoneError) {
      setStatus("error");
      return;
    }
    if (prepaymentTermsUrl && !prepaymentAccepted) {
      setStatus("error");
      setErrorMessage("Подтвердите условия возврата предоплаты.");
      return;
    }

    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          phone,
          context,
          antiSpam: {
            website,
            startedAt,
          },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setErrorMessage(payload.error || "Не удалось отправить форму. Попробуйте позже.");
        throw new Error("Lead failed");
      }

      trackGoal(metrikaId, METRIKA_GOALS.leadSubmitted, {
        paymentMethod: context.paymentMethod,
        ...(context.monthlyBudget ? { monthlyBudget: context.monthlyBudget } : {}),
        maxPriceRub: context.maxPriceRub,
        city: context.city,
        fuel: context.fuel,
      });
      setStatus("success");
      setName("");
      setPhone("");
      setPrepaymentAccepted(false);
      setWebsite("");
      onSuccess?.();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("Сервер отвечает слишком долго. Повторите попытку.");
      }
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const inner = (
    <>
      {!hideTitle ? (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)]">
            Оставьте заявку
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Перезвоним и уточним варианты в бюджете{" "}
            {context.paymentMethod === "credit" && context.monthlyBudget
              ? formatCurrency(context.monthlyBudget)
              : formatCurrency(context.maxPriceRub)}
            .
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          Перезвоним и уточним варианты в бюджете{" "}
          {context.paymentMethod === "credit" && context.monthlyBudget
            ? formatCurrency(context.monthlyBudget)
            : formatCurrency(context.maxPriceRub)}
          .
        </p>
      )}

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input
          label="Телефон"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 (___) ___-__-__"
          error={status === "error" ? phoneError || errorMessage || "Не удалось отправить форму" : ""}
        />
        <Input
          label="Имя (необязательно)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Как к вам обращаться"
        />
        {prepaymentTermsUrl ? (
          <label className="md:col-span-2 flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={prepaymentAccepted}
              onChange={(event) => setPrepaymentAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[color:var(--color-brand-accent)] focus:ring-[color:var(--color-brand-accent)]"
            />
            <span>
              Согласен с{" "}
              <a
                href={prepaymentTermsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                условиями возврата предоплаты
              </a>
              .
            </span>
          </label>
        ) : null}
        <input
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          type="text"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : "Отправить заявку"}
          </Button>
        </div>
      </form>
      {status === "error" && errorMessage ? (
        <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
      ) : null}

      <p className="text-xs text-slate-500">
        Нажимая кнопку, вы соглашаетесь на{" "}
        <a href="/legal/privacy" className="underline hover:no-underline">
          обработку персональных данных
        </a>
        ,{" "}
        <a href="/legal/terms" className="underline hover:no-underline">
          пользовательское соглашение
        </a>{" "}
        и{" "}
        <a href="/legal/consent" className="underline hover:no-underline">
          согласие на обработку ПДн
        </a>
        .
      </p>

      {status === "success" ? (
        <p className="text-sm font-medium text-emerald-700">
          Заявка отправлена. Менеджер свяжется с вами в ближайшее время.
        </p>
      ) : null}
    </>
  );

  if (variant === "plain") {
    return <div className="space-y-5">{inner}</div>;
  }

  return (
    <Card className="space-y-5 p-4 md:p-5" id="lead-form">
      {inner}
    </Card>
  );
}
