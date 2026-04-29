import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestCounters = new Map<string, { count: number; resetAt: number }>();

const bodyTypeLabel: Record<"any" | "sedan" | "liftback" | "suv" | "hatchback", string> = {
  any: "Любой",
  sedan: "Седан",
  liftback: "Лифтбек",
  suv: "Кроссовер/SUV",
  hatchback: "Хэтчбек",
};

const transmissionLabel: Record<"any" | "automatic" | "manual", string> = {
  any: "Любая",
  automatic: "Автомат",
  manual: "Механика",
};

const driveLabel: Record<"any" | "fwd" | "rwd" | "awd", string> = {
  any: "Любой",
  fwd: "Передний",
  rwd: "Задний",
  awd: "Полный",
};

const fuelLabel: Record<"any" | "petrol" | "diesel" | "hybrid" | "electric", string> = {
  any: "Любое",
  petrol: "Бензин",
  diesel: "Дизель",
  hybrid: "Гибрид",
  electric: "Электро",
};

const paymentMethodLabel: Record<"credit" | "cash", string> = {
  credit: "Кредит",
  cash: "Trade-in",
};

const leadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(10),
  context: z.object({
    city: z.string(),
    carId: z.string().optional(),
    /** Backward compatibility for previous payloads */
    selectedCarId: z.string().optional(),
    paymentMethod: z.union([z.literal("credit"), z.literal("cash")]).default("credit"),
    monthlyBudget: z.number().optional(),
    maxPriceRub: z.number(),
    bodyType: z.union([
      z.literal("any"),
      z.literal("sedan"),
      z.literal("liftback"),
      z.literal("suv"),
      z.literal("hatchback"),
    ]),
    transmission: z.union([z.literal("any"), z.literal("automatic"), z.literal("manual")]),
    drive: z.union([z.literal("any"), z.literal("fwd"), z.literal("rwd"), z.literal("awd")]),
    fuel: z.union([
      z.literal("any"),
      z.literal("petrol"),
      z.literal("diesel"),
      z.literal("hybrid"),
      z.literal("electric"),
    ]),
    yearFrom: z.number(),
    maxMileageKm: z.number(),
    purchaseGoal: z.string().optional(),
    leadSource: z.string().optional(),
    carTitle: z.string().optional(),
    carUrl: z.string().optional(),
    downPayment: z.number().optional(),
    creditTermMonths: z.number().optional(),
    estimatedMonthlyPayment: z.number().optional(),
    utm: z.record(z.string(), z.string()),
  }),
  antiSpam: z.object({
    website: z.string(),
    startedAt: z.number(),
  }),
});

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = leadSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const key = `${ip}:${userAgent}`;
    const now = Date.now();
    const minute = 60_000;

    const currentCounter = requestCounters.get(key);
    if (!currentCounter || currentCounter.resetAt < now) {
      requestCounters.set(key, { count: 1, resetAt: now + minute });
    } else {
      currentCounter.count += 1;
      if (currentCounter.count > 5) {
        return NextResponse.json(
          { error: "Слишком много попыток. Повторите через минуту." },
          { status: 429 },
        );
      }
    }

    const { name, phone, context, antiSpam } = result.data;
    const normalizedCarId = context.carId ?? context.selectedCarId;
    if (antiSpam.website) {
      return NextResponse.json({ ok: true });
    }

    if (now - antiSpam.startedAt < 3000) {
      return NextResponse.json(
        { error: "Форма отправлена слишком быстро. Повторите попытку." },
        { status: 400 },
      );
    }

    if (now - antiSpam.startedAt > 30 * minute) {
      return NextResponse.json(
        { error: "Сессия формы устарела. Обновите страницу." },
        { status: 400 },
      );
    }

    const to = process.env.LEADS_TO_EMAIL;
    if (!to) {
      return NextResponse.json(
        { error: "LEADS_TO_EMAIL is not configured" },
        { status: 503 },
      );
    }

    await transporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Новая заявка Aurora Auto MVP",
      text: [
        `Имя: ${name || "Не указано"}`,
        `Телефон: ${phone}`,
        `Город: ${context.city || "Не указан"}`,
        `ID авто: ${normalizedCarId || "Не выбрано"}`,
        `Модель: ${context.carTitle || "Не указана"}`,
        `URL авто: ${context.carUrl || "Не указан"}`,
        `Цель покупки: ${context.purchaseGoal || "Не указана"}`,
        `Источник заявки: ${context.leadSource || "Не указан"}`,
        `Способ оплаты: ${paymentMethodLabel[context.paymentMethod]}`,
        `Бюджет в месяц: ${
          context.paymentMethod === "credit" ? (context.monthlyBudget ?? "Не указан") : "Не применимо"
        }`,
        `Первоначальный взнос: ${context.downPayment ?? "Не указан"}`,
        `Срок кредита (мес): ${context.creditTermMonths ?? "Не указан"}`,
        `Расчётный платёж / мес: ${context.estimatedMonthlyPayment ?? "Не указан"}`,
        `Бюджет авто: ${context.maxPriceRub ?? "Не указан"}`,
        `Тип кузова: ${bodyTypeLabel[context.bodyType]}`,
        `Коробка: ${transmissionLabel[context.transmission]}`,
        `Привод: ${driveLabel[context.drive]}`,
        `Топливо: ${fuelLabel[context.fuel]}`,
        `Год от: ${context.yearFrom}`,
        `Пробег до: ${context.maxMileageKm}`,
        `UTM: ${Object.keys(context.utm).length ? JSON.stringify(context.utm) : "Не переданы"}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Внутренняя ошибка отправки. Попробуйте позже.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
