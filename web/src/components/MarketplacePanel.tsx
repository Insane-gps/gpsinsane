"use client";

import { useAuth } from "@/components/AuthProvider";
import { ChatBox } from "@/components/ChatBox";
import { OfferCard } from "@/components/OfferCard";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import { carregarPlanoUsuario, premiumPodeCriarOferta } from "@/lib/plan";
import type { Oferta, TipoOferta } from "@/lib/types";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, runTransaction } from "firebase/firestore";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const MapaOfertas = dynamic(() => import("@/components/MapaOfertas").then((mod) => mod.MapaOfertas), {
  ssr: false,
  loading: () => <section className="mapShell neoPane mapLoading">Carregando mapa...</section>,
});

type MarketplacePanelProps = {
  filtroTipo?: TipoOferta | null;
};

        export function MarketplacePanel({ filtroTipo = null }: MarketplacePanelProps) {
  const router = useRouter();
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [chatOferta, setChatOferta] = useState<Oferta | null>(null);
  const [ofertaSelecionadaId, setOfertaSelecionadaId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"outras" | "minhas">("outras");
  const [planoAtual, setPlanoAtual] = useState<"free" | "pro" | "premium" | "premium_free">("free");
  const [reservaQtdPorOferta, setReservaQtdPorOferta] = useState<Record<string, number>>({});
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
 function vagasReservadasOferta(oferta: Oferta) {
  const reservasAtivas = Array.isArray(oferta.reservas)
    ? oferta.reservas.filter((reserva:any) => String(reserva?.status || "") !== "cancelada")
    : [];

  return reservasAtivas.reduce((total:number, reserva:any) => {
    return total + Math.max(0, Number(reserva?.quantidade || 1));
  }, 0);
}

function vagasDisponiveisOferta(oferta: Oferta) {
  return Math.max(
    0,
    Number(oferta.quantidadePessoas || 0) - vagasReservadasOferta(oferta)
  );
}

function usuarioTemReservaAtiva(oferta: Oferta, uid?: string) {
  const usuario = String(uid || "").trim();
  if (!usuario) return false;

  return (oferta.reservas || []).some((reserva:any) => {
    const donoReserva =
      String(reserva?.usuarioId || "") === usuario ||
      String(reserva?.passageiroId || "") === usuario;

    return donoReserva && String(reserva?.status || "") !== "cancelada";
  });
}
function distanciaMetrosWeb(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const R = 6371000;
  const toRad = (value:number) => (value * Math.PI) / 180;

  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function getRotaPontosWeb(oferta:any):Array<{lat:number;lng:number}> {
  const pontos:Array<{lat:number;lng:number}> = [];

  if(oferta?.origem?.lat && oferta?.origem?.lng){
    pontos.push({
      lat:Number(oferta.origem.lat),
      lng:Number(oferta.origem.lng)
    });
  }

  (oferta?.paradas || []).forEach((p:any)=>{
    if(p?.lat && p?.lng){
      pontos.push({
        lat:Number(p.lat),
        lng:Number(p.lng)
      });
    }
  });

  if(oferta?.destino?.lat && oferta?.destino?.lng){
    pontos.push({
      lat:Number(oferta.destino.lat),
      lng:Number(oferta.destino.lng)
    });
  }

  return pontos;
}

function pontoPertoDaRotaWeb(
  ponto:{lat:number;lng:number},
  rota:Array<{lat:number;lng:number}>,
  raioMetros:number
) {
  if(!ponto || !Number.isFinite(ponto.lat) || !Number.isFinite(ponto.lng)) return false;
  if(!Array.isArray(rota) || rota.length === 0) return false;

  return rota.some((p:any)=>{
    if(!p || !Number.isFinite(Number(p.lat)) || !Number.isFinite(Number(p.lng))) return false;

    return distanciaMetrosWeb(
      {lat:Number(ponto.lat), lng:Number(ponto.lng)},
      {lat:Number(p.lat), lng:Number(p.lng)}
    ) <= raioMetros;
  });
}

function motoristaVaiNaDirecaoDaOfertaWeb(ofertaMotorista:any, ofertaExclusiva:any) {
  const pontosMotorista = getRotaPontosWeb(ofertaMotorista);

  const origemExclusiva = {
    lat:Number(ofertaExclusiva?.origem?.lat),
    lng:Number(ofertaExclusiva?.origem?.lng)
  };

  const destinoExclusiva = {
    lat:Number(ofertaExclusiva?.destino?.lat),
    lng:Number(ofertaExclusiva?.destino?.lng)
  };

  const origemPerto = pontoPertoDaRotaWeb(origemExclusiva, pontosMotorista, 50000);
  const destinoPerto = pontoPertoDaRotaWeb(destinoExclusiva, pontosMotorista, 50000);

  return origemPerto || destinoPerto;
}
  const ofertasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ofertas.filter((oferta) => {
      if (oferta.status !== "ativa") return false;
      const prioridadeAte = Number((oferta as any)?.prioridadeMotoristasAte || 0);

const exclusivaComPrioridade =
  String((oferta as any)?.modoPreco || "").toLowerCase() === "direto" &&
  prioridadeAte > Date.now();

if (
  exclusivaComPrioridade &&
  String(oferta.criadorId || "") !== String(user?.uid || "")
) {
  const minhasOfertasMotorista = ofertas.filter((m:any)=>
    String(m?.tipo || "") === "carona_oferecida" &&
    (
      String(m?.criadorId || "") === String(user?.uid || "") ||
      String(m?.criadorEmail || "").toLowerCase() === String(user?.email || "").toLowerCase()
    ) &&
    String(m?.status || "") === "ativa"
  );

  const motoristaCompativel = minhasOfertasMotorista.some((m:any)=>
    motoristaVaiNaDirecaoDaOfertaWeb(m, oferta)
  );

  if(!motoristaCompativel){
    return false;
  }
}
     if (
  oferta.tipo === "carona_oferecida" &&
  vagasDisponiveisOferta(oferta) <= 0 &&
  String(oferta.criadorId || "") !== String(user?.uid || "") &&
  !usuarioTemReservaAtiva(oferta, user?.uid)
) {
  return false;
}
      if (filtroTipo && oferta.tipo !== filtroTipo) return false;
      const ofertaCriadaPorMim =
  String(oferta.criadorId || "") === String(user?.uid || "") ||
  String((oferta as any).criadorEmail || "").toLowerCase() === String(user?.email || "").toLowerCase();

if (aba === "minhas" && !ofertaCriadaPorMim) {
  return false;
}

if (aba === "outras" && ofertaCriadaPorMim) {
  return false;
}
      if (!termo) return true;

      const pool = [
        oferta.nomeOuDescricao,
        oferta.origem?.endereco,
        oferta.destino?.endereco,
        oferta.criadorNome,
      ].map((v) => String(v || "").toLowerCase());

      return pool.some((item) => item.includes(termo));
    });
  }, [ofertas, filtroTipo, busca, planoAtual, user?.uid, user?.email, aba]);
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
  const quantidadeSelecionada = Math.max(
    1,
    Number(reservaQtdPorOferta[oferta.id] || 1)
  );
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

      const novaReserva = {
  usuarioId: user.uid,
  passageiroId: user.uid,
  usuarioNome: user.displayName || user.email || user.uid,
  passageiroNome: user.displayName || user.email || user.uid,
  quantidade: quantidadeSelecionada,
  embarcaIdx: 0,
  embarcaLabel: data.origem?.endereco || "Origem",
  desembarcaIdx: Array.isArray((data as any).paradas) ? (data as any).paradas.length + 1 : 1,
  desembarcaLabel: data.destino?.endereco || "Destino",
  valorTrechoUnitario: Number(data.valor || 0),
  valorTrechoTotal: Number(data.valor || 0) * quantidadeSelecionada,
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
async function cancelarMinhaReserva(oferta: Oferta) {
  if (!user) {
    setMsg(t.loginToReserve);
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

    const reservasAtualizadas = reservas.map((reserva:any) => {
      const donoReserva =
        String(reserva?.usuarioId || "") === user.uid ||
        String(reserva?.passageiroId || "") === user.uid;

      if (!donoReserva) return reserva;
      if (String(reserva?.status || "") === "cancelada") return reserva;

      return {
        ...reserva,
        status: "cancelada",
        canceladaEm: Date.now(),
        canceladaPor: user.uid,
      };
    });

    tx.update(ofertaRef, {
      reservas: reservasAtualizadas,
      atualizadoEm: Date.now(),
    });
  });

  setMsg("Reserva cancelada.");
}
async function excluirOferta(oferta: Oferta) {
  if (!user) {
    setMsg("Faça login para excluir sua oferta.");
    return;
  }

  if (String(oferta.criadorId || "") !== String(user.uid || "")) {
    setMsg("Você só pode excluir ofertas criadas por você.");
    return;
  }

  const reservasAtivas = Array.isArray(oferta.reservas)
    ? oferta.reservas.filter((reserva:any) => String(reserva?.status || "") !== "cancelada")
    : [];

  if (
    String(oferta.status || "ativa") !== "ativa" ||
    reservasAtivas.length > 0
  ) {
    setMsg("Esta oferta já possui reserva, solicitação ou viagem em andamento e não pode ser excluída.");
    return;
  }

  const confirmar = window.confirm("Excluir esta oferta? Essa ação não pode ser desfeita.");
  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "ofertas", oferta.id));
    setMsg("Oferta excluída.");
  } catch (error) {
    setMsg(error instanceof Error ? error.message : "Erro ao excluir oferta.");
  }
}

 async function editarOferta(oferta: Oferta) {
  if (!user) {
    setMsg("Faça login para editar sua oferta.");
    return;
  }

  if (String(oferta.criadorId || "") !== String(user.uid || "")) {
    setMsg("Você só pode editar ofertas criadas por você.");
    return;
  }

  router.push(`/oferecer?editar=${oferta.id}`);
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
       <div
  style={{
    display:"flex",
    gap:12,
    marginBottom:20
  }}
>
  <button
    className={aba==="outras" ? "btnPrimary" : "btnSecondary"}
    onClick={()=>setAba("outras")}
  >
    Outras
  </button>

  <button
    className={aba==="minhas" ? "btnPrimary" : "btnSecondary"}
    onClick={()=>setAba("minhas")}
  >
    Minhas
  </button>
</div>
      <div className="marketplaceLayout">
        <MapaOfertas
          ofertas={ofertasFiltradas}
          ofertaSelecionadaId={ofertaSelecionadaId}
          onSelecionarOferta={(oferta) => {
            setOfertaSelecionadaId(oferta.id);
          }}
          centroInicial={centroInicialMapa}
        />

        <div
  className="marketplaceSide"
  style={{
    paddingRight:8
  }}
>
 
          <div className="offersGrid marketplaceList">
            {ofertasFiltradas.map((oferta) => (
             <OfferCard
  key={oferta.id}
  oferta={oferta}
  selected={ofertaSelecionada?.id === oferta.id}
  usuarioId={user?.uid || ""}
  usuarioEmail={user?.email || ""}
  quantidadeReserva={reservaQtdPorOferta[oferta.id] || 1}
  onMudarQuantidadeReserva={(qtd) =>
    setReservaQtdPorOferta((prev) => ({
      ...prev,
      [oferta.id]: qtd
    }))
  }
  onSelecionar={(item) => setOfertaSelecionadaId(item.id)}
  onReservar={solicitarReserva}
  onCancelarReserva={cancelarMinhaReserva}
  onEditarOferta={editarOferta}
  onExcluirOferta={excluirOferta}
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
