import { getAdminDb } from "@/lib/firebase-admin";

export type PlanoCheckout = "pro" | "premium";

type CheckoutInitResult = {
  initPoint: string;
  preferenceId: string;
  pagamentoRefId: string;
};

type PreferenciaMercadoPago = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type PagamentoMercadoPago = {
  id?: number | string;
  status?: string;
  external_reference?: string;
};

function requireEnv(name: string): string {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  return value;
}

function webBaseUrl(): string {
  const fromEnv = String(process.env.NEXT_PUBLIC_WEB_URL || "").trim();
  return fromEnv || "http://localhost:3000";
}

function planoToPrice(plano: PlanoCheckout): number {
  return plano === "premium" ? 49.9 : 9.9;
}

function planoToTitle(plano: PlanoCheckout): string {
  return plano === "premium" ? "INSANE GPS Premium" : "INSANE GPS Pro";
}

export async function criarCheckoutMercadoPago(input: {
  uid: string;
  plano: PlanoCheckout;
}): Promise<CheckoutInitResult> {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const baseUrl = webBaseUrl();

  const uid = String(input.uid || "").trim();
  const plano = input.plano;
  if (!uid) throw new Error("uid obrigatorio");
  if (plano !== "pro" && plano !== "premium") throw new Error("plano invalido");

  const db = getAdminDb();
  const pagamentoRef = db.collection("pagamentos_web").doc();

  await pagamentoRef.set({
    uid,
    plano,
    provider: "mercado_pago",
    status: "checkout_criado",
    criadoEm: Date.now(),
  });

  const externalReference = `${pagamentoRef.id}|${uid}|${plano}`;
  const notificationUrl = `${baseUrl.replace(/\/$/, "")}/api/webhooks/pagamento`;

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_reference: externalReference,
      notification_url: notificationUrl,
      metadata: {
        uid,
        plano,
        pagamentoRefId: pagamentoRef.id,
      },
      items: [
        {
          id: plano,
          title: planoToTitle(plano),
          quantity: 1,
          unit_price: planoToPrice(plano),
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${baseUrl}/oferecer?checkout=success`,
        pending: `${baseUrl}/oferecer?checkout=pending`,
        failure: `${baseUrl}/oferecer?checkout=failure`,
      },
      auto_return: "approved",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    await pagamentoRef.set(
      {
        status: "erro_checkout",
        erro: String(errText || "").slice(0, 2000),
        atualizadoEm: Date.now(),
      },
      { merge: true }
    );
    throw new Error(`Erro ao criar checkout Mercado Pago: HTTP ${response.status}`);
  }

  const data = (await response.json()) as PreferenciaMercadoPago;
  const initPoint = String(data.init_point || data.sandbox_init_point || "").trim();
  const preferenceId = String(data.id || "").trim();

  if (!initPoint || !preferenceId) {
    throw new Error("Mercado Pago nao retornou init_point/preference_id");
  }

  await pagamentoRef.set(
    {
      status: "checkout_enviado",
      preferenceId,
      initPoint,
      atualizadoEm: Date.now(),
    },
    { merge: true }
  );

  return {
    initPoint,
    preferenceId,
    pagamentoRefId: pagamentoRef.id,
  };
}

export async function consultarPagamentoMercadoPago(paymentId: string): Promise<PagamentoMercadoPago> {
  const accessToken = requireEnv("MERCADO_PAGO_ACCESS_TOKEN");
  const id = String(paymentId || "").trim();
  if (!id) throw new Error("paymentId obrigatorio");

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao consultar pagamento ${id}: HTTP ${response.status} ${errText.slice(0, 300)}`);
  }

  return (await response.json()) as PagamentoMercadoPago;
}

export function parseExternalReference(value: string): {
  pagamentoRefId: string;
  uid: string;
  plano: PlanoCheckout;
} | null {
  const raw = String(value || "").trim();
  const [pagamentoRefId, uid, planoRaw] = raw.split("|");
  const plano = planoRaw === "premium" ? "premium" : planoRaw === "pro" ? "pro" : null;
  if (!pagamentoRefId || !uid || !plano) return null;
  return { pagamentoRefId, uid, plano };
}
