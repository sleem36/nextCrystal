"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PopupCallback } from "@/components/ui/popup-callback";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <PopupCallback delayMs={30000} showOnExit />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
