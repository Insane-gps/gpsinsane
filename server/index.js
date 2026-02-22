const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
// rota teste raiz
app.get("/", (req, res)=>{
  res.send("🚀 GPSINSANE SERVER ONLINE");
});
app.use(cors());
app.use(express.json({limit:"2mb"}));

const ELEVEN_KEY = "9888eb51cf71c6ccbb359cd22c2567ba9c5f3b80a9254fc60bba247b51dac8d7";
const VOICE_ID = "Gfpl8Yo74Is0W6cPUWWT";

// =============================
// 🔊 ROTA DE VOZ
// =============================
app.post("/speak", (req,res)=>{

 const text = req.body.text;

 if(!text){
  return res.status(400).send("sem texto");
 }

 const payload = JSON.stringify({
  text,
  model_id:"eleven_multilingual_v2",
  voice_settings:{
   stability:0.4,
   similarity_boost:0.8
  }
 });

 const options = {
  hostname:"api.elevenlabs.io",
  path:`/v1/text-to-speech/${VOICE_ID}`,
  method:"POST",
  headers:{
   "xi-api-key":ELEVEN_KEY,
   "Content-Type":"application/json",
   "Accept":"audio/mpeg",
   "Content-Length":Buffer.byteLength(payload)
  }
 };

 const apiReq = https.request(options, apiRes=>{

  let data=[];

  apiRes.on("data",chunk=>data.push(chunk));

  apiRes.on("end",()=>{

  const buffer = Buffer.concat(data);

// envia base64
const audioBase64 = buffer.toString("base64");

res.send(audioBase64);



  });

 });

 apiReq.on("error",err=>{
  console.log("erro eleven",err);
  res.status(500).send("erro");
 });

 apiReq.write(payload);
 apiReq.end();

});

// =============================
// 🚀 START SERVER
// =============================
app.listen(3001,"0.0.0.0",()=>{
 console.log("🔥 Eleven server rodando");
});
