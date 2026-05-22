"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import Link from "next/link";

type PremiumGuardProps = {
  liberado: boolean;
  children: React.ReactNode;
};

export function PremiumGuard({ liberado, children }: PremiumGuardProps) {
  const { t } = useWebI18n();

  if (liberado) return <>{children}</>;

  return (
    <section className="premiumPane">
      <h2>{t.premiumLockTitle}</h2>
      <p>
        {t.premiumLockSubtitle}
      </p>
      <Link href="/ofertas" className="btnSecondary">{t.premiumBackToOffers}</Link>
    </section>
  );
}
