"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function mapAuthError(error: unknown) {
  const raw = error instanceof Error ? error.message : "";

  if (raw.includes("auth/operation-not-allowed")) {
    return "Login com Google desabilitado no Firebase. Use e-mail/senha ou habilite Google em Authentication > Sign-in method.";
  }
  if (raw.includes("auth/popup-blocked")) {
    return "Popup bloqueado pelo navegador. Permita popups para localhost e tente novamente.";
  }
  if (raw.includes("auth/unauthorized-domain")) {
    return "Dominio nao autorizado no Firebase Auth. Adicione localhost em Authentication > Settings > Authorized domains.";
  }
  if (raw.includes("auth/invalid-credential") || raw.includes("auth/wrong-password") || raw.includes("auth/user-not-found")) {
    return "Credenciais invalidas. Verifique e-mail e senha.";
  }
  if (raw.includes("auth/email-already-in-use")) {
    return "Este e-mail ja esta em uso. Tente entrar em vez de criar conta.";
  }
  if (raw.includes("auth/weak-password")) {
    return "Senha fraca. Use pelo menos 6 caracteres.";
  }

  return raw || "Falha de autenticacao no Firebase.";
}

export default function LoginPage() {
  const router = useRouter();
  const { loginGoogle, loginEmail, cadastrarEmail } = useAuth();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      if (modoCadastro) {
        await cadastrarEmail(email, senha, nome);
      } else {
        await loginEmail(email, senha);
      }
      router.push("/ofertas");
    } catch (error) {
      setErro(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  async function loginComGoogle() {
    setErro("");
    setLoading(true);
    try {
      await loginGoogle();
      router.push("/ofertas");
    } catch (error) {
      setErro(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="formShell">
      <h1>{modoCadastro ? "Criar conta" : "Entrar"}</h1>
      <p className="muted">usuarioId utilizado na web sera o UID do Firebase Auth.</p>

      <form onSubmit={onSubmit} className="formGrid">
        {modoCadastro && (
          <label>
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
        )}

        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} required />
        </label>

        {erro && <p className="errorLine">{erro}</p>}

        <button disabled={loading} className="btnPrimary" type="submit">
          {loading ? "Processando..." : modoCadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <button className="btnSecondary" disabled={loading} onClick={() => void loginComGoogle()}>
        Continuar com Google
      </button>

      <button className="ghost" onClick={() => setModoCadastro((v) => !v)}>
        {modoCadastro ? "Ja tenho conta" : "Nao tenho conta"}
      </button>
    </section>
  );
}
