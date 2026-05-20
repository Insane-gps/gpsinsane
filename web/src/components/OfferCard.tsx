"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import type { Oferta } from "@/lib/types";

type OfferCardProps = {
  oferta: Oferta;
  onReservar: (oferta: Oferta) => void;
  onAbrirChat: (oferta: Oferta) => void;
  disabled?: boolean;
};

function labelTipo(tipo: Oferta["tipo"]): string {
  if (tipo === "entrega") return "Entrega";
  if (tipo === "carona_oferecida") return "Carona oferecida";
  return "Carona solicitada";
}

export function OfferCard({ oferta, onReservar, onAbrirChat, disabled = false }: OfferCardProps) {
  const { t } = useWebI18n();
  const reservasAtivas = (oferta.reservas || []).filter((item) => item.status !== "cancelada").length;

  return (
    <article className="offerCard">
      <header>
        <span className="pill">{labelTipo(oferta.tipo)}</span>
        <span className="muted">{oferta.status || "ativa"}</span>
      </header>

      <h3>{oferta.nomeOuDescricao || "Oferta sem descricao"}</h3>

      <p className="routeLine">
        <strong>Origem:</strong> {oferta.origem?.endereco || "Nao informado"}
      </p>
      <p className="routeLine">
        <strong>Destino:</strong> {oferta.destino?.endereco || "Nao informado"}
      </p>

      <div className="metaGrid">
        <span><strong>Valor:</strong> {typeof oferta.valor === "number" ? `R$ ${oferta.valor.toFixed(2)}` : "A combinar"}</span>
        <span><strong>Vagas:</strong> {oferta.quantidadePessoas || 0}</span>
        <span><strong>Reservas:</strong> {reservasAtivas}</span>
        <span><strong>Quando:</strong> {oferta.dataSaida || "--"} {oferta.horarioSaida || ""}</span>
      </div>

      <footer>
        <button disabled={disabled} className="btnPrimary" onClick={() => onReservar(oferta)}>
          {t.reserve}
        </button>
        <button disabled={disabled} className="btnSecondary" onClick={() => onAbrirChat(oferta)}>
          {t.openChat}
        </button>
      </footer>
    </article>
  );
}
