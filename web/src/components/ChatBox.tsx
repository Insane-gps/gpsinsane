"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import type { MensagemChat, Oferta } from "@/lib/types";
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

type ChatBoxProps = {
  oferta: Oferta | null;
  usuarioId: string;
  usuarioNome: string;
  onConversationDeleted?: (offerId: string) => void;
};

export function ChatBox({ oferta, usuarioId, usuarioNome, onConversationDeleted }: ChatBoxProps) {
  const { t } = useWebI18n();
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState("");
  const [deletandoConversa, setDeletandoConversa] = useState(false);
  const offerId = useMemo(() => String(oferta?.id || ""), [oferta?.id]);

  function mensagemVisivelParaMim(data: Omit<MensagemChat, "id">) {
    if ((data as any).deletedByAdmin || (data as any).apagada) return false;
    const apagadoPara = Array.isArray((data as any).apagadoPara)
      ? ((data as any).apagadoPara as string[]).map((id) => String(id || ""))
      : [];
    if (usuarioId && apagadoPara.includes(String(usuarioId))) return false;
    return true;
  }

  useEffect(() => {
    if (!offerId) {
      setMensagens([]);
      return;
    }

    const q = query(collection(db, "ofertas", offerId, "mensagens"), orderBy("criadoEm", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const next: MensagemChat[] = [];
      snap.forEach((docItem) => {
        const data = docItem.data() as Omit<MensagemChat, "id">;
        if (!mensagemVisivelParaMim(data)) return;
        next.push({ id: docItem.id, ...data });
      });
      setMensagens(next);
    });

    return () => unsubscribe();
  }, [offerId, usuarioId]);

  async function enviarTexto() {
    const textoNormalizado = texto.trim();
    if (!offerId || !usuarioId || !textoNormalizado) return;

    await addDoc(collection(db, "ofertas", offerId, "mensagens"), {
      tipo: "texto",
      texto: textoNormalizado,
      autor: usuarioId,
      autorNome: usuarioNome || usuarioId,
      ofertaId: offerId,
      criadoEm: Date.now(),
      lidoPor: [usuarioId],
      reported: false,
      hiddenByModeration: false,
      moderated: false,
      deletedByAdmin: false,
    });

    setTexto("");
  }

  async function excluirMensagemParaMim(mensagem: MensagemChat) {
    if (!offerId || !usuarioId) return;
    const alvoRef = doc(db, "ofertas", offerId, "mensagens", String(mensagem.id));
    const apagadoParaAtual = Array.isArray((mensagem as any).apagadoPara)
      ? (mensagem as any).apagadoPara.map((id: any) => String(id || ""))
      : [];
    const apagadoPara = Array.from(new Set([...apagadoParaAtual, String(usuarioId)]));

    await updateDoc(alvoRef, {
      apagadoPara,
      apagadoParaMimEm: Date.now(),
    });

    setMensagens((prev) => prev.filter((m) => m.id !== mensagem.id));
  }

  async function excluirConversaInteiraParaMim() {
    if (!offerId || !usuarioId || deletandoConversa) return;
    const confirmar = window.confirm("Deseja excluir toda esta conversa para voce?");
    if (!confirmar) return;

    setDeletandoConversa(true);
    try {
      const snap = await getDocs(collection(db, "ofertas", offerId, "mensagens"));
      await Promise.all(
        snap.docs.map(async (item) => {
          const dados: any = item.data() || {};
          const apagadoParaAtual = Array.isArray(dados?.apagadoPara)
            ? dados.apagadoPara.map((id: any) => String(id || ""))
            : [];
          if (apagadoParaAtual.includes(String(usuarioId))) return;

          const apagadoPara = Array.from(new Set([...apagadoParaAtual, String(usuarioId)]));
          await updateDoc(doc(db, "ofertas", offerId, "mensagens", item.id), {
            apagadoPara,
            apagadoParaMimEm: Date.now(),
          });
        })
      );

      setMensagens([]);
      onConversationDeleted?.(offerId);
    } finally {
      setDeletandoConversa(false);
    }
  }

  if (!oferta) {
    return (
      <aside className="chatPanel empty">
        <h3>{t.chatTitle}</h3>
        <p>{t.chatEmpty}</p>
      </aside>
    );
  }

  return (
    <aside className="chatPanel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <h3>{t.chatTitle}</h3>
        <button
          type="button"
          className="ghost"
          onClick={() => void excluirConversaInteiraParaMim()}
          disabled={!usuarioId || deletandoConversa}
        >
          {deletandoConversa ? t.chatDeleting : t.chatDeleteConversation}
        </button>
      </div>
      <p className="muted">{oferta.nomeOuDescricao || oferta.id}</p>
      {!usuarioId && <p className="noticeLine">{t.loginToChat}</p>}

      <div className="chatList">
        {mensagens.map((m) => (
          <div key={m.id} className={`bubble ${m.autor === usuarioId ? "mine" : "other"}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <strong>{m.autorNome || m.autor}</strong>
              {usuarioId && (
                <button
                  type="button"
                  className="ghost"
                  style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                  onClick={() => void excluirMensagemParaMim(m)}
                >
                  Excluir
                </button>
              )}
            </div>
            <p>{m.texto}</p>
          </div>
        ))}
      </div>

      <form
        className="chatComposer"
        onSubmit={(e) => {
          e.preventDefault();
          void enviarTexto();
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={!usuarioId ? t.loginToChat : t.chatPlaceholder}
          maxLength={500}
          disabled={!usuarioId}
        />
        <button className="btnPrimary" type="submit" disabled={!usuarioId}>Enviar</button>
      </form>
    </aside>
  );
}
