import { consultarPagamentoMercadoPago, parseExternalReference } from "@/lib/billing";
import { adminServerTimestamp, getAdminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

type WebhookPayload = {
  action?: string;
  type?: string;
  topic?: string;
  data?: {
    id?: string | number;
  };
};

function planoToValorEsperado(plano: "pro" | "premium"): number {
  return plano === "premium" ? 49.9 : 9.9;
}

function planoQualificaComissao(plano: unknown): boolean {
  const normalizado = String(plano || "").trim().toLowerCase();
  return normalizado === "pro" || normalizado === "premium";
}

function resolveMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof (value as any)?.toMillis === "function") return Number((value as any).toMillis() || 0);
  if (typeof (value as any)?.seconds === "number") return Number((value as any).seconds) * 1000;
  return 0;
}

function construirDatasPlano(prevUsuario: Record<string, unknown>, plano: "pro" | "premium", nowMs: number) {
  const prevPlano = String(prevUsuario?.plano || "").trim().toLowerCase();
  const prevAtivo = prevUsuario?.assinaturaAtiva === true;
  const prevQualifica = prevAtivo && planoQualificaComissao(prevPlano);
  const prevDesdeCliente = resolveMillis(prevUsuario?.planoElegivelDesdeCliente);

  if (!planoQualificaComissao(plano)) {
    return {
      planoElegivelDesdeCliente: null,
      planoElegivelDesde: null,
    };
  }

  const planoElegivelDesdeCliente = prevQualifica && prevDesdeCliente > 0
    ? prevDesdeCliente
    : nowMs;

  return {
    planoElegivelDesdeCliente,
    planoElegivelDesde: new Date(planoElegivelDesdeCliente),
  };
}

function isPagamentoEvento(payload: WebhookPayload): boolean {
  const type = String(payload?.type || payload?.topic || "").toLowerCase();
  return type.includes("payment") || type.includes("pagamento");
}

function extractType(payload: WebhookPayload, request: Request): string {
  const url = new URL(request.url);
  const fromQuery = String(url.searchParams.get("type") || url.searchParams.get("topic") || "").toLowerCase();
  const fromBody = String(payload?.type || payload?.topic || "").toLowerCase();
  return fromBody || fromQuery;
}

function extractPaymentId(payload: WebhookPayload, request: Request): string {
  const url = new URL(request.url);
  const queryId = String(
    url.searchParams.get("data.id")
    || url.searchParams.get("id")
    || ""
  ).trim();
  const bodyId = String(payload?.data?.id || "").trim();
  return bodyId || queryId;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebhookPayload;

    const tipoEvento = extractType(payload, request);
    const tipoLikePayload: WebhookPayload = { ...payload, type: tipoEvento };

    if (!isPagamentoEvento(tipoLikePayload)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paymentId = extractPaymentId(payload, request);
    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: "sem_payment_id" });
    }

    const pagamento = await consultarPagamentoMercadoPago(paymentId);
    const pagamentoAny = pagamento as any;
    const status = String(pagamentoAny?.status || "").toLowerCase();

    if (status !== "approved") {
      return NextResponse.json({ ok: true, ignored: true, status });
    }

    const external = parseExternalReference(String(pagamentoAny?.external_reference || ""));
    if (!external) {
      return NextResponse.json({ ok: true, ignored: true, reason: "external_reference_invalida" });
    }

    const db = getAdminDb();
    const pagamentoRef = db.collection("pagamentos_web").doc(external.pagamentoRefId);
    const pagamentoDoc = await pagamentoRef.get();
    const pagamentoData = pagamentoDoc.exists ? (pagamentoDoc.data() as Record<string, unknown>) : null;

    if (!pagamentoData) {
      return NextResponse.json({ ok: true, ignored: true, reason: "pagamento_referencia_nao_encontrado" });
    }

    if (String(pagamentoData.uid || "") !== external.uid || String(pagamentoData.plano || "") !== external.plano) {
      return NextResponse.json({ ok: true, ignored: true, reason: "checkout_uid_plano_invalido" });
    }

    const valorEsperado = planoToValorEsperado(external.plano);
    const valorPago = Number(pagamentoAny?.transaction_amount || 0);
    const moedaPagamento = String(pagamentoAny?.currency_id || "").toUpperCase();

    if (!Number.isFinite(valorPago) || valorPago + 1e-6 < valorEsperado) {
      return NextResponse.json({ ok: true, ignored: true, reason: "valor_pago_invalido", valorPago, valorEsperado });
    }

    if (moedaPagamento && moedaPagamento !== "BRL") {
      return NextResponse.json({ ok: true, ignored: true, reason: "moeda_pagamento_invalida", moedaPagamento });
    }

    const usuarioRef = db.collection("usuarios").doc(external.uid);
    const usuarioSnap = await usuarioRef.get();
    const usuarioAtual = usuarioSnap.exists ? ((usuarioSnap.data() as Record<string, unknown>) || {}) : {};
    const nowMs = Date.now();
    const camposPlano = construirDatasPlano(usuarioAtual, external.plano, nowMs);

    await usuarioRef.set(
      {
        plano: external.plano,
        assinaturaAtiva: true,
        assinaturaOrigem: "web",
        assinaturaStatus: "ativa",
        assinaturaAtualizadaEm: adminServerTimestamp(),
        assinaturaProvider: "web_checkout",
        assinaturaProductId: null,
        assinaturaExpiraEm: null,
        ultimoOrderId: String(pagamentoAny?.order?.id || pagamentoAny?.external_reference || paymentId).trim() || null,
        pagamentoProvider: "mercado_pago",
        pagamentoId: paymentId,
        ...camposPlano,
      },
      { merge: true }
    );

    await pagamentoRef.set(
      {
        status: "approved",
        assinaturaAplicada: true,
        paymentId,
        planoAplicado: external.plano,
        valorPago,
        valorEsperado,
        moedaPagamento: moedaPagamento || null,
        atualizadoEm: Date.now(),
        assinaturaAtualizadaEm: adminServerTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook/pagamento] erro", error);
    return NextResponse.json({ error: "webhook_error" }, { status: 500 });
  }
}