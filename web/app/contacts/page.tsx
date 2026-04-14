import type { Metadata } from "next";
import { ContactsPageContent } from "@/components/contacts/contacts-page-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crystal-motors.ru";

export const metadata: Metadata = {
  title: "Контакты Aurora Auto — телефон, email, мессенджеры, карта, заявка",
  description:
    "Свяжитесь с Aurora Auto: телефон и email для звонка и письма, Telegram и ВКонтакте, режим работы Пн–Вс 09:00–20:00, адрес в Барнауле, карта проезда и форма обратной связи.",
  openGraph: {
    title: "Контакты — Aurora Auto",
    description: "Телефон, мессенджеры, адрес и карта. Оставьте заявку — перезвоним в рабочее время.",
    url: `${siteUrl}/contacts`,
    type: "website",
  },
  alternates: {
    canonical: "/contacts",
  },
};

export default function ContactsPage() {
  return (
    <main className="flex-1">
      <ContactsPageContent />
    </main>
  );
}
