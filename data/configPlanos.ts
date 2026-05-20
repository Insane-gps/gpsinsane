// ============================================================
// INSANE GPS — Configuração Central de Planos
// ============================================================
// Este arquivo é a fonte de verdade para fases de lançamento,
// preços por moeda e regiões suportadas.
// Não altere os tipos sem atualizar utils/planos.ts junto.
// ============================================================

// ─── TIPOS PÚBLICOS ──────────────────────────────────────────

export type PlanoUsuario = "free" | "pro" | "premium" | "premium_free";
export type FasePlano = "lancamento" | "transicao" | "normal";
export type MoedaPlano = "BRL" | "USD" | "EUR";

export type AssinaturaUsuario = {
  /** Plano contratado */
  plano: PlanoUsuario;
  /** Se a assinatura está ativa (não expirada, não cancelada) */
  ativo: boolean;
  /** Timestamp ms do início da assinatura */
  dataInicio: number | null;
  /** Timestamp ms de expiração (null = sem prazo fixo, usa ciclo de 30 dias) */
  dataFim?: number | null;
  /** Preço mensal travado na contratação (em moeda original) */
  precoTravadoMensal?: number | null;
  /** Moeda travada na contratação */
  moeda?: MoedaPlano | null;
  /** Canal de origem da assinatura */
  origem?: "play_store" | "pix" | "manual" | "teste";
  /** Fase do app no momento da contratação */
  faseNaEntrada?: FasePlano | null;
  /** Região do dispositivo no momento da contratação */
  regiaoNaEntrada?: string | null;
};

// ─── DATA OFICIAL DE LANÇAMENTO ──────────────────────────────
// Altere esta data para a data real de lançamento do app.
// Formato: ISO 8601 UTC
export const DATA_LANCAMENTO_APP = new Date("2026-04-23T00:00:00.000Z").getTime();

// ─── PREMIUM FREE ─────────────────────────────────────────────
// Plano gratuito para motoristas válido por 75 dias a partir do lançamento.
export const DURACAO_PREMIUM_FREE_DIAS = 75;
export const DATA_FIM_PREMIUM_FREE = (() => {
  return DATA_LANCAMENTO_APP + DURACAO_PREMIUM_FREE_DIAS * 24 * 60 * 60 * 1000;
})();

// ─── DURAÇÃO DAS FASES (em dias) ─────────────────────────────
export const DURACAO_FASE_LANCAMENTO_DIAS = 180; // 6 meses
export const DURACAO_FASE_TRANSICAO_DIAS  = 90;  // meses 7–9

// ─── TABELA DE PREÇOS ────────────────────────────────────────
// Estrutura: fase → plano → moeda → valor
// Apenas planos pagos (pro e premium) têm entrada aqui.
export type PrecosPorMoeda = Record<MoedaPlano, number>;
export type PrecosPlanosPagos = Record<Exclude<PlanoUsuario, "free" | "premium_free">, PrecosPorMoeda>;
export type TabelaPrecos = Record<FasePlano, PrecosPlanosPagos>;

export const TABELA_PRECOS: TabelaPrecos = {
  lancamento: {
    pro:     { BRL: 9.90, USD: 2.90,  EUR: 2.90  },
    premium: { BRL: 49.90, USD: 9.99,  EUR: 9.99  },
  },
  transicao: {
    pro:     { BRL: 14.90, USD: 2.99,  EUR: 2.99  },
    premium: { BRL: 79.90, USD: 14.99, EUR: 14.99 },
  },
  normal: {
    pro:     { BRL: 14.90, USD: 2.99,  EUR: 2.99  },
    premium: { BRL: 99.90, USD: 18.99, EUR: 18.99 },
  },
};

// ─── MAPEAMENTO REGIÃO → MOEDA ────────────────────────────────
// Países da zona do euro (lista não exaustiva, mas abrangente)
const PAISES_EURO = new Set([
  "AT","BE","CY","EE","FI","FR","DE","GR","IE","IT",
  "LV","LT","LU","MT","NL","PT","SK","SI","ES",
]);

/**
 * Retorna a moeda padrão para uma região (código de país ISO 3166-1 alfa-2).
 * Fallback para USD quando a região não é reconhecida.
 */
export function moedaPorRegiao(regiao: string | null | undefined): MoedaPlano {
  if (!regiao) return "USD";
  const r = regiao.toUpperCase().trim();
  if (r === "BR") return "BRL";
  if (PAISES_EURO.has(r)) return "EUR";
  return "USD";
}

// ─── DURAÇÃO DO CICLO ────────────────────────────────────────
/** Duração padrão de um ciclo de assinatura mensal, em ms */
export const DURACAO_CICLO_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ─── PERMISSÕES POR PLANO ────────────────────────────────────
export type PermissoesPlano = {
  modoComico: boolean;
  nivelMaxXingamento: 0 | 1 | 2 | 3 | 4;
  podeDarCarona: boolean;
  podeFazerEntrega: boolean;
  podeAceitarOferta: boolean;
  podeGanharDinheiro: boolean;
};

export const PERMISSOES_POR_PLANO: Record<PlanoUsuario, PermissoesPlano> = {
  free: {
    modoComico: false,
    nivelMaxXingamento: 0,
    podeDarCarona: false,
    podeFazerEntrega: false,
    podeAceitarOferta: false,
    podeGanharDinheiro: false,
  },
  // Plano gratuito para motoristas durante os primeiros 75 dias de lançamento.
  // Libera funcionalidades de motorista mas bloqueia xingamentos e modo cômico.
  premium_free: {
    modoComico: false,
    nivelMaxXingamento: 0,
    podeDarCarona: true,
    podeFazerEntrega: true,
    podeAceitarOferta: true,
    podeGanharDinheiro: true,
  },
  pro: {
    modoComico: true,
    nivelMaxXingamento: 4,
    podeDarCarona: false,
    podeFazerEntrega: false,
    podeAceitarOferta: false,
    podeGanharDinheiro: false,
  },
  premium: {
    modoComico: true,
    nivelMaxXingamento: 4,
    podeDarCarona: true,
    podeFazerEntrega: true,
    podeAceitarOferta: true,
    podeGanharDinheiro: true,
  },
};

// ─── CHAVE DE PERSISTÊNCIA ────────────────────────────────────
export const ASYNC_KEY_ASSINATURA = "assinatura_usuario_v2";
/** Chave legada (só para upgrading de usuários antigos) */
export const ASYNC_KEY_PRO_LEGADO  = "pro_ativo";
