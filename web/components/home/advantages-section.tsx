"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Car, FileCheck, Headphones, ShieldCheck, Wallet } from "lucide-react";
import { motion } from "framer-motion";

type Advantage = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const advantages: Advantage[] = [
  {
    title: "Широкий выбор",
    description: "Большой ассортимент марок и моделей от лучших производителей.",
    icon: Car,
  },
  {
    title: "Честные цены",
    description: "Актуальные цены с возможностью торга. Без скрытых переплат.",
    icon: Wallet,
  },
  {
    title: "Поддержка 24/7",
    description: "Помощь профессионалов и оформление кредита под ключ.",
    icon: Headphones,
  },
  {
    title: "Полная информация",
    description: "Пробег, год, комплектация, история - все по каждому авто.",
    icon: FileCheck,
  },
  {
    title: "Гарантия сделки",
    description: "Прозрачность, юридическая чистота и надежные продавцы.",
    icon: ShieldCheck,
  },
];

export function AdvantagesSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
            Почему выбирают нас
          </h2>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Покупайте авто с комфортом и уверенностью.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[color:var(--color-brand-accent)]">
                  <Icon size={48} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/about"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Узнать больше
          </Link>
        </div>
      </div>
    </section>
  );
}
