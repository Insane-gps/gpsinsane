"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import { auth, db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Vehicle = {
  tipo: "carro" | "moto" | "van";
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
};

type ProfileData = {
  nome: string;
  cidade: string;
  telefone: string;
  foto: string;
  veiculos: Vehicle[];
};

const emptyProfile: ProfileData = {
  nome: "",
  cidade: "",
  telefone: "",
  foto: "",
  veiculos: [],
};

export function ProfilePanel() {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [tipo, setTipo] = useState<Vehicle["tipo"]>("carro");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [cor, setCor] = useState("");
  const [placa, setPlaca] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState("");
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [confirmacaoExcluirVisivel, setConfirmacaoExcluirVisivel] = useState(false);

  useEffect(() => {
    if (!user) return;
    const raw = window.localStorage.getItem(`perfil_${user.uid}`);
    if (raw) {
      try {
        setProfile({ ...emptyProfile, ...(JSON.parse(raw) as ProfileData) });
      } catch {
        setProfile(emptyProfile);
      }
    }
  }, [user]);

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    window.localStorage.setItem(`perfil_${user.uid}`, JSON.stringify(profile));
    setMsg("Perfil salvo no navegador.");
  }

  function addVehicle() {
    if (!marca.trim() || !modelo.trim()) {
      setMsg("Informe marca e modelo do veiculo.");
      return;
    }
    const next: Vehicle = {
      tipo,
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano.trim(),
      cor: cor.trim(),
      placa: placa.trim().toUpperCase(),
    };
    setProfile((prev) => ({ ...prev, veiculos: [...prev.veiculos, next] }));
    setMarca("");
    setModelo("");
    setAno("");
    setCor("");
    setPlaca("");
  }

  function removeVehicle(index: number) {
    setProfile((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, i) => i !== index),
    }));
  }

  function limparReservaDoUsuario(reserva: any, uid: string) {
    if (!reserva || typeof reserva !== "object") {
      return { alterada: false, reserva };
    }

    const passageiroId = String(reserva?.passageiroId || "").trim();
    const usuarioReservaId = String(reserva?.usuarioId || "").trim();
    if (passageiroId !== uid && usuarioReservaId !== uid) {
      return { alterada: false, reserva };
    }

    const proxima = { ...reserva };
    if ("passageiroNome" in proxima) proxima.passageiroNome = "Conta excluida";
    if ("usuarioNome" in proxima) proxima.usuarioNome = "Conta excluida";
    if ("nome" in proxima) proxima.nome = "Conta excluida";
    if ("foto" in proxima) proxima.foto = null;
    if ("passageiroFoto" in proxima) proxima.passageiroFoto = null;
    if ("telefone" in proxima) proxima.telefone = null;
    if ("email" in proxima) proxima.email = null;
    if ("whatsapp" in proxima) proxima.whatsapp = null;

    return { alterada: true, reserva: proxima };
  }

  async function anonimizarDadosUsuario(uid: string) {
    const ofertasSnap = await getDocs(collection(db, "ofertas"));

    for (const ofertaDoc of ofertasSnap.docs) {
      const ofertaId = String(ofertaDoc.id || "").trim();
      if (!ofertaId) continue;

      const oferta: any = ofertaDoc.data() || {};
      const patchOferta: Record<string, any> = {};
      let alterouOferta = false;

      if (String(oferta?.criadorId || "").trim() === uid) {
        patchOferta.criadorNome = "Conta excluida";
        if ("criadorFoto" in oferta) patchOferta.criadorFoto = null;
        if ("criadorEmail" in oferta) patchOferta.criadorEmail = null;
        if ("criadorTelefone" in oferta) patchOferta.criadorTelefone = null;
        if ("criadorWhatsapp" in oferta) patchOferta.criadorWhatsapp = null;
        alterouOferta = true;
      }

      if (String(oferta?.aceitaPor || "").trim() === uid && "aceitaPorNome" in oferta) {
        patchOferta.aceitaPorNome = "Conta excluida";
        alterouOferta = true;
      }

      if (Array.isArray(oferta?.solicitacoes)) {
        const filtradas = oferta.solicitacoes
          .map((id: any) => String(id || "").trim())
          .filter((id: string) => !!id && id !== uid);
        if (filtradas.length !== oferta.solicitacoes.length) {
          patchOferta.solicitacoes = filtradas;
          alterouOferta = true;
        }
      }

      if (Array.isArray(oferta?.solicitantes)) {
        const filtrados = oferta.solicitantes
          .map((id: any) => String(id || "").trim())
          .filter((id: string) => !!id && id !== uid);
        if (filtrados.length !== oferta.solicitantes.length) {
          patchOferta.solicitantes = filtrados;
          alterouOferta = true;
        }
      }

      if (Array.isArray(oferta?.reservas)) {
        let alterouReservas = false;
        const reservas = oferta.reservas.map((item: any) => {
          const resultado = limparReservaDoUsuario(item, uid);
          if (resultado.alterada) alterouReservas = true;
          return resultado.reserva;
        });
        if (alterouReservas) {
          patchOferta.reservas = reservas;
          alterouOferta = true;
        }
      }

      if (alterouOferta) {
        await updateDoc(doc(db, "ofertas", ofertaId), {
          ...patchOferta,
          atualizadoEm: Date.now(),
        });
      }

      const mensagensSnap = await getDocs(collection(db, "ofertas", ofertaId, "mensagens"));
      for (const mensagemDoc of mensagensSnap.docs) {
        const mensagem: any = mensagemDoc.data() || {};
        const patchMensagem: Record<string, any> = {};
        let alterouMensagem = false;

        if (String(mensagem?.autor || "").trim() === uid) {
          patchMensagem.autorNome = "Conta excluida";
          if ("autorFoto" in mensagem) patchMensagem.autorFoto = null;
          patchMensagem.apagada = true;
          patchMensagem.tipo = "apagada";
          patchMensagem.texto = "mensagem removida pelo usuário";
          patchMensagem.mediaUrl = null;
          patchMensagem.duracaoMs = null;
          patchMensagem.latitude = null;
          patchMensagem.longitude = null;
          patchMensagem.acao = null;
          patchMensagem.statusSolicitacao = null;
          patchMensagem.apagadaEm = Date.now();
          patchMensagem.apagadaPor = "conta_excluida";
          alterouMensagem = true;
        }

        if (String(mensagem?.solicitanteId || "").trim() === uid) {
          patchMensagem.solicitanteId = null;
          if ("solicitanteNome" in mensagem) patchMensagem.solicitanteNome = "Conta excluida";
          alterouMensagem = true;
        }

        if (String(mensagem?.destinatarioId || "").trim() === uid) {
          patchMensagem.destinatarioId = null;
          alterouMensagem = true;
        }

        if (String(mensagem?.apagadaPor || "").trim() === uid) {
          patchMensagem.apagadaPor = "conta_excluida";
          alterouMensagem = true;
        }

        if (!alterouMensagem) continue;

        await updateDoc(doc(db, "ofertas", ofertaId, "mensagens", String(mensagemDoc.id)), {
          ...patchMensagem,
          atualizadoEm: Date.now(),
        });
      }
    }
  }

  async function excluirContaWeb() {
    if (!user || !auth.currentUser || String(auth.currentUser.uid || "") !== String(user.uid || "")) {
      setMsg("Faca login para excluir sua conta.");
      return;
    }

    const confirma = String(confirmacaoExcluir || "").trim().toUpperCase();
    if (confirma !== "EXCLUIR") {
      setMsg("Digite EXCLUIR para confirmar.");
      return;
    }

    setExcluindoConta(true);
    setMsg("");

    const uid = String(user.uid || "").trim();

    try {
      await anonimizarDadosUsuario(uid);

      await Promise.allSettled([
        deleteDoc(doc(db, "usuarios", uid)),
        deleteDoc(doc(db, "perfisUsuarios", uid)),
        deleteDoc(doc(db, "chatTermsAccepted", uid)),
      ]);

      if (!auth.currentUser || String(auth.currentUser.uid || "") !== uid) {
        setMsg("Sessao alterada. Faca login novamente e tente de novo.");
        return;
      }

      await auth.currentUser.delete();

      window.localStorage.removeItem(`perfil_${uid}`);
      window.localStorage.removeItem("assinatura_usuario_v2");
      window.localStorage.removeItem("pro_ativo");
      window.localStorage.removeItem("aceitou_termo");
      window.localStorage.removeItem("aceitou_termo_versao");
      window.localStorage.removeItem("aceite_registrado");

      setMsg("Conta excluida com sucesso.");
      setConfirmacaoExcluirVisivel(false);
      window.location.href = "/login";
    } catch (error: any) {
      const raw = String(error?.code || error?.message || "").toLowerCase();
      if (raw.includes("auth/requires-recent-login")) {
        setMsg("Para excluir sua conta, faca login novamente e repita a operacao.");
      } else {
        setMsg("Nao foi possivel excluir sua conta agora.");
      }
    } finally {
      setExcluindoConta(false);
    }
  }

  if (loading) return <section className="sectionPane neoPane profilePage">{t.loadingSession}</section>;

  if (!user) {
    return (
      <section className="sectionPane neoPane profilePage">
        <h1>{t.profileTitle}</h1>
        <p className="muted">Faca login para editar seu perfil.</p>
        <Link href="/login" className="btnPrimary" style={{ display: "inline-flex", width: "fit-content" }}>
          {t.login}
        </Link>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane profilePage">
      <h1>{t.profileTitle}</h1>
      <p className="muted">{t.profileSubtitle}</p>

      <form className="formGrid" onSubmit={saveProfile}>
        <label>
          Nome
          <input value={profile.nome} onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))} />
        </label>
        <label>
          Cidade
          <input value={profile.cidade} onChange={(e) => setProfile((p) => ({ ...p, cidade: e.target.value }))} />
        </label>
        <label>
          Telefone
          <input value={profile.telefone} onChange={(e) => setProfile((p) => ({ ...p, telefone: e.target.value }))} />
        </label>
        <label>
          Foto (URL)
          <input value={profile.foto} onChange={(e) => setProfile((p) => ({ ...p, foto: e.target.value }))} />
        </label>

        <div className="vehicleBuilder">
          <h3>{t.profileVehiclesTitle}</h3>
          <div className="vehicleGrid">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Vehicle["tipo"])}>
              <option value="carro">Carro</option>
              <option value="moto">Moto</option>
              <option value="van">Van</option>
            </select>
            <input placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            <input placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            <input placeholder="Ano" value={ano} onChange={(e) => setAno(e.target.value)} />
            <input placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />
            <input placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          </div>
          <button className="btnSecondary" type="button" onClick={addVehicle}>{t.profileAddVehicle}</button>

          <div className="tripGrid">
            {profile.veiculos.map((item, index) => (
              <article key={`${item.placa}-${index}`} className="tripCard">
                <header>
                  <strong>{item.marca} {item.modelo}</strong>
                  <button className="ghost" type="button" onClick={() => removeVehicle(index)}>{t.profileRemoveVehicle}</button>
                </header>
                <p><strong>Tipo:</strong> {item.tipo}</p>
                <p><strong>Ano:</strong> {item.ano || "-"}</p>
                <p><strong>Cor:</strong> {item.cor || "-"}</p>
                <p><strong>Placa:</strong> {item.placa || "-"}</p>
              </article>
            ))}
          </div>
        </div>

        {msg && <p className="noticeLine">{msg || t.profileStoredLocal}</p>}
        <button className="btnPrimary" type="submit">{t.profileSave}</button>
      </form>

      <button
        type="button"
        className="ghost"
        onClick={() => {
          setConfirmacaoExcluir("");
          setConfirmacaoExcluirVisivel(true);
          setMsg("");
        }}
        style={{
          marginTop: "1rem",
          width: "100%",
          padding: "0.45rem 0.9rem",
          borderRadius: 10,
          background: "rgba(71, 85, 105, 0.52)",
          borderColor: "rgba(148, 163, 184, 0.7)",
          color: "#e2e8f0",
          fontSize: "0.9rem",
          fontWeight: 700,
        }}
      >
        Excluir minha conta
      </button>

      {confirmacaoExcluirVisivel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 18, 0.78)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: "min(560px, 96vw)",
              border: "1px solid rgba(148, 163, 184, 0.45)",
              background: "rgba(22, 31, 50, 0.95)",
              borderRadius: 14,
              padding: "1rem",
              display: "grid",
              gap: "0.65rem",
            }}
          >
            <strong style={{ fontSize: "1rem" }}>Excluir conta</strong>
            <p className="muted" style={{ margin: 0, whiteSpace: "pre-line" }}>
              Esta acao e permanente. Ao confirmar:{"\n"}
              - seu perfil sera removido;{"\n"}
              - suas mensagens/ofertas terao dados pessoais anonimizados;{"\n"}
              - voce perdera o acesso a esta conta.{"\n\n"}
              Para continuar, digite EXCLUIR.
            </p>
            <input
              placeholder="Digite EXCLUIR"
              value={confirmacaoExcluir}
              onChange={(e) => setConfirmacaoExcluir(e.target.value)}
              autoCapitalize="characters"
              autoCorrect="off"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                className="ghost"
                disabled={excluindoConta}
                onClick={() => {
                  setConfirmacaoExcluirVisivel(false);
                  setConfirmacaoExcluir("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => void excluirContaWeb()}
                disabled={
                  excluindoConta ||
                  String(confirmacaoExcluir || "").trim().toUpperCase() !== "EXCLUIR"
                }
                style={{
                  background:
                    excluindoConta || String(confirmacaoExcluir || "").trim().toUpperCase() !== "EXCLUIR"
                      ? "rgba(120, 53, 15, 0.35)"
                      : "rgba(153, 27, 27, 0.6)",
                  borderColor: "rgba(248, 113, 113, 0.6)",
                  color: "#fee2e2",
                }}
              >
                {excluindoConta ? "Excluindo conta..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
