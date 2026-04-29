"use client";

import { useState } from "react";
import {
  type ContactBranch,
  CONTACT_BRANCHES,
  DEFAULT_CONTACT_BRANCH_ID,
} from "@/lib/contact-locations";
import { ContactsCityMap } from "@/components/contacts/contacts-city-map";

type ContactsMapSectionProps = {
  branches?: ContactBranch[];
};

export function ContactsMapSection({ branches = CONTACT_BRANCHES }: ContactsMapSectionProps) {
  const [branchId, setBranchId] = useState(() => {
    if (branches.some((b) => b.id === DEFAULT_CONTACT_BRANCH_ID)) {
      return DEFAULT_CONTACT_BRANCH_ID;
    }
    return branches[0]?.id ?? DEFAULT_CONTACT_BRANCH_ID;
  });

  return (
    <section aria-labelledby="contacts-map-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 id="contacts-map-heading" className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
          Как добраться
        </h2>
        <label className="flex flex-col gap-2 text-sm text-[color:var(--text-default)] sm:flex-row sm:items-center sm:gap-0">
          <span className="shrink-0 font-semibold text-[color:var(--text-strong)] sm:whitespace-nowrap">Город</span>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="h-11 w-full min-w-[200px] rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-3 text-sm text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 sm:ml-3"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.city}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <ContactsCityMap branchId={branchId} branches={branches} />
      </div>
    </section>
  );
}
