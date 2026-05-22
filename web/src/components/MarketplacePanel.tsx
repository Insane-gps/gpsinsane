"use client";

import { useAuth } from "@/components/AuthProvider";
import { ChatBox } from "@/components/ChatBox";
import { OfferCard } from "@/components/OfferCard";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import { carregarPlanoUsuario, premiumPodeCriarOferta } from "@/lib/plan";
import type { Oferta, ReservaOferta, TipoOferta } from "@/lib/types";
import { collection, doc, onSnapshot, orderBy, query, runTransaction } from "firebase/firestore";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const MapaOfertas = dynamic(() => import("@/components/MapaOfertas").then((mod) => mod.MapaOfertas), {
  ssr: false,
  loading: () => <section className="mapShell neoPane mapLoading">Carregando mapa...</section>,
});

type MarketplacePanelProps = {
  filtroTipo?: TipoOferta | null;
};

export function MarketplacePanel({ filtroTipo = null }: MarketplacePanelProps) {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [chatOferta, setChatOferta] = useState<Oferta | null>(null);
  const [ofertaSelecionadaId, setOfertaSelecionadaId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");
  const [planoAtual, setPlanoAtual] = useState<"free" | "pro" | "premium" | "premium_free">("free");

  useEffect(() => {
    let ativo = true;

    async function carregarPlano() {
      if (!user?.uid) {
        if (ativo) setPlanoAtual("free");
        return;
      }

      const plano = await carregarPlanoUsuario(user.uid);
      if (ativo) setPlanoAtual(plano);
    }

    carregarPlano();
    return () => {
      ativo = false;
    };
  }, [user?.uid]);

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

  const ofertasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const premiumAtivo = premiumPodeCriarOferta(planoAtual);
    return ofertas.filter((oferta) => {
      if (oferta.status !== "ativa") return false;
      if (filtroTipo && oferta.tipo !== filtroTipo) return false;
      if (!premiumAtivo && oferta.tipo !== "carona_oferecida") return false;
      if (!termo) return true;

      const pool = [
        oferta.nomeOuDescricao,
        oferta.origem?.endereco,
        oferta.destino?.endereco,
        oferta.criadorNome,
      ].map((v) => String(v || "").toLowerCase());

      return pool.some((item) => item.includes(termo));
    });
  }, [ofertas, filtroTipo, busca, planoAtual]);

  const ofertaSelecionada = useMemo(() => {
    return ofertasFiltradas.find((oferta) => oferta.id === ofertaSelecionadaId) || null;
  }, [ofertasFiltradas, ofertaSelecionadaId]);

  const centroInicialMapa = useMemo(() => {
    const alvo = ofertasFiltradas.find((oferta) => Number.isFinite(oferta.origem?.lat) && Number.isFinite(oferta.origem?.lng))
      || ofertasFiltradas.find((oferta) => Number.isFinite(oferta.destino?.lat) && Number.isFinite(oferta.destino?.lng));

    if (alvo?.origem && Number.isFinite(alvo.origem.lat) && Number.isFinite(alvo.origem.lng)) {
      return [alvo.origem.lat, alvo.origem.lng] as [number, number];
    }

    if (alvo?.destino && Number.isFinite(alvo.destino.lat) && Number.isFinite(alvo.destino.lng)) {
      return [alvo.destino.lat, alvo.destino.lng] as [number, number];
    }

    return [-26.9042, -48.6556] as [number, number];
  }, [ofertasFiltradas]);

  useEffect(() => {
    if (ofertasFiltradas.length === 0) {
      setOfertaSelecionadaId(null);
      return;
    }

    if (!ofertasFiltradas.some((oferta) => oferta.id === ofertaSelecionadaId)) {
      setOfertaSelecionadaId(ofertasFiltradas[0].id);
    }
  }, [ofertasFiltradas, ofertaSelecionadaId]);

  async function reservar(oferta: Oferta) {
    if (!user) {
      setMsg(t.loginToReserve);
      return;
    }

    if (!premiumPodeCriarOferta(planoAtual) && oferta.tipo !== "carona_oferecida") {
      setMsg("Plano atual: somente caronas oferecidas disponiveis. Ative Premium para entregas e outras oportunidades.");
      return;
    }

    const ofertaRef = doc(db, "ofertas", oferta.id);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ofertaRef);
      if (!snap.exists()) {
        throw new Error("Oferta nao encontrada");
      }

      const data = snap.data() as Oferta;
      const reservas = Array.isArray(data.reservas) ? data.reservas : [];
      const jaReservou = reservas.some((r) => String(r.usuarioId) === user.uid && r.status !== "cancelada");
      if (jaReservou) {
        throw new Error("Voce ja possui reserva ativa nesta oferta.");
      }

      const novaReserva: ReservaOferta = {
        usuarioId: user.uid,
        usuarioNome: user.displayName || user.email || user.uid,
        status: "pendente",
        criadoEm: Date.now(),
      };

      tx.update(ofertaRef, {
        reservas: [...reservas, novaReserva],
        atualizadoEm: Date.now(),
      });
    });

    setMsg(t.reserveSuccess);
  }

  async function solicitarReserva(oferta: Oferta) {
    try {
      await reservar(oferta);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : t.reserveFail);
    }
  }

  if (loading) return <section className="sectionPane">{t.loadingSession}</section>;

  return (
    <section className="sectionPane neoPane marketplacePage">
      <header className="sectionHead sectionHeadWide">
        <div>
          <p className="kicker">{t.procurar}</p>
          <h1>{t.offersTitle}</h1>
          <p className="muted">{t.offerPageSubtitle}</p>
        </div>
        <input
          className="searchInput"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
      </header>

      {msg && <p className="noticeLine">{msg}</p>}

      <div className="marketplaceLayout">
        <MapaOfertas
          ofertas={ofertasFiltradas}
          ofertaSelecionadaId={ofertaSelecionadaId}
          onSelecionarOferta={(oferta) => {
            setOfertaSelecionadaId(oferta.id);
          }}
          centroInicial={centroInicialMapa}
        />

        <div className="marketplaceSide">
          <div className="offersGrid marketplaceList">
            {ofertasFiltradas.map((oferta) => (
              <OfferCard
                key={oferta.id}
                oferta={oferta}
                selected={ofertaSelecionada?.id === oferta.id}
                onSelecionar={(item) => setOfertaSelecionadaId(item.id)}
                onReservar={solicitarReserva}
                onAbrirChat={setChatOferta}
              />
            ))}

            {ofertasFiltradas.length === 0 && (
              <p className="muted">{t.noOffers}</p>
            )}
          </div>

          <ChatBox
            oferta={chatOferta}
            usuarioId={user?.uid || ""}
            usuarioNome={user?.displayName || user?.email || user?.uid || "anon"}
            onConversationDeleted={() => setChatOferta(null)}
          />
        </div>
      </div>
    </section>
  );
}
