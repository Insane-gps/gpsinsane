import { db } from "@/lib/firebase";
import type { PlanoUsuario } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";

type AssinaturaLike = {
  plano?: PlanoUsuario;
  ativo?: boolean;
  status?: string;
};

function planoValido(value: unknown): value is PlanoUsuario {
  return value === "free" || value === "pro" || value === "premium" || value === "premium_free";
}

function extrairPlanoDeAssinatura(assinatura: AssinaturaLike | null | undefined): PlanoUsuario {
  if (!assinatura?.ativo) return "free";
  if (!planoValido(assinatura.plano)) return "free";
  return assinatura.plano;
}

export function premiumPodeCriarOferta(plano: PlanoUsuario): boolean {
  return plano === "premium" || plano === "premium_free";
}

export async function carregarPlanoUsuario(uid: string): Promise<PlanoUsuario> {
  if (!uid) return "free";

  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    const data = snap.data() as Record<string, unknown> | undefined;

    const assinaturaObjeto = (data?.assinatura ?? null) as AssinaturaLike | null;
    const assinaturaDireta = (data?.assinaturaUsuario ?? null) as AssinaturaLike | null;
    const assinaturaAtiva = Boolean(data?.assinaturaAtiva);
    const assinaturaStatus = String(data?.assinaturaStatus || "").toLowerCase();

    const planoRaiz = data?.plano;
    if (planoValido(planoRaiz)) {
      if (!assinaturaAtiva && assinaturaStatus && assinaturaStatus !== "ativa") return "free";
      return planoRaiz;
    }

    const planoAssinatura = extrairPlanoDeAssinatura(assinaturaObjeto);
    if (planoAssinatura !== "free") return planoAssinatura;

    return extrairPlanoDeAssinatura(assinaturaDireta);
  } catch {
    return "free";
  }
}
