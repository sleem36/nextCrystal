import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";

const callbackSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(32),
  source: z.string().default("header_callback"),
  page: z.string().optional(),
});

const requestCounters = new Map<string, { count: number; resetAt: number }>();

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
    const payload = callbackSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
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

    const { name, phone, source, page } = payload.data;
    const crmWebhook = process.env.CRM_CALLBACK_WEBHOOK_URL;
    const emailTo = process.env.LEADS_TO_EMAIL;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    if (!crmWebhook && (!emailTo || !from)) {
      return NextResponse.json(
        { error: "Не настроены CRM_CALLBACK_WEBHOOK_URL или SMTP/LEADS_TO_EMAIL." },
        { status: 503 },
      );
    }

    if (crmWebhook) {
      const crmResponse = await fetch(crmWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          source,
          page,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!crmResponse.ok) {
        const errText = await crmResponse.text().catch(() => "");
        throw new Error(`CRM webhook error: ${crmResponse.status} ${errText}`);
      }
    }

    if (emailTo && from) {
      await transporter().sendMail({
        from,
        to: emailTo,
        subject: "Заявка на обратный звонок (Header)",
        text: [
          "Новая заявка на обратный звонок",
          `Имя: ${name}`,
          `Телефон: ${phone}`,
          `Источник: ${source}`,
          `Страница: ${page ?? "Не указана"}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

