import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestCounters = new Map<string, { count: number; resetAt: number }>();

const contactSchema = z.object({
  name: z.string().min(1, "Укажите имя").max(120),
  phone: z.string().min(10, "Укажите телефон"),
  message: z.string().max(4000).optional(),
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
    const result = contactSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Проверьте поля формы." }, { status: 400 });
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

    const { name, phone, message, antiSpam } = result.data;
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
      subject: "Сообщение со страницы «Контакты» — Aurora Auto",
      text: [
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        message?.trim() ? `Сообщение:\n${message.trim()}` : "Сообщение: не указано",
      ].join("\n\n"),
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
