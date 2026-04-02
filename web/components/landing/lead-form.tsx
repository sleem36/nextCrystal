"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { CarBodyType, CarTag } from "@/types/car";

type LeadFormProps = {
  context: {
    city: string;
    selectedCarId?: string;
    monthlyBudget: number;
    maxPriceRub: number;
    bodyType: CarBodyType | "any";
    purchaseGoal: CarTag;
    scenario: "budget" | "family" | "first-car";
    utm: Record<string, string>;
  };
};

export function LeadForm({ context }: LeadFormProps) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        scenario: context.scenario,
        monthlyBudget: context.monthlyBudget,
        maxPriceRub: context.maxPriceRub,
        city: context.city,
      });
      setStatus("success");
      setName("");
      setPhone("");
      setWebsite("");
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

  return (
    <Card className="space-y-5" id="lead-form">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Оставьте заявку
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Перезвоним и зафиксируем условия по платежу {formatCurrency(context.monthlyBudget)}.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input
          label="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Как к вам обращаться"
        />
        <Input
          label="Телефон"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 (___) ___-__-__"
          error={status === "error" ? phoneError || errorMessage || "Не удалось отправить форму" : ""}
        />
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
            {isSubmitting ? "Отправка..." : "Получить подборку и расчет"}
          </Button>
        </div>
      </form>
      {status === "error" && errorMessage ? (
        <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
      ) : null}

      <p className="text-xs text-slate-500">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
      </p>

      {status === "success" ? (
        <p className="text-sm font-medium text-emerald-700">
          Заявка отправлена. Менеджер свяжется с вами в ближайшее время.
        </p>
      ) : null}
    </Card>
  );
}
