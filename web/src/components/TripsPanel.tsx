"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import type { Oferta } from "@/lib/types";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function TripsPanel() {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  useEffect(() => {
    const q = query(collection(db, "ofertas"), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snap) => {
      const next: Oferta[] = [];
      snap.forEach((item) => {
        next.push({ id: item.id, ...(item.data() as Omit<Oferta, "id">) });
      });
      setOfertas(next);
    });
  }, []);

  const minhasViagens = useMemo(() => {
    if (!user) return [];
    return ofertas.filter((item) => {
      const souCriador = String(item.criadorId || "") === user.uid;
      const tenhoReserva = (item.reservas || []).some((r) => String(r.usuarioId || "") === user.uid && r.status !== "cancelada");
      return souCriador || tenhoReserva;
    });
  }, [ofertas, user]);

  if (loading) return <section className="sectionPane">{t.loadingSession}</section>;

  if (!user) {
    return (
      <section className="sectionPane neoPane">
        <h1>{t.myTripsTitle}</h1>
        <p className="muted">Faca login para visualizar suas viagens.</p>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane">
      <h1>{t.myTripsTitle}</h1>
      <p className="muted">Historico de ofertas criadas e reservas ativas.</p>

      <div className="tripGrid">
        {minhasViagens.map((item) => (
          <article key={item.id} className="tripCard">
            <header>
              <strong>{item.nomeOuDescricao || "Oferta sem descricao"}</strong>
              <span className="pill">{item.status || "ativa"}</span>
            </header>
            <p><strong>Tipo:</strong> {item.tipo}</p>
            <p><strong>Origem:</strong> {item.origem?.endereco || "Nao informado"}</p>
            <p><strong>Destino:</strong> {item.destino?.endereco || "Nao informado"}</p>
            <p><strong>Data:</strong> {[item.dataSaida, item.horarioSaida].filter(Boolean).join(" ") || "-"}</p>
          </article>
        ))}
      </div>

      {minhasViagens.length === 0 && <p className="muted">{t.myTripsEmpty}</p>}
    </section>
  );
}
