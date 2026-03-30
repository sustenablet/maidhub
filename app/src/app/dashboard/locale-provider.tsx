"use client";

import { LocaleProvider } from "@/lib/i18n/locale-context";

export function DashboardLocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: string | null;
}) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>;
}
