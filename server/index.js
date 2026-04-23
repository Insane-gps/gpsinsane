const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const https = require("https");
const nodemailer = require("nodemailer");

const app = express();
// rota teste raiz
app.get("/", (req, res)=>{
  res.send("🚀 GPSINSANE SERVER ONLINE");
});
app.use(cors());
app.use(express.json({limit:"12mb"}));

const ELEVEN_KEY = process.env.ELEVEN_API_KEY || "";
const VOICE_ID = process.env.ELEVEN_VOICE_ID || "";
const VOICE_ID_INSANA = process.env.ELEVEN_VOICE_ID_INSANA || "";
const ELEVEN_MODEL_ID = process.env.ELEVEN_MODEL_ID || "eleven_flash_v2_5";
const VOICE_PROVIDER = process.env.VOICE_PROVIDER || "eleven"; // eleven | local | auto
const VOICE_FALLBACK = String(process.env.VOICE_FALLBACK || "1") === "1";
const LOCAL_TTS_URL = process.env.LOCAL_TTS_URL || "http://127.0.0.1:8020/tts";
const LOCAL_VOICE_SAMPLE = process.env.LOCAL_VOICE_SAMPLE || "";
const LOCAL_LANGUAGE = process.env.LOCAL_LANGUAGE || "pt";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "";
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || "";
const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";
const GMAIL_TO_EMAIL = process.env.GMAIL_TO_EMAIL || GMAIL_USER;

function falarViaEleven(text, opcoes = {}) {
  return new Promise((resolve, reject) => {
    const modo = String(opcoes?.mode || "normal").trim().toLowerCase();
    const vozSelecionada = modo === "insana" && VOICE_ID_INSANA ? VOICE_ID_INSANA : VOICE_ID;

    console.log(`🎭 modo=${modo} | vozSelecionada=${vozSelecionada ? vozSelecionada.slice(0,8)+"..." : "NÃO CONFIGURADA"} | VOICE_ID_INSANA=${VOICE_ID_INSANA ? "configurada" : "VAZIA"}`);

    if (!ELEVEN_KEY || !vozSelecionada) {
      const err = new Error("eleven_not_configured");
      err.code = "eleven_not_configured";
      reject(err);
      return;
    }

    console.log("🧠 Eleven texto:", text);

    const payload = JSON.stringify({
      text,
      model_id: ELEVEN_MODEL_ID,
      voice_settings: {
        stability: modo === "insana" ? 0.25 : 0.4,
        similarity_boost: modo === "insana" ? 0.95 : 0.8,
        style: modo === "insana" ? 0.9 : 0.35,
        use_speaker_boost: true,
      },
    });

    const options = {
      hostname: "api.elevenlabs.io",
      path: `/v1/text-to-speech/${vozSelecionada}`,
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      const data = [];

      apiRes.on("data", (chunk) => data.push(chunk));
      apiRes.on("end", () => {
        try {
          const buffer = Buffer.concat(data);
          const status = Number(apiRes.statusCode || 0);
          const contentType = String(
            apiRes.headers?.["content-type"] || ""
          ).toLowerCase();

          console.log("🧠 Eleven status:", status);
          console.log("🧠 Eleven content-type:", contentType);
          console.log("🧠 Eleven buffer bytes:", buffer.length);

          if (status < 200 || status >= 300) {
            let detalhe = buffer.toString("utf8");
            try {
              const erroJson = JSON.parse(detalhe);
              detalhe = erroJson?.detail?.message || erroJson?.message || detalhe;
            } catch {}

            const err = new Error(`eleven_http_${status}`);
            err.code = "eleven_http_error";
            err.status = status;
            err.detail = String(detalhe || "").slice(0, 300);
            reject(err);
            return;
          }

          if (
            contentType &&
            !contentType.includes("audio") &&
            !contentType.includes("octet-stream")
          ) {
            const err = new Error("eleven_invalid_content_type");
            err.code = "eleven_invalid_content_type";
            err.detail = contentType;
            reject(err);
            return;
          }

          resolve(buffer.toString("base64"));
        } catch (e) {
          reject(e);
        }
      });
    });

    apiReq.setTimeout(10000, () => {
      apiReq.destroy(new Error("eleven_timeout"));
    });

    apiReq.on("error", reject);
    apiReq.write(payload);
    apiReq.end();
  });
}

async function falarViaLocal(text, opcoes){
 if(!LOCAL_VOICE_SAMPLE){
  const err = new Error("local_voice_sample_missing");
  err.code = "local_voice_sample_missing";
  throw err;
 }

 if(typeof fetch !== "function"){
  const err = new Error("fetch_not_available");
  err.code = "fetch_not_available";
  throw err;
 }

 const localController = new AbortController();
 const localTimeout = setTimeout(() => localController.abort(), 180000);
 let resposta;
 try {
  resposta = await fetch(LOCAL_TTS_URL, {
   method:"POST",
   headers:{ "Content-Type":"application/json" },
   body: JSON.stringify({
     text,
     speaker_wav: LOCAL_VOICE_SAMPLE,
     language: LOCAL_LANGUAGE,
     speed: opcoes?.speed ?? 0.9,
   }),
   signal: localController.signal,
  });
 } finally {
  clearTimeout(localTimeout);
 }

 if(!resposta.ok){
  const detalhe = await resposta.text().catch(()=>"");
  const err = new Error(`local_tts_http_${resposta.status}`);
  err.code = "local_tts_http_error";
  err.detail = detalhe;
  throw err;
 }

 const contentType = String(resposta.headers.get("content-type") || "").toLowerCase();

 if(contentType.includes("application/json")){
  const json = await resposta.json();
  const audioBase64 = json?.audioBase64 || json?.audio || json?.base64;
  if(!audioBase64){
    const err = new Error("local_tts_json_without_audio");
    err.code = "local_tts_json_without_audio";
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

function providerPrimario(){
  if(VOICE_PROVIDER === "local") return "local";
  if(VOICE_PROVIDER === "auto"){
    return LOCAL_VOICE_SAMPLE ? "local" : "eleven";
  }
  return "eleven";
}

function providerSecundario(principal){
  return principal === "local" ? "eleven" : "local";
}

async function gerarAudio(provider, text, opcoes){
  if(provider === "local") return falarViaLocal(text, opcoes);
  return falarViaEleven(text, opcoes);
}

// =============================
// 🔊 ROTA DE VOZ
// =============================
app.post("/speak", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  const speed = parseFloat(req.body?.speed) || 0.9;
  const mode = String(req.body?.mode || "normal").trim().toLowerCase();

  if (!text) {
    return res.status(400).json({ ok: false, erro: "text_vazio" });
  }

  const principal = providerPrimario();

  const tentar = async (provider) => gerarAudio(provider, text, { speed, mode });

  try {
    let audioBase64;
    try {
      audioBase64 = await tentar(principal);
    } catch (err) {
      console.log("⚠️ provider primário falhou:", err?.message || err);
      if (VOICE_FALLBACK) {
        const secundario = providerSecundario(principal);
        console.log("🔄 tentando provider secundário:", secundario);
        audioBase64 = await tentar(secundario);
      } else {
        throw err;
      }
    }

    return res.json({
      ok: true,
      provider: principal,
      mode,
      mimeType: "audio/wav",
      audioBase64,
    });
  } catch (err) {
    console.log("❌ /speak falhou:", err?.message || err);
    return res.status(500).json({
      ok: false,
      erro: err?.code || err?.message || "tts_error",
      audioBase64: null,
    });
  }
});

app.get("/voice-config", (req,res)=>{
 const principal = providerPrimario();
 res.json({
  provider: VOICE_PROVIDER,
  providerPrimario: principal,
  fallbackAtivo: VOICE_FALLBACK,
  elevenConfigured: !!(ELEVEN_KEY && VOICE_ID),
  elevenModelId: ELEVEN_MODEL_ID,
  localTtsUrl: LOCAL_TTS_URL,
  hasLocalVoiceSample: !!LOCAL_VOICE_SAMPLE,
  localLanguage: LOCAL_LANGUAGE,
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
app.listen(3001,"0.0.0.0",()=>{
 console.log(`🔥 Voice server rodando em provider: ${VOICE_PROVIDER}`);
 if(VOICE_PROVIDER === "local"){
  console.log(`🔈 Local TTS URL: ${LOCAL_TTS_URL}`);
 }
});
