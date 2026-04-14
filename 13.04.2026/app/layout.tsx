import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { YandexMetrika } from "@/components/yandex-metrika";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crystal Motors — подбор автомобиля с пробегом",
  description:
    "Подбор проверенных подержанных автомобилей, понятный платёж и сопровождение сделки. Федеральная сеть Crystal Motors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[color:var(--background)]">
        <SiteHeader />
        {children}
        <SiteFooter />
        <YandexMetrika id={metrikaId} />
      </body>
    </html>
  );
}
