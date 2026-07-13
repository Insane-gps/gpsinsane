import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

type DecodedToken = {
  uid?: string;
};

type UsuarioData = Record<string, unknown>;

function parseBearerToken(request: Request) {
  const authHeader = String(request.headers.get("authorization") || "");
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
}

function toMillis(value: unknown): number {
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
}

function toIsoOrNull(value: unknown): string | null {
  const ms = toMillis(value);
  if (!ms) return null;
  return new Date(ms).toISOString();
}

function maskMid(value: unknown, visibleStart = 4, visibleEnd = 3): string {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  if (raw.length <= visibleStart + visibleEnd) {
    return `${raw.slice(0, Math.max(1, visibleStart - 1))}***`;
  }
  return `${raw.slice(0, visibleStart)}***${raw.slice(-visibleEnd)}`;
}

function partialPaymentId(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const compact = raw.replace(/\s+/g, "");
  if (compact.length <= 8) return `${compact.slice(0, 3)}***`;
  return `${compact.slice(0, 5)}***${compact.slice(-4)}`;
}

function parsePlano(value: unknown): "PRO" | "PREMIUM" | "-" {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "-";
  if (raw.includes("premium")) return "PREMIUM";
  if (raw.includes("pro")) return "PRO";
  return "-";
}

function asMoney(value: unknown): number {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(2));
}

function normalizeBaseName(value: unknown): string {
  const raw = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return raw.slice(0, 18) || "usuario";
}

function randomSuffix(length = 6): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}

async function generateUniqueCodigoIndicacao(db: ReturnType<typeof getAdminDb>, usuario: UsuarioData) {
  const baseName = normalizeBaseName(
    usuario.nome || usuario.displayName || usuario.nomeCompleto || usuario.email || usuario.emailUsuario
  );

  for (let tentativa = 0; tentativa < 12; tentativa += 1) {
    const codigo = `${baseName}_${randomSuffix(6)}`;
    const conflito = await db.collection("usuarios").where("codigoIndicacao", "==", codigo).limit(1).get();
    if (conflito.empty) {
      return codigo;
    }
  }

  return `${baseName}_${randomSuffix(8)}`;
}

export async function GET(request: Request) {
  try {
    const token = parseBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "token ausente" }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "token invalido" }, { status: 401 });
    }

    const uid = String(decoded?.uid || "").trim();
    if (!uid) {
      return NextResponse.json({ error: "usuario invalido" }, { status: 401 });
    }

    const db = getAdminDb();

    const usuarioRef = db.collection("usuarios").doc(uid);
    const [usuarioSnap, resumoSnap, comissoesSnap] = await Promise.all([
      usuarioRef.get(),
      db.collection("comissoesResumo").doc(uid).get(),
      db.collection("comissoes").where("uidIndicador", "==", uid).get(),
    ]);

    const usuario = usuarioSnap.exists ? (usuarioSnap.data() || {}) : {};

    let codigoIndicacao = String(
      (usuario as UsuarioData).codigoIndicacao ||
      (usuario as UsuarioData).codigoConvite ||
      (usuario as UsuarioData).codigoReferencia ||
      ""
    ).trim();

    if (!codigoIndicacao) {
      codigoIndicacao = await generateUniqueCodigoIndicacao(db, usuario as UsuarioData);
      await usuarioRef.set(
        {
          codigoIndicacao,
          codigoIndicacaoGeradoEm: Date.now(),
          codigoIndicacaoGeradoEmCliente: Date.now(),
          atualizadoEm: Date.now(),
          atualizadoEmCliente: Date.now(),
        },
        { merge: true },
      );
    }

    const resumo = resumoSnap.exists ? (resumoSnap.data() || {}) : {};

    const linkIndicacao = codigoIndicacao
      ? `https://insanegps.com.br/convite/${encodeURIComponent(codigoIndicacao)}`
      : "";

    const historico = comissoesSnap.docs
      .map((docAtual) => {
        const dados = docAtual.data() || {};
        const anyDados = dados as Record<string, unknown>;

        const plano = parsePlano(
          anyDados.plano ||
          anyDados.assinaturaPlano ||
          anyDados.assinaturaTipo ||
          anyDados.assinaturaProductId
        );

        const valorAssinatura = asMoney(
          anyDados.valorAssinatura ||
          anyDados.valorPlano ||
          anyDados.valorPago ||
          anyDados.valorAssinaturaPago
        );

        const percentual = Number(anyDados.percentualComissao || 5);
        const valorComissao = asMoney(anyDados.valorComissao);
        const status = String(anyDados.status || "pendente").trim() || "pendente";

        const criadoEm = toIsoOrNull(anyDados.criadoEmCliente || anyDados.criadoEm || anyDados.createdAt);
        const liberadoEm = toIsoOrNull(anyDados.liberadoEm || anyDados.aprovadoEm || anyDados.pagoEm);

        const indicadoRef = maskMid(anyDados.uidIndicado || anyDados.indicadoUid || anyDados.usuarioIndicadoUid);
        const pagamentoRef = partialPaymentId(
          anyDados.orderId ||
          anyDados.purchaseToken ||
          anyDados.transactionId ||
          anyDados.paymentIntentId
        );

        return {
          id: docAtual.id,
          plano,
          valorAssinatura,
          percentual: Number.isFinite(percentual) ? percentual : 5,
          valorComissao,
          status,
          criadoEm,
          liberadoEm,
          indicadoRef,
          pagamentoRef,
        };
      })
      .sort((a, b) => {
        const aTime = a.criadoEm ? Date.parse(a.criadoEm) : 0;
        const bTime = b.criadoEm ? Date.parse(b.criadoEm) : 0;
        return bTime - aTime;
      });

    const resposta = {
      ok: true,
      codigoIndicacao,
      linkIndicacao,
      resumo: {
        indicados: Number((resumo as Record<string, unknown>).indicados || 0),
        assinaturasAtivas: Number((resumo as Record<string, unknown>).assinaturasAtivas || 0),
        comissaoPendente: asMoney((resumo as Record<string, unknown>).comissaoPendente),
        comissaoLiberada: asMoney((resumo as Record<string, unknown>).comissaoLiberada),
        comissaoAprovada: asMoney((resumo as Record<string, unknown>).comissaoAprovada),
        comissaoPaga: asMoney((resumo as Record<string, unknown>).comissaoPaga),
        comissaoCancelada: asMoney((resumo as Record<string, unknown>).comissaoCancelada),
        comissaoBloqueadaPixInvalido: asMoney((resumo as Record<string, unknown>).comissaoBloqueadaPixInvalido),
        comissaoExpiradaPorPlano: asMoney((resumo as Record<string, unknown>).comissaoExpiradaPorPlano),
        comissaoExpiradaPorTempo: asMoney((resumo as Record<string, unknown>).comissaoExpiradaPorTempo),
      },
      dadosPagamento: {
        temDados: Boolean(
          (usuario as Record<string, unknown>).pixChave ||
          (usuario as Record<string, unknown>).chavePix ||
          (usuario as Record<string, unknown>).pixTipo ||
          (usuario as Record<string, unknown>).pixNomeTitular
        ),
      },
      historico,
    };

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("[divulgador/comissoes][GET] erro", error);
    return NextResponse.json({ error: "falha ao carregar dados do divulgador" }, { status: 500 });
  }
}
