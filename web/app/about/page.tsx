import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/about-page-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurora-auto.ru";

export const metadata: Metadata = {
  title: "О компании Aurora Auto — сеть, стандарты проверки и команда",
  description:
    "Aurora Auto: история сети, миссия, ключевые цифры, преимущества (trade-in, кредит, гарантия проверки), команда, сертификаты и отзывы. Контакты и реквизиты.",
  openGraph: {
    title: "О компании — Aurora Auto",
    description:
      "Сеть автомобилей с пробегом: прозрачная диагностика, юридическая чистота сделки и сервис без сюрпризов.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  alternates: {
    canonical: "/about",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Aurora Auto",
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
      description:
        "Федеральная сеть автомобилей с пробегом: диагностика, юридическая проверка, trade-in, кредит и страхование.",
      sameAs: [],
    },
    {
      "@type": ["LocalBusiness", "AutoDealer"],
      "@id": `${siteUrl}/about#local`,
      name: "Aurora Auto — Барнаул",
      image: `${siteUrl}/hero/poster.svg`,
      telephone: "+73852554545",
      email: "sales@aurora-auto.ru",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Павловский тракт, 251В",
        addressLocality: "Барнаул",
        addressCountry: "RU",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
      parentOrganization: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="flex-1">
        <AboutPageContent />
      </main>
    </>
  );
}
