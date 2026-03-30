"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppLocale } from "./types";
import { LOCALE_STORAGE_KEY, parseAppLocale } from "./types";
import { translate } from "./dictionaries";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: string | null;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(() =>
    parseAppLocale(initialLocale ?? undefined)
  );

  useEffect(() => {
    if (initialLocale) {
      setLocaleState(parseAppLocale(initialLocale));
      return;
    }
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored) setLocaleState(parseAppLocale(stored));
    } catch {
      /* ignore */
    }
  }, [initialLocale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
    }
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string) => translate(locale, key),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

/** Safe fallback when used outside provider (should not happen in dashboard) */
export function useLocaleOptional(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
