const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
// rota teste raiz
app.get("/", (req, res)=>{
  res.send("🚀 GPSINSANE SERVER ONLINE");
});
app.use(cors());
app.use(express.json({limit:"12mb"}));

const XTTS_URL = process.env.XTTS_URL || "https://insanegps.com/tts";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "";
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || "";
const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";
const GMAIL_TO_EMAIL = process.env.GMAIL_TO_EMAIL || GMAIL_USER;
async function falarViaXtts(text, speed){
 if(typeof fetch !== "function"){
  const err = new Error("fetch_not_available");
  err.code = "fetch_not_available";
  throw err;
 }

 const localController = new AbortController();
 const localTimeout = setTimeout(() => localController.abort(), 60000);
 let resposta;
 try {
  resposta = await fetch(XTTS_URL, {
   method:"POST",
   headers:{ "Content-Type":"application/json" },
   body: JSON.stringify({
     text,
     speed,
   }),
   signal: localController.signal,
  });
 } finally {
  clearTimeout(localTimeout);
 }

 if(!resposta.ok){
  const detalhe = await resposta.text().catch(()=>"");
  const err = new Error(`xtts_http_${resposta.status}`);
  err.code = "xtts_http_error";
  err.detail = detalhe;
  throw err;
 }

 const contentType = String(resposta.headers.get("content-type") || "").toLowerCase();

 if(contentType.includes("application/json")){
  const json = await resposta.json();
  const audioBase64 = json?.audioBase64 || json?.audio || json?.base64;
  if(!audioBase64){
    const err = new Error("xtts_json_without_audio");
    err.code = "xtts_json_without_audio";
    throw err;
  }
  return audioBase64;
 }

 const arr = await resposta.arrayBuffer();
 return Buffer.from(arr).toString("base64");
}

async function enviarEmailFeedback(payload){
 const tipo = String(payload?.tipo || "feedback");
 const mensagem = String(payload?.mensagem || "").trim();
 const contatoEmail = String(payload?.contatoEmail || "").trim();
 const usuarioId = String(payload?.usuarioId || "anonimo").trim();
 const alvoUsuarioId = String(payload?.alvoUsuarioId || "").trim();
 const imagens = Array.isArray(payload?.imagens) ? payload.imagens : [];
 const attachments = imagens
  .filter((item)=>item && item.base64)
  .slice(0, 3)
  .map((item, index)=>(
   {
    filename: String(item?.fileName || `imagem_${index + 1}.jpg`),
    content: String(item?.base64 || ""),
    type: String(item?.mimeType || "image/jpeg")
   }
  ));

 const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2>Novo ${tipo} enviado pelo app</h2>
    <p><strong>Usuário:</strong> ${usuarioId}</p>
    <p><strong>Tipo:</strong> ${tipo}</p>
    <p><strong>Email de contato:</strong> ${contatoEmail || "não informado"}</p>
    <p><strong>Usuário denunciado:</strong> ${alvoUsuarioId || "não informado"}</p>
    <p><strong>Quantidade de imagens:</strong> ${attachments.length}</p>
    <p><strong>Mensagem:</strong></p>
    <p>${mensagem.replace(/\n/g, "<br />")}</p>
  </div>
 `;

 const assunto = `[GPSClean] ${tipo === "denuncia" ? "Nova denúncia" : "Nova sugestão"}`;

 if(RESEND_API_KEY && RESEND_FROM_EMAIL && RESEND_TO_EMAIL){
  try{
   const resposta = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{
     Authorization:`Bearer ${RESEND_API_KEY}`,
     "Content-Type":"application/json"
    },
    body: JSON.stringify({
     from: RESEND_FROM_EMAIL,
     to: [RESEND_TO_EMAIL],
     subject: assunto,
      html,
      reply_to: contatoEmail || undefined,
      attachments
    })
   });

   if(resposta.ok){
    return { enviado:true, provider:"resend" };
   }

   const detalhe = await resposta.text().catch(()=>"");
   console.log("resend falhou, tentando gmail fallback:", resposta.status, detalhe);
  }catch(err){
   console.log("erro resend, tentando gmail fallback:", err?.detail || err?.message || err);
  }
 }

 if(!GMAIL_USER || !GMAIL_APP_PASSWORD || !GMAIL_TO_EMAIL){
  return { enviado:false, motivo:"email_provider_not_configured" };
 }

 const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
   user:GMAIL_USER,
   pass:GMAIL_APP_PASSWORD
  }
 });

 await transporter.sendMail({
  from: GMAIL_USER,
  to: GMAIL_TO_EMAIL,
  subject: assunto,
  html,
  replyTo: contatoEmail || undefined,
  attachments: attachments.map((item)=>(
   {
    filename: item.filename,
    content: item.content,
    contentType: item.type,
    encoding: "base64"
   }
  ))
 });

 return { enviado:true, provider:"gmail" };
}

// =============================
// 🔊 ROTA DE VOZ
// =============================
app.post("/speak", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  const speed = parseFloat(req.body?.speed) || 0.9;

  console.log("SPEAK TEXT:", text);
  console.log("SPEAK TARGET:", XTTS_URL);

  if (!text) {
    return res.status(400).json({ ok: false, erro: "text_vazio" });
  }

  try {
    const audioBase64 = await falarViaXtts(text, speed);
    console.log("SPEAK OK");

    return res.json({
      ok: true,
      provider: "local",
      mimeType: "audio/wav",
      audioBase64,
    });
  } catch (err) {
    console.log("SPEAK ERROR", err?.message || err);
    return res.status(500).json({
      ok: false,
      erro: err?.code || err?.message || "tts_error",
      audioBase64: null,
    });
  }
});

app.get("/voice-config", (req,res)=>{
 res.json({
  provider: "local",
  xttsUrl: XTTS_URL,
 });
});

app.get("/feedback-health", (req,res)=>{
 res.json({
  ok:true,
  resendConfigured: !!(RESEND_API_KEY && RESEND_FROM_EMAIL && RESEND_TO_EMAIL),
  hasApiKey: !!RESEND_API_KEY,
  hasFromEmail: !!RESEND_FROM_EMAIL,
  hasToEmail: !!RESEND_TO_EMAIL
 });
});

app.post("/feedback", async (req,res)=>{
 const payload = req.body || {};
 const mensagem = String(payload?.mensagem || "").trim();
 const tipo = String(payload?.tipo || "").trim();

 if(!mensagem || !tipo){
  return res.status(400).json({ ok:false, erro:"payload_invalido" });
 }

 try{
  const email = await enviarEmailFeedback(payload);
  res.json({ ok:true, emailEnviado: !!email?.enviado, emailStatus: email?.motivo || "ok" });
 }catch(err){
  console.log("erro feedback resend", err?.detail || err?.message || err);
  res.status(500).json({ ok:false, erro:"feedback_email_error", detalhe: err?.detail || err?.message || "unknown" });
 }
});

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 Voice server rodando em provider: xtts");
  console.log(`🔈 XTTS URL: ${XTTS_URL}`);
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
