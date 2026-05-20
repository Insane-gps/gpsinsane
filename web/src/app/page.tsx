"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import Link from "next/link";

export default function HomePage() {
  const { t } = useWebI18n();

  return (
    <section className="hero neoPane">
      <div className="heroBadge">FUTURE MOBILITY CONTROL DECK</div>
      <h1>{t.heroTitle}</h1>
      <p>{t.heroSubtitle}</p>

      <div className="heroActions">
        <Link href="/procurar" className="btnPrimary">{t.heroCta1}</Link>
        <Link href="/oferecer" className="btnSecondary">{t.heroCta2}</Link>
        <Link href="/viagens" className="btnSecondary">{t.heroCta3}</Link>
        <Link href="/mensagens" className="ghost">{t.heroCta4}</Link>
      </div>
    </section>
  );
}
