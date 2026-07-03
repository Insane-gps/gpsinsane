"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import type { Oferta } from "@/lib/types";

type OfferCardProps = {
  usuarioId?: string;
  usuarioEmail?: string;
  onCancelarReserva?: (oferta: Oferta) => void;
  quantidadeReserva?: number;
  onMudarQuantidadeReserva?: (qtd:number)=>void;
  oferta: Oferta;
  onReservar: (oferta: Oferta) => void;
  onAbrirChat: (oferta: Oferta) => void;
  onEditarOferta?: (oferta: Oferta) => void;
  onExcluirOferta?: (oferta: Oferta) => void;
  onSelecionar?: (oferta: Oferta) => void;
  selected?: boolean;
  disabled?: boolean;
};

function labelTipo(
  oferta: Oferta,
  t: ReturnType<typeof useWebI18n>["t"]
): string {
  if (oferta.tipo === "carona_oferecida") {
    return String((oferta as any).modoPreco || "").toLowerCase() === "direto"
      ? t.exclusiveRide
      : t.sharedRide;
  }

  if (oferta.tipo === "entrega") {
    if ((oferta as any).subtipoEntrega === "restaurante") {
      return t.deliveryRestaurant;
    }

   return t.deliveryObject;
  }
  return t.reserve;
}

function tituloEntregaRestaurante(
  oferta: Oferta,
  t: ReturnType<typeof useWebI18n>["t"]
): string {
  const tipo = String((oferta as any).tipoEstabelecimento || "").trim().toLowerCase();

  if (tipo === "pizzaria") return t.pizzeriaDeliveryTitle;
  if (tipo === "hamburgueria") return t.burgerDeliveryTitle;
  if (tipo === "lanchonete") return t.snackBarDeliveryTitle;
  if (tipo === "mercado") return t.marketDeliveryTitle;

  return t.restaurantDeliveryTitle;
}

function labelTipoEstabelecimento(
  oferta: Oferta,
  t: ReturnType<typeof useWebI18n>["t"]
): string {
  const tipo = String((oferta as any).tipoEstabelecimento || "").trim().toLowerCase();

  if (tipo === "pizzaria") return t.restaurantOptionPizza;
  if (tipo === "hamburgueria") return t.restaurantOptionBurger;
  if (tipo === "lanchonete") return t.restaurantOptionSnackBar;
  if (tipo === "mercado") return t.restaurantOptionMarket;
  if (tipo === "outro") return t.restaurantOptionOther;

  return t.restaurantOptionRestaurant;
}

function labelTamanhoPedido(
  oferta: Oferta,
  t: ReturnType<typeof useWebI18n>["t"]
): string {
  const tamanho = String((oferta as any).tamanhoPedido || "").trim().toLowerCase();

  if (tamanho === "pequeno") return t.smallOrder;
  if (tamanho === "medio") return t.mediumOrder;
  if (tamanho === "grande") return t.largeOrder;
  if (tamanho === "muito_grande") return t.veryLargeOrder;

  return t.restaurantOrder;
}
export function OfferCard({
  oferta,
  onReservar,
  onCancelarReserva = () => {},
  onAbrirChat,
  onEditarOferta = () => {},
  onExcluirOferta = () => {},
  onSelecionar,
  selected = false,
  disabled = false,
  usuarioId = "",
  usuarioEmail = "",
  quantidadeReserva = 1,
  onMudarQuantidadeReserva = () => {},
}: OfferCardProps) {
  const { t } = useWebI18n();

  const ofertaCriadaPorMim =
    String(oferta.criadorId || "") === String(usuarioId || "") ||
    String((oferta as any).criadorEmail || "").toLowerCase() === String(usuarioEmail || "").toLowerCase();

  const reservasAtivas = (oferta.reservas || []).filter((item) => item.status !== "cancelada");

  const vagasReservadas = reservasAtivas.reduce((total, reserva:any) => {
    return total + Math.max(0, Number(reserva?.quantidade || 1));
  }, 0);

  const vagasDisponiveis = Math.max(
    0,
    Number(oferta.quantidadePessoas || 0) - vagasReservadas
  );

  const minhaReservaAtiva = (oferta.reservas || []).find((reserva:any) => {
    const donoReserva =
      String(reserva?.usuarioId || "") === String(usuarioId || "") ||
      String(reserva?.passageiroId || "") === String(usuarioId || "");

    return donoReserva && String(reserva?.status || "") !== "cancelada";
  });

  const valorPorPessoa = Number(oferta.valor || 0);

  const valorTotalSelecionado = Number(
    (valorPorPessoa * Math.max(1, Number(quantidadeReserva || 1))).toFixed(2)
  );

  const reservaAtivaAny = minhaReservaAtiva as any;

  const valorTotalMinhaReserva = minhaReservaAtiva
    ? Number(
        reservaAtivaAny?.valorTrechoTotal ||
        valorPorPessoa * Math.max(1, Number(reservaAtivaAny?.quantidade || 1))
      )
    : 0;

  const typeClass = oferta.tipo === "entrega"
    ? "delivery"
    : oferta.tipo === "carona_oferecida"
      ? "ride-offered"
      : "ride-request";

  return (
    <article
  className={`offerCard ${typeClass} ${selected ? "selected" : ""}`}
  style={{
    minHeight: 320
  }}
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
        <span className="pill">{labelTipo(oferta, t)}</span>
        <span className="muted">{oferta.status || "ativa"}</span>
      </header>

      <h3>
  {(oferta as any).subtipoEntrega === "restaurante"
    ? `🍔 ${(oferta as any).nomeEstabelecimento || oferta.nomeOuDescricao || tituloEntregaRestaurante(oferta, t)}`
    : oferta.nomeOuDescricao || t.offerNoDescription}
</h3>

{(oferta as any).subtipoEntrega === "restaurante" && (
  <div style={{
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    background: "rgba(249, 115, 22, 0.12)",
    border: "1px solid rgba(249, 115, 22, 0.35)"
  }}>
    <p className="muted" style={{margin: 0}}>
      <strong>{t.restaurantType}:</strong>{" "}
      {labelTipoEstabelecimento(oferta, t)}
    </p>

    {!!(oferta as any).nomeCliente && (
      <p className="muted" style={{margin: "4px 0 0"}}>
        <strong>{t.customer}:</strong> {(oferta as any).nomeCliente}
      </p>
    )}

   {String((oferta as any).bagTermicaModo || "") === "necessaria" && (
  <p style={{color:"#facc15",fontSize:12,fontWeight:800,margin:"6px 0 0"}}>
    🧊 {t.thermalBagRequired}
  </p>
)}

{String((oferta as any).bagTermicaModo || "") === "fornecida" && (
  <p style={{color:"#22c55e",fontSize:12,fontWeight:800,margin:"6px 0 0"}}>
    ✅ {t.bagProvidedByRestaurant}
  </p>
)}

{!!(oferta as any).fragil && (
  <p style={{color:"#fecaca",fontSize:12,fontWeight:800,margin:"6px 0 0"}}>
    ⚠️ {t.fragileOrder}
  </p>
)}

{!!(oferta as any).tamanhoPedido && (
  <p style={{color:"#93c5fd",fontSize:12,fontWeight:800,margin:"6px 0 0"}}>
    📦 {labelTamanhoPedido(oferta, t)}
  </p>
)}
  </div>
)}
      {String((oferta as any)?.modoPreco || "").toLowerCase() === "direto" &&
  Number((oferta as any)?.prioridadeMotoristasAte || 0) > Date.now() && (
  <p style={{color:"#facc15",fontSize:12,fontWeight:800,marginTop:4}}>
    ⭐ {t.priorityDrivers}
  </p>
)}

<p className="muted" style={{marginTop:4,marginBottom:8}}>
  {t.createdBy}: {oferta.criadorNome || (oferta as any).criadorEmail || oferta.criadorId || t.profileTitle}
</p>

      <p className="routeLine">
        <strong>{t.offerOrigin}:</strong> {oferta.origem?.endereco || "-"}
      </p>

      <p className="routeLine">
        <strong>{t.offerDestination}:</strong> {oferta.destino?.endereco || "-"}
      </p>

      <div className="metaGrid">
        <span>
          <strong>{minhaReservaAtiva ? t.reservedValue : t.valueLabel}:</strong>{" "}
          {valorPorPessoa > 0
            ? minhaReservaAtiva
              ? `R$ ${valorTotalMinhaReserva.toFixed(2)}`
              : `R$ ${valorTotalSelecionado.toFixed(2)}`
            : t.toBeArranged}
        </span>

        <span><strong>{t.offerSeats}:</strong> {oferta.quantidadePessoas || 0}</span>
        <span><strong>{t.availableSeats}:</strong> {vagasDisponiveis}/{oferta.quantidadePessoas || 0}</span>
        <span><strong>{t.reservedSeats}:</strong> {vagasReservadas}</span>
      </div>

      {oferta.tipo === "carona_oferecida" && vagasDisponiveis > 0 && !ofertaCriadaPorMim && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <strong>{t.reserve}:</strong>

          {[1, 2, 3, 4].map((qtd) => {
            const disponivel = qtd <= vagasDisponiveis;
            const ativo = quantidadeReserva === qtd;

            return (
              <button
                key={qtd}
                disabled={!disponivel}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!disponivel) return;
                  onMudarQuantidadeReserva(qtd);
                }}
                style={{
                  width: 34,
                  height: 34,
                  padding: 0,
                  borderRadius: 999,
                  opacity: disponivel ? 1 : 0.35,
                  background: ativo ? "#16a34a" : "rgba(9, 18, 34, 0.76)",
                  borderColor: ativo ? "#22c55e" : "rgba(77, 123, 205, 0.55)",
                  fontWeight: 800
                }}
              >
                {qtd}
              </button>
            );
          })}
        </div>
      )}

      <footer>
        {!ofertaCriadaPorMim && (
          <>
            <button
              disabled={disabled}
              className={minhaReservaAtiva ? "btnSecondary" : "btnPrimary"}
              onClick={(event) => {
                event.stopPropagation();

                if (minhaReservaAtiva) {
                  onCancelarReserva(oferta);
                  return;
                }

                onReservar(oferta);
              }}
            >
              {minhaReservaAtiva
                ? "Cancelar reserva"
                : `Solicitar reserva • R$ ${valorTotalSelecionado.toFixed(2)}`}
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
          </>
        )}
      </footer>

      {ofertaCriadaPorMim && (
  <div
    style={{
      display:"flex",
      gap:10,
      marginTop:12
    }}
  >
          <button
            disabled={disabled}
            className="btnSecondary"
            onClick={(event) => {
              event.stopPropagation();
              onEditarOferta(oferta);
            }}
            style={{
              flex:1,
              borderColor:"#f59e0b",
              color:"#fbbf24"
            }}
          >
            Editar
          </button>

          <button
            disabled={disabled}
            className="btnSecondary"
            onClick={(event) => {
              event.stopPropagation();
              onExcluirOferta(oferta);
            }}
            style={{
              flex:1,
              borderColor:"#ef4444",
              color:"#fecaca"
            }}
          >
            Excluir
          </button>
        </div>
      )}
    </article>
  );
}