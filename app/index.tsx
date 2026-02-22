import BottomSheet, { BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { deactivateKeepAwake, useKeepAwake } from "expo-keep-awake";
import * as Localization from "expo-localization";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import googleCreds from './google-voice.json';
const __manterSpeechImport = Speech;


import {
  Alert,
  Animated,
  BackHandler,
  Image,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FRASES_VIVAS } from "../data/frasesVivas";
import { TEXTOS } from "../data/idiomas";
import { NOMES_AMIGO_ZOEIRA } from "../data/nomesAmigos";
import { NOMES_CASA_ZOEIRA } from "../data/nomesCasa";
import { PIADAS_INSANO } from "../data/piadasInsano";
import { POI_LABELS } from "../data/poiLabels";
import { POI_LINES } from "../data/poiLines";
import { WRONG_LINES } from "../data/wrongLines";
import SettingsPanel from "./components/SettingsPanel";

// ==========================================
// BANCO DE FRASES (AGORA INTERNO NO INDEX)
// ==========================================

// ==========================================
// 🧠 PERSONALIDADE GLOBAL
// ==========================================
const PERSONALIDADE_ATUAL = "psico"; // leve | psico
const MODO_REVISAO_XINGAMENTOS = false;


// ===============================
// 💰 BENEFÍCIOS PRO
// ===============================
const BENEFICIOS_PRO = [
 "Desbloqueia níveis 2, 3 e 4",
 "Modo insano completo",
 "Novas personalidades futuras",
 "Atualizações premium",
 "Sem limites de xingamento",
 "Apenas R$49,90 por ano"
];



// ==========================================
// 🚓 POI PROFISSIONAL POR NÍVEL
// ==========================================

// ===============================
// 🌙 ESTILO MAPA NOTURNO PROFISSIONAL
// ===============================
const mapaNoturnoStyle = [

  // FUNDO TOTAL
  { elementType:"geometry", stylers:[{color:"#05070a"}] },
  { elementType:"labels.text.fill", stylers:[{color:"#5a636e"}] },
  { elementType:"labels.text.stroke", stylers:[{color:"#05070a"}] },

  // ESCONDER POIS
  {
    featureType:"poi",
    elementType:"all",
    stylers:[{visibility:"off"}]
  },

  // ESCONDER TRANSITO PUBLICO
  {
    featureType:"transit",
    elementType:"all",
    stylers:[{visibility:"off"}]
  },

  // ÁGUA
  {
    featureType:"water",
    elementType:"geometry",
    stylers:[{color:"#020305"}]
  },

  // RUAS PADRÃO
  {
    featureType:"road",
    elementType:"geometry",
    stylers:[{color:"#1c1f26"}]
  },

  // RUAS ARTERIAIS
  {
    featureType:"road.arterial",
    elementType:"geometry",
    stylers:[{color:"#2b3038"}]
  },

  // RODOVIAS
  {
    featureType:"road.highway",
    elementType:"geometry",
    stylers:[{color:"#3a404a"}]
  },

  // BORDAS DAS RUAS
  {
    featureType:"road",
    elementType:"geometry.stroke",
    stylers:[{color:"#000000"}]
  },

  // ESCONDER BAIRROS
  {
    featureType:"administrative",
    elementType:"all",
    stylers:[{visibility:"off"}]
  }
];

export default function Index() {
  const insets = useSafeAreaInsets();
  const jaFalouInicio = useRef(false);

  useEffect(() => {
    
  async function ativarAudio() {
   await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeIOS: 1,
  interruptionModeAndroid: 1,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
    console.log("AUDIO LIBERADO");
  }

  ativarAudio();
}, []);  

  useEffect(() => {
  pedirPermissao();
}, []);
async function pedirPermissao() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert("Permissão de localização negada");
    return;
  }
  console.log("Permissão concedida");
}
const DEBUG_BRAIN = false;
if(DEBUG_BRAIN){
 console.log(POI_LINES); 
}
 // ==========================================
 // 💾 CARREGAR DADOS SALVOS DO CELULAR
 // ==========================================
 useEffect(()=>{
   carregarLocaisSalvos();
 },[]);

 async function carregarLocaisSalvos(){
   try{
     const casa = await AsyncStorage.getItem("casa_salva");
     const trab = await AsyncStorage.getItem("trabalho_salvo");
     const fav = await AsyncStorage.getItem("favoritos_lista");
     const rec = await AsyncStorage.getItem("recentes_lista");
     const amigos = await AsyncStorage.getItem("amigos_lista");
     if(amigos) setAmigosLista(JSON.parse(amigos));

     if(casa) setCasaSalva(JSON.parse(casa));
     if(trab) setTrabalhoSalvo(JSON.parse(trab));
     if(fav) setFavoritos(JSON.parse(fav));
     if(rec) setRecentes(JSON.parse(rec));

   }catch(e){
     console.log("erro carregar locais");
   }
 }
  // ==========================================
 // 🏠 ESCOLHER COMO SALVAR CASA
 // ==========================================
 function abrirEscolhaEnderecoCasa(apelido:string){

  alert(
`Salvar "${apelido}" como sua casa?

OK = usar localização atual
Cancelar = digitar endereço`
  );

  // se quiser depois fazemos popup bonito,
  // por enquanto vamos simples e funcional
 }

// ===============================
// 🌍 IDIOMA GLOBAL
// ===============================
const idiomaSistema = Platform.OS === "ios"
  ? (navigator.language || "pt")
  : "pt";
const lang = idiomaSistema.startsWith("en") ? "en" : "pt";
// ===============================
// 💰 MODO FREE / PRO
// ===============================
const [modoPro, setModoPro] = useState(false);
const [modoInsano, setModoInsano] = useState(false);
const [somPolicia, setSomPolicia] = useState(true);
const [somRadar, setSomRadar] = useState(true);

// ===============================
// 🎤 ALERTA POR VOZ
// ===============================
const [alertaVozAtivo, setAlertaVozAtivo] = useState(true);

const ultimoInsano = useRef(0);
const timerInsano = useRef<any>(null);
const falandoRef = useRef(false);
const ultimaInstrucaoRef = useRef("");

const ultimaPiada = useRef("");
const tempoParado = useRef<number | null>(null);
const [gravando, setGravando] = useState<Audio.Recording | null>(null);
const bottomSheetRef = useRef<any>(null);
const sheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ['18%', '45%', '70%'], []);
const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
const [telaProVisivel, setTelaProVisivel] = useState(false);
const nivelMaxFree = 1;
const nivelMaxPro = 4;
const [nivelAtual, setNivelAtual] = useState(0);
// barra visível
const [barraVisivel, setBarraVisivel] = useState(false);
const [mostrarBotaoPro, setMostrarBotaoPro] = useState(false);
const [editorCasaVisivel, setEditorCasaVisivel] = useState(false);
const [rotaCarregando, setRotaCarregando] = useState(false);
const [painelVisivel, setPainelVisivel] = useState(false);
const [idiomaAtual, setIdiomaAtual] = useState<"pt"|"en">("pt");
const textos = TEXTOS[idiomaAtual];
const [modalAlerta, setModalAlerta] = useState(false);
const [motivoAlerta, setMotivoAlerta] = useState("");
const [menuReportRapido, setMenuReportRapido] = useState(false);
const [coordsReportTemp, setCoordsReportTemp] = useState(null);
const [coordsAlerta, setCoordsAlerta] = useState<any>(null);
const [escutandoVoz, setEscutandoVoz] = useState(false);
const animPulse = useRef(new Animated.Value(1)).current;
// 🎙️ GRAVAÇÃO ALERTA POR VOZ (REAL GOOGLE)
async function iniciarGravacao(){

 try{

   console.log("🎤 INICIO GRAVAÇÃO");

   setEscutandoVoz(true);

   await Audio.requestPermissionsAsync();

  await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeIOS: 1,

  shouldDuckAndroid: true,
  interruptionModeAndroid: 1,
  playThroughEarpieceAndroid: false,
}); 
const { recording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);
   setGravando(recording);

   // grava exatamente 4s
   setTimeout(async ()=>{

     try{

       console.log("🛑 PARANDO GRAVAÇÃO");

       await recording.stopAndUnloadAsync();
       const uri = recording.getURI();

       setGravando(null);
       setEscutandoVoz(false);

       if(uri){
         console.log("🎧 AUDIO OK:", uri);
         await enviarParaGoogle(uri);
       }

     }catch(e){
       console.log("erro parar gravação", e);
       setEscutandoVoz(false);
       setGravando(null);
     }

   },4000);

 }catch(err){
   console.log("erro iniciar gravação",err);
   setEscutandoVoz(false);
 }
}
async function enviarAudioParaServidor(uriAudio: string){

  try{

    const form = new FormData();

    form.append("audio", {
      uri: uriAudio,
      type: "audio/m4a",
      name: "audio.m4a",
    } as any);

    const resp = await fetch("http://192.168.3.106:3000/transcrever", {
      method: "POST",
      body: form,
    });

    const json = await resp.json();

    console.log("🧠 TEXTO DO GOOGLE:", json.texto);

    if(json.texto){
      interpretarComando(json.texto);
    }

  }catch(e){
    console.log("❌ ERRO ENVIO:", e);
  }

}
async function pararGravacao(recording: Audio.Recording){
  try {

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setGravando(null);

    console.log("🎧 PAROU GRAVAÇÃO");

    if(uri){
      await enviarParaGoogle(uri);
    }

  } catch(err){
    console.log("Erro ao parar gravação:", err);
  }
}
async function pegarTokenGoogle() {
  try {
    const jwt = require('jsonwebtoken');

    const agora = Math.floor(Date.now() / 1000);

    const payload = {
      iss: googleCreds.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: agora + 3600,
      iat: agora
    };

    const tokenAssinado = jwt.sign(payload, googleCreds.private_key, {
      algorithm: 'RS256'
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${tokenAssinado}`
    });

    const json = await res.json();
    return json.access_token;

  } catch(e){
    console.log("ERRO TOKEN GOOGLE:", e);
    return null;
  }
}
async function enviarParaGoogle(uri: string) {
  try {
console.log("URI AUDIO:", uri);

    const formData = new FormData();
    const response = await fetch(uri);
    const audioBlob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(",")[1];
console.log("URI AUDIO:", uri);
      const res = await fetch(
        "https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyD74D3ul40R3MhNnRzdpSbSvISQlCKXGeo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
     config: {
  encoding: "WEBM_OPUS",
  languageCode: "pt-BR"
},
            audio: {
              content: base64Audio,
            },
          }),
        }
      );

      const data = await res.json();

      const texto =
        data.results?.[0]?.alternatives?.[0]?.transcript?.toLowerCase() || "";

      interpretarComando(texto);
    };

    reader.readAsDataURL(audioBlob);

  } catch (err) {
    console.log("Erro Google Speech", err);
  }
}
function interpretarComando(texto: string){

  console.log("TEXTO BRUTO GOOGLE:", texto);

  if(!texto || texto.trim().length === 0){
    console.log("⚠️ GOOGLE VEIO VAZIO");
    falar("Não entendi o que você disse");
    return;
  }

  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log("TEXTO NORMALIZADO:", t);

  // 🔥 detectar palavras
  if(t.includes("policia")){
    salvarReportLocal("polícia");
    falar("Polícia reportada por voz");
    return;
  }

  if(t.includes("acidente")){
    salvarReportLocal("acidente");
    falar("Acidente reportado");
    return;
  }

  if(t.includes("buraco")){
    salvarReportLocal("buraco");
    falar("Buraco reportado");
    return;
  }

  if(t.includes("transito")){
    salvarReportLocal("trânsito");
    falar("Trânsito reportado");
    return;
  }

  // se não reconheceu nada
  falar("Não reconheci o comando");
}
function ativarAlertaPorVoz(){

  setEscutandoVoz(true);

  Animated.loop(
    Animated.sequence([
      Animated.timing(animPulse,{
        toValue:1.3,
        duration:600,
        useNativeDriver:true
      }),
      Animated.timing(animPulse,{
        toValue:1,
        duration:600,
        useNativeDriver:true
      })
    ])
  ).start();

 
}
function t(chave:string){
  return TEXTOS[idiomaAtual]?.[chave] || chave;
}

const [menuAberto, setMenuAberto] = useState(false);

async function trocarIdiomaManual(id:"pt"|"en"){
  setIdiomaAtual(id);
  await AsyncStorage.setItem("idioma_manual", id);
}
const [nivelBloqueado, setNivelBloqueado] = useState(4);
// =================================
// 🔐 CONTROLE REAL FREE vs PRO
// =================================
const [idiomaManual, setIdiomaManual] = useState(false);
// nível máximo permitido pelo usuário
;
const [stepsRota, setStepsRota] = useState<any[]>([]);
const stepAtualRef = useRef(0);

function limiteNivelUsuario(): number{
  if(assinaturaAtiva || modoPro) return 4;
  return 1;
}

function nivelPermitido(): 0|1|2|3|4{
if(modoInsano){
  return 3; // trava nível máximo
}

  // limite da conta
  const limiteConta = (assinaturaAtiva || modoPro) ? 4 : 1;

  // limite escolhido manualmente na barra
  const limiteUsuario = nivelBloqueado;

  // nunca passar do menor
  const final = Math.min(limiteConta, limiteUsuario);

  return final as 0|1|2|3|4;
}
function usuarioEhPro(){
  return assinaturaAtiva || modoPro;
}
// timer esconder barra
const barraTimer = useRef<any>(null);
const [aceitouTermo, setAceitouTermo] = useState(false);
useEffect(()=>{

 async function carregarIdioma(){

  const salvo = await AsyncStorage.getItem("idioma_manual");

  if(salvo){
    setIdiomaAtual(salvo as "pt"|"en");
    return;
  }

  // detectar idioma celular
  const locale = Localization.getLocales()?.[0]?.languageCode ?? "pt";

  if(locale.startsWith("en")){
    setIdiomaAtual("en");
  }else{
    setIdiomaAtual("pt");
  }
 }

 async function verificarTermo(){
   const ok = await AsyncStorage.getItem("aceitou_termo");
   if(ok==="sim"){
     setAceitouTermo(true);
   }
 }

 carregarIdioma();
 verificarTermo();

},[]);

// ===============================
// 💰 CARREGAR ASSINATURA SALVA
// ===============================
useEffect(()=>{
 async function carregarPro(){
  const pro = await AsyncStorage.getItem("pro_ativo");
  if(pro==="sim"){
    setAssinaturaAtiva(true);
    setModoPro(true);
  }
 }
 carregarPro();
},[]);
 // carregar config toque duplo
 useEffect(()=>{
  async function loadTouch(){
    const v = await AsyncStorage.getItem("toque_duplo");
    if(v==="off") setToqueDuploAtivo(false);
  }
  loadTouch();
 },[]);

// ===============================
// 📢 ANÚNCIOS (placeholder futuro)
// ===============================
const [mostrarAds, setMostrarAds] = useState(true);

// só mostra anúncio parado
function podeMostrarAd(vel:number){

  return vel < 3;
}

// ===============================
// 🎙️ FRASES BASE (PT/EN)
// ===============================
const frases = {
  pt:{
    recalculando:"Recalculando rota",
    policia:"Polícia reportada à frente",
    radar:"Radar à frente",
    erro_rota:"Você saiu da rota"
  },
  en:{
    recalculando:"Recalculating route",
    policia:"Police ahead",
    radar:"Speed camera ahead",
    erro_rota:"You left the route"
  }
};
// ==========================================
// 😈 ZOEIRA POR TRANSPORTE
// ==========================================
const FRASES_TRANSPORTE:any = {

carro:[
 "Vamos ver quantas decisões ruins hoje.",
 "Dirigindo… infelizmente.",
 "Tenta não fazer merda agora.",
 "Confio em você… infelizmente.",
 "Isso vai dar errado.",
 "Mais um dia de direção duvidosa.",
 "Vamos fingir que sabe dirigir.",
 "Não estraga tudo hoje.",
 "Respira e tenta não errar.",
 "Expectativa baixa ativada."
],

moto:[
 "Alta chance de dar ruim.",
 "Cuidado pra não virar estatística.",
 "Capacete não salva direção ruim.",
 "Se cair não me culpa.",
 "Isso parece perigoso.",
 "Coragem ou falta de noção?",
 "Vai dar merda em 3…2…1…",
 "Pilotando como se fosse imortal.",
 "Boa sorte aí.",
 "Seguro de vida em dia?"
],

bike:[
 "Pelo menos vai emagrecer.",
 "Demora, mas chega… talvez.",
 "Esforço físico inútil.",
 "Cardio forçado.",
 "Vai suar pra chegar.",
 "Boa sorte nas subidas.",
 "Chega cansado porém vivo.",
 "Academia grátis.",
 "Movimento lento ativado.",
 "Pedala e reflete."
],

pe:[
 "Chega em 2999.",
 "Boa caminhada, tartaruga.",
 "Vai andando e pensando nos erros.",
 "Isso vai demorar muito.",
 "Passos de arrependimento.",
 "Chega… eventualmente.",
 "Longa jornada do fracasso.",
 "Prepare as pernas.",
 "Modo lento ativado.",
 "Até lá muita coisa acontece."
],

bus:[
 "Boa sorte dependendo disso.",
 "Transporte coletivo… misericórdia.",
 "Talvez chegue hoje.",
 "Se passar já é milagre.",
 "Confia no transporte público.",
 "Aventura urbana iniciada.",
 "Lotação em 3…2…1…",
 "Chegar é opcional.",
 "Boa sorte com horários.",
 "Isso vai testar sua fé."
]

};


// ==========================================
// ⏱ TEMPO FAKE POR TRANSPORTE
// ==========================================
function tempoFake(){
 if(!tempo) return "";

 if(modoTransporte==="carro") return tempo+" min";
 if(modoTransporte==="moto") return Math.round(tempo*0.8)+" min";
 if(modoTransporte==="bike") return Math.round(tempo*2.5)+" min";
 if(modoTransporte==="pe") return Math.round(tempo*8)+" min";
 if(modoTransporte==="bus") return Math.round(tempo*1.5)+" min";

 return tempo+" min";
}

// ===============================
// 🤬 PERSONALIDADE BASE
// ===============================
const personalidade = {
  pt:{
    1:[
      "Tentando dirigir ou testar minha paciência?"
    ],
    2:[
      "Magnífico. Errar era exatamente o plano?"
    ]
  },
  en:{
    1:[
      "Driving or testing my patience?"
    ],
    2:[
      "Brilliant. Getting lost was clearly the strategy."
    ]
  }
};

  const mapRef = useRef<MapView>(null);
  const ultimoPoiFalado = useRef("");

  const [origem, setOrigem] = useState<any>(null);
  const [gpsPronto, setGpsPronto] = useState(false);
  const [poisProximos, setPoisProximos] = useState<any[]>([]);


  const motoristaId = useRef("user_"+Math.random().toString(36).substring(2,9));
  // ===============================
// 🌙 MODO NOTURNO AUTOMÁTICO
// ===============================
const [modoNoturno, setModoNoturno] = useState(false);

useEffect(()=>{

 function verificarNoite(){
   const hora = new Date().getHours();

   if(hora >= 18 || hora < 6){
     setModoNoturno(true);
   }else{
     setModoNoturno(false);
   }
 }

 verificarNoite();
 const t = setInterval(verificarNoite, 60000);

 return ()=>clearInterval(t);

},[]);

  const [destinoTxt, setDestinoTxt] = useState("");
  const [destinoLat, setDestinoLat] = useState<number | null>(null);
const [destinoLng, setDestinoLng] = useState<number | null>(null);

  const [rua, setRua] = useState("");
  const [nomeCasaEscolhido, setNomeCasaEscolhido] = useState("");
const [mostrarListaCasa, setMostrarListaCasa] = useState(false);
const [numero, setNumero] = useState("");
const [bairro, setBairro] = useState("");
const [cidade, setCidade] = useState("");
const [sugestoesRua, setSugestoesRua] = useState<any[]>([]);

  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [altRouteCoords, setAltRouteCoords] = useState<any[]>([]);
   // ==========================================
 // 💾 BANCO LOCAL DE LOCAIS (CASA/TRAB/FAV)
 // ==========================================
 const [casaSalva, setCasaSalva] = useState<any>(null);
 const [editorTrabalhoVisivel, setEditorTrabalhoVisivel] = useState(false);
const [nomeTrabalhoEscolhido, setNomeTrabalhoEscolhido] = useState("");

 const [trabalhoSalvo, setTrabalhoSalvo] = useState<any>(null);
 const [favoritos, setFavoritos] = useState<any[]>([]);
 const [recentes, setRecentes] = useState<any[]>([]);
 const [amigosLista, setAmigosLista] = useState<any[]>([]);
 const [listaAmigosVisivel, setListaAmigosVisivel] = useState(false);

const [editorAmigoVisivel, setEditorAmigoVisivel] = useState(false);
const [nomeAmigoEscolhido, setNomeAmigoEscolhido] = useState("");
const [amigoEditandoIndex, setAmigoEditandoIndex] = useState<number | null>(null);

  // ==========================================
 // 🏠 POPUP DEFINIR CASA
 // ==========================================
 const [modalCasa, setModalCasa] = useState(false);
 const [modalEnderecoCasa, setModalEnderecoCasa] = useState(false);
const [inputEnderecoCasa, setInputEnderecoCasa] = useState("");

 const [apelidoCasaTemp, setApelidoCasaTemp] = useState("");

  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const GOOGLE_KEY = "AIzaSyD74D3ul40R3MhNnRzdpSbSvISQlCKXGeo";
  async function buscarPOIsReais(lat:number,lng:number){

 try{

  const tipos = [
    {tipo:"police", palavra:"police"},
    {tipo:"gas", palavra:"gas_station"},
    {tipo:"driving_school", palavra:"driving_school"},
  ];

  for(const t of tipos){

    const url =
`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=400&type=${t.palavra}&key=${GOOGLE_KEY}`;

    const res = await fetch(url);
        const json = await res.json();

    if(!json.results) continue;

    json.results.slice(0,3).forEach((p:any)=>{

      const plat = p.geometry.location.lat;
      const plng = p.geometry.location.lng;

      const dx = lat - plat;
      const dy = lng - plng;
      const dist = Math.sqrt(dx*dx+dy*dy)*111000;

      const chave = t.tipo+Math.round(plat*1000);

      // só alerta se estiver realmente perto
if(dist < 80){
        if(!poisMemoria.current[chave]){
          falarPoi(t.tipo);
          poisMemoria.current[chave] = Date.now();
        }
      }

    });

  }

 }catch(e){}
}

  const [tempo, setTempo] = useState<number | null>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [navegando, setNavegando] = useState(false);
  let testeInicialFalado = false;

  const [modoTransporte, setModoTransporte] = useState("carro");
  // opções com tempo estimado estilo Google Maps
const opcoesTransporte = [
 {
  icon:"🚗",
  frase:"Vamos ver quantas decisões ruins hoje.",
  tempo: tempo || 0
 },
 {
  icon:"🏍",
  frase:"Alta chance de dar ruim.",
  tempo: tempo ? Math.round(tempo*0.8) : 0
 },
 {
  icon:"🚲",
  frase:"Pelo menos vai emagrecer.",
  tempo: tempo ? Math.round(tempo*2.5) : 0
 },
 {
  icon:"🚶",
  frase:"Chega em 2999.",
  tempo: tempo ? Math.round(tempo*8) : 0
 },
 {
  icon:"🚌",
  frase:"Boa sorte dependendo disso.",
  tempo: tempo ? Math.round(tempo*1.5) : 0
 }
];

  const [frasesLateral, setFrasesLateral] = useState<any>(null);

  useKeepAwake();

  const [carroPos, setCarroPos] = useState<any>(null);
  useEffect(()=>{

 let sub:any = null;

 async function iniciarGPS(){

  const { status } = await Location.requestForegroundPermissionsAsync();
  if(status !== "granted") return;

  sub = await Location.watchPositionAsync(
   {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    distanceInterval: 1
   },
   (loc)=>{

    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;
    const vel = (loc.coords.speed || 0) * 3.6;
     // ================================
 // 🚗 CAMERA SEGUE CARRO (REAL)
 // ================================
 if(navegando && !mapMovidoRef.current){

   mapRef.current?.animateCamera({
     center:{
       latitude: loc.coords.latitude,
       longitude: loc.coords.longitude
     },
     pitch:65,
     heading: loc.coords.heading || 0,
     zoom:18
   }, { duration: 700 });

 }
    buscarPoisProximos(lat, lng);

    setCarroPos(loc.coords);
    setVelocidade(Math.round(vel));

    if(!navegando) return;

    // ================================
    // 🔊 FALAR CURVAS
    // ================================
    const stepAtual = stepsRota[stepAtualRef.current];
    if(!stepAtual) return;

    const stepLat = stepAtual.maneuver.location[1];
    const stepLng = stepAtual.maneuver.location[0];

    const dx = lat - stepLat;
    const dy = lng - stepLng;
    const dist = Math.sqrt(dx*dx+dy*dy) * 111000;

    if(dist < 40){
      falarInstrucao(stepAtual, dist);
      stepAtualRef.current++;
    }
    else if(dist < 220){
      falarInstrucao(stepAtual, dist);
    }

    // ================================
    // 🚨 FORA DA ROTA
    // ================================
    const distRota = distanciaAteRota(lat,lng);
    if(distRota > 60){
      const agora = Date.now();
      if(agora - ultimoRecalculo.current > 7000){
        falarErroRota();
        ultimoRecalculo.current = agora;
      }
    }

    // ================================
    // 🧠 POIs
    // ================================
    if(podeBuscarPOI(lat,lng)){
      buscarPOIsReais(lat,lng);
    }

   }
  );
 }

 iniciarGPS();

 return ()=>{
  if(sub) sub.remove();
 };

},[navegando, stepsRota]);
  const ultimoStepFalado = useRef(-1);

useEffect(()=>{

 if(!navegando) return;
 if(!carroPos) return;
 if(!stepsRota || stepsRota.length===0) return;

 const stepIndex = stepAtualRef.current;
 const step = stepsRota[stepIndex];

 if(!step) return;

 const alvo = step.maneuver.location;
 if(!alvo) return;

 const lat = alvo[1];
 const lng = alvo[0];

 const dx = carroPos.latitude - lat;
 const dy = carroPos.longitude - lng;
 const distancia = Math.sqrt(dx*dx+dy*dy)*111000;

 // ===== FALAR INSTRUÇÃO =====
 if(distancia < 220){

   if(stepIndex !== ultimoStepFalado.current){
     ultimoStepFalado.current = stepIndex;
     falarInstrucao(step, distancia);
   }

 }

 // ===== PASSOU DO PONTO → PROX STEP =====
 if(distancia < 30){
   stepAtualRef.current++;
 }

}, [carroPos, navegando]);

  const [velocidade, setVelocidade] = useState(0);
   // ==========================================
 // 🚨 BOTÃO REPORT FLUTUANTE
 // ==========================================
 const posBotao = useRef({x: 300, y: 500});
 const opacidadeBotao = useRef(new Animated.Value(0.9)).current;
const timerFade = useRef<any>(null);

function mostrarBotao(){
  Animated.timing(opacidadeBotao,{
    toValue:0.9,
    duration:200,
    useNativeDriver:true
  }).start();

  if(timerFade.current) clearTimeout(timerFade.current);

  timerFade.current = setTimeout(()=>{
    esconderBotao();
  },4000);
}

function esconderBotao(){
  Animated.timing(opacidadeBotao,{
    toValue:0.15,
    duration:800,
    useNativeDriver:true
  }).start();
}

  const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      const x = gesture.moveX - 30;
      const y = gesture.moveY - 30;

      posBotao.current = {x,y};
      setRenderPos({x,y});
    }
  })
 ).current;

 const [renderPos, setRenderPos] = useState({x:300,y:500});

 const segurandoReport = useRef(false);
 const tempoPress = useRef(0);

  // ==========================================
// 🚀 GPS EM TEMPO REAL (CÉREBRO DO APP)
// ==========================================
useEffect(()=>{

 let sub:any=null;

 async function iniciarGPS(){

  const { status } = await Location.requestForegroundPermissionsAsync();
  if(status !== "granted"){
    console.log("GPS negado");
    return;
  }

  sub = await Location.watchPositionAsync(
   {
     accuracy: Location.Accuracy.High,
     distanceInterval: 5,
     timeInterval: 2000
   },
   (loc)=>{

     const lat = loc.coords.latitude;
     const lng = loc.coords.longitude;
     
     setCarroPos({
       latitude: lat,
       longitude: lng,
       heading: loc.coords.heading || 0
     });
verificarPoisProximos(lat, lng);


     setVelocidade(Math.round((loc.coords.speed || 0)*3.6));
     if((loc.coords.speed || 0) < 1){
  if(!tempoParado.current){
    tempoParado.current = Date.now();
  }
}else{
  tempoParado.current = null;
}

     // =====================================
     // 🧠 FALAR CURVAS DO GPS
     // =====================================
     if(navegando && stepsRota.length > 0){

       const idx = stepAtualRef.current;
       const step = stepsRota[idx];
       if(!step) return;

       const target = step.maneuver.location;
       const tLat = target[1];
       const tLng = target[0];

       const dx = lat - tLat;
       const dy = lng - tLng;
       const dist = Math.sqrt(dx*dx + dy*dy)*111000;

       // aviso antes
       if(dist < 220 && !step._avisado){
         falarInstrucao(step, 200);
         step._avisado = true;
       }

       // chegou curva
       if(dist < 35){
         falarInstrucao(step, 0);
         stepAtualRef.current++;
       }
     }

   }
  );
 }

 iniciarGPS();

 return ()=>{
  if(sub) sub.remove();
 };

},[navegando, stepsRota]);

  const poisMemoria = useRef<Record<string, number>>({});
  const ultimaBuscaPOI = useRef<{lat:number,lng:number} | null>(null);


const ultimoAviso = useRef(0);
const contadorErros = useRef(0);
const memoriaErros = useRef<Record<string,number>>({});

const ultimoPensamento = useRef(0);

// distância inteligente baseada na velocidade
function distanciaAlerta(){
 if(velocidade < 20) return 120;
 if(velocidade < 40) return 200;
 if(velocidade < 70) return 300;
 if(velocidade < 100) return 450;
 return 600;
}
function podeBuscarPOI(lat:number,lng:number){

 if(!ultimaBuscaPOI.current){
   ultimaBuscaPOI.current = {lat,lng};
   return true;
 }

 const dx = lat - ultimaBuscaPOI.current.lat;
 const dy = lng - ultimaBuscaPOI.current.lng;
 const dist = Math.sqrt(dx*dx+dy*dy)*111000;

 if(dist > 1000){ // 1km para nova busca
   ultimaBuscaPOI.current = {lat,lng};
   return true;
 }

 return false;
}

  const [mapMovido, setMapMovido] = useState(false);
  const mapMovidoRef = useRef(false);
  const bloqueioAutoCamera = useRef(false);
   // ==========================================
 // 👆 SISTEMA TOQUE INTELIGENTE
 // ==========================================
 const ultimoToque = useRef(0);
 const timeoutToque = useRef<any>(null);
 const [menuReportVisivel, setMenuReportVisivel] = useState(false);

 // config salva
 const [toqueDuploAtivo, setToqueDuploAtivo] = useState(true);

// libera após 2 segundos

  const [foraRota, setForaRota] = useState(false);
  const ultimoRecalculo = useRef(0);
  // ==========================================
// 🚗 GPS REAL — RASTREAMENTO CONTÍNUO
// ==========================================
useEffect(()=>{

 let sub:any = null;

 async function iniciarGPS(){

  const { status } = await Location.requestForegroundPermissionsAsync();
  if(status !== "granted") return;

  sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 3,
    },
    (loc)=>{

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      setCarroPos(loc.coords);
      setVelocidade(Math.round((loc.coords.speed || 0)*3.6));

      // só funciona navegando
      if(!navegando) return;

      // ===== POIs =====
      if(podeBuscarPOI(lat,lng)){
        buscarPOIsReais(lat,lng);
      }

      // ===== FORA DA ROTA =====
      const distRota = distanciaAteRota(lat,lng);

      if(distRota > 45){
        const agora = Date.now();
        if(agora - ultimoRecalculo.current > 6000){
          ultimoRecalculo.current = agora;
          falarErroRota();
        }
      }

      // ===== INSTRUÇÕES DE CURVA =====
      if(stepsRota.length > 0){

        const stepAtual = stepsRota[stepAtualRef.current];
        if(!stepAtual) return;

        const alvo = stepAtual.maneuver.location;
        const dLat = lat - alvo[1];
        const dLng = lng - alvo[0];
        const dist = Math.sqrt(dLat*dLat + dLng*dLng) * 111000;

        // aviso antes
        if(dist < 200 && dist > 60){
          falarInstrucao(stepAtual, 200);
        }

        // na curva
        if(dist < 35){
          falarInstrucao(stepAtual, 0);
          stepAtualRef.current++;
        }
      }
    }
  );
 }

 iniciarGPS();

 return ()=>{
  if(sub) sub.remove();
 };

},[navegando]);
useEffect(()=>{

 if(!modoInsano){
   if(timerInsano.current) clearTimeout(timerInsano.current);
   return;
 }

 function loopInsano(){

   const tempo =
     25000 + Math.random()*90000; // 25s até ~2min

   timerInsano.current = setTimeout(()=>{

     falarInsano();
     loopInsano();

   }, tempo);
 }

 loopInsano();

 return ()=>{
   if(timerInsano.current) clearTimeout(timerInsano.current);
 };

},[modoInsano, navegando]);

  
  // ===============================
// 🔙 BOTÃO VOLTAR ANDROID
// ===============================
useEffect(() => {

  const backAction = () => {

    // se navegando → cancela navegação
    if(navegando){
      setNavegando(false);
      deactivateKeepAwake();
      setRouteCoords([]);
      setAltRouteCoords([]);
      setDestinoTxt("");
      return true;
    }

    // se tem rota traçada → volta para busca
    if(routeCoords.length > 0){
      setRouteCoords([]);
      setAltRouteCoords([]);
      setDestinoTxt("");
      return true;
    }

    // se está na busca → pode sair do app
    return false;
  };

  const backHandler = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => backHandler.remove();

}, [navegando, routeCoords]);

async function buscarSugestoes(texto:string){

  setDestinoTxt(texto);

  if(texto.length < 3){
    setSugestoes([]);
    return;
  }

  try{

    const response = await fetch(
`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(texto)}&location=${carroPos?.latitude || 0},${carroPos?.longitude || 0}&radius=50000&language=pt&key=${GOOGLE_KEY}`
    );

    const json = await response.json();

    if(json.predictions){
      setSugestoes(json.predictions);
    }else{
      setSugestoes([]);
    }

  }catch(e){
    console.log("erro autocomplete",e);
  }
}


async function buscarDestino() {
  // ABRE PAINEL IMEDIATO (ANTES DE TUDO)
  setPainelVisivel(true);
  setRotaCarregando(true);
  if (!destinoTxt) return;
  // ⬇️ IMPORTANTE: dar respiro para UI renderizar
  await new Promise(r => setTimeout(r, 50));


    try{
      const { status } = await Location.getForegroundPermissionsAsync();

if (status !== "granted") {
  alert("Permita localização primeiro");
  return;
}

      let geo = [];

try {
  geo = await Location.geocodeAsync(destinoTxt);

  if (!geo || geo.length === 0) {
    alert("Endereço não encontrado");
    return;
  }

} catch (err) {
  console.log("ERRO GEOCODE:", err);
  alert("Erro ao buscar endereço. Verifique internet.");
  return;
}
      if(!geo.length) return alert("Endereço não encontrado");
     const destLat = geo[0].latitude;
const destLng = geo[0].longitude;
// ===== ABRE PAINEL IMEDIATAMENTE =====
setDestinoLat(destLat);
setDestinoLng(destLng);

setRotaCarregando(true);


      mapRef.current?.animateToRegion({
        latitude: destLat,
        longitude: destLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const loc = await Location.getLastKnownPositionAsync() 
           || await Location.getCurrentPositionAsync({});

      const origemLat = loc.coords.latitude;
      const origemLng = loc.coords.longitude;

  const url = `https://router.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destLng},${destLat}?alternatives=3&overview=full&geometries=geojson&steps=true&annotations=false`;

      const res = await fetch(url);
      const json = await res.json();
     console.log("ROTAS RECEBIDAS:", json.routes?.length);

     const rotaPrincipal = json.routes[0];
     // salvar instruções reais da rota
if(rotaPrincipal.legs && rotaPrincipal.legs[0].steps){
  setStepsRota(rotaPrincipal.legs[0].steps);
  stepAtualRef.current = 0;
}

     const rotaAlt = json.routes.length > 1 ? json.routes[1] : null;

setTempo(Math.round(rotaPrincipal.duration/60));
setRotaCarregando(false);

setDistancia(Math.round((rotaPrincipal.distance/1000)*10)/10);
setTimeout(() => {
  sheetRef.current?.snapToIndex(1);
}, 400);


// rota principal (azul)
const coords = rotaPrincipal.geometry.coordinates.map((c:any)=>({
  latitude:c[1],
  longitude:c[0],
}));
setRouteCoords(coords);
 // gerar frases laterais transporte
 const frasesGeradas:any = {};

 Object.keys(FRASES_TRANSPORTE).forEach((tipo)=>{
   const lista = FRASES_TRANSPORTE[tipo];
   if(lista && lista.length){
     const frase = lista[Math.floor(Math.random()*lista.length)];
     frasesGeradas[tipo] = frase;
   }
 });

 setFrasesLateral(frasesGeradas);

// rota alternativa (cinza)
if(rotaAlt){
  const altcoords = rotaAlt.geometry.coordinates.map((c:any)=>({
    latitude:c[1],
    longitude:c[0],
  }));
  setAltRouteCoords(altcoords);
  // abrir painel automático estilo Google Maps
setTimeout(()=>{
  sheetRef.current?.snapToIndex(1);
}, 600);

}
    }catch(e){
      console.log(e);
    }
  }
// ===============================
// 📏 DISTÂNCIA DO CARRO ATÉ ROTA
// ===============================
function distanciaAteRota(lat:number,lng:number){

  if(routeCoords.length === 0) return 0;

  let menor = 999999;

  for(let i=0;i<routeCoords.length;i++){
    const p = routeCoords[i];

    const dx = lat - p.latitude;
    const dy = lng - p.longitude;
    const d = Math.sqrt(dx*dx + dy*dy);

    if(d < menor) menor = d;
  }

 return menor * 111000; // metros
}


// ===============================
// 🔊 FALAR (base global)
// ===============================


// ==========================================
// 🔥 VOZ ELEVENLABS (PRO)
// ==========================================
// ==========================================
// 🔊 SISTEMA CENTRAL DE VOZ
// ==========================================
// ==========================================
// 🔊 SISTEMA DE VOZ PROFISSIONAL (ELEVEN)
// ==========================================


let tocandoAgora:any = null;
let filaAudio:string[] = [];
let reproduzindo = false;
function traduzir(texto:string){

  if(idiomaAtual === "pt") return texto;

  // tradução simples automática (base)
  const miniDic:any = {
    "Vire à direita":"Turn right",
    "Vire à esquerda":"Turn left",
    "Siga em frente":"Go straight",
    "Você chegou ao destino":"You arrived",
    "Em 200 metros":"In 200 meters",
    "Polícia à frente":"Police ahead",
    "Radar à frente":"Speed camera ahead",
    "Posto":"Gas station",
  };

  let t = texto;

  Object.keys(miniDic).forEach(pt=>{
    t = t.replace(pt, miniDic[pt]);
  });

  return t;
}

async function falar(texto:string){

  texto = traduzir(texto);

  falandoRef.current = true;

ultimoAviso.current = Date.now();

if(MODO_REVISAO_XINGAMENTOS) return;

if(!texto) return;

 if(!texto) return;

 console.log("ELEVEN:", texto);

 // adiciona na fila
 filaAudio.push(texto);

 if(reproduzindo) return;
 reproduzindo = true;

 while(filaAudio.length > 0){

   const proximo = filaAudio.shift();
  if(!proximo) return;
   try{

     // para qualquer áudio anterior
     if(tocandoAgora){
       await tocandoAgora.stopAsync();
       await tocandoAgora.unloadAsync();
       tocandoAgora = null;
     }

     const res = await fetch("http://62.171.144.109:3001/speak", {
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body: JSON.stringify({ text:proximo })
});


     if(!res.ok){
       console.log("erro eleven server");
       continue;
     }

  const audioBase64 = await res.text();

const uri = `data:audio/mp3;base64,${audioBase64}`;

const { sound } = await Audio.Sound.createAsync(
 { uri },
 { shouldPlay: true, volume: 1.0 }
);

await sound.playAsync();

sound.setOnPlaybackStatusUpdate((status:any)=>{
 if(status.didJustFinish){
   sound.unloadAsync();
 }
});
setTimeout(()=>{
  falandoRef.current = false;
}, 5000);

await sound.playAsync();

sound.setOnPlaybackStatusUpdate((status:any)=>{
  if(status.didJustFinish){
    sound.unloadAsync();
  }
});



   }catch(e){
     console.log("erro eleven");
   }
 }
reproduzindo = false;
}
function falarInsano(){

  const agora = Date.now();

  // evita spam
  if(agora - ultimoInsano.current < 25000) return;

  // se já tem voz falando
  if(falandoRef.current) return;

  ultimoInsano.current = agora;

  let fala = "";

  const tipo = Math.random();

  // 1️⃣ PIADA INSANA (40%)
  if(tipo < 0.4){
    fala = PIADAS_INSANO[Math.floor(Math.random()*PIADAS_INSANO.length)];
  }

  // 2️⃣ FRASE VIVA (35%)
  else if(tipo < 0.75){
    fala = FRASES_VIVAS[Math.floor(Math.random()*FRASES_VIVAS.length)];
  }

  // 3️⃣ CONTEXTO VELOCIDADE (25%)
  else{
    if(velocidade < 5){
      fala = "Parado assim parece que desistiu da vida.";
    }else if(velocidade > 120){
      fala = "Essa pressa toda é fuga ou só imprudência mesmo?";
    }else{
      fala = PIADAS_INSANO[Math.floor(Math.random()*PIADAS_INSANO.length)];
    }
  }

  if(!fala) return;

  falar(fala);

  // risada inteligente
  setTimeout(()=>{
    if(Math.random() < 0.35){
      falar("hahahahaha");
    }
  }, 4500);
}

if(!jaFalouInicio.current){
  jaFalouInicio.current = true;

  setTimeout(()=>{
    falar("Sistema de voz conectado com sucesso");
  },1500);
}
async function buscarPoisProximos(lat:number, lng:number){

  try{

    const tipos = [
      "police",
      "hospital",
      "gas_station",
      "school",
      "restaurant"
    ];

    let resultados:any[] = [];

    for(const tipo of tipos){

      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${tipo}&key=AIzaSyD74D3ul40R3MhNnRzdpSbSvISQlCKXGeo`;

      const res = await fetch(url);
      const json = await res.json();

      if(json.results){
        const filtrados = json.results.map((p:any)=>({
          tipo:
            tipo === "gas_station" ? "gas" :
            tipo === "gas_station" ? "gas" :
            tipo,
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng
        }));

        resultados = [...resultados, ...filtrados];
      }
    }

    setPoisProximos(resultados);

  }catch(e){
    console.log("Erro ao buscar POIs", e);
  }

}

function verificarPoisProximos(lat:number,lng:number){

  if(!mapRef.current) return;

const lista = [
 {tipo:"police"},
 {tipo:"radar"},
 {tipo:"gas"},
 {tipo:"hospital"},
 {tipo:"restaurant"},
 {tipo:"school"},
 {tipo:"driving_school"},
];

  lista.forEach(poi=>{

    // evita repetir sempre o mesmo
if(!poisProximos || !poisProximos.length) return;

poisProximos.forEach(p=>{
const nomeTraduzido = POI_LABELS[idiomaAtual][p.tipo];

  if(p.tipo !== poi.tipo) return;

  const dx = (lat - p.lat) * 111000;
  const dy = (lng - p.lng) * 111000;
  const distancia = Math.sqrt(dx*dx + dy*dy);

  if(distancia < 120){

    if(ultimoPoiFalado.current === poi.tipo) return;

    ultimoPoiFalado.current = poi.tipo;

    falarPoi(poi.tipo);

    setTimeout(()=>{
      ultimoPoiFalado.current = "";
    },45000);
  }

});

  });

}

function falarPoi(tipo:string){

  if(!POI_LINES[tipo]) return;

  let nivel = 0;

  if(modoInsano) nivel = 4;
  else if(modoPro) nivel = 3;
  else nivel = 1;

  const banco = POI_LINES[tipo][nivel];
  if(!banco || !banco.length) return;

  const frase = banco[Math.floor(Math.random()*banco.length)];

  falar(frase);
}

function falarInstrucao(step:any, distancia:number){

 if(!step) return;

 const chaveUnica =
   step?.maneuver?.modifier +
   step?.maneuver?.type +
   step?.name;

 // evita repetir igual papagaio
 if(ultimaInstrucaoRef.current === chaveUnica){
   return;
 }

 ultimaInstrucaoRef.current = chaveUnica;

 let tipo = step.maneuver?.type || "";
 let lado:any = step.maneuver?.modifier || "";

 // ================================
 // 🧠 DESCOBRIR NOME DA RUA
 // ================================
 let nomeRua = "";

 if(step.name && step.name.trim().length > 0){
   nomeRua = step.name;
 }
 else if(step.ref && step.ref.trim().length > 0){
   nomeRua = step.ref;
 }
 else if(step.destinations){
   nomeRua = step.destinations.split(",")[0];
 }

 // limpar nomes estranhos
 if(nomeRua){
   nomeRua = nomeRua
   .replace(/\s+/g," ")
   .replace("Unnamed Road","")
   .replace("null","")
   .trim();
 }

 // ================================
 // 🧭 CORREÇÃO ABSOLUTA ESQUERDA/DIREITA
 // ================================
 if(step.geometry?.coordinates?.length >= 2){

  const c1 = step.geometry.coordinates[0];
  const c2 = step.geometry.coordinates[1];

  const dx = c2[0] - c1[0];
  const dy = c2[1] - c1[1];

  const angulo = Math.atan2(dy, dx) * 180/Math.PI;

  if(angulo > 20) lado = "left";
  if(angulo < -20) lado = "right";
 }

 // idioma
 if(idiomaAtual === "pt"){
   if(lado==="left") lado="esquerda";
   if(lado==="right") lado="direita";
 }else{
   if(lado==="esquerda") lado="left";
   if(lado==="direita") lado="right";
 }

 let frase = "";

 // =========================================
// 📣 AVISO INTELIGENTE BASEADO NA DISTÂNCIA
// =========================================
if(distancia > 40){

 let metros = 0;

 if(distancia > 400) metros = 300;
 else if(distancia > 220) metros = 200;
 else if(distancia > 120) metros = 120;
 else metros = 60;

 if(tipo==="roundabout"){
   frase = idiomaAtual==="pt"
     ? `Em ${metros} metros entre na rotatória`
     : `In ${metros} meters enter the roundabout`;
 }

 else if(lado==="esquerda" || lado==="left"){
   frase = idiomaAtual==="pt"
     ? `Em ${metros} metros vire à esquerda`
     : `In ${metros} meters turn left`;
 }

 else if(lado==="direita" || lado==="right"){
   frase = idiomaAtual==="pt"
     ? `Em ${metros} metros vire à direita`
     : `In ${metros} meters turn right`;
 }

 else{
   frase = idiomaAtual==="pt"
     ? `Em ${metros} metros siga em frente`
     : `In ${metros} meters go straight`;
 }

 if(nomeRua){
   frase += idiomaAtual==="pt"
     ? " na " + nomeRua
     : " on " + nomeRua;
 }
}
 // =========================================
 // 📍 NA CURVA
 // =========================================
 else{

   if(tipo==="arrive"){
     frase = idiomaAtual==="pt"
       ? "Você chegou ao destino"
       : "You arrived at destination";
   }

   else if(tipo==="roundabout"){
     const exit = step.maneuver?.exit || "";
     if(exit){
       frase = idiomaAtual==="pt"
         ? `Na rotatória pegue a ${exit}ª saída`
         : `At the roundabout take exit ${exit}`;
     }else{
       frase = idiomaAtual==="pt"
         ? "Entre na rotatória"
         : "Enter the roundabout";
     }
   }

   else if(lado==="esquerda" || lado==="left"){
     frase = idiomaAtual==="pt"
       ? "Vire à esquerda"
       : "Turn left";
   }

   else if(lado==="direita" || lado==="right"){
     frase = idiomaAtual==="pt"
       ? "Vire à direita"
       : "Turn right";
   }

   else{
     frase = idiomaAtual==="pt"
       ? "Siga em frente"
       : "Go straight";
   }

   // adicionar rua
   if(nomeRua){
     frase += idiomaAtual==="pt"
       ? " na " + nomeRua
       : " on " + nomeRua;
   }
 }

 falar(frase);
}
 // ==========================================
 // 💾 SALVAR REPORT LOCAL
 // ==========================================
 async function salvarReportLocal(tipo:string){
  
  // ==========================================
 // ⚡ REPORT RÁPIDO TESLA (SEGURAR)
 // ==========================================


  if(!carroPos) return;

  const report = {
   tipo,
   lat: carroPos.latitude,
   lng: carroPos.longitude,
   data: Date.now()
  };

  try{
    const atual = await AsyncStorage.getItem("reports_local");
    let lista:any[] = atual ? JSON.parse(atual) : [];

    lista.push(report);

    await AsyncStorage.setItem("reports_local", JSON.stringify(lista));
    console.log("REPORT SALVO", report);

  }catch(e){
    console.log("erro salvar report");
  }
 }
 // ==========================================
// ⚡ REPORT RÁPIDO TESLA (SEGURAR BOTÃO)
// ==========================================
function reportRapido(segundos:number){

 if(!carroPos) return;

 let tipo = "polícia";

 if(segundos >= 2) tipo = "objeto na pista";
 if(segundos >= 3) tipo = "acidente";

 salvarReportLocal(tipo);

 // vibração leve feedback
 Vibration.vibrate(80);

 // confirmação discreta (não bloqueia navegação)
 console.log("⚡ REPORT RÁPIDO:", tipo);
}
async function salvarAmigo(novoAmigo:any){

 try{

  let listaAtual = [...amigosLista];

  if(amigoEditandoIndex !== null){
    listaAtual[amigoEditandoIndex] = novoAmigo;
  }else{
    listaAtual.push(novoAmigo);
  }

  await AsyncStorage.setItem("amigos_lista", JSON.stringify(listaAtual));
  setAmigosLista(listaAtual);

  setEditorAmigoVisivel(false);
  setNomeAmigoEscolhido("");
  setAmigoEditandoIndex(null);

  setRua("");
  setNumero("");
  setBairro("");
  setCidade("");

  falar("Amigo salvo. Que escolha duvidosa.");

 }catch(e){
  alert("Erro ao salvar amigo");
 }

}

function falarErroRota(){

contadorErros.current++;
if(carroPos){
 const chaveLocal =
  Math.round(carroPos.latitude*1000)+"_"+
  Math.round(carroPos.longitude*1000);

 memoriaErros.current[chaveLocal] =
  (memoriaErros.current[chaveLocal] || 0) + 1;

 const repeticoes = memoriaErros.current[chaveLocal];

 if(repeticoes === 2){
   setTimeout(()=>falar("Você já errou aqui antes."),3000);
 }

 if(repeticoes === 3){
   setTimeout(()=>falar("Terceira vez no mesmo lugar."),3000);
 }

 if(repeticoes >= 4){
   setTimeout(()=>falar("Você nunca aprende."),3000);
 }
}

let nivelBase = nivelBloqueado;
if(!usuarioEhPro() && nivelBase > 1){
  nivelBase = 1;
}



// progressão de impaciência
let nivelMax = nivelPermitido();

// progressão só até o limite permitido
if(contadorErros.current >= 3) nivelBase = Math.min(nivelMax,2);
if(contadorErros.current >= 6) nivelBase = Math.min(nivelMax,3);
if(contadorErros.current >= 9) nivelBase = Math.min(nivelMax,4);

nivelBase = Math.min(nivelBase, nivelMax);


let nivel = nivelBase;


if(nivel===0){
  falar("Recalculando rota");
  return;
}
const lista = WRONG_LINES[nivel];
if(!lista || lista.length===0){
  falar("Recalculando rota");
  return;
}
const frase = lista[Math.floor(Math.random()*lista.length)];
falar(frase);
// memória global de direção ruim
if(contadorErros.current === 5){
 setTimeout(()=>falar("Você está especialmente ruim hoje."),4000);
}

if(contadorErros.current === 8){
 setTimeout(()=>falar("Impressionante a sequência de erros."),4000);
}

if(contadorErros.current >= 12){
 setTimeout(()=>falar("Você dirige mal de forma consistente."),4000);
}
 // ===============================
 // 🧠 RESPOSTA AO MOTORISTA (PENSAMENTO)
 // ===============================

 setTimeout(()=>{

   const pensamentos = [
    "Não adianta me culpar.",
    "Você que errou.",
    "Não adianta me xingar.",
    "A culpa é sua.",
    "Dirige mal e reclama.",
    "Eu só mostro o caminho.",
    "Você erra e ainda acha ruim.",
    "Foca na direção antes de reclamar.",
    "Quer xingar? Aprende a dirigir primeiro."
   ];

   const p = pensamentos[Math.floor(Math.random()*pensamentos.length)];
   falar(p);

 },3500);

}

// ================================
// 🔞 TELA DE TERMO OBRIGATÓRIO
// ================================
if(!aceitouTermo){
  return(
    <View style={{
      flex:1,
      backgroundColor:"#000",
      justifyContent:"center",
      alignItems:"center",
      padding:25
    }}>

      <Text style={{
        color:"#fff",
        fontSize:24,
        fontWeight:"bold",
        marginBottom:25,
        textAlign:"center"
      }}>
        GPS SEM PACIÊNCIA
      </Text>

      <Text style={{
        color:"#ccc",
        fontSize:16,
        textAlign:"center",
        marginBottom:40
      }}>
        Este aplicativo utiliza linguagem ofensiva, humor ácido e interações verbais potencialmente agressivas durante a navegação.

Ao prosseguir, você declara estar ciente e de acordo em utilizar o aplicativo por livre e espontânea vontade, compreendendo que todas as falas possuem caráter exclusivamente humorístico e fictício.

O desenvolvedor não se responsabiliza por qualquer interpretação emocional, reação pessoal, desconforto ou dano subjetivo decorrente do uso.

Caso não concorde, encerre o aplicativo agora.

Ao pressionar ACEITAR, você confirma ciência e concordância integral com estes termos.

      </Text>

      <TouchableOpacity
        style={{
          backgroundColor:"#00C853",
          paddingVertical:16,
          borderRadius:12,
          width:"100%",
          marginBottom:15
        }}
        onPress={async ()=>{

 const registro = {
  aceitou:true,
  data:new Date().toISOString(),
  versao:"1.0",
 };

 await AsyncStorage.setItem("aceitou_termo","sim");
 await AsyncStorage.setItem("aceite_registrado", JSON.stringify(registro));

 setAceitouTermo(true);
}}


      >
        <Text style={{
          color:"#fff",
          fontSize:18,
          fontWeight:"bold",
          textAlign:"center"
        }}>
          ACEITAR E ENTRAR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor:"#d50000",
          paddingVertical:14,
          borderRadius:12,
          width:"100%"
        }}
        onPress={()=>BackHandler.exitApp()}
      >
        <Text style={{
          color:"#fff",
          fontSize:16,
          fontWeight:"bold",
          textAlign:"center"
        }}>
          RECUSAR
        </Text>
      </TouchableOpacity>


    </View>
  )
}

if(!aceitouTermo){
  if(!gpsPronto){
  return(
    <View style={{
      flex:1,
      backgroundColor:"#000",
      justifyContent:"center",
      alignItems:"center"
    }}>
      <Text style={{color:"#fff",fontSize:18}}>
        Obtendo localização...
      </Text>
    </View>
  );
}

  return(
    <View style={{
      flex:1,
      backgroundColor:"#000",
      justifyContent:"center",
      alignItems:"center",
      padding:30
    }}>

      <Text style={{
        color:"#fff",
        fontSize:22,
        fontWeight:"bold",
        marginBottom:20,
        textAlign:"center"
      }}>
        GPS SEM PACIÊNCIA
      </Text>

      <Text style={{
        color:"#ccc",
        fontSize:16,
        textAlign:"center",
        marginBottom:30
      }}>
        Este aplicativo possui modo de humor ácido e linguagem ofensiva.
        Ao continuar você aceita ouvir xingamentos e conteúdo adulto
        durante a navegação.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor:"#00C853",
          padding:15,
          borderRadius:12,
          width:"100%",
          alignItems:"center",
          marginBottom:15
        }}
        onPress={()=>setAceitouTermo(true)}
      >
        <Text style={{color:"#fff",fontSize:18,fontWeight:"bold"}}>
          ACEITAR E ENTRAR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor:"#d50000",
          padding:15,
          borderRadius:12,
          width:"100%",
          alignItems:"center"
        }}
        onPress={()=>BackHandler.exitApp()}
      >
        <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>
          RECUSAR E SAIR
        </Text>
      </TouchableOpacity>

    </View>
  )
}

return (
  <GestureHandlerRootView style={{ flex: 1 }}>

    <BottomSheetModalProvider>

<View style={{flex:1}}>


<MapView

ref={mapRef}
style={StyleSheet.absoluteFillObject}
customMapStyle={modoNoturno ? mapaNoturnoStyle : []}


showsUserLocation={true}
followsUserLocation={false}

moveOnMarkerPress={false}
scrollEnabled={true}
zoomEnabled={true}
pitchEnabled={true}
rotateEnabled={true}

  onPanDrag={()=>{
  if(navegando){
    console.log("MAPA MOVIDO USUARIO");
   setMapMovido(true);
mapMovidoRef.current = true;

  }
}}

  onPress={()=>{

 // se não navegando → deixa mapa normal
 if(!navegando) return;

 const agora = Date.now();
 const diff = agora - ultimoToque.current;
 ultimoToque.current = agora;

 // =========================
 // 🚀 TOQUE DUPLO REAL
 // =========================
 if(toqueDuploAtivo && diff < 260){

   console.log("TOQUE DUPLO REAL");

   if(timeoutToque.current){
     clearTimeout(timeoutToque.current);
   }

   setMenuReportVisivel(true);
   return;
 }

 // =========================
 // TOQUE SIMPLES
 // =========================
 if(timeoutToque.current){
   clearTimeout(timeoutToque.current);
 }

 timeoutToque.current = setTimeout(()=>{

   setBarraVisivel(true);

   if(!assinaturaAtiva){
     setMostrarBotaoPro(true);

     if(barraTimer.current){
       clearTimeout(barraTimer.current);
     }

     barraTimer.current = setTimeout(()=>{
       setMostrarBotaoPro(false);
     },4000);
   }

   if(barraTimer.current){
     clearTimeout(barraTimer.current);
   }

   barraTimer.current = setTimeout(()=>{
     setBarraVisivel(false);
   },4000);

 },280);

}}

onTouchStart={()=>{
  mostrarBotao();
  if(!navegando) return;

  console.log("MAPA MOVIDO USUARIO");
  setMapMovido(true);
mapMovidoRef.current = true;


  setBarraVisivel(true);

  if(barraTimer.current){
    clearTimeout(barraTimer.current);
  }

  barraTimer.current = setTimeout(()=>{
    setBarraVisivel(false);
  },3000);
}}

    initialRegion={{
    latitude: carroPos?.latitude || -23.5505,
    longitude: carroPos?.longitude || -46.6333,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  }}
>


      {/* ROTA */}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeWidth={6}
          strokeColor="#007AFF"
        />
      )}

      {/* CARRO */}
      {carroPos &&  (
        <Marker
          coordinate={{
            latitude: carroPos.latitude,
            longitude: carroPos.longitude
          }}
          anchor={{x:0.5,y:0.5}}
          rotation={carroPos.heading || 0}
        >
      <Image
  source={{uri:"https://cdn-icons-png.flaticon.com/512/744/744465.png"}}
  style={{
    width:28,
    height:28,
    tintColor:"#007AFF"
  }}
/>


        </Marker>
      )}

          {/* rota alternativa cinza */}
      {altRouteCoords.length > 0 && (
        <Polyline
          coordinates={altRouteCoords}
          strokeWidth={5}
          strokeColor="#999"
        />
      )}

      {/* rota principal azul */}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeWidth={6}
          strokeColor="#007AFF"
        />
            )}

    </MapView>  
<TouchableOpacity
  onPress={()=>setMenuAberto(true)}
  style={{
    position:"absolute",
    top: insets.top + 8,
    left:18,
    backgroundColor:"rgba(0,0,0,0.55)",
    paddingVertical:10,
    paddingHorizontal:14,
    borderRadius:14,
    zIndex:9999,
    elevation:20
  }}
>
  <Text style={{color:"#fff", fontSize:20}}>☰</Text>
</TouchableOpacity>
 
   {/* =========================================
   🏠 PAINEL INICIAL FAVORITOS (WAZE STYLE)
   ========================================= */}
{!navegando && routeCoords.length === 0 && (

<View style={{
 position:"absolute",
 bottom:0,
 left:0,
 right:0,
 height:"43%",
 backgroundColor:"#f5f6fa",
 borderTopLeftRadius:25,
 borderTopRightRadius:25,
 padding:18,
 zIndex:9999
}}>

<Text style={{
 color:"#fff",
 fontSize:18,
 fontWeight:"bold",
 marginBottom:15
}}>
Para onde vamos?
</Text>

<TouchableOpacity

onPress={()=>{
  // se não tem casa salva → abrir cadastro
  if(!casaSalva?.lat){
    setEditorCasaVisivel(true);
    return;
  }
  // navegar normal
  setDestinoTxt(casaSalva.endereco);
buscarDestino();
}}
onLongPress={()=>{
  // só PRO pode editar
  if(!modoPro){
    setTelaProVisivel(true);
    return;
  }
  // abrir editor
  setEditorCasaVisivel(true);
}}

delayLongPress={400}

style={{
 backgroundColor:"#ffffff",
 padding:15,
 borderRadius:14,
 marginBottom:10
}}
>

<Text style={{color:"#111",fontSize:16}}>
🏠 {casaSalva?.nome || "Casa"}
</Text>

</TouchableOpacity>

{/* TRABALHO */}
<TouchableOpacity

onPress={()=>{

 if(!trabalhoSalvo?.lat){
   setEditorTrabalhoVisivel(true);
   return;
 }

 setDestinoTxt(trabalhoSalvo.endereco);
 setTimeout(()=>buscarDestino(),300);

}}

onLongPress={()=>{

 if(!modoPro){
   setTelaProVisivel(true);
   return;
 }

 setEditorTrabalhoVisivel(true);

}}

delayLongPress={400}

style={{
 backgroundColor:"#ffffff",
 padding:14,
 borderRadius:14,
 marginBottom:15
}}>
<Text style={{color:"#111",fontSize:16}}>
💼 {trabalhoSalvo?.nome || "Definir trabalho"}
</Text>
</TouchableOpacity>

{/* AMIGOS — PRO ONLY */}
{usuarioEhPro() && (
<TouchableOpacity
onPress={()=>{

 if(amigosLista.length === 0){
   setEditorAmigoVisivel(true);
   return;
 }

 setListaAmigosVisivel(true);

}}


style={{
 backgroundColor:"#ffffff",
 padding:14,
 borderRadius:14,
 marginBottom:15
}}>
<Text style={{color:"#111",fontSize:16}}>
👬 Amigos ({amigosLista.length})
</Text>
</TouchableOpacity>
)}

{/* FAVORITOS */}
<Text style={{color:"#aaa",marginBottom:6}}>Favoritos</Text>

{favoritos.length===0 && (
<Text style={{color:"#666",marginBottom:12}}>
Nenhum favorito salvo ainda
</Text>
)}

{favoritos.slice(0,3).map((f,i)=>(
<TouchableOpacity key={i}
style={{
 padding:10,
 backgroundColor:"#ffffff",
 borderRadius:10,
 marginBottom:6
}}>
<Text style={{color:"#111"}}>
⭐ {f.nome}
</Text>
</TouchableOpacity>
))}

{/* RECENTES */}
<Text style={{color:"#aaa",marginTop:10,marginBottom:6}}>
Recentes
</Text>

{recentes.length===0 && (
<Text style={{color:"#666"}}>
Nenhum recente ainda
</Text>
)}

</View>
)}

{modalEnderecoCasa && (

<View style={{
 position:"absolute",
 top:0,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.92)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:99999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 maxHeight:"85%",
 borderRadius:20,
 padding:20
}}>

{/* =========================
🧠 ESCOLHER NOME
========================= */}
{!apelidoCasaTemp && (
<>
<Text style={{
 color:"#fff",
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Escolha o nome da casa
</Text>

<View style={{maxHeight:300}}>

{[
"Voltar pro cativeiro",
"Base operacional",
"Casa (infelizmente)",
"Lar questionável",
"Depósito humano",
"Ponto de vergonha",
"Retorno inevitável",
"Centro de fracasso",
"QG do caos",
"Residência duvidosa"
].map((n,i)=>(

<TouchableOpacity key={i}
onPress={()=>setApelidoCasaTemp(n)}
style={{
 backgroundColor:"#1c1c1c",
 padding:15,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{color:"#fff",fontSize:16}}>
🏠 {n}
</Text>
</TouchableOpacity>

))}

</View>
</>
)}

{/* =========================
✏️ EDITAR ENDEREÇO
========================= */}
{!!apelidoCasaTemp && (
<>
<Text style={{
 color:"#00ff88",
 fontSize:18,
 fontWeight:"bold",
 marginBottom:10,
 textAlign:"center"
}}>
{apelidoCasaTemp}
</Text>

{/* RUA */}
<TextInput
placeholder="Rua"
value={rua}
onChangeText={setRua}
placeholderTextColor="#777"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>

{/* NUMERO */}
<TextInput
placeholder="Número"
value={numero}
onChangeText={setNumero}
keyboardType="numeric"
placeholderTextColor="#777"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>

{/* BAIRRO */}
<TextInput
placeholder="Bairro"
value={bairro}
onChangeText={setBairro}
placeholderTextColor="#777"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>
{/* CIDADE */}
<TextInput
placeholder="Cidade"
value={cidade}
onChangeText={setCidade}
placeholderTextColor="#777"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:15
}}
/>
<TouchableOpacity
onPress={async()=>{
 if(!rua.trim()) return;


 try{

  const resp = await fetch(
   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(inputEnderecoCasa)}&key=${GOOGLE_KEY}`
  );

  const data = await resp.json();

  if(!data.results?.length){
   alert("Endereço não encontrado");
   return;
  }

  const loc = data.results[0].geometry.location;

  const novaCasa = {
    apelido: apelidoCasaTemp,
  endereco: `${rua}, ${numero} - ${bairro}, ${cidade}, Brasil`,
    lat: loc.lat,
    lng: loc.lng
  };

  await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
  setCasaSalva(novaCasa);

  setModalEnderecoCasa(false);
  setApelidoCasaTemp("");
  setInputEnderecoCasa("");

 }catch(e){
  alert("Erro ao salvar");
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:18,
 borderRadius:16
}}>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center",
 fontSize:16
}}>
SALVAR CASA
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>{
 setApelidoCasaTemp("");
 setModalEnderecoCasa(false);
}}
style={{marginTop:15}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</>
)}

</View>
</View>
)}

{editorCasaVisivel && (
<View style={{
 position:"absolute",
 top:-40,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.95)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"88%",
 borderRadius:20,
 padding:20
}}>

<Text style={{
 color:"#fff",
 fontSize:18,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Editar casa
</Text>


<TextInput
placeholder="Rua"
placeholderTextColor="#777"
value={rua}
onChangeText={setRua}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>

<TextInput
placeholder="Número"
placeholderTextColor="#777"
value={numero}
onChangeText={setNumero}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>

<TextInput
placeholder="Bairro"
placeholderTextColor="#777"
value={bairro}
onChangeText={setBairro}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:10
}}
/>

<TextInput
placeholder="Cidade"
placeholderTextColor="#777"
value={cidade}
onChangeText={setCidade}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:15
}}
/>

<TouchableOpacity
onPress={async ()=>{

 if(!rua || !numero || !cidade){
   alert("Preencha o endereço");
   return;
 }

 const enderecoFinal = `${rua}, ${numero}, ${bairro}, ${cidade}, Brasil`;


 try{

  const resp = await fetch(
   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoFinal)}&key=${GOOGLE_KEY}`
  );

  const data = await resp.json();

  if(!data.results?.length){
    alert("Endereço não encontrado");
    return;
  }

  const loc = data.results[0].geometry.location;

  const novaCasa = {
    apelido: nomeCasaEscolhido || "Casa",

    endereco: enderecoFinal,
    lat: loc.lat,
    lng: loc.lng
  };

  await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
  setCasaSalva(novaCasa);

  setEditorCasaVisivel(false);
  alert("Casa salva");

 }catch(e){
   alert("Erro ao salvar");
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:15,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{color:"#fff",fontWeight:"bold",textAlign:"center"}}>
SALVAR CASA
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setEditorCasaVisivel(false)}
style={{padding:10}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
🏠 EDITOR CASA DEFINITIVO
========================================= */}
{editorCasaVisivel && (
<View style={{
 position:"absolute",
 top:-80,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.96)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 borderRadius:22,
 padding:20,
 maxHeight:"85%"
}}>

<Text style={{
 color:"#fff",
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Escolha o nome da base
</Text>

{/* LISTA NOMES ZOEIRA */}
{!nomeCasaEscolhido && (

<View style={{maxHeight:260, marginBottom:15}}>
<ScrollView showsVerticalScrollIndicator={true}>


{(modoPro ? NOMES_CASA_ZOEIRA : NOMES_CASA_ZOEIRA.slice(0,3)).map((n,i)=>(
<TouchableOpacity
key={i}
onPress={()=>setNomeCasaEscolhido(n)}
style={{
 backgroundColor: nomeCasaEscolhido===n ? "#00c853" : "#1c1c1c",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}>
<Text style={{color:"#fff",fontSize:16}}>
🏠 {n}
</Text>
</TouchableOpacity>
))}
</ScrollView>

</View>
)}

{/* MOSTRA ENDEREÇO SÓ APÓS ESCOLHER NOME */}
{!!nomeCasaEscolhido && (
<>

<Text style={{
 color:"#00ff88",
 fontWeight:"bold",
 marginBottom:8,
 textAlign:"center"
}}>
{nomeCasaEscolhido}
</Text>

<TextInput
placeholder="Rua"
placeholderTextColor="#777"
value={rua}
onChangeText={setRua}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Número"
placeholderTextColor="#777"
value={numero}
onChangeText={setNumero}
keyboardType="numeric"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Bairro"
placeholderTextColor="#777"
value={bairro}
onChangeText={setBairro}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Cidade"
placeholderTextColor="#777"
value={cidade}
onChangeText={setCidade}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:15
}}
/>

{/* SALVAR */}
<TouchableOpacity
onPress={async()=>{

 if(!rua || !cidade){
   alert("Preencha o endereço");
   return;
 }

 const enderecoFinal =
 `${rua}, ${numero} - ${bairro}, ${cidade}, Brasil`;

 try{

 const resp = await fetch(
 `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoFinal)}&key=${GOOGLE_KEY}`
 );

 const data = await resp.json();

 if(!data.results?.length){
   alert("Endereço não encontrado");
   return;
 }

 const loc = data.results[0].geometry.location;

 const novaCasa = {
   nome: nomeCasaEscolhido,
   endereco: enderecoFinal,
   lat: loc.lat,
   lng: loc.lng
 };

 await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
 setCasaSalva(novaCasa);

 setEditorCasaVisivel(false);

 setNomeCasaEscolhido("");
 setRua("");
 setNumero("");
 setBairro("");
 setCidade("");

 falar("Base definida");

 }catch(e){
   alert("Erro ao salvar");
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:16,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center",
 fontSize:16
}}>
SALVAR BASE
</Text>
</TouchableOpacity>

</>
)}

<TouchableOpacity
onPress={()=>{
 setEditorCasaVisivel(false);
 setNomeCasaEscolhido("");
}}
style={{padding:10}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
👬 EDITOR AMIGO PROFISSIONAL
========================================= */}
{editorAmigoVisivel && (
<View style={{
 position:"absolute",
 top:-80,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.96)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 borderRadius:22,
 padding:20,
 maxHeight:"85%"
}}>

<Text style={{
 color:"#fff",
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Escolha o nome do amigo
</Text>

{!nomeAmigoEscolhido && (

<View style={{maxHeight:260, marginBottom:15}}>
<ScrollView showsVerticalScrollIndicator={true}>


{(modoPro ? NOMES_AMIGO_ZOEIRA : NOMES_AMIGO_ZOEIRA.slice(0,3)).map((n,i)=>(

<TouchableOpacity
key={i}
onPress={()=>setNomeAmigoEscolhido(n)}
style={{
 backgroundColor:"#1c1c1c",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}>
<Text style={{color:"#fff",fontSize:16}}>
👬 {n}
</Text>
</TouchableOpacity>

))}

</ScrollView>

</View>

)}

{!!nomeAmigoEscolhido && (
<>

<Text style={{
 color:"#00ff88",
 fontWeight:"bold",
 marginBottom:8,
 textAlign:"center"
}}>
{nomeAmigoEscolhido}
</Text>

<TextInput
placeholder="Rua"
placeholderTextColor="#777"
value={rua}
onChangeText={setRua}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Número"
placeholderTextColor="#777"
value={numero}
onChangeText={setNumero}
keyboardType="numeric"
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Bairro"
placeholderTextColor="#777"
value={bairro}
onChangeText={setBairro}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Cidade"
placeholderTextColor="#777"
value={cidade}
onChangeText={setCidade}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:15
}}
/>

<TouchableOpacity
onPress={async()=>{

 if(!rua || !cidade){
   alert("Preencha o endereço");
   return;
 }

 const enderecoFinal =
 `${rua}, ${numero} - ${bairro}, ${cidade}, Brasil`;

 try{

 const resp = await fetch(
 `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoFinal)}&key=${GOOGLE_KEY}`
 );

 const data = await resp.json();

 if(!data.results?.length){
   alert("Endereço não encontrado");
   return;
 }

 const loc = data.results[0].geometry.location;

 const novoAmigo = {
   nome: nomeAmigoEscolhido,
   endereco: enderecoFinal,
   lat: loc.lat,
   lng: loc.lng
 };

 salvarAmigo(novoAmigo);

 }catch(e){
   alert("Erro ao salvar amigo");
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:16,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center",
 fontSize:16
}}>
SALVAR AMIGO
</Text>
</TouchableOpacity>

</>
)}

<TouchableOpacity
onPress={()=>{
 setEditorAmigoVisivel(false);
 setNomeAmigoEscolhido("");
}}
style={{padding:10}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
💼 EDITOR TRABALHO
========================================= */}
{editorTrabalhoVisivel && (
<View style={{
 position:"absolute",
 top:-80,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.96)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 borderRadius:22,
 padding:20,
 maxHeight:"85%"
}}>

<Text style={{
 color:"#fff",
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Nome do trabalho
</Text>

{!nomeTrabalhoEscolhido && (

<ScrollView style={{maxHeight:260}}>

{[
"Fábrica de boletos",
"Cativeiro remunerado",
"Centro de estresse",
"Exploração diária",
"Fonte de depressão",
"Escravidão moderna",
"Lugar que paga mal",
"Rotina sem sentido",
"Campo de sofrimento",
"Base do capitalismo"
].map((n,i)=>(

<TouchableOpacity
key={i}
onPress={()=>setNomeTrabalhoEscolhido(n)}
style={{
 backgroundColor:"#1c1c1c",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}>
<Text style={{color:"#fff",fontSize:16}}>
💼 {n}
</Text>
</TouchableOpacity>

))}

</ScrollView>
)}

{!!nomeTrabalhoEscolhido && (
<>

<Text style={{
 color:"#00ff88",
 fontWeight:"bold",
 marginBottom:8,
 textAlign:"center"
}}>
{nomeTrabalhoEscolhido}
</Text>

<TextInput
placeholder="Rua"
placeholderTextColor="#777"
value={rua}
onChangeText={setRua}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Número"
placeholderTextColor="#777"
value={numero}
onChangeText={setNumero}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Bairro"
placeholderTextColor="#777"
value={bairro}
onChangeText={setBairro}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
/>

<TextInput
placeholder="Cidade"
placeholderTextColor="#777"
value={cidade}
onChangeText={setCidade}
style={{
 backgroundColor:"#1c1c1c",
 color:"#fff",
 padding:14,
 borderRadius:12,
 marginBottom:15
}}
/>

<TouchableOpacity
onPress={async()=>{

 if(!rua || !cidade){
   alert("Preencha o endereço");
   return;
 }

 const enderecoFinal =
 `${rua}, ${numero} - ${bairro}, ${cidade}, Brasil`;

 try{

 const resp = await fetch(
 `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoFinal)}&key=${GOOGLE_KEY}`
 );

 const data = await resp.json();

 if(!data.results?.length){
   alert("Endereço não encontrado");
   return;
 }

 const loc = data.results[0].geometry.location;

 const novoTrab = {
   nome: nomeTrabalhoEscolhido,
   endereco: enderecoFinal,
   lat: loc.lat,
   lng: loc.lng
 };

 await AsyncStorage.setItem("trabalho_salvo", JSON.stringify(novoTrab));
 setTrabalhoSalvo(novoTrab);

 setEditorTrabalhoVisivel(false);
 setNomeTrabalhoEscolhido("");

 falar("Destino de sofrimento salvo");

 }catch(e){
   alert("Erro ao salvar trabalho");
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:16,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center",
 fontSize:16
}}>
SALVAR TRABALHO
</Text>
</TouchableOpacity>

</>
)}

<TouchableOpacity
onPress={()=>{
 setEditorTrabalhoVisivel(false);
 setNomeTrabalhoEscolhido("");
}}
style={{padding:10}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}

{/* =========================================
👬 LISTA DE AMIGOS SALVOS
========================================= */}
{listaAmigosVisivel && (
<View style={{
 position:"absolute",
 top:-60,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.96)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 borderRadius:22,
 padding:20,
 maxHeight:"85%"
}}>

<Text style={{
 color:"#fff",
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
Seus contatos duvidosos
</Text>

<ScrollView style={{maxHeight:350}}>

{amigosLista.map((amg,i)=>(
<TouchableOpacity
key={i}

onPress={()=>{

  setListaAmigosVisivel(false);

  // define destino
  setDestinoTxt(amg.endereco);

  // abre painel instantâneo
  setPainelVisivel(true);
  setRotaCarregando(true);

  // deixa UI respirar 1 frame
  requestAnimationFrame(()=>{
    buscarDestino();
  });

}}


onLongPress={()=>{

 setListaAmigosVisivel(false);

 setNomeAmigoEscolhido(amg.nome);
 setRua("");
 setNumero("");
 setBairro("");
 setCidade("");

 setAmigoEditandoIndex(i);
 setEditorAmigoVisivel(true);
}}

style={{
 backgroundColor:"#1c1c1c",
 padding:16,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{color:"#fff",fontSize:16}}>
👬 {amg.nome}
</Text>

<Text style={{color:"#777",fontSize:12, marginTop:3}}>
{amg.endereco}
</Text>

</TouchableOpacity>
))}

</ScrollView>

{/* ADICIONAR NOVO */}
<TouchableOpacity
onPress={()=>{
 setListaAmigosVisivel(false);
 setEditorAmigoVisivel(true);
}}
style={{
 backgroundColor:"#00c853",
 padding:16,
 borderRadius:14,
 marginTop:10
}}>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center"
}}>
+ Adicionar novo amigo
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setListaAmigosVisivel(false)}
style={{marginTop:12}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
Fechar
</Text>
</TouchableOpacity>

</View>
</View>
)}

     {/* BOTÃO RECENTRALIZAR */}
{mapMovido && navegando && (

  <TouchableOpacity
    style={{
   position:"absolute",
   bottom:220,
   right:20,
   backgroundColor:"#007AFF",
   paddingVertical:14,
   paddingHorizontal:22,
   borderRadius:30,

   zIndex:9999,
   elevation:999,
}}



   onPress={()=>{

  // some botão
  setMapMovido(false);
  mapMovidoRef.current = false;

  // volta câmera pro carro
  if(carroPos){
    mapRef.current?.animateCamera({
      center:{
        latitude: carroPos.latitude,
        longitude: carroPos.longitude
      },
      pitch:60,
      heading: carroPos.heading || 0,
      zoom:18
    });
  }

}}

  >
    <Text style={{
      color:"#fff",
      fontWeight:"bold",
      fontSize:13
    }}>
      RECENTRAR ANTES QUE PIORE
    </Text>
  </TouchableOpacity>
)}
{/* =========================================
🚨 BOTÃO REPORT VOZ AUTOMÁTICO
========================================= */}
{navegando && (
<Animated.View
style={{
 position:"absolute",
 left: renderPos.x,
 top: renderPos.y,
 zIndex:9999,
 opacity: opacidadeBotao
}}
>

<TouchableOpacity
{...panResponder.panHandlers}
activeOpacity={0.8}

onPress={()=>{

  if(!carroPos){
    console.log("GPS ainda não disponível");
    return;
  }

  console.log("🚨 REPORT RÁPIDO");

  const dados = {
    latitude: carroPos.latitude,
    longitude: carroPos.longitude,
    data: new Date().toISOString()
  };

  setCoordsReportTemp(dados);

  // abre menu discreto
  setMenuReportRapido(true);

  // vibração leve
  Vibration.vibrate(60);
}}
style={{
   width:60,
   height:60,
   backgroundColor:"rgba(255,0,51,0.35)",
   borderRadius:30,
   justifyContent:"center",
   alignItems:"center",

   borderWidth:1.5,
   borderColor:"rgba(255,255,255,0.25)",

   elevation:10,
   shadowColor:"#ff0033",
   shadowOpacity:0.4,
   shadowRadius:6,
}}
>
<Text style={{fontSize:26}}>
🚨
</Text>
</TouchableOpacity>

</Animated.View>
)}
{/* 🚨 MENU REPORT RÁPIDO WAZE */}
{menuReportRapido && (

<View style={{
 position:"absolute",
 bottom:160,
 left:20,
 right:20,
 backgroundColor:"#111",
 borderRadius:18,
 padding:14,
 zIndex:9999,
 elevation:30,
 borderWidth:2,
 borderColor:"#ff0033"
}}>

<Text style={{
 color:"#fff",
 fontWeight:"bold",
 marginBottom:10,
 textAlign:"center"
}}>
Reportar no trajeto
</Text>

{[
 "🚧 Objeto na pista",
 "🚓 Polícia",
 "📷 Radar",
 "🚦 Trânsito",
 "❌ Cancelar"
].map((t,i)=>(

<TouchableOpacity
key={i}
onPress={()=>{

 if(t==="❌ Cancelar"){
   setMenuReportRapido(false);
   return;
 }

 salvarReportLocal({
   tipo:t,
   ...coordsReportTemp
 });

 setMenuReportRapido(false);

 falar("Reportado");

}}
style={{
 backgroundColor:"#222",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}>
<Text style={{color:"#fff"}}>
{t}
</Text>
</TouchableOpacity>

))}

</View>
)}
{/* BOTÃO VIRAR PRO (APENAS FREE) */}
{!assinaturaAtiva && (!navegando || mostrarBotaoPro) && (
<TouchableOpacity
 style={{
   position:"absolute",
   top:70,
   left:20,
   backgroundColor:"#ff0033",
   paddingVertical:10,
   paddingHorizontal:16,
   borderRadius:14,
   elevation:20,
   zIndex:999
 }}
 onPress={()=>setTelaProVisivel(true)}
>
 <Text style={{color:"#fff",fontWeight:"bold"}}>
   VIRAR PRO
 </Text>
</TouchableOpacity>
)}

    {/* BUSCA (some após rota) */}
    {routeCoords.length === 0 && (
      <View style={styles.buscaBox}>
        <View style={{
 flexDirection:"row",
 alignItems:"center",
 backgroundColor:"#f2f3f7",
 borderRadius:16,
 paddingHorizontal:12,
 height:50
}}>

<TextInput
 placeholder="Para onde vamos?"
 value={destinoTxt}
 onChangeText={buscarSugestoes}
 placeholderTextColor="#666"
 style={{
   flex:1,
   fontSize:16,
   color:"#111"
 }}
/>

<TouchableOpacity
 onPress={buscarDestino}
 style={{
   width:42,
   height:42,
   borderRadius:12,
   backgroundColor:"#007AFF",
   justifyContent:"center",
   alignItems:"center"
 }}
>
 <Text style={{color:"#fff",fontSize:18}}>🔍</Text>
</TouchableOpacity>

</View>
{sugestoes.map((item:any, i:number)=>(
  <TouchableOpacity
    key={i}
    style={{
      padding:10,
      borderBottomWidth:1,
      borderColor:"#eee"
    }}
    onPress={()=>{
      setDestinoTxt(item.description);
      setSugestoes([]);
    }}
  >
    <Text>{item.description}</Text>
  </TouchableOpacity>
))}

        
      </View>
    )}

   
{/* VELOCÍMETRO */}
{navegando && (
  <View style={{
    position:"absolute",
    bottom:110,
    left:20,
    backgroundColor:"rgba(0,0,0,0.75)",
    paddingVertical:5,
    paddingHorizontal:6,

    borderRadius:20,
    alignItems:"center"
  }}>
    <Text style={{color:"#fff",fontSize:18,fontWeight:"bold"}}>
      {velocidade}
    </Text>
    <Text style={{color:"#aaa",fontSize:10}}>km/h</Text>
  </View>
)}
{/* BOTÃO PRO TESTE (REMOVER ANTES DA PLAY STORE) */}
{!modoPro && (
<TouchableOpacity
  style={{
    position:"absolute",
    top:120,
    right:20,
    backgroundColor:"#ff0033",
    paddingVertical:10,
    paddingHorizontal:14,
    borderRadius:12,
    zIndex:999
  }}
  onPress={async ()=>{
    setMapMovido(false);
    mapMovidoRef.current = false;

    setModoPro(true);
    setAssinaturaAtiva(true);

    await AsyncStorage.setItem("pro_ativo","sim");

    alert("PRO ATIVADO PERMANENTE");
  }}
>
  <Text style={{color:"#fff",fontWeight:"bold"}}>
    ATIVAR PRO
  </Text>
</TouchableOpacity>
)}

{/* BOTÃO MODO INSANO */}
{usuarioEhPro() && !modoInsano && (
<TouchableOpacity
 style={{
   position:"absolute",
   top:180,
   right:20,
   backgroundColor: modoInsano ? "#00c853" : "#444",
   paddingVertical:10,
   paddingHorizontal:16,
   borderRadius:14,
   zIndex:999
 }}
onPress={()=>{

 if(!modoInsano){

   // se estiver no nível 4, força para 3
   if(nivelBloqueado === 4){
     setNivelBloqueado(3);
   }

   setModoInsano(true);
   falar("Modo insano ativado");

 }else{

   setModoInsano(false);
   falar("Modo insano desativado");
 }

}}

>
 <Text style={{color:"#fff",fontWeight:"bold"}}>
 🕶 INSANO
 </Text>
</TouchableOpacity>
)}


{/* 🔥 BARRA DE NÍVEL INSANO */}
{barraVisivel && navegando && (

  <View style={{
    position:"absolute",
    bottom:170,
    left:20,
    right:20,
    backgroundColor:"#111",
    padding:8,
    borderRadius:14,

    borderWidth:2,
    borderColor:"#ff0033",
    elevation:20
  }}>

    <Text style={{
      color:"#fff",
      fontWeight:"bold",
      marginBottom:10,
      textAlign:"center",
      fontSize:15
    }}>
      NÍVEL DE PACIÊNCIA
    </Text>

  <View style={{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  height:38
}}>

{[0,1,2,3,4].map(n=>{
const limiteConta = (assinaturaAtiva || modoPro) ? 4 : 1;
const limiteUsuario = nivelBloqueado;

// limite real final
const limiteFinal = Math.min(limiteConta, limiteUsuario);

const bloqueado = n > limiteFinal;

const cores = [
"#00E676",
"#AEEA00",
"#FFD600",
"#FF6D00",
"#FF0033"
];

const emojis = [
"🙂",
"😐",
"😏",
"😡",
"🤬"
];

return(
<TouchableOpacity
key={n}
disabled={false}
onPress={()=>{

 // se está no modo insano e tenta ativar nível 4
 if(modoInsano && n === 4){

 Alert.alert(
  "Linguagem explícita",
  "O nível 4 contém palavrões e conteúdo adulto.\n\nDeseja realmente ativar?",
  [
    {
      text: "Não",
      style: "cancel"
    },
    {
      text: "Sim",
      onPress: () => {
        setNivelBloqueado(4);
      }
    }
  ]
 );

 return;
}


 if(bloqueado){
   setTelaProVisivel(true);
   return;
 }

 setNivelBloqueado(n);

}}


style={{
flex:1,
marginHorizontal:3,
paddingVertical:2,
borderRadius:8,
backgroundColor: bloqueado ? "#555" : cores[n],
opacity: bloqueado ? 0.25 : 1,
alignItems:"center"
}}
>
<Text style={{fontSize:18}}>
{emojis[n]}
</Text>

<Text style={{
color:"#fff",
fontWeight:"bold",
fontSize:8
}}>
{n}
</Text>

</TouchableOpacity>
);
})}

    </View>

    {!modoPro && (
      <Text style={{
        color:"#aaa",
        fontSize:11,
        textAlign:"center",
        marginTop:8
      }}>
        Versão gratuita limitada ao nível 1
      </Text>
    )}

  </View>
)}
{/* 💰 TELA PRO */}
{telaProVisivel && (
<View style={{
 position:"absolute",
 top:0,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"#000",
 justifyContent:"center",
 padding:25,
 zIndex:9999
}}>

<Text style={{
 color:"#fff",
 fontSize:28,
 fontWeight:"bold",
 textAlign:"center",
 marginBottom:20
}}>
INSANE GPS PRO
</Text>

<Text style={{
 color:"#ff0033",
 fontSize:18,
 textAlign:"center",
 marginBottom:25
}}>
Navegação sem paciência. Sem limites. Sem perdão.

</Text>

{BENEFICIOS_PRO.map((b,i)=>(
<Text key={i} style={{
 color:"#ccc",
 fontSize:16,
 marginBottom:8,
 textAlign:"center"
}}>
• {b}
</Text>
))}

<TouchableOpacity
style={{
 backgroundColor:"#ff0033",
 padding:16,
 borderRadius:14,
 marginTop:30
}}
onPress={()=>{
 alert("Assinatura Play Store em breve");
}}
>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 fontSize:18,
 textAlign:"center"
}}>
ASSINAR PRO • R$49,90/ano
</Text>
</TouchableOpacity>

<TouchableOpacity
style={{
 marginTop:20,
 alignItems:"center"
}}
onPress={()=>setTelaProVisivel(false)}
>
<Text style={{color:"#aaa"}}>
Agora não
</Text>
</TouchableOpacity>

</View>
)}
{/* 🚨 MENU REPORT WAZE STYLE */}
{menuReportVisivel && (

<View style={{
 position:"absolute",
 bottom:140,
 left:20,
 right:20,
 backgroundColor:"#111",
 borderRadius:18,
 padding:18,
 zIndex:9999,
 elevation:30,
 borderWidth:2,
 borderColor:"#00E5FF"
}}>

<Text style={{
 color:"#fff",
 fontSize:16,
 fontWeight:"bold",
 marginBottom:12,
 textAlign:"center"
}}>
Reportar no trajeto
</Text>

{[
 "🚧 Objeto na pista",
 "🚓 Polícia",
 "📷 Radar",
 "🚦 Trânsito",
 "❌ Cancelar"
].map((t,i)=>(

<TouchableOpacity
key={i}
onPress={()=>{

 if(t==="❌ Cancelar"){
   setMenuReportVisivel(false);
   return;
 }

 salvarReportLocal(t);
 setMenuReportVisivel(false);
 falar("Reportado");

}}
style={{
 backgroundColor:"#222",
 padding:14,
 borderRadius:12,
 marginBottom:8
}}
>
<Text style={{color:"#fff",fontSize:15}}>
{t}
</Text>
</TouchableOpacity>

))}

</View>
)}

<BottomSheet
  ref={sheetRef}
index={-1}
  snapPoints={snapPoints}
  enablePanDownToClose={false}
  backgroundStyle={{ backgroundColor:"#fff" }}
  handleIndicatorStyle={{ backgroundColor:"#999" }}
>

<BottomSheetScrollView contentContainerStyle={{ padding:20 }}>

{routeCoords.length > 0 && !navegando && (
<View>

<Text style={{
 fontSize:20,
 fontWeight:"bold",
 textAlign:"center",
 marginBottom:18
}}>
Escolha como quer se arrepender
<View style={{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center",
 marginBottom:15
}}>

<Text style={{
 color:"#fff",
 fontSize:16,
 fontWeight:"bold"
}}>
Pronto pra se arrepender?
</Text>

<TouchableOpacity
style={{
 backgroundColor:"#007AFF",
 paddingVertical:10,
 paddingHorizontal:18,
 borderRadius:12
}}
onPress={async ()=>{

 setNavegando(true);
 sheetRef.current?.close();
if (mapRef.current) {
  mapRef.current.animateToRegion({
  latitude: destinoLat || 0,
  longitude: destinoLng || 0,

    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
}

 const loc = await Location.getCurrentPositionAsync({});
 setCarroPos(loc.coords);

 mapRef.current?.animateCamera({
  center:{
   latitude: loc.coords.latitude,
   longitude: loc.coords.longitude
  },
  pitch:60,
  heading: loc.coords.heading || 0,
  zoom:18
 });

}}
>

<Text style={{
 color:"#fff",
 fontWeight:"bold",
 fontSize:14
}}>
INICIAR
</Text>

</TouchableOpacity>

</View>

</Text>

{[
 {icon:"🚗", mult:1, tipo:"carro", frase: frasesLateral?.carro},
 {icon:"🏍", mult:0.8, tipo:"moto", frase: frasesLateral?.moto},
 {icon:"🚲", mult:2.5, tipo:"bike", frase: frasesLateral?.bike},
 {icon:"🚶", mult:8, tipo:"pe", frase: frasesLateral?.pe},
 {icon:"🚌", mult:1.5, tipo:"bus", frase: frasesLateral?.bus}
].map((item,i)=>(
<TouchableOpacity
key={i}
onPress={()=>setModoTransporte(item.tipo)}
style={{
 flexDirection:"row",
 alignItems:"center",
 backgroundColor: modoTransporte===item.tipo ? "#007AFF22" : "#f2f2f2",
 padding:16,
 borderRadius:18,
 marginBottom:12
}}>

<Text style={{fontSize:26, marginRight:14}}>
{item.icon}
</Text>

<View style={{flex:1}}>

<Text style={{
 fontSize:17,
 fontWeight:"600",
 color:"#222"
}}>
{item.frase}
</Text>

{tempo && (
<Text style={{
 fontSize:13,
 color:"#666",
 marginTop:3
}}>
⏱ {Math.round(tempo * item.mult)} min
</Text>
)}

</View>
</TouchableOpacity>
))}


</View>
)}
</BottomSheetScrollView>
</BottomSheet>

</View>

{/* ===== MENU FULLSCREEN ===== */}
{menuAberto && (
  <View
    style={{
      position:"absolute",
      top:0,
      left:0,
      right:0,
      bottom:0,
      backgroundColor:"#111",
      zIndex:99999,
      paddingTop:80,
      paddingHorizontal:20
    }}
  >

   <TouchableOpacity
  onPress={()=>setMenuAberto(true)}
  style={{
    marginLeft:10,
    backgroundColor:"rgba(0,0,0,0.25)",
    padding:10,
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center"
  }}
>
  <Text style={{
    color:"#111",
    fontSize:22,
    fontWeight:"bold"
  }}>
    ≡
  </Text>
</TouchableOpacity>

    <Text style={{
      color:"#fff",
      fontSize:22,
      marginBottom:25,
      fontWeight:"bold"
    }}>
      Configurações
    </Text>

       <TouchableOpacity
      
    >
      <Text style={{color:"#fff"}}>🇧🇷 Português</Text>
    </TouchableOpacity>

    <TouchableOpacity      
    >
      <Text style={{color:"#fff"}}>🇺🇸 English</Text>
    </TouchableOpacity>

  </View>
)}
<SettingsPanel
  visivel={menuAberto}
  fechar={()=>setMenuAberto(false)}
  trocarIdioma={trocarIdiomaManual}

  modoInsano={modoInsano}
  setModoInsano={setModoInsano}

  modoPro={modoPro}

  somPolicia={somPolicia}
  setSomPolicia={setSomPolicia}

  somRadar={somRadar}
  setSomRadar={setSomRadar}

  textos={textos}
/>
{escutandoVoz && (
<View style={{
 position:"absolute",
 top:0,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.6)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>
<Animated.View style={{
 width:120,
 height:120,
 borderRadius:60,
 backgroundColor:"#ff0033",
 justifyContent:"center",
 alignItems:"center",
 transform:[{scale:animPulse}]
}}>
<Text style={{fontSize:40,color:"#fff"}}>🎤</Text>
</Animated.View>
</View>
)}
{/* ================= MODAL ALERTA MANUAL ================= */}
{modalAlerta && (
<View style={{
 position:"absolute",
 top:0,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.9)",
 justifyContent:"center",
 alignItems:"center",
 zIndex:999999
}}>

<View style={{
 backgroundColor:"#111",
 width:"90%",
 borderRadius:20,
 padding:20
}}>

<Text style={{
 color:"#fff",
 fontSize:18,
 fontWeight:"bold",
 marginBottom:15,
 textAlign:"center"
}}>
🚨 Descrever ocorrência
</Text>

<TextInput
 placeholder="O que está acontecendo?"
 placeholderTextColor="#888"
 multiline
 value={motivoAlerta}
 onChangeText={setMotivoAlerta}
 style={{
  backgroundColor:"#1c1c1c",
  color:"#fff",
  padding:15,
  borderRadius:14,
  height:120,
  textAlignVertical:"top"
 }}
/>

<TouchableOpacity
onPress={()=>{

 const alertaFinal = {
   ...coordsAlerta,
   motivo: motivoAlerta
 };

 console.log("🚨 ALERTA SALVO:", alertaFinal);

 setMotivoAlerta("");
 setModalAlerta(false);

}}
style={{
 backgroundColor:"#ff0033",
 padding:16,
 borderRadius:14,
 marginTop:15
}}
>
<Text style={{
 color:"#fff",
 fontWeight:"bold",
 textAlign:"center"
}}>
SALVAR ALERTA
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setModalAlerta(false)}
style={{marginTop:12}}
>
<Text style={{
 color:"#aaa",
 textAlign:"center"
}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* ================= FIM MODAL ================= */}


</BottomSheetModalProvider>
</GestureHandlerRootView>

);
}

const styles = StyleSheet.create({

buscaBox:{
  position:"absolute",
 top:120,
  left:20,
  right:20,
  backgroundColor:"#fff",
  padding:12,
  borderRadius:14,
  elevation:10
},

input:{
  height:40,
  fontSize:15
},

btnBuscar:{
  backgroundColor:"#007AFF",
  paddingVertical:8,
  borderRadius:10,
  alignItems:"center",
  marginTop:6,
  width:"40%",        // 🔥 menor
  alignSelf:"flex-end" // 🔥 direita
},
card:{
  position:"absolute",
  bottom:90,   // SUBIU da barra android
  left:20,
  right:20,
  backgroundColor:"#fff",
  padding:15,
  borderRadius:18,
  elevation:20
},


btnIniciar:{
  backgroundColor:"#007AFF",
  padding:12,
  borderRadius:10,
  alignItems:"center",
  marginTop:8,
  marginBottom:25   
},


});
