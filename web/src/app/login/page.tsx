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

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12C3.9 7.9 7.5 5 12 5C16.5 5 20.1 7.9 22 12C20.1 16.1 16.5 19 12 19C7.5 19 3.9 16.1 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12C3.9 7.9 7.5 5 12 5C16.5 5 20.1 7.9 22 12C20.1 16.1 16.5 19 12 19C7.5 19 3.9 16.1 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginGoogle, loginEmail, cadastrarEmail } = useAuth();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const emailNormalizado = String(email || "").replace(/\s+/g, "").trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

    if (!emailValido) {
      setErro("Informe um e-mail valido.");
      return;
    }

    setErro("");
    setLoading(true);
    try {
      if (modoCadastro) {
        await cadastrarEmail(emailNormalizado, senha, nome);
      } else {
        await loginEmail(emailNormalizado, senha);
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

      <form onSubmit={onSubmit} className="formGrid" noValidate>
        {modoCadastro && (
          <label>
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
        )}

        <label>
          E-mail
          <input
            type="text"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <div style={{ position: "relative" }}>
            <input
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
              style={{ width: "100%", paddingRight: "2.7rem" }}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              style={{
                position: "absolute",
                right: "0.45rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "2rem",
                height: "2rem",
                borderRadius: "999px",
                border: "1px solid rgba(77, 123, 205, 0.55)",
                background: "rgba(9, 18, 34, 0.76)",
                color: "#cae3ff",
                padding: 0,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
