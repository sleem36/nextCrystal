"use client";

import { useMemo } from "react";
import {
  type ContactBranch,
  CONTACT_BRANCHES,
  CONTACT_LEGAL_EMAIL,
  buildYandexMapWidgetUrl,
  yandexMapsSearchUrl,
} from "@/lib/contact-locations";
import { telHref } from "@/lib/contact-site";
import { ContactBranchGallery } from "@/components/contacts/contact-branch-gallery";
import { ContactsMap } from "@/components/contacts/contacts-map";

type ContactsCityMapProps = {
  branches?: ContactBranch[];
  branchId: string;
};

export function ContactsCityMap({ branches = CONTACT_BRANCHES, branchId }: ContactsCityMapProps) {
  const branch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? branches[0],
    [branches, branchId],
  );

  const embedUrl = useMemo(
    () => (branch ? (branch.yandexMapEmbedUrl?.trim() || buildYandexMapWidgetUrl(branch.lat, branch.lng)) : ""),
    [branch],
  );

  const externalMapsUrl = branch ? yandexMapsSearchUrl(branch) : undefined;

  if (!branch) {
    return null;
  }

  return (
    <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-stretch lg:gap-8">
      {/* Левая колонка: серая «рамка», белая карточка — как на макете CM */}
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/80 lg:p-5">
          <h3 className="text-lg font-bold text-slate-900">Контактная информация</h3>

          <div className="overflow-hidden rounded-[var(--radius-card)]">
            <ContactBranchGallery key={branchId} images={branch.images} cityLabel={branch.city} />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-1 text-sm">
            <div>
              <p className="text-base font-bold leading-snug text-[color:var(--color-link)]">{branch.address}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900">Время работы</p>
              <p className="mt-1 leading-relaxed text-slate-700">{branch.hours}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900">Телефон</p>
              <a
                href={telHref(branch.phone)}
                className="mt-1 inline-block font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline"
              >
                {branch.phone}
              </a>
            </div>

            <div>
              <p className="font-bold text-slate-900">Почта</p>
              <a
                href={`mailto:${branch.email}`}
                className="mt-1 inline-block break-all font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline"
              >
                {branch.email}
              </a>
            </div>

            <div>
              <p className="font-bold text-slate-900">Юридический отдел</p>
              <a
                href={`mailto:${branch.legalEmail || CONTACT_LEGAL_EMAIL}`}
                className="mt-1 inline-block break-all font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline"
              >
                {branch.legalEmail || CONTACT_LEGAL_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col lg:h-full">
        <ContactsMap
          key={branchId}
          embedUrl={embedUrl}
          title={`Карта проезда — ${branch.city}`}
          externalMapsUrl={externalMapsUrl}
          fillHeight
        />
      </div>
    </div>
  );
}
