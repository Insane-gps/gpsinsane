"use client";

import { useAuth } from "@/components/AuthProvider";
import { ChatBox } from "@/components/ChatBox";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import type { Oferta } from "@/lib/types";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function InboxPanel() {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [ativa, setAtiva] = useState<Oferta | null>(null);
  const [conversasOcultasMeta, setConversasOcultasMeta] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setConversasOcultasMeta({});
      return;
    }
    const chave = `conversas_ocultas_${user.uid}`;
    try {
      const salvo = window.localStorage.getItem(chave);
      const parsed = salvo ? JSON.parse(salvo) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setConversasOcultasMeta(parsed as Record<string, number>);
      } else {
        setConversasOcultasMeta({});
      }
    } catch {
      setConversasOcultasMeta({});
    }
  }, [user?.uid]);

  function persistirConversasOcultas(uid: string, meta: Record<string, number>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`conversas_ocultas_${uid}`, JSON.stringify(meta));
  }

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

  const conversas = useMemo(() => {
    if (!user) return [];
    return ofertas.filter((item) => {
      if (conversasOcultasMeta[String(item.id || "")]) return false;
      const souCriador = String(item.criadorId || "") === user.uid;
      const tenhoReserva = (item.reservas || []).some((r) => String(r.usuarioId || "") === user.uid && r.status !== "cancelada");
      return souCriador || tenhoReserva;
    });
  }, [ofertas, user, conversasOcultasMeta]);

  if (loading) return <section className="sectionPane">{t.loadingSession}</section>;

  if (!user) {
    return (
      <section className="sectionPane neoPane">
        <h1>{t.inboxTitle}</h1>
        <p className="muted">Faca login para abrir suas conversas.</p>
        <Link href="/login" className="btnPrimary" style={{ display: "inline-flex", width: "fit-content" }}>
          {t.login}
        </Link>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane inboxPage">
      <header className="sectionHead">
        <h1>{t.inboxTitle}</h1>
        <p className="muted">Central de conversa das suas ofertas e reservas.</p>
      </header>

      <div className="offersLayout">
        <div className="inboxList">
          {conversas.map((item) => (
            <button
              key={item.id}
              className={`inboxRow ${ativa?.id === item.id ? "active" : ""}`}
              onClick={() => setAtiva(item)}
            >
              <strong>{item.nomeOuDescricao || "Oferta"}</strong>
              <span>{item.origem?.endereco || ""}</span>
              <span>{item.destino?.endereco || ""}</span>
            </button>
          ))}

          {conversas.length === 0 && <p className="muted">{t.inboxEmpty}</p>}
        </div>

        <ChatBox
          oferta={ativa}
          usuarioId={user.uid}
          usuarioNome={user.displayName || user.email || user.uid}
          onConversationDeleted={(offerId) => {
            const proximo = {
              ...conversasOcultasMeta,
              [String(offerId)]: Date.now(),
            };
            setConversasOcultasMeta(proximo);
            persistirConversasOcultas(user.uid, proximo);
            setAtiva(null);
          }}
        />
      </div>
    </section>
  );
}
