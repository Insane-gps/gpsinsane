"use client";

import { LANG_OPTIONS, detectLang, getTexts, type WebLang } from "@/lib/web-i18n";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WebI18nValue = {
  lang: WebLang;
  setLang: (lang: WebLang) => void;
  t: ReturnType<typeof getTexts>;
  options: typeof LANG_OPTIONS;
};

const WebI18nContext = createContext<WebI18nValue | undefined>(undefined);

export function WebI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<WebLang>("pt");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("web_lang") : null;
    const browser = typeof navigator !== "undefined" ? navigator.language : null;
    setLangState(detectLang(saved || browser));
  }, []);

  function setLang(next: WebLang) {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("web_lang", next);
    }
  }

  const value = useMemo<WebI18nValue>(() => ({
    lang,
    setLang,
    t: getTexts(lang),
    options: LANG_OPTIONS,
  }), [lang]);

  return <WebI18nContext.Provider value={value}>{children}</WebI18nContext.Provider>;
}

export function useWebI18n() {
  const ctx = useContext(WebI18nContext);
  if (!ctx) throw new Error("useWebI18n must be used within WebI18nProvider");
  return ctx;
}
