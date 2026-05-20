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
    const status = String(pagamento?.status || "").toLowerCase();

    if (status !== "approved") {
      return NextResponse.json({ ok: true, ignored: true, status });
    }

    const external = parseExternalReference(String(pagamento?.external_reference || ""));
    if (!external) {
      return NextResponse.json({ ok: true, ignored: true, reason: "external_reference_invalida" });
    }

    const db = getAdminDb();
    const usuarioRef = db.collection("usuarios").doc(external.uid);

    await usuarioRef.set(
      {
        plano: external.plano,
        assinaturaAtiva: true,
        assinaturaOrigem: "web",
        assinaturaStatus: "ativa",
        assinaturaAtualizadaEm: adminServerTimestamp(),
        pagamentoProvider: "mercado_pago",
        pagamentoId: paymentId,
      },
      { merge: true }
    );

    await db
      .collection("pagamentos_web")
      .doc(external.pagamentoRefId)
      .set(
        {
          status: "approved",
          assinaturaAplicada: true,
          paymentId,
          planoAplicado: external.plano,
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
