"use client";

import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { use, useEffect, useMemo, useState } from "react";
import { db } from "../../../lib/firebase";

export default function ConvitePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const resolvedParams = use(params);
  const [mensagem, setMensagem] = useState("Preparando convite...");

  const codigoLimpo = useMemo(() => {
    return String(resolvedParams?.codigo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
  }, [resolvedParams?.codigo]);

  useEffect(() => {
    async function processarConvite() {
      if (!codigoLimpo) {
        setMensagem("Convite inválido.");
        return;
      }

      try {
        setMensagem("Validando convite...");

        const snap = await getDocs(
          query(
            collection(db, "usuarios"),
            where("codigoIndicacao", "==", codigoLimpo)
          )
        );

        if (snap.empty) {
          setMensagem("Convite não encontrado. Redirecionando mesmo assim...");
        } else {
          const divulgadorDoc = snap.docs[0];
          const divulgadorUid = String(divulgadorDoc.id || "");

          try {
            localStorage.setItem("insane_indicador_codigo", codigoLimpo);
            localStorage.setItem("insane_indicador_uid", divulgadorUid);
          } catch {}

          try {
            await setDoc(doc(collection(db, "cliquesIndicacao")), {
              codigoIndicacao: codigoLimpo,
              divulgadorUid,
              userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
              origem: "web_convite",
              criadoEmCliente: Date.now(),
              criadoEm: serverTimestamp(),
            });
          } catch (erroClique) {
            console.log("Erro ao registrar clique:", erroClique);
          }

          setMensagem("Convite aplicado. Abrindo Play Store...");
        }

        const playStoreUrl =
          "https://play.google.com/store/apps/details?id=com.insanelabs.insanegps" +
          `&referrer=${encodeURIComponent(`indicador=${codigoLimpo}`)}`;

        setTimeout(() => {
          window.location.href = playStoreUrl;
        }, 700);

      } catch (error) {
        console.log("Erro ao processar convite:", error);
        setMensagem("Não foi possível validar agora. Abrindo Play Store...");

        const playStoreUrl =
          "https://play.google.com/store/apps/details?id=com.insanelabs.insanegps" +
          `&referrer=${encodeURIComponent(`indicador=${codigoLimpo}`)}`;

        setTimeout(() => {
          window.location.href = playStoreUrl;
        }, 900);
      }
    }

    processarConvite();
  }, [codigoLimpo]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <section style={{
        width: "100%",
        maxWidth: 460,
        border: "1px solid rgba(34,211,238,0.35)",
        borderRadius: 22,
        padding: 26,
        background: "rgba(15,23,42,0.96)",
        boxShadow: "0 0 30px rgba(34,211,238,0.14)"
      }}>
        <h1 style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 26
        }}>
          INSANE GPS
        </h1>

        <p style={{
          color: "#67e8f9",
          fontSize: 16,
          marginBottom: 16
        }}>
          Convite de indicação
        </p>

        <p style={{
          color: "#cbd5e1",
          fontSize: 15,
          lineHeight: 1.5
        }}>
          {mensagem}
        </p>

        <p style={{
          color: "#22c55e",
          fontWeight: 800,
          marginTop: 18
        }}>
          {codigoLimpo || "convite"}
        </p>
      </section>
    </main>
  );
}