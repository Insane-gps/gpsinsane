import { adminServerTimestamp, getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "ocimar0102@gmail.com",
  "creatinglab1@gmail.com",
].map((item) => item.toLowerCase());

const ALLOWED_STATUS = new Set([
  "pendente",
  "liberada",
  "aprovada",
  "paga",
  "cancelada",
  "expirada_sem_pro",
  "expirada_por_plano",
  "expirada_por_tempo",
  "bloqueada_pix_invalido",
]);

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pendente: ["liberada", "bloqueada_pix_invalido", "expirada_por_plano", "expirada_por_tempo", "cancelada"],
  bloqueada_pix_invalido: ["liberada", "expirada_por_tempo", "expirada_por_plano", "cancelada"],
  liberada: ["aprovada", "paga", "cancelada"],
  aprovada: ["paga", "cancelada"],
  paga: [],
  cancelada: [],
  expirada_sem_pro: [],
  expirada_por_plano: [],
  expirada_por_tempo: [],
};

function parseBearerToken(request: Request) {
  const authHeader = String(request.headers.get("authorization") || "");
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
}

async function validarAdmin(request: Request) {
  const token = parseBearerToken(request);
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ error: "token ausente" }, { status: 401 }) };
  }

  let decoded: { email?: string };
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "token invalido" }, { status: 401 }) };
  }
  const email = String(decoded.email || "").trim().toLowerCase();

  if (!ADMIN_EMAILS.includes(email)) {
    return { ok: false as const, response: NextResponse.json({ error: "acesso negado" }, { status: 403 }) };
  }

  return { ok: true as const, email };
}

async function recalcularResumoIndicador(uidIndicador: string) {
  const db = getAdminDb();
  const resumoRef = db.collection("comissoesResumo").doc(uidIndicador);
  const resumoAtualSnap = await resumoRef.get();
  const resumoAtual = resumoAtualSnap.exists ? ((resumoAtualSnap.data() as Record<string, unknown>) || {}) : {};

  const snap = await db.collection("comissoes").where("uidIndicador", "==", uidIndicador).get();

  let pendente = 0;
  let liberada = 0;
  let aprovada = 0;
  let paga = 0;
  let cancelada = 0;
  let expiradaPorPlano = 0;
  let expiradaPorTempo = 0;
  let bloqueadaPixInvalido = 0;

  snap.docs.forEach((docAtual) => {
    const dados = docAtual.data() || {};
    const status = String(dados.status || "pendente").trim();
    const valor = Number(dados.valorComissao || 0);

    if (!Number.isFinite(valor) || valor <= 0) return;

    if (status === "pendente") pendente += valor;
    if (status === "liberada") liberada += valor;
    if (status === "aprovada") aprovada += valor;
    if (status === "paga") paga += valor;
    if (status === "cancelada") cancelada += valor;
    if (status === "expirada_sem_pro" || status === "expirada_por_plano") expiradaPorPlano += valor;
    if (status === "expirada_por_tempo") expiradaPorTempo += valor;
    if (status === "bloqueada_pix_invalido") bloqueadaPixInvalido += valor;
  });

  await resumoRef.set({
    uidIndicador,
    indicados: Number(resumoAtual.indicados || 0),
    assinaturasAtivas: Number(resumoAtual.assinaturasAtivas || 0),
    comissaoPendente: Number(pendente.toFixed(2)),
    comissaoLiberada: Number(liberada.toFixed(2)),
    comissaoAprovada: Number(aprovada.toFixed(2)),
    comissaoPaga: Number(paga.toFixed(2)),
    comissaoCancelada: Number(cancelada.toFixed(2)),
    comissaoExpiradaPorPlano: Number(expiradaPorPlano.toFixed(2)),
    comissaoExpiradaPorTempo: Number(expiradaPorTempo.toFixed(2)),
    comissaoBloqueadaPixInvalido: Number(bloqueadaPixInvalido.toFixed(2)),
    atualizadoEm: adminServerTimestamp(),
  }, { merge: true });
}

export async function GET(request: Request) {
  try {
    const validacao = await validarAdmin(request);
    if (!validacao.ok) return validacao.response;

    const db = getAdminDb();
    const snap = await db.collection("comissoes").get();

    if (snap.empty) {
      return NextResponse.json({ ok: true, comissoes: [] });
    }

    const toMillis = (value: unknown): number => {
      if (!value) return 0;
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      if (typeof value === "string") {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }

      const anyValue = value as { toMillis?: () => number; seconds?: number };
      if (typeof anyValue.toMillis === "function") {
        const ms = Number(anyValue.toMillis() || 0);
        return Number.isFinite(ms) ? ms : 0;
      }

      if (typeof anyValue.seconds === "number") {
        const ms = Number(anyValue.seconds) * 1000;
        return Number.isFinite(ms) ? ms : 0;
      }

      return 0;
    };

    const getSortValue = (item: Record<string, unknown>) => {
      return (
        toMillis(item.criadoEmCliente) ||
        toMillis(item.criadoEm) ||
        toMillis(item.createdAt) ||
        0
      );
    };

    const comissoes = snap.docs.map((docAtual) => ({
      id: docAtual.id,
      ...(docAtual.data() || {}),
    })) as Array<Record<string, unknown>>;

    comissoes.sort((a, b) => getSortValue(b) - getSortValue(a));

    return NextResponse.json({ ok: true, comissoes });
  } catch (error) {
    console.error("[admin/comissoes][GET] erro", error);
    return NextResponse.json({ error: "falha ao carregar comissoes" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const validacao = await validarAdmin(request);
    if (!validacao.ok) return validacao.response;

    const body = (await request.json()) as { id?: string; status?: string };
    const id = String(body?.id || "").trim();
    const status = String(body?.status || "").trim();

    if (!id || !ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: "payload invalido" }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection("comissoes").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "comissao nao encontrada" }, { status: 404 });
    }

    const atual = snap.data() || {};
    const statusAtual = String(atual.status || "pendente").trim();
    const permitidos = STATUS_TRANSITIONS[statusAtual] || [];
    if (status !== statusAtual && !permitidos.includes(status)) {
      return NextResponse.json({ error: "transicao_de_status_nao_permitida" }, { status: 409 });
    }

    const historicoAtual = Array.isArray((atual as Record<string, unknown>).historicoStatus)
      ? ((atual as Record<string, unknown>).historicoStatus as unknown[])
      : [];

    const payload: Record<string, unknown> = {
      status,
      atualizadoEm: adminServerTimestamp(),
      atualizadoEmCliente: Date.now(),
      atualizadoPorAdminEmail: validacao.email,
      historicoStatus: [
        ...historicoAtual,
        {
          de: statusAtual,
          para: status,
          atCliente: Date.now(),
          origem: "admin_api",
          adminEmail: validacao.email,
        },
      ].slice(-100),
    };

    if (status === "liberada") payload.liberadoEm = adminServerTimestamp();
    if (status === "aprovada") payload.aprovadoEm = adminServerTimestamp();
    if (status === "paga") payload.pagoEm = adminServerTimestamp();
    if (status === "cancelada") payload.canceladoEm = adminServerTimestamp();
    if (status === "expirada_sem_pro" || status === "expirada_por_plano" || status === "expirada_por_tempo") payload.expiradoEm = adminServerTimestamp();
    if (status === "bloqueada_pix_invalido") payload.bloqueadoEm = adminServerTimestamp();

    await ref.set(payload, { merge: true });
    await recalcularResumoIndicador(String(atual.uidIndicador || "").trim());

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/comissoes][PATCH] erro", error);
    return NextResponse.json({ error: "falha ao atualizar comissao" }, { status: 500 });
  }
}