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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app"),
  title: "Aurora Auto — подбор автомобиля с пробегом",
  description:
    "Подбор проверенных подержанных автомобилей, понятный платёж и сопровождение сделки. Федеральная сеть Aurora Auto.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aurora Auto — подбор автомобиля с пробегом",
    description:
      "Подбор проверенных подержанных автомобилей, понятный платёж и сопровождение сделки. Федеральная сеть Aurora Auto.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aurora Auto",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+7-3852-55-45-45",
      contactType: "sales",
      areaServed: "RU",
      availableLanguage: ["Russian"],
    },
  };

  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[color:var(--background)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <YandexMetrika id={metrikaId} />
      </body>
    </html>
  );
}
