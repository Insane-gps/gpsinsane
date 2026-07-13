"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type DadosPagamento = {
  pixTipo: string;
  pixChave: string;
  pixNomeTitular: string;
  pixDocumentoTitular: string;
};

const emptyDados: DadosPagamento = {
  pixTipo: "cpf",
  pixChave: "",
  pixNomeTitular: "",
  pixDocumentoTitular: "",
};

export default function DadosPagamentoPage() {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [dados, setDados] = useState<DadosPagamento>(emptyDados);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!user) return;
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      const payload = snap.exists() ? (snap.data() || {}) : {};
      setDados({
        pixTipo: String(payload.pixTipo || "cpf"),
        pixChave: String(payload.pixChave || payload.chavePix || ""),
        pixNomeTitular: String(payload.pixNomeTitular || ""),
        pixDocumentoTitular: String(payload.pixDocumentoTitular || ""),
      });
    }

    void carregar();
  }, [user]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSalvando(true);
    setMensagem("");
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        pixTipo: dados.pixTipo,
        pixChave: dados.pixChave.trim(),
        pixNomeTitular: dados.pixNomeTitular.trim(),
        pixDocumentoTitular: dados.pixDocumentoTitular.trim(),
        pagamentoAtualizadoEm: serverTimestamp(),
        pagamentoAtualizadoEmCliente: Date.now(),
      }, { merge: true });

      setMensagem("Dados de pagamento salvos com sucesso.");
    } catch {
      setMensagem("Nao foi possivel salvar os dados de pagamento.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return <section className="sectionPane neoPane profilePage">{t.loadingSession}</section>;
  }

  if (!user) {
    return (
      <section className="sectionPane neoPane profilePage">
        <h1>{t.dadosPagamento}</h1>
        <p className="muted">Faca login para cadastrar seus dados de recebimento.</p>
        <Link href="/login" className="btnPrimary" style={{ display: "inline-flex", width: "fit-content" }}>
          {t.login}
        </Link>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane profilePage">
      <h1>{t.dadosPagamento}</h1>
      <div className="noticeBlock" style={{ marginBottom: "0.8rem" }}>
        <p style={{ margin: 0 }}>{t.regraPlanoAtivo}</p>
        <p style={{ margin: "0.5rem 0 0" }}>{t.regraPixMesmoTitular}</p>
      </div>

      <form className="formGrid" onSubmit={salvar}>
        <label>
          Tipo de chave PIX
          <select value={dados.pixTipo} onChange={(e) => setDados((prev) => ({ ...prev, pixTipo: e.target.value }))}>
            <option value="cpf">CPF</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Aleatoria</option>
          </select>
        </label>

        <label>
          Chave PIX
          <input value={dados.pixChave} onChange={(e) => setDados((prev) => ({ ...prev, pixChave: e.target.value }))} />
        </label>

        <label>
          Nome completo do titular
          <input value={dados.pixNomeTitular} onChange={(e) => setDados((prev) => ({ ...prev, pixNomeTitular: e.target.value }))} />
        </label>

        <label>
          CPF do titular
          <input value={dados.pixDocumentoTitular} onChange={(e) => setDados((prev) => ({ ...prev, pixDocumentoTitular: e.target.value }))} />
        </label>

        {mensagem ? <p className="noticeLine">{mensagem}</p> : null}

        <button type="submit" className="btnPrimary" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar dados de pagamento"}
        </button>
      </form>
    </section>
  );
}
