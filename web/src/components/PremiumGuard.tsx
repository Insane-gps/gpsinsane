"use client";

import Link from "next/link";

type PremiumGuardProps = {
  liberado: boolean;
  children: React.ReactNode;
};

export function PremiumGuard({ liberado, children }: PremiumGuardProps) {
  if (liberado) return <>{children}</>;

  return (
    <section className="premiumPane">
      <h2>Recurso Premium</h2>
      <p>
        Criar oferta publica de carona/entrega na web exige plano Premium ativo.
        Sua conta pode continuar solicitando reservas normalmente no plano Free.
      </p>
      <Link href="/ofertas" className="btnSecondary">Voltar para ofertas</Link>
    </section>
  );
}
