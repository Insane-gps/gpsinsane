const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const nodemailer = require("nodemailer");
const { Resend } = require("resend");

if (!admin.apps.length) {
  admin.initializeApp();
}

function getEnv(name) {
  return process.env[name] || "";
}

function buildMensagemHtml(payload, attachmentsCount) {
  const tipo = String(payload?.tipo || "").trim();
  const mensagem = String(payload?.mensagem || "").trim();
  const contatoEmail = String(payload?.contatoEmail || "").trim();
  const usuarioId = String(payload?.usuarioId || "anonimo").trim();
  const alvoUsuarioId = String(payload?.alvoUsuarioId || "").trim();
  const imagens = Array.isArray(payload?.imagens) ? payload.imagens : [];

  const linksImagens = imagens
    .filter((item) => item && item.url)
    .map((item, index) => {
      const nome = String(item?.fileName || `imagem_${index + 1}`);
      const url = String(item?.url || "");
      return `<li><a href="${url}" target="_blank" rel="noreferrer">${nome}</a></li>`;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Novo ${tipo} enviado pelo app</h2>
      <p><strong>Usuário:</strong> ${usuarioId}</p>
      <p><strong>Tipo:</strong> ${tipo}</p>
      <p><strong>Email de contato:</strong> ${contatoEmail || "não informado"}</p>
      <p><strong>Usuário denunciado:</strong> ${alvoUsuarioId || "não informado"}</p>
      <p><strong>Quantidade de imagens:</strong> ${attachmentsCount}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem.replace(/\n/g, "<br />")}</p>
      ${linksImagens ? `<p><strong>Links das imagens:</strong></p><ul>${linksImagens}</ul>` : ""}
    </div>
  `;
}

function getGmailConfig() {
  return {
    user: getEnv("GMAIL_USER"),
    appPassword: getEnv("GMAIL_APP_PASSWORD"),
    to: getEnv("GMAIL_TO_EMAIL") || getEnv("GMAIL_USER")
  };
}

function buildAttachments(imagens) {
  if (!Array.isArray(imagens)) return [];

  return imagens
    .filter((item) => item && item.base64)
    .slice(0, 3)
    .map((item, index) => ({
      filename: String(item?.fileName || `imagem_${index + 1}.jpg`),
      content: String(item?.base64 || ""),
      type: String(item?.mimeType || "image/jpeg")
    }));
}

async function enviarFeedbackPorResend(payload) {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("RESEND_FROM_EMAIL");
  const to = getEnv("RESEND_TO_EMAIL");

  if (!apiKey || !from || !to) {
    return { ok: false, erro: "resend_not_configured" };
  }

  const tipo = String(payload?.tipo || "").trim();
  const mensagem = String(payload?.mensagem || "").trim();
  const contatoEmail = String(payload?.contatoEmail || "").trim();
  const usuarioId = String(payload?.usuarioId || "anonimo").trim();
  const alvoUsuarioId = String(payload?.alvoUsuarioId || "").trim();

  if (!tipo || !mensagem) {
    return { ok: false, erro: "payload_invalido" };
  }

  const attachments = buildAttachments(payload?.imagens);
  const resend = new Resend(apiKey);

  const html = buildMensagemHtml(payload, attachments.length);

  const resposta = await resend.emails.send({
    from,
    to: [to],
    subject: `[GPSClean] ${tipo === "denuncia" ? "Nova denúncia" : "Nova sugestão"}`,
    html,
    replyTo: contatoEmail || undefined,
    attachments
  });

  if (resposta?.error) {
    return {
      ok: false,
      erro: String(resposta?.error?.message || "resend_send_failed").slice(0, 180)
    };
  }

  const providerId = resposta?.data?.id || null;
  if (!providerId) {
    return { ok: false, erro: "resend_no_provider_id" };
  }

  return {
    ok: true,
    providerId,
    provider: "resend",
    attachmentsCount: attachments.length,
    tipo,
    usuarioId
  };
}

async function enviarFeedbackPorGmail(payload) {
  const { user, appPassword, to } = getGmailConfig();

  if (!user || !appPassword || !to) {
    return { ok: false, erro: "gmail_not_configured" };
  }

  const tipo = String(payload?.tipo || "").trim();
  const mensagem = String(payload?.mensagem || "").trim();
  const contatoEmail = String(payload?.contatoEmail || "").trim();
  const usuarioId = String(payload?.usuarioId || "anonimo").trim();
  const alvoUsuarioId = String(payload?.alvoUsuarioId || "").trim();
  const imagens = Array.isArray(payload?.imagens) ? payload.imagens : [];
  const attachments = buildAttachments(imagens).map((item) => ({
    filename: item.filename,
    content: item.content,
    contentType: item.type,
    encoding: "base64"
  }));

  if (!tipo || !mensagem) {
    return { ok: false, erro: "payload_invalido" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass: appPassword
    }
  });

  const info = await transporter.sendMail({
    from: user,
    to,
    subject: `[GPSClean] ${tipo === "denuncia" ? "Nova denúncia" : "Nova sugestão"}`,
    html: buildMensagemHtml(payload, imagens.length),
    replyTo: contatoEmail || undefined,
    attachments
  });

  return {
    ok: true,
    providerId: info?.messageId || null,
    provider: "gmail",
    attachmentsCount: imagens.length,
    tipo,
    usuarioId,
    alvoUsuarioId
  };
}

async function enviarFeedback(payload) {
  const gmailConfig = getGmailConfig();
  if (gmailConfig.user && gmailConfig.appPassword) {
    return enviarFeedbackPorGmail(payload);
  }

  return enviarFeedbackPorResend(payload);
}

exports.feedbackHealth = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  const gmailConfig = getGmailConfig();
  res.json({
    ok: true,
    hasApiKey: !!getEnv("RESEND_API_KEY"),
    hasFromEmail: !!getEnv("RESEND_FROM_EMAIL"),
    hasToEmail: !!getEnv("RESEND_TO_EMAIL"),
    resendConfigured: !!(getEnv("RESEND_API_KEY") && getEnv("RESEND_FROM_EMAIL") && getEnv("RESEND_TO_EMAIL")),
    gmailConfigured: !!(gmailConfig.user && gmailConfig.appPassword),
    gmailToConfigured: !!gmailConfig.to,
    activeProvider: gmailConfig.user && gmailConfig.appPassword ? "gmail" : "resend"
  });
});

exports.sendFeedbackEmail = onRequest({ cors: true, invoker: "public", memory: "512MiB", timeoutSeconds: 60 }, async (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, erro: "method_not_allowed" });
    }

    try {
      const resultado = await enviarFeedback(req.body || {});
      if (!resultado.ok) {
        return res.status(400).json({ ok: false, erro: resultado.erro || "payload_invalido" });
      }

      logger.info("Feedback email enviado via HTTP", {
        id: resultado.providerId,
        provider: resultado.provider,
        tipo: resultado.tipo,
        usuarioId: resultado.usuarioId
      });

      return res.json({ ok: true, emailEnviado: true, emailStatus: "ok", providerId: resultado.providerId });
    } catch (error) {
      logger.error("Erro ao enviar email de feedback", error);
      return res.status(500).json({
        ok: false,
        erro: "feedback_email_error",
        detalhe: error?.message || "unknown"
      });
    }
  });
});

exports.enviarEmailSuporte = onDocumentCreated("feedbackUsuarios/{docId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("Evento de feedback sem snapshot");
    return;
  }

  const dados = snapshot.data() || {};
  const docRef = snapshot.ref;

  if (dados.emailEncaminhado === true) {
    logger.info("Feedback já encaminhado, ignorando", { docId: snapshot.id });
    return;
  }

  try {
    const resultado = await enviarFeedback(dados);

    if (!resultado.ok) {
      await docRef.update({
        emailEncaminhado: false,
        emailStatus: resultado.erro || "payload_invalido",
        emailUltimaTentativaEmCliente: new Date().toISOString()
      });
      return;
    }

    await docRef.update({
      emailEncaminhado: true,
      emailStatus: "ok",
      emailProviderId: resultado.providerId || null,
      emailUltimaTentativaEmCliente: new Date().toISOString()
    });

    logger.info("Feedback email enviado via trigger Firestore", {
      docId: snapshot.id,
      providerId: resultado.providerId,
      provider: resultado.provider,
      tipo: resultado.tipo,
      usuarioId: resultado.usuarioId
    });
  } catch (error) {
    logger.error("Erro no trigger de envio de feedback", error);
    await docRef.update({
      emailEncaminhado: false,
      emailStatus: error?.message || "feedback_email_error",
      emailUltimaTentativaEmCliente: new Date().toISOString()
    });
  }
});
