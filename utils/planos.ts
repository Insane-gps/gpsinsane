// ============================================================
// INSANE GPS — Utilitários de Planos
// ============================================================
// Funções centrais para lógica de planos, preços e permissões.
// Importe daqui, nunca duplique lógica em outros arquivos.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ASYNC_KEY_ASSINATURA,
    ASYNC_KEY_PRO_LEGADO,
    DATA_FIM_PREMIUM_FREE,
    DATA_LANCAMENTO_APP,
    DURACAO_CICLO_MS,
    DURACAO_FASE_LANCAMENTO_DIAS,
    DURACAO_FASE_TRANSICAO_DIAS,
    moedaPorRegiao,
    PERMISSOES_POR_PLANO,
    TABELA_PRECOS,
    type AssinaturaUsuario,
    type FasePlano,
    type MoedaPlano,
    type PlanoUsuario,
} from "../data/configPlanos";

// ─── FASE ATUAL ──────────────────────────────────────────────

/**
 * Retorna a fase comercial atual do app com base na data de lançamento.
 */
export function obterFasePlanoAtual(agora: number = Date.now()): FasePlano {
  const diasDesde = (agora - DATA_LANCAMENTO_APP) / (1000 * 60 * 60 * 24);
  if (diasDesde < 0) return "lancamento"; // antes do lançamento oficial
  if (diasDesde <= DURACAO_FASE_LANCAMENTO_DIAS) return "lancamento";
  if (diasDesde <= DURACAO_FASE_LANCAMENTO_DIAS + DURACAO_FASE_TRANSICAO_DIAS) return "transicao";
  return "normal";
}

// ─── MOEDA / REGIÃO ──────────────────────────────────────────

export { moedaPorRegiao };

/**
 * Retorna o símbolo de exibição da moeda.
 */
export function obterSimboloMoeda(moeda: MoedaPlano): string {
  switch (moeda) {
    case "BRL": return "R$";
    case "USD": return "$";
    case "EUR": return "€";
    default: return "$";
  }
}

// ─── PREÇOS ──────────────────────────────────────────────────

/**
 * Retorna os preços atuais para NOVOS assinantes conforme região.
 * Assinantes antigos devem usar precoTravadoMensal da AssinaturaUsuario.
 */
export function obterPrecosAtuaisNovosAssinantes(regiao: string | null | undefined): {
  pro: number;
  premium: number;
  moeda: MoedaPlano;
  fase: FasePlano;
} {
  const fase = obterFasePlanoAtual();
  const moeda = moedaPorRegiao(regiao);
  return {
    pro:     TABELA_PRECOS[fase].pro[moeda],
    premium: TABELA_PRECOS[fase].premium[moeda],
    moeda,
    fase,
  };
}

/**
 * Formata um valor monetário para exibição.
 * Usa Intl.NumberFormat quando disponível, senso usa formatação manual.
 */
export function formatarPreco(valor: number, moeda: MoedaPlano, idioma?: string): string {
  const localeMap: Record<MoedaPlano, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  const locale = idioma
    ? idioma.replace("_", "-")
    : localeMap[moeda] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: moeda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  } catch {
    const simbolo = obterSimboloMoeda(moeda);
    return `${simbolo} ${valor.toFixed(2)}`;
  }
}

/**
 * Calcula o valor líquido após a taxa de 15% da Play Store.
 */
export function calcularLiquidoPlayStore(valor: number): number {
  return Math.round(valor * 0.85 * 100) / 100;
}

// ─── VALIDADE DA ASSINATURA ───────────────────────────────────

/**
 * Verifica se uma assinatura está expirada.
 * Se dataFim existir, compara com agora.
 * Se não existir dataFim, assume ciclo de 30 dias a partir de dataInicio.
 */
export function assinaturaExpirada(
  assinatura: AssinaturaUsuario | null | undefined,
  agora: number = Date.now()
): boolean {
  if (!assinatura) return true;
  if (!assinatura.ativo) return true;
  if (!assinatura.dataInicio) return true;

  if (assinatura.dataFim != null) {
    return agora > assinatura.dataFim;
  }

  const expiracao = assinatura.dataInicio + DURACAO_CICLO_MS;
  return agora > expiracao;
}

// ─── NORMALIZAÇÃO DE STATUS ───────────────────────────────────

/**
 * Normaliza o plano do usuário levando em conta expiração.
 * Se expirado, rebaixa para "free".
 */
export function normalizarStatusAssinatura(
  assinatura: AssinaturaUsuario | null | undefined,
  agora: number = Date.now()
): PlanoUsuario {
  if (!assinatura) return "free";
  if (assinaturaExpirada(assinatura, agora)) return "free";
  return assinatura.plano;
}

// ─── PERMISSÕES ───────────────────────────────────────────────

export function obterPermissoesDoPlano(plano: PlanoUsuario) {
  return PERMISSOES_POR_PLANO[plano] ?? PERMISSOES_POR_PLANO.free;
}

// ─── HELPERS DE PLANO ─────────────────────────────────────────

export function usuarioEhFree(plano: PlanoUsuario): boolean {
  return plano === "free";
}

export function usuarioEhPro(plano: PlanoUsuario): boolean {
  return plano === "pro" || plano === "premium";
}

export function usuarioEhPremium(plano: PlanoUsuario): boolean {
  return plano === "premium" || plano === "premium_free";
}

export function usuarioEhPremiumFree(plano: PlanoUsuario): boolean {
  return plano === "premium_free";
}

/**
 * Retorna true se o Premium Free ainda está dentro do período de validade
 * (75 dias a partir da data de lançamento na Play Store).
 */
export function premiumFreeDisponivel(agora: number = Date.now()): boolean {
  return agora <= DATA_FIM_PREMIUM_FREE;
}

export { DATA_FIM_PREMIUM_FREE };

export function usuarioPodeModoComico(plano: PlanoUsuario): boolean {
  return Boolean(obterPermissoesDoPlano(plano).modoComico);
}

export function usuarioPodeXingamentoNivel(nivel: number, plano: PlanoUsuario): boolean {
  const nivelSeguro = Math.max(0, Math.min(4, Number(nivel) || 0));
  return nivelSeguro <= obterPermissoesDoPlano(plano).nivelMaxXingamento;
}

export function usuarioPodeCriarOfertaPremium(plano: PlanoUsuario): boolean {
  return obterPermissoesDoPlano(plano).podeDarCarona;
}

export function usuarioPodeGanharDinheiroComOfertas(plano: PlanoUsuario): boolean {
  return obterPermissoesDoPlano(plano).podeGanharDinheiro;
}

// ─── PERSISTÊNCIA ─────────────────────────────────────────────

/**
 * Carrega a assinatura do AsyncStorage.
 * Migra automaticamente usuários com a chave legada "pro_ativo".
 */
export async function carregarAssinaturaLocal(): Promise<AssinaturaUsuario> {
  try {
    // Tentar carregar formato novo
    const raw = await AsyncStorage.getItem(ASYNC_KEY_ASSINATURA);
    if (raw) {
      const parsed: AssinaturaUsuario = JSON.parse(raw);
      return parsed;
    }

    // Migração: verificar chave legada "pro_ativo"
    const legado = await AsyncStorage.getItem(ASYNC_KEY_PRO_LEGADO);
    if (legado === "sim") {
      const assinaturaMigrada: AssinaturaUsuario = {
        plano: "pro",
        ativo: true,
        dataInicio: null, // data desconhecida na migração
        dataFim: null,    // sem prazo fixo
        precoTravadoMensal: null,
        moeda: "BRL",
        origem: "manual",
        faseNaEntrada: "lancamento",
        regiaoNaEntrada: "BR",
      };
      // Persistir no formato novo para evitar migração futura
      await salvarAssinaturaLocal(assinaturaMigrada);
      return assinaturaMigrada;
    }
  } catch (e) {
    console.log("[planos] Erro ao carregar assinatura:", e);
  }

  return {
    plano: "free",
    ativo: false,
    dataInicio: null,
  };
}

/**
 * Salva a assinatura no AsyncStorage.
 */
export async function salvarAssinaturaLocal(assinatura: AssinaturaUsuario): Promise<void> {
  try {
    await AsyncStorage.setItem(ASYNC_KEY_ASSINATURA, JSON.stringify(assinatura));
  } catch (e) {
    console.log("[planos] Erro ao salvar assinatura:", e);
  }
}

/**
 * Ativa um plano pago para o usuário, travando o preço vigente.
 */
export async function ativarPlano(params: {
  plano: Exclude<PlanoUsuario, "free">;
  regiao: string | null | undefined;
  origem?: AssinaturaUsuario["origem"];
  precoCustom?: number;
}): Promise<AssinaturaUsuario> {
  const fase = obterFasePlanoAtual();
  const moeda = moedaPorRegiao(params.regiao);
  const preco = params.precoCustom ?? TABELA_PRECOS[fase][params.plano][moeda];
  const agora = Date.now();

  const novaAssinatura: AssinaturaUsuario = {
    plano: params.plano,
    ativo: true,
    dataInicio: agora,
    dataFim: agora + DURACAO_CICLO_MS,
    precoTravadoMensal: preco,
    moeda,
    origem: params.origem ?? "manual",
    faseNaEntrada: fase,
    regiaoNaEntrada: params.regiao ?? null,
  };

  await salvarAssinaturaLocal(novaAssinatura);
  return novaAssinatura;
}

/**
 * Cancela a assinatura atual, revertendo para free.
 */
export async function cancelarAssinatura(): Promise<AssinaturaUsuario> {
  const assinatura: AssinaturaUsuario = {
    plano: "free",
    ativo: false,
    dataInicio: null,
  };
  await salvarAssinaturaLocal(assinatura);
  return assinatura;
}
