export type AppLocale = "en" | "pt-BR";

export const APP_LOCALES: { value: AppLocale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_STORAGE_KEY = "mh-app-locale";

export function parseAppLocale(value: string | null | undefined): AppLocale {
  if (value === "pt-BR" || value === "en") return value;
  return DEFAULT_LOCALE;
}
