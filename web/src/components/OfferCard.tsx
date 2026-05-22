"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import type { Oferta } from "@/lib/types";

type OfferCardProps = {
  oferta: Oferta;
  onReservar: (oferta: Oferta) => void;
  onAbrirChat: (oferta: Oferta) => void;
  onSelecionar?: (oferta: Oferta) => void;
  selected?: boolean;
  disabled?: boolean;
};

function labelTipo(tipo: Oferta["tipo"]): string {
  if (tipo === "entrega") return "Entrega";
  if (tipo === "carona_oferecida") return "Carona oferecida";
  return "Carona solicitada";
}

export function OfferCard({ oferta, onReservar, onAbrirChat, onSelecionar, selected = false, disabled = false }: OfferCardProps) {
  const { t } = useWebI18n();
  const reservasAtivas = (oferta.reservas || []).filter((item) => item.status !== "cancelada").length;
  const typeClass = oferta.tipo === "entrega"
    ? "delivery"
    : oferta.tipo === "carona_oferecida"
      ? "ride-offered"
      : "ride-request";

  return (
    <article
      className={`offerCard ${typeClass} ${selected ? "selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelecionar?.(oferta)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onSelecionar) {
          event.preventDefault();
          onSelecionar(oferta);
        }
      }}
    >
      <header>
        <span className="pill">{labelTipo(oferta.tipo)}</span>
        <span className="muted">{oferta.status || "ativa"}</span>
      </header>

      <h3>{oferta.nomeOuDescricao || t.offerNoDescription}</h3>

      <p className="routeLine">
        <strong>{t.offerOrigin}:</strong> {oferta.origem?.endereco || "-"}
      </p>
      <p className="routeLine">
        <strong>{t.offerDestination}:</strong> {oferta.destino?.endereco || "-"}
      </p>

      <div className="metaGrid">
        <span><strong>{t.offerValue}:</strong> {typeof oferta.valor === "number" ? `R$ ${oferta.valor.toFixed(2)}` : "A combinar"}</span>
        <span><strong>{t.offerSeats}:</strong> {oferta.quantidadePessoas || 0}</span>
        <span><strong>{t.offerReservations}:</strong> {reservasAtivas}</span>
        <span><strong>{t.offerWhen}:</strong> {oferta.dataSaida || "--"} {oferta.horarioSaida || ""}</span>
      </div>

      <footer>
        <button
          disabled={disabled}
          className="btnPrimary"
          onClick={(event) => {
            event.stopPropagation();
            onReservar(oferta);
          }}
        >
          {t.reserve}
        </button>
        <button
          disabled={disabled}
          className="btnSecondary"
          onClick={(event) => {
            event.stopPropagation();
            onAbrirChat(oferta);
          }}
        >
          {t.openChat}
        </button>
      </footer>
    </article>
  );
}
