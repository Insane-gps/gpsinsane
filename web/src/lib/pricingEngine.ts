export type TipoOfertaPricing = "carona_solicitada" | "carona_oferecida" | "entrega";
export type ModoPrecoPricing = "compartilhado" | "direto";

function calcularHorarioPicoInterno() {
  const hora = new Date().getHours();

  const picoManha = hora >= 7 && hora <= 10;
  const picoTarde = hora >= 17 && hora <= 20;

  if (picoManha || picoTarde) return 1.3;
  if (hora >= 0 && hora <= 5) return 0.85;

  return 1;
}

function calcularFatorCidadeInterno(estado: string) {
  const uf = String(estado || "").trim().toUpperCase();

  if (uf === "SP" || uf === "SÃO PAULO" || uf === "SAO PAULO") return 1.4;
  if (uf === "RJ" || uf === "RIO DE JANEIRO") return 1.3;
  if (uf === "SC" || uf === "SANTA CATARINA") return 1.05;
  if (uf === "PR" || uf === "PARANÁ" || uf === "PARANA") return 1.05;

  return 1;
}

function calcularUrgenciaInterna(data: string, hora: string) {
  try {
    const partesData = String(data || "").trim().split("/");
    const partesHora = String(hora || "").trim().split(":");

    if (partesData.length !== 3 || partesHora.length !== 2) return 1;

    const [d, m, a] = partesData;
    const [hh, mm] = partesHora;

    const destino = new Date(
      Number(a),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      0,
      0
    );

    const agora = new Date();
    const diffMin = (destino.getTime() - agora.getTime()) / 60000;

    if (!Number.isFinite(diffMin) || diffMin <= 0) return 1;

    if (diffMin <= 30) return 1.6;
    if (diffMin <= 60) return 1.4;
    if (diffMin <= 180) return 1.2;

    return 1;
  } catch {
    return 1;
  }
}

export function calcularPrecoInteligente({
  km,
  min,
  tipo,
  estado,
  dataSaida,
  horarioSaida,
  isPro,
  vagas = 1,
  gasolina = 6.3,
  modoPreco = "compartilhado"
}: {
  km: number;
  min: number;
  tipo: TipoOfertaPricing;
  estado: string;
  dataSaida: string;
  horarioSaida: string;
    isPro: boolean;
  vagas?: number;
  gasolina?: number;
  modoPreco?: ModoPrecoPricing;
}) {
  const kmSeguro = Math.max(0, Number(km || 0));
  const minSeguro = Math.max(0, Number(min || 0));
  const vagasSeguras = Math.max(1, Number(vagas || 1));
  const gasolinaSegura = Math.max(4.5, Number(gasolina || 6.3));

  let baseKm = 0.45;
  let baseMin = 0.025;
  let taxaBase = 4;

  let multiplicadorMin = 0.52;
let multiplicadorMax = 1.25;

 if (tipo === "entrega") {
  baseKm = Math.max(0.42, gasolinaSegura / 15);
  baseMin = 0.035;
  taxaBase = 8;
  multiplicadorMin = 0.50;
  multiplicadorMax = 1.30;
}

if (tipo === "carona_solicitada" || tipo === "carona_oferecida") {
  if (modoPreco === "direto") {
    baseKm = 1.8;
    baseMin = 0.35;
    taxaBase = 3;
    multiplicadorMin = 0.80;
    multiplicadorMax = 1.40;
  } else {
    baseKm = Math.max(0.38, gasolinaSegura / 14);
    baseMin = 0.025;
    taxaBase = 4;
    multiplicadorMin = 0.604;
    multiplicadorMax = 1.25;
  }
}

  let fatorVagas = 1;

  if (tipo === "carona_oferecida") {
    if (vagasSeguras === 1) fatorVagas = 1.25;
    if (vagasSeguras === 2) fatorVagas = 1.1;
    if (vagasSeguras === 3) fatorVagas = 1;
    if (vagasSeguras >= 4) fatorVagas = 0.9;
  }
  const fatorPassageiros =
  tipo === "carona_solicitada"
    ? vagasSeguras
    : 1;
  const pico =
  tipo === "entrega"
    ? calcularHorarioPicoInterno()
    : 1;

const cidade =
  tipo === "entrega"
    ? calcularFatorCidadeInterno(estado)
    : 1;

const urgencia =
  tipo === "entrega"
    ? calcularUrgenciaInterna(dataSaida, horarioSaida)
    : 1;
  const premium = isPro ? 0.95 : 1;

  const valorBase =
    (kmSeguro * baseKm) +
    (minSeguro * baseMin) +
    taxaBase;

 const fatorCompartilhamento =
  tipo === "carona_solicitada" || tipo === "carona_oferecida"
    ? modoPreco === "direto"
      ? 1
      : 0.70
    : tipo === "entrega"
      ? 0.55
      : 1;

const valor =
  valorBase *
  pico *
  cidade *
  urgencia *
  premium *
  fatorCompartilhamento *
  (modoPreco === "compartilhado"
    ? fatorVagas * fatorPassageiros
    : 1);

 return {
  valorCalculado: Number(valor.toFixed(2)),
  valorMinimoCalculado: Number((valor * multiplicadorMin).toFixed(2)),
  valorMaximoCalculado: Number((valor * multiplicadorMax).toFixed(2)),
  picoCalculado: pico,
  cidadeCalculada: cidade,
  urgenciaCalculada: urgencia,
  premiumCalculado: premium,
  fatorVagasCalculado: fatorVagas,
fatorPassageirosCalculado: fatorPassageiros,
modoPrecoCalculado: modoPreco
};
}