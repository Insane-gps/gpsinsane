import { criarCheckoutMercadoPago } from "@/lib/billing";
import { getAdminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

type CheckoutBody = {
  uid?: string;
  plano?: "pro" | "premium";
};

export async function POST(request: Request) {
  try {
    const authHeader = String(request.headers.get("authorization") || "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      return NextResponse.json({ error: "token ausente" }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutBody;
    const uid = String(body?.uid || "").trim();
    const plano = body?.plano;

    if (!uid) {
      return NextResponse.json({ error: "uid obrigatorio" }, { status: 400 });
    }

    if (plano !== "pro" && plano !== "premium") {
      return NextResponse.json({ error: "plano invalido" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (String(decoded.uid || "") !== uid) {
      return NextResponse.json({ error: "uid/token invalido" }, { status: 403 });
    }

    const checkout = await criarCheckoutMercadoPago({ uid, plano });

    return NextResponse.json({
      ok: true,
      provider: "mercado_pago",
      initPoint: checkout.initPoint,
      preferenceId: checkout.preferenceId,
    });
  } catch (error) {
    console.error("[checkout] erro ao criar checkout", error);
    return NextResponse.json({ error: "falha ao criar checkout" }, { status: 500 });
  }
}
