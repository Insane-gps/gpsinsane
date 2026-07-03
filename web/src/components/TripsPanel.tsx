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

  if (loading) return <section className="sectionPane neoPane tripsPage">{t.loadingSession}</section>;

  if (!user) {
    return (
      <section className="sectionPane neoPane tripsPage">
        <h1>{t.myTripsTitle}</h1>
        <p className="muted">Faca login para visualizar suas viagens.</p>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane tripsPage">
      <h1>{t.myTripsTitle}</h1>
      <p className="muted">{t.tripsSubtitle}</p>

      <div className="tripGrid">
        {minhasViagens.map((item) => (
          <article key={item.id} className="tripCard">
            <header>
              <strong>{item.nomeOuDescricao || "Oferta sem descricao"}</strong>
              <span className="pill">{item.status || "ativa"}</span>
            </header>
            <p><strong>{t.deliveryType}:</strong>{item.tipo}</p>
            {item.tipo === "entrega" && (
  <>
    {!!(item as any).tamanhoPedido && (
      <p>
        <strong>Tamanho:</strong>{" "}
        {{
          pequeno:"Pedido pequeno",
          medio:"Pedido médio",
          grande:"Pedido grande",
          muito_grande:"Pedido muito grande"
        }[(item as any).tamanhoPedido as string]}
      </p>
    )}

    {String((item as any).bagTermicaModo || "") === "necessaria" && (
      <p><strong>Bag térmica:</strong> Necessária</p>
    )}

    {String((item as any).bagTermicaModo || "") === "fornecida" && (
      <p><strong>Bag térmica:</strong> Fornecida pelo estabelecimento</p>
    )}

    {!!(item as any).fragil && (
      <p><strong>Frágil:</strong> Sim</p>
    )}
  </>
)}
<p><strong>{t.offerOrigin}:</strong> {item.origem?.endereco || t.addressNotProvided}</p>
<p><strong>{t.offerDestination}:</strong> {item.destino?.endereco || t.addressNotProvided}</p>
<p><strong>{t.offerWhen}:</strong> {[item.dataSaida, item.horarioSaida].filter(Boolean).join(" ") || "-"}</p>
          </article>
        ))}
      </div>

      {minhasViagens.length === 0 && <p className="muted">{t.myTripsEmpty}</p>}
    </section>
  );
}
