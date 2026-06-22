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

function labelTipo(tipo: Oferta["tipo"]): string {
  if (tipo === "entrega") return "Entrega";
  if (tipo === "carona_oferecida") return "Carona oferecida";
  return "Carona solicitada";
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
        <span className="pill">{labelTipo(oferta.tipo)}</span>
        <span className="muted">{oferta.status || "ativa"}</span>
      </header>

      <h3>{oferta.nomeOuDescricao || t.offerNoDescription}</h3>
      {String((oferta as any)?.modoPreco || "").toLowerCase() === "direto" &&
  Number((oferta as any)?.prioridadeMotoristasAte || 0) > Date.now() && (
  <p style={{color:"#facc15",fontSize:12,fontWeight:800,marginTop:4}}>
    ⭐ Prioridade para motoristas na mesma direção
  </p>
)}

<p className="muted" style={{marginTop:4,marginBottom:8}}>
  Criado por: {oferta.criadorNome || (oferta as any).criadorEmail || oferta.criadorId || "Usuário"}
</p>

      <p className="routeLine">
        <strong>{t.offerOrigin}:</strong> {oferta.origem?.endereco || "-"}
      </p>

      <p className="routeLine">
        <strong>{t.offerDestination}:</strong> {oferta.destino?.endereco || "-"}
      </p>

      <div className="metaGrid">
        <span>
          <strong>{minhaReservaAtiva ? "Valor reservado" : "Valor"}:</strong>{" "}
          {valorPorPessoa > 0
            ? minhaReservaAtiva
              ? `R$ ${valorTotalMinhaReserva.toFixed(2)}`
              : `R$ ${valorTotalSelecionado.toFixed(2)}`
            : "A combinar"}
        </span>

        <span><strong>{t.offerSeats}:</strong> {oferta.quantidadePessoas || 0}</span>
        <span><strong>Vagas disponíveis:</strong> {vagasDisponiveis} de {oferta.quantidadePessoas || 0}</span>
        <span><strong>Vagas reservadas:</strong> {vagasReservadas}</span>
      </div>

      {oferta.tipo === "carona_oferecida" && vagasDisponiveis > 0 && !ofertaCriadaPorMim && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <strong>Reservar:</strong>

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