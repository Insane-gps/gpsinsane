import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { activateKeepAwakeAsync, deactivateKeepAwake, isAvailableAsync as keepAwakeDisponivelAsync } from "expo-keep-awake";
import * as Localization from "expo-localization";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, collectionGroup, doc, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadString } from "firebase/storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import type { AssinaturaUsuario, PlanoUsuario } from "../data/configPlanos";
import { auth, db, storage } from "../firebase";
import {
  addDocWithLog as addDoc,
  deleteDocWithLog as deleteDoc,
  getDocWithLog as getDoc,
  onSnapshotWithLog as onSnapshot,
  setDocWithLog as setDoc,
  setFirestoreDebugUid,
  updateDocWithLog as updateDoc,
} from "../utils/firestoreDebug";
import {
  ativarPlano,
  carregarAssinaturaLocal,
  DATA_FIM_PREMIUM_FREE,
  normalizarStatusAssinatura,
  obterFasePlanoAtual,
  obterPermissoesDoPlano,
  obterPrecosAtuaisNovosAssinantes,
  obterSimboloMoeda,
  usuarioEhFree as planoEhFree,
  usuarioEhPremium as planoEhPremium,
  usuarioEhPremiumFree as planoEhPremiumFree,
  usuarioEhPro as planoEhPro,
  premiumFreeDisponivel,
  salvarAssinaturaLocal
} from "../utils/planos";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import { LINHAS_COMICAS_PT_POR_NIVEL, type LinhaComica } from "../data/xingamentos";
import { limparTextoParaFala, materializarLinhaComica, obterNomeFalavelUsuario } from "../utils/falaComica";


import {
  Alert,
  Animated,
  AppState,
  BackHandler,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import { GestureHandlerRootView, } from 'react-native-gesture-handler';
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { LINHAS_CHEGADA_DESTINO_POR_IDIOMA, LINHAS_CHEGADA_DESTINO_PT_COM_NOME } from "../data/chegadaDestino";
import { COMENTARIOS_PIADA_COMICA_POR_IDIOMA, FALAS_TRADUCAO_POR_IDIOMA, IDIOMAS_DISPONIVEIS, PIADAS_COMICAS_CURTAS_POR_IDIOMA, TEXTOS, WRONG_LINES_POR_IDIOMA, type IdiomaId } from "../data/idiomas";
import { getNomesAmigoZoeira } from "../data/nomesAmigos";
import { getNomesCasaZoeira } from "../data/nomesCasa";
import { getNomesTrabalhoZoeira } from "../data/nomesTrabalho";
import { POI_LABELS } from "../data/poiLabels";
import { POI_LINES } from "../data/poiLines";
import { getVeiculoPorId } from "../data/veiculos";
import ChatModal from "./components/ChatModal";
import FaleConoscoSection from "./components/FaleConoscoSection";
import RouteViewModal from "./components/RouteViewModal";
import SettingsPanel from "./components/SettingsPanel";
import MensagensScreen from "./ofertas/MensagensScreen";
import OfertasScreen from "./ofertas/OfertasScreen";
import PerfilPainel from "./ofertas/PerfilPainel";
import ProcurarScreen from "./ofertas/ProcurarScreen";
import ViagensScreen from "./ofertas/ViagensScreen";
// ==========================================
// �x�� PERSONALIDADE GLOBAL
// ==========================================
const PERSONALIDADE_ATUAL = "psico"; // leve | psico
const MODO_REVISAO_XINGAMENTOS = false;
const TERMO_VERSAO_ATUAL = `xingamentos-${String(Constants.nativeAppVersion || "1")}-${String(Constants.nativeBuildVersion || "1")}`;

// ===============================
//  BENEFÍCIOS PRO
// ===============================
// BENEFICIOS_PRO removido — renderizado dinamicamente com i18n e preços de fase
// ===============================
// �xR" ESTILO MAPA NOTURNO PROFISSIONAL
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

  // RUAS PADRÒO
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
async function geocodeEndereco(endereco: string) {
  const geocodeQuery = String(endereco || "").trim();
  const url =
    "https://api.openrouteservice.org/geocode/search?text=" +
    encodeURIComponent(geocodeQuery);
  console.log("[GEOCODE_QUERY]", geocodeQuery);
  console.log("[GEOCODE_URL]", url);

  const response = await fetch(
    url,
    {
      headers: {
        Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0=",
      },
    }
  );

  const data = await response.json();
  const primeiroResultado = Array.isArray(data?.features) ? data.features[0] : null;
  console.log("[GEOCODE_RESULT]", primeiroResultado);

  if (!data.features || data.features.length === 0) {
    return null;
  }

  return {
    lat: data.features[0].geometry.coordinates[1],
    lng: data.features[0].geometry.coordinates[0],
  };
}


// =========================
// CALCULAR DIST�NCIA ENTRE DOIS PONTOS
// =========================
function calcularDistancia(
  lat1:number,
  lng1:number,
  lat2:number,
  lng2:number
){

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // km
}
function distanciaFormatada(
  lat1:number,
  lng1:number,
  lat2:number,
  lng2:number
){

  const km = calcularDistancia(lat1,lng1,lat2,lng2);

  if(km < 1){
    return Math.round(km*1000)+" m";
  }

  return km.toFixed(1)+" km";
}
type Oferta = {
  id:string;
  tipo:"entrega"|"carona_solicitada"|"carona_oferecida";
  bloqueadaNoFree?:boolean;
  criadorId:string;
  criadorNome:string;
  criadoEm:number;

  nomeOuDescricao:string;
  quantidadePessoas:number;

  origem:{
    lat:number;
    lng:number;
    endereco:string;
  };

  destino:{
    lat:number;
    lng:number;
    endereco:string;
  };

  valor:number;
  status:"ativa" | "aceita"
}
const VOICE_SERVER_URL_PADRAO = "https://insanegps.com/speak";
const VOICE_SERVER_URL_ANTIGO = "https://gpsinsane.onrender.com/speak";
const VOICE_SERVER_URL_ENV_RAW = String(
  (globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_SERVER_URL || ""
).trim();
const VOICE_SERVER_URL = (
  VOICE_SERVER_URL_ENV_RAW === VOICE_SERVER_URL_ANTIGO
    ? VOICE_SERVER_URL_PADRAO
    : (VOICE_SERVER_URL_ENV_RAW || VOICE_SERVER_URL_PADRAO)
).trim() || VOICE_SERVER_URL_PADRAO;

const RISADA_TOKEN_POR_AUDIO = {
  "__RISADA_FORTE__": require("../assets/audio/risadas/risada_forte.wav"),
  "__RISADA_LEVE__": require("../assets/audio/risadas/risada_leve.wav"),
  "__RISADA_MEDIA__": require("../assets/audio/risadas/risada_media.wav"),
  "__RISADA_SARCASTICA__": require("../assets/audio/risadas/risada_sarcastica.wav"),
} as const;

type RisadaToken = keyof typeof RISADA_TOKEN_POR_AUDIO;
const RISADA_TOKEN_REGEX = /^__RISADA_(FORTE|LEVE|MEDIA|SARCASTICA)__$/;

console.log("VOICE URL FINAL UNICA:", VOICE_SERVER_URL);

export default function Index() {
  const [veiculoGpsId, setVeiculoGpsId] = useState("silverado-preta");
  const [veiculoIconDataUri, setVeiculoIconDataUri] = useState("");
  const [raioNotificacaoKm, setRaioNotificacaoKm] = useState(10);
  const ofertasProximasNotificadasRef = useRef<Set<string>>(new Set());
  const ofertasSnapshotInicializadoRef = useRef(false);
  const coinSoundUriRef = useRef<string | null>(null);
  const falandoAgoraRef = useRef(false);
  const coinSoundPlayerRef = useRef<any>(null);
  const coinSoundSubscriptionRef = useRef<any>(null);
  const voicePlayerRef = useRef<any>(null);
  const voicePlayerSubscriptionRef = useRef<any>(null);
  const risadaUriCacheRef = useRef<Partial<Record<RisadaToken, string>>>({});
  const androidMapWebRef = useRef<WebView>(null);
  const [androidMapReady, setAndroidMapReady] = useState(false);
const sugestaoDestinoTimerRef = useRef<any>(null);
const ultimaBuscaDestinoRef = useRef("");
  function trocarVeiculoGps(id: string) {
    setVeiculoGpsId(id);
    AsyncStorage.setItem("veiculo_gps_id", id).catch(() => {});
  }
function buscarSugestoesDestinoDebounced(texto:string){
  setDestinoTxt(texto);
  setDestinoLat(null);
  setDestinoLng(null);

  if(sugestaoDestinoTimerRef.current){
    clearTimeout(sugestaoDestinoTimerRef.current);
  }

  const textoLimpo = String(texto || "").trim();

  if(textoLimpo.length < 3){
    setSugestoes([]);
    setSugestoesDestino([]);
    ultimaBuscaDestinoRef.current = "";
    return;
  }

  sugestaoDestinoTimerRef.current = setTimeout(async ()=>{
    if(textoLimpo === ultimaBuscaDestinoRef.current) return;
    ultimaBuscaDestinoRef.current = textoLimpo;
    await buscarSugestoesDestino(textoLimpo);
  }, 250);
}
  useEffect(() => {
    let ativo = true;
    const veiculo = getVeiculoPorId(veiculoGpsId);
    if (!veiculo) { setVeiculoIconDataUri(""); return; }
    (async () => {
      try {
        const asset = Asset.fromModule(veiculo.source);
        await asset.downloadAsync();
        const localUri = asset.localUri || asset.uri;
        if (localUri) {
          const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
          const mime = localUri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
          if (ativo) setVeiculoIconDataUri(`data:${mime};base64,${base64}`);
          return;
        }
        const resolved = Image.resolveAssetSource(veiculo.source);
        if (ativo) setVeiculoIconDataUri(String(resolved?.uri || ""));
      } catch {
        const resolved = Image.resolveAssetSource(veiculo.source);
        if (ativo) setVeiculoIconDataUri(String(resolved?.uri || ""));
      }
    })();
    return () => { ativo = false; };
  }, [veiculoGpsId]);

  function trocarRaioNotificacao(km:number){
    const valor = Number(km);
    if(!Number.isFinite(valor) || valor <= 0) return;
    setRaioNotificacaoKm(valor);
    AsyncStorage.setItem("raio_notificacao_km", String(valor)).catch((error)=>{
      console.log("Erro ao salvar raio de notificacao:", error);
    });
  }

  function formatarDistanciaAlerta(distanciaM:number){
    if(distanciaM < 1000) return `${Math.round(distanciaM)} m`;
    return `${(distanciaM / 1000).toFixed(1)} km`;
  }

  function normalizarTextoBusca(valor:any){
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

function normalizarTextoFalado(valor:any){
  return limparTextoParaFala(valor, idiomaAtual);
}

// ===============================
// 🎤 VARIAÇÃO DE FRASES
// ===============================
const ABERTURAS = [
  "",
  "Olha só...",
  "Sério...",
  "Presta atenção...",
  "De novo isso...",
  "Vamos lá...",
];

let ultimasFrasesMontadas: string[] = [];

function evitarRepeticao(lista: string[]) {
  const base = Array.isArray(lista)
    ? lista.map((item)=>String(item || "").trim()).filter(Boolean)
    : [];

  if(!base.length) return "";

  const filtradas = base.filter((f)=>!ultimasFrasesMontadas.includes(f));

  const escolhida = filtradas.length > 0
    ? filtradas[Math.floor(Math.random() * filtradas.length)]
    : base[Math.floor(Math.random() * base.length)];

  ultimasFrasesMontadas.push(escolhida);
  if(ultimasFrasesMontadas.length > 5){
    ultimasFrasesMontadas.shift();
  }

  return escolhida;
}

function montarFraseFinal(xingamento:string, instrucao?:string){
  const abertura = ABERTURAS[Math.floor(Math.random() * ABERTURAS.length)] || "";

  const parteXingamento = String(xingamento || "").trim();
  const parteInstrucao = String(instrucao || "").trim();

  if(parteInstrucao && parteXingamento && Math.random() < 0.6){
    return `${abertura ? abertura + " " : ""}${parteXingamento} ${parteInstrucao}`.trim();
  }

  if(parteInstrucao && !parteXingamento){
    // em instrução pura, não adiciona abertura para evitar atrasar/confundir manobra
    return parteInstrucao;
  }

  return `${abertura ? abertura + " " : ""}${parteXingamento}`.trim();
}
useEffect(()=>{
  return ()=>{
    if(sugestaoDestinoTimerRef.current){
      clearTimeout(sugestaoDestinoTimerRef.current);
    }
  };
},[]);
  useEffect(()=>{
    return ()=>{
      try{
        coinSoundSubscriptionRef.current?.remove?.();
      }catch{}

      try{
        coinSoundPlayerRef.current?.pause?.();
        coinSoundPlayerRef.current?.remove?.();
      }catch{}

      coinSoundSubscriptionRef.current = null;
      coinSoundPlayerRef.current = null;

      try{
        voicePlayerSubscriptionRef.current?.remove?.();
      }catch{}

      try{
        voicePlayerRef.current?.pause?.();
        voicePlayerRef.current?.remove?.();
      }catch{}

      voicePlayerSubscriptionRef.current = null;
      voicePlayerRef.current = null;
      risadaUriCacheRef.current = {};

      try{
        Speech.stop();
      }catch{}

      filaAudioRef.current = [];
      reproduzindoRef.current = false;
      bloquearFallbackPorCustomRef.current = false;
    };
  },[]);

  async function garantirSomMoedaUri(){
    if(coinSoundUriRef.current) return coinSoundUriRef.current;
    const asset = Asset.fromModule(require("../assets/audio/oferta-proxima.wav"));
    if(!asset.localUri){
      await asset.downloadAsync();
    }
    const uri = asset.localUri || asset.uri;
    if(!uri) throw new Error("Arquivo de som de oferta não encontrado");

    coinSoundUriRef.current = uri;
    return uri;
  }

  function isRisadaToken(valor:string): valor is RisadaToken {
    return RISADA_TOKEN_REGEX.test(valor) && valor in RISADA_TOKEN_POR_AUDIO;
  }

  async function garantirUriRisada(token:RisadaToken){
    const emCache = risadaUriCacheRef.current[token];
    if(emCache) return emCache;

    const asset = Asset.fromModule(RISADA_TOKEN_POR_AUDIO[token]);
    if(!asset.localUri){
      await asset.downloadAsync();
    }

    const uri = asset.localUri || asset.uri;
    if(!uri) throw new Error(`Arquivo de risada não encontrado para ${token}`);

    risadaUriCacheRef.current[token] = uri;
    return uri;
  }

  async function tocarRisadaTokenFila(token:RisadaToken){
    const uri = await garantirUriRisada(token);

    try{
      voicePlayerSubscriptionRef.current?.remove?.();
    }catch{}

    try{
      voicePlayerRef.current?.pause?.();
      voicePlayerRef.current?.remove?.();
    }catch{}

    voicePlayerSubscriptionRef.current = null;
    voicePlayerRef.current = null;

    const player = createAudioPlayer({ uri }, { updateInterval: 80 });
    voicePlayerRef.current = player;

    await new Promise<void>((resolve, reject) => {
      let finalizado = false;

      const finalizar = (erro?:any) => {
        if(finalizado) return;
        finalizado = true;

        try{
          voicePlayerSubscriptionRef.current?.remove?.();
        }catch{}
        voicePlayerSubscriptionRef.current = null;

        try{
          if(voicePlayerRef.current === player){
            voicePlayerRef.current = null;
          }
          player.remove?.();
        }catch{}

        if(erro) reject(erro);
        else resolve();
      };

      voicePlayerSubscriptionRef.current = player.addListener("playbackStatusUpdate", (status:any) => {
        if(!status?.isLoaded) return;
        if(status?.didJustFinish || status?.playbackState === "ended"){
          finalizar();
        }
      });

      try{
        player.play();
      }catch(e){
        finalizar(e);
      }
    });
  }

  async function tocarRisadaComFallback(tokenPreferencial: RisadaToken){
    const ordemTentativas: RisadaToken[] = [
      tokenPreferencial,
      "__RISADA_MEDIA__",
      "__RISADA_LEVE__",
      "__RISADA_SARCASTICA__",
      "__RISADA_FORTE__",
    ];

    const tentativas = Array.from(new Set(ordemTentativas));

    for(const token of tentativas){
      try{
        await tocarRisadaTokenFila(token);
        return true;
      }catch(error){
        console.log("RISADA FALLBACK ERROR:", token, error);
      }
    }

    return false;
  }

  async function tocarSomMoeda(){
    try{
      const uri = await garantirSomMoedaUri();

      try{
        coinSoundSubscriptionRef.current?.remove?.();
      }catch{}

      try{
        coinSoundPlayerRef.current?.pause?.();
        coinSoundPlayerRef.current?.remove?.();
      }catch{}

      coinSoundSubscriptionRef.current = null;
      coinSoundPlayerRef.current = null;

      const player = createAudioPlayer({ uri }, { updateInterval: 80 });
      coinSoundPlayerRef.current = player;

      coinSoundSubscriptionRef.current = player.addListener("playbackStatusUpdate", (status:any)=>{
        if(!status?.isLoaded || status?.didJustFinish){
          try{
            coinSoundSubscriptionRef.current?.remove?.();
          }catch{}
          coinSoundSubscriptionRef.current = null;

          try{
            player.remove?.();
          }catch{}

          if(coinSoundPlayerRef.current === player){
            coinSoundPlayerRef.current = null;
          }
        }
      });

      player.play();
      return true;
    }catch(error){
      console.log("Erro ao tocar som de moeda:", error);
      return false;
    }
  }

  async function notificarOfertaProximaSeNecessario(ofertaId:string, dados:any){
    if(!ofertaId || !dados) return;
    if(!usuarioId) return;
    if(ofertasProximasNotificadasRef.current.has(ofertaId)) return;
    if(String(dados?.criadorId || "") === String(usuarioId)) return;
    if(String(dados?.status || "") !== "ativa") return;

    const lat = Number(dados?.origem?.lat);
    const lng = Number(dados?.origem?.lng);
    if(!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const raioKm = Number(raioNotificacaoKm || 0);
    if(!Number.isFinite(raioKm) || raioKm <= 0) return;

    let posicao:any = null;
    try{
      posicao = await Location.getLastKnownPositionAsync();
      if(!posicao){
        posicao = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
    }catch(error){
      console.log("Erro ao obter localizacao para alerta de oferta:", error);
      return;
    }

    const userLat = Number(posicao?.coords?.latitude);
    const userLng = Number(posicao?.coords?.longitude);
    if(!Number.isFinite(userLat) || !Number.isFinite(userLng)) return;

    const distanciaM = getDistanciaMetros(userLat, userLng, lat, lng);
    if(!Number.isFinite(distanciaM) || distanciaM > raioKm * 1000) return;

    ofertasProximasNotificadasRef.current.add(ofertaId);

    const titulo = t("ofertaPertoTitulo");
    const distanciaTexto = formatarDistanciaAlerta(distanciaM);
    const descricao = String(dados?.nomeOuDescricao || t("oferta")).trim() || t("oferta");
    const corpoNotificacao = t("ofertaPertoCorpo")
      .replace("{{descricao}}", descricao)
      .replace("{{distancia}}", distanciaTexto);

    Vibration.vibrate([0, 120, 80, 120]);

    // Sempre tenta tocar a moeda para alertar qualquer usuario (PRO ou FREE).
    let tocouMoeda = await tocarSomMoeda();
    if(!tocouMoeda && somRadar){
      try{
        falar(t("novaOfertaPerto"));
      }catch(error){
        console.log("Erro ao tocar alerta de voz da oferta:", error);
      }
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpoNotificacao,
        sound: tocouMoeda ? null : "default",
        data: {
          ofertaId,
          tipo: "oferta_proxima"
        }
      },
      trigger: null
    }).catch((error)=>console.log("Erro ao notificar oferta proxima:", error));
  }

  // resto dos states e funções...
  
async function arquivoParaBase64(uri:any){
  const caminho = String(uri || "").trim();
  if(!caminho) return "";
  if(caminho.startsWith("data:")){
    const match = caminho.match(/^data:.*?;base64,(.*)$/);
    return String(match?.[1] || "");
  }
  if(!caminho.startsWith("file://")) return "";
  try{
    const conteudo = await FileSystem.readAsStringAsync(caminho, {
      encoding: FileSystem.EncodingType.Base64
    });
    return String(conteudo || "");
  }catch(error){
    console.log("Erro ao ler arquivo local para base64:", error);
    return "";
  }
}
async function tocarTextoComVozCustom(texto: string) {
  let arquivoUri = "";

  try {
    falandoAgoraRef.current = true;
    falandoRef.current = true;
    bloquearFallbackPorCustomRef.current = true;

    console.log("VOICE ENGINE: custom");
    console.log("VOICE TEXTO:", texto);

    const fetchPromise = fetch(VOICE_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: texto,
        speed: modoComico ? 0.94 : 0.92,
        mode: "insana"
      })
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("VOICE TIMEOUT: servidor demorando")), VOICE_CUSTOM_TIMEOUT_PADRAO_MS)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    console.log("VOICE STATUS:", response.status);

    const json = await response.json();
    const audioBase64 = String(json?.audioBase64 || "").trim();

    if (!audioBase64) {
      throw new Error("audioBase64 vazio");
    }

    const nomeArquivo = `voz_${Date.now()}.wav`;
    arquivoUri = `${FileSystem.cacheDirectory}${nomeArquivo}`;

    await FileSystem.writeAsStringAsync(arquivoUri, audioBase64, {
      encoding: FileSystem.EncodingType.Base64
    });

    try {
      voicePlayerSubscriptionRef.current?.remove?.();
    } catch {}

    try {
      voicePlayerRef.current?.pause?.();
      voicePlayerRef.current?.remove?.();
    } catch {}

    voicePlayerSubscriptionRef.current = null;
    voicePlayerRef.current = null;

    const player = createAudioPlayer({ uri: arquivoUri }, { updateInterval: 80 });
    voicePlayerRef.current = player;

    voicePlayerSubscriptionRef.current = player.addListener("playbackStatusUpdate", (status: any) => {
      console.log("STATUS AUDIO:", JSON.stringify(status));

      if (!status?.isLoaded) return;

      if (status?.didJustFinish || status?.playbackState === "ended") {
        console.log("CUSTOM TERMINOU");

        try {
          voicePlayerSubscriptionRef.current?.remove?.();
        } catch {}

        voicePlayerSubscriptionRef.current = null;

        try {
          player.remove?.();
        } catch {}

        if (voicePlayerRef.current === player) {
          voicePlayerRef.current = null;
        }

        reproduzindoRef.current = false;
        falandoAgoraRef.current = false;
        falandoRef.current = false;
        bloquearFallbackPorCustomRef.current = false;

        console.log("VOICE LIBERADA");
        console.log("FILA RESTANTE:", [...filaAudioRef.current]);

        if (filaAudioRef.current.length > 0) {
          setTimeout(() => drenaFilaAudio(), 50);
        }
      }
    });

    player.play();
  } catch (e) {
    console.log("VOICE ERROR:", e);
    console.log("VOICE CUSTOM ERROR: fallback de sistema desativado");

    reproduzindoRef.current = false;
    falandoAgoraRef.current = false;
    falandoRef.current = false;
    bloquearFallbackPorCustomRef.current = false;

    setTimeout(() => {
      reproduzindoRef.current = false;
      if (filaAudioRef.current.length > 0) {
        setTimeout(() => drenaFilaAudio(), 50);
      }
    }, 1000);
  }
}
function extensaoPorMime(mimeType:string, tipo:string){
  const mime = String(mimeType || "").toLowerCase();
  if(mime.includes("png")) return "png";
  if(mime.includes("webp")) return "webp";
  if(mime.includes("aac")) return "aac";
  if(mime.includes("wav")) return "wav";
  if(mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if(mime.includes("ogg")) return "ogg";
  if(mime.includes("m4a") || mime.includes("mp4")) return "m4a";
  return tipo === "imagem" ? "jpg" : "m4a";
}

async function prepararMediaUrlMensagem(mensagem:any){
  const tipo = String(mensagem?.tipo || "");
  if(tipo !== "imagem" && tipo !== "audio") return null;

  const existente = String(mensagem?.mediaUrl || "").trim();
  if(existente) return existente;

  const mimePadrao = tipo === "imagem" ? "image/jpeg" : "audio/m4a";
  const mimeType = String(mensagem?.mimeType || mimePadrao);

  let base64 = "";
  if(typeof mensagem?.base64Data === "string" && mensagem.base64Data.trim()){
    base64 = mensagem.base64Data.trim();
  }else{
    base64 = await arquivoParaBase64(mensagem?.arquivoUri);
  }

  if(!base64) return null;

  const dataUrl = `data:${mimeType};base64,${base64}`;
  const ext = extensaoPorMime(mimeType, tipo);
  const ofertaId = String(chatOferta?.id || "sem_oferta");
  const nome = `${Date.now()}_${String(usuarioId || "anon")}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const caminhoStorage = `chat_media/ofertas/${ofertaId}/${nome}`;

  try{
    const ref = storageRef(storage, caminhoStorage);
    await uploadString(ref, dataUrl, "data_url");
    return await getDownloadURL(ref);
  }catch(error){
    console.log("Erro ao subir mídia no Storage:", error);
    if(dataUrl.length <= 700000){
      return dataUrl;
    }
    return null;
  }
}
 async function enviarMensagemChat(payload:any){

if(!chatOferta) return;
if(chatBloqueadoPorMimNoContexto(chatOferta, chatMensagens, usuarioId)){
  Alert.alert(
    "Chat indisponível",
    "Você bloqueou este usuário. Desbloqueie para voltar a conversar."
  );
  return;
}

if(chatFuiBloqueadoNoContexto(chatOferta, chatMensagens, usuarioId)){
  Alert.alert(
    "Chat indisponível",
    "Este usuário bloqueou você."
  );
  return;
}

const bloqueioAtual = await sincronizarBloqueioChatAtual(chatOferta, chatMensagens);
if(chatBloqueadoParaUsuario(chatOferta, chatMensagens, usuarioId)){
  Alert.alert(
    tComFallback("chatBloqueadoTitulo", "Chat bloqueado"),
    tComFallback("chatBloqueadoRecusa", "Sua solicitação foi recusada nesta oferta. Você não pode enviar novas mensagens.")
  );
  return;
}

if(bloqueioAtual.euBloqueei || bloqueioAtual.fuiBloqueado){
  Alert.alert(
    "Chat indisponível",
    bloqueioAtual.fuiBloqueado
      ? "Este usuário bloqueou você."
      : "Você bloqueou este usuário. Desbloqueie para voltar a conversar."
  );
  return;
}

const mensagem = typeof payload === "string"
  ? { tipo: "texto", texto: payload }
  : (payload || {});

const tipo = String(mensagem?.tipo || "texto");
const textoNormalizado =
  typeof mensagem?.texto === "string"
    ? mensagem.texto
    : String(mensagem?.texto || "");
const ofertaIdAtual = String(chatOferta?.id || "");
const moderacao = tipo === "texto"
  ? avaliarModeracaoMensagemTexto(textoNormalizado, ofertaIdAtual)
  : { bloquear: false, ocultar: false, motivo: "" };

if(moderacao.bloquear){
  Alert.alert("Mensagem bloqueada", "Essa mensagem viola as regras do chat e não foi enviada.");
  return;
}

const mediaUrlFinal = await prepararMediaUrlMensagem(mensagem);
if((tipo === "imagem" || tipo === "audio") && !mediaUrlFinal){
  Alert.alert(t("erro"), t("naoFoiPossivelEnviarMidia"));
  return;
}

try {
  await addDoc(
    collection(db,"ofertas",chatOferta.id,"mensagens"),
    {
      tipo,
      texto:textoNormalizado,
      mediaUrl:mediaUrlFinal || null,
      duracaoMs:typeof mensagem?.duracaoMs === "number" ? mensagem.duracaoMs : null,
      latitude:typeof mensagem?.latitude === "number" ? mensagem.latitude : null,
      longitude:typeof mensagem?.longitude === "number" ? mensagem.longitude : null,
      acao:mensagem?.acao || null,
      statusSolicitacao:mensagem?.statusSolicitacao || null,
      solicitanteId:mensagem?.solicitanteId || null,
      lidoPor:[usuarioId],
      autor:usuarioId,
      autorNome: perfilAtualMini.nome || usuarioId,
      autorFoto: perfilAtualMini.foto || null,
      ofertaId:chatOferta.id,
      criadoEm:Date.now(),
      reported:false,
      hiddenByModeration:!!moderacao.ocultar,
      moderated:!!moderacao.ocultar,
      deletedByAdmin:false,
      moderationReason:moderacao.motivo || null,
      blockedForAuthor:chatBloqueioManual.euBloqueei && chatBloqueioManual.outroId
        ? { [String(chatBloqueioManual.outroId)]: Date.now() }
        : {}
    }
  );

  if(moderacao.ocultar){
    Alert.alert("Mensagem enviada com restrição", "A mensagem foi marcada automaticamente para revisão de moderação.");
  }
} catch(e){
  console.log("Erro ao enviar mensagem:", e);
}

}
 function criarOferta(nova: Omit<Oferta, "id" | "criadoEm" | "status">){

  const ofertaCompleta: Oferta = {
    ...nova,
    id: Date.now().toString(),
    criadoEm: Date.now(),
    status: "ativa"
  };

  setOfertas(prev => [...prev, ofertaCompleta]);
} 
  
  const insets = useSafeAreaInsets();
  const jaFalouInicio = useRef(false);   

  useEffect(() => {
  pedirPermissao();
}, []);
async function pedirPermissao() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert(t("permissaoLocalizacaoNegada"));
    return;
  }
  console.log("Permissão concedida");
}
const DEBUG_BRAIN = false;
if(DEBUG_BRAIN){
 console.log(POI_LINES); 
}
 // ==========================================
 // �x� CARREGAR DADOS SALVOS DO CELULAR
 // ==========================================
 useEffect(()=>{
   carregarLocaisSalvos();
 },[]);

 async function buscarCoordenadas(endereco:string){
  const consulta = String(endereco || "").trim();
  if(!consulta) return null;

  try{
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(consulta)}&limit=1&addressdetails=1`;
    console.log("[GEOCODE_QUERY]", consulta);
    console.log("[GEOCODE_URL]", url);

    const response = await fetch(url, {
      headers:{
        "User-Agent":"gps-clean-app",
        "Accept":"application/json"
      }
    });

    const json = await response.json();
    const primeiroResultado = Array.isArray(json) ? json[0] : null;
    console.log("[GEOCODE_RESULT]", primeiroResultado);

    if(Array.isArray(json) && json.length > 0){
      return {
        lat: Number(json[0].lat),
        lng: Number(json[0].lon)
      };
    }

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(consulta)}&limit=1`;
    console.log("[GEOCODE_URL]", photonUrl);
    const photonRes = await fetch(photonUrl, { headers:{ "Accept":"application/json" } });
    const photonJson = await photonRes.json();
    const feature = Array.isArray(photonJson?.features) ? photonJson.features[0] : null;
    console.log("[GEOCODE_RESULT]", feature || null);

    const lngPhoton = Number(feature?.geometry?.coordinates?.[0]);
    const latPhoton = Number(feature?.geometry?.coordinates?.[1]);
    if(Number.isFinite(latPhoton) && Number.isFinite(lngPhoton)){
      return { lat: latPhoton, lng: lngPhoton };
    }

    const geoDispositivo = await Location.geocodeAsync(consulta);
    if(Array.isArray(geoDispositivo) && geoDispositivo.length > 0){
      return {
        lat: Number(geoDispositivo[0].latitude),
        lng: Number(geoDispositivo[0].longitude)
      };
    }

    return null;
  }catch(e){
    console.log("Erro geocode", e);

    try{
      const geoDispositivo = await Location.geocodeAsync(consulta);
      if(Array.isArray(geoDispositivo) && geoDispositivo.length > 0){
        return {
          lat: Number(geoDispositivo[0].latitude),
          lng: Number(geoDispositivo[0].longitude)
        };
      }
    }catch{}

    return null;
  }
}
async function buscarRotaComFallback(
  origemLat:number,
  origemLng:number,
  destLat:number,
  destLng:number
){
  // 1) tenta ORS primeiro
  try{
    const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

    const orsRes = await fetch(orsUrl, {
      method:"POST",
      headers:{
        "Authorization":"eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0=",
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body: JSON.stringify({
        coordinates: [
          [origemLng, origemLat],
          [destLng, destLat]
        ],
        instructions: true,
        preference: "recommended"
      })
    });

    const orsText = await orsRes.text();

    if(orsRes.ok && orsText && !String(orsText).trim().startsWith("<")){
      const orsJson = JSON.parse(orsText);

      const coords = Array.isArray(orsJson?.features?.[0]?.geometry?.coordinates)
        ? orsJson.features[0].geometry.coordinates.map((c:any)=>({
            latitude: Number(c[1]),
            longitude: Number(c[0]),
          }))
        : [];

      const summary = orsJson?.features?.[0]?.properties?.summary || {};
      const segments = orsJson?.features?.[0]?.properties?.segments || [];
      const steps = Array.isArray(segments?.[0]?.steps) ? segments[0].steps : [];

      if(coords.length > 1){
        return {
          provider: "ors",
          coords,
          altCoords: [],
          steps,
          duration: Number(summary?.duration || 0),
          distance: Number(summary?.distance || 0)
        };
      }
    }else{
      console.log("ORS HTTP STATUS:", orsRes.status);
      console.log("ORS BODY:", String(orsText || "").slice(0, 300));
    }
  }catch(e){
    console.log("Erro ORS directions:", e);
  }

  // 2) fallback para OSRM
  try{
    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origemLng},${origemLat};${destLng},${destLat}` +
      `?alternatives=1&overview=full&geometries=geojson&steps=true`;

    const osrmRes = await fetch(osrmUrl, {
      method:"GET",
      headers:{
        "Accept":"application/json"
      }
    });

    const osrmText = await osrmRes.text();

    if(!osrmRes.ok){
      console.log("OSRM HTTP STATUS:", osrmRes.status);
      console.log("OSRM BODY:", String(osrmText || "").slice(0, 300));
      return null;
    }

    const respostaLimpa = String(osrmText || "").trim();

    if(!respostaLimpa || respostaLimpa.startsWith("<")){
      console.log("OSRM respondeu inválido:", respostaLimpa.slice(0, 300));
      return null;
    }

    const osrmJson = JSON.parse(respostaLimpa);

    if(!Array.isArray(osrmJson?.routes) || osrmJson.routes.length === 0){
      console.log("OSRM sem routes:", osrmJson);
      return null;
    }

    const rotaPrincipal = osrmJson.routes[0];
    const rotaAlt = osrmJson.routes[1] || null;

    const coords = Array.isArray(rotaPrincipal?.geometry?.coordinates)
      ? rotaPrincipal.geometry.coordinates.map((c:any)=>({
          latitude: Number(c[1]),
          longitude: Number(c[0]),
        }))
      : [];

    const altCoords =
      Array.isArray(rotaAlt?.geometry?.coordinates)
        ? rotaAlt.geometry.coordinates.map((c:any)=>({
            latitude: Number(c[1]),
            longitude: Number(c[0]),
          }))
        : [];

    const steps = Array.isArray(rotaPrincipal?.legs?.[0]?.steps)
      ? rotaPrincipal.legs[0].steps
      : [];

    if(coords.length > 1){
      return {
        provider: "osrm",
        coords,
        altCoords,
        steps,
        duration: Number(rotaPrincipal?.duration || 0),
        distance: Number(rotaPrincipal?.distance || 0)
      };
    }

    return null;
  }catch(e){
    console.log("Erro OSRM fallback:", e);
    return null;
  }
}
function pegarAleatorio<T>(lista:T[], excluir?:T){
  if(!Array.isArray(lista) || lista.length === 0) return null;

  if(lista.length === 1) return lista[0];

  let candidato = lista[Math.floor(Math.random() * lista.length)];
  let tentativas = 0;

  while(excluir && candidato === excluir && tentativas < 10){
    candidato = lista[Math.floor(Math.random() * lista.length)];
    tentativas++;
  }

  return candidato;
}

function extrairComentarioManualFinal(texto:string){
  const bruto = String(texto || "");
  const semEspacosFim = bruto.trimEnd();
  const match = semEspacosFim.match(/^(.*?)(?:\s*\(([^()]*)\)|\s*\[([^\[\]]*)\]|\s*\{([^{}]*)\})$/);

  if(!match){
    return {
      textoPrincipal: semEspacosFim,
      comentarioManual: ""
    };
  }

  const comentarioManual = String(match[2] ?? match[3] ?? match[4] ?? "").trim();

  return {
    textoPrincipal: String(match[1] || "").trimEnd(),
    comentarioManual
  };
}

function materializarTextoPiada(texto:string){
  const nomeFalavel =
    obterNomeFalavelUsuario(perfilAtualMini?.nome) ||
    obterNomeFalavelUsuario(nomePassageiro) ||
    obterNomeFalavelUsuario(usuarioId);

  const base = String(texto || "");
  const semPlaceholder = nomeFalavel
    ? base.replace(/\{\{\s*nome\s*\}\}/gi, nomeFalavel)
    : base.replace(/\{\{\s*nome\s*\}\}\s*,?\s*/gi, "");

  return semPlaceholder
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function garantirPrefixoPerguntaPiada(texto:string){
  const pergunta = String(texto || "").trim();
  if(!pergunta) return "";

  if(/^(?:(?:ei|oi|viu)(?:[\s,!.?-]|$)|ô(?:[\s,!.?-]|$))/i.test(pergunta)){
    return pergunta;
  }

  const prefixos = ["Ei", "Ô", "Viu"];
  const idx = Math.abs(pergunta.length) % prefixos.length;
  return `${prefixos[idx]}, ${pergunta}`;
}

function montarBlocoPiadaComica(
  piada:{
    pergunta:string;
    resposta:string;
    pausa?:number;
    abertura?:string;
    fechamento?:string;
  }
){
  const perguntaMaterializada = materializarTextoPiada(String(piada?.pergunta || ""));
  const respostaComComentario = extrairComentarioManualFinal(
    materializarTextoPiada(String(piada?.resposta || ""))
  );

  const textoPergunta = garantirPrefixoPerguntaPiada(perguntaMaterializada).trim();
  const textoResposta = String(respostaComComentario.textoPrincipal || "").trim();
  const comentarioManual = String(respostaComComentario.comentarioManual || "").trim();
  const pausaMs = Math.max(900, Number(piada?.pausa) || 1400);
  const separadorPrincipal = pausaMs >= 1700 ? ". " : ", ";
  const separadorComentario = pausaMs >= 1700 ? ". " : ", ";

  const partes: string[] = [];

  if(textoPergunta){
    partes.push(textoPergunta);
  }

  if(textoResposta){
    if(partes.length > 0){
      partes.push(separadorPrincipal + textoResposta);
    }else{
      partes.push(textoResposta);
    }
  }

  if(comentarioManual){
    if(partes.length > 0){
      partes.push(separadorComentario + comentarioManual);
    }else{
      partes.push(comentarioManual);
    }
  }

  let textoFinal = partes.join("");

  textoFinal = textoFinal
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[(){}\[\]"]/g, " ")
    .replace(/[_*#^~`|<>]/g, " ")
    .replace(/\.\.\.+/g, " ")
    .replace(/[;:]/g, ", ")
    .replace(/[!?]{2,}/g, "!")
    .replace(/\.{2,}/g, ".")
    .replace(/,\s*,+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    textoFinal,
    textoPergunta,
    textoResposta,
    textoComentario: comentarioManual,
  };
}

function comentarioIndicaSemRisada(texto:string){
  const t = String(texto || "").toLowerCase();
  return (
    t.includes("nem vou rir") ||
    t.includes("nao vou rir") ||
    t.includes("não vou rir") ||
    t.includes("nao da para rir") ||
    t.includes("não dá para rir") ||
    t.includes("nao precisa rir") ||
    t.includes("não precisa rir")
  );
}

function risadaPorRankingPiada(piada:any, textoResposta:string, textoComentario:string){
  const ranking = String(piada?.ranking || "boa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if(ranking === "otima" || ranking === "muito boa"){
    return "__RISADA_FORTE__";
  }

  if(ranking === "boa"){
    return "__RISADA_MEDIA__";
  }

  if(ranking === "ruim"){
    return "__RISADA_SARCASTICA__";
  }

  // pessima / muito ruim
  return "__RISADA_SARCASTICA__";
}

function comentarioRankingPiada(piada:any){
  const ranking = String(piada?.ranking || "boa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  let chaveRanking: "pessima" | "ruim" | "boa" | "otima" = "boa";
  if(ranking === "otima" || ranking === "muito boa") chaveRanking = "otima";
  else if(ranking === "boa") chaveRanking = "boa";
  else if(ranking === "ruim") chaveRanking = "ruim";
  else chaveRanking = "pessima";

  const comentariosIdioma =
    COMENTARIOS_PIADA_COMICA_POR_IDIOMA[idiomaAtual] ||
    COMENTARIOS_PIADA_COMICA_POR_IDIOMA.pt;

  const opcoes = Array.isArray(comentariosIdioma?.[chaveRanking])
    ? comentariosIdioma[chaveRanking]
    : [];

  if(opcoes.length > 0){
    return String(opcoes[Math.floor(Math.random() * opcoes.length)] || "").trim();
  }

  const fallbackPt = COMENTARIOS_PIADA_COMICA_POR_IDIOMA.pt?.[chaveRanking] || [];
  if(Array.isArray(fallbackPt) && fallbackPt.length > 0){
    return String(fallbackPt[Math.floor(Math.random() * fallbackPt.length)] || "").trim();
  }

  return "";
}

function obterDelayModoComico() {
  const MIN_MS = 90 * 1000;
  const MAX_MS = 150 * 1000;
  return MIN_MS + Math.floor(Math.random() * (MAX_MS - MIN_MS + 1));
}

function limparTimerModoComico() {
  if (timerComico.current) {
    clearTimeout(timerComico.current);
    timerComico.current = null;
  }
}

function falarPiadaComica() {
  const listaPiadas =
    PIADAS_COMICAS_CURTAS_POR_IDIOMA[idiomaAtual] ||
    PIADAS_COMICAS_CURTAS_POR_IDIOMA.pt;

  if (!Array.isArray(listaPiadas) || listaPiadas.length === 0) {
    console.log("MODO COMICO: sem piadas disponíveis");
    return;
  }

  const vistas = piadasJaContadasRef.current;
  const todasChaves = listaPiadas.map(
    (j: any) => `${String(j?.pergunta || "")}|${String(j?.resposta || "")}`
  );

  let pool = listaPiadas.filter((_: any, i: number) => !vistas.has(todasChaves[i]));

  if (pool.length === 0) {
    vistas.clear();
    pool = listaPiadas;
  }

  const piada = pool[Math.floor(Math.random() * pool.length)];
  const chave = `${String(piada?.pergunta || "")}|${String(piada?.resposta || "")}`;

  vistas.add(chave);
  ultimaPiada.current = chave;

  const bloco = montarBlocoPiadaComica(piada);
  const textoPergunta = String(bloco?.textoPergunta || "").trim();
  const textoResposta = String(bloco?.textoResposta || "").trim();
  const textoComentario = String(bloco?.textoComentario || "").trim();
  const comentarioRanking = textoComentario ? "" : comentarioRankingPiada(piada);
  const semRisada = comentarioIndicaSemRisada(textoComentario);
  const textoRisada = semRisada
    ? ""
    : String(risadaPorRankingPiada(piada, textoResposta, textoComentario) || "__RISADA_MEDIA__").trim();
  const textoFinal = String(bloco?.textoFinal || "").trim();
  const textoRespostaComComentario = textoComentario
    ? `${textoResposta}${textoResposta ? ", " : ""}${textoComentario}`.trim()
    : textoResposta;

  if (!textoFinal) {
    console.log("MODO COMICO: piada vazia");
    return;
  }

  console.log("MODO COMICO: piada escolhida =", textoFinal);

  // enfileira partes separadas com pausas curtas para manter ritmo natural
  if (textoPergunta && textoResposta) {
    filaAudioRef.current.push({
      texto: normalizarTextoFalado(textoPergunta) || textoPergunta,
      contexto: "modo_comico"
    });
    filaAudioRef.current.push("__PAUSE_120__");
    filaAudioRef.current.push({
      texto: normalizarTextoFalado(textoRespostaComComentario) || textoRespostaComComentario,
      contexto: "modo_comico"
    });
    filaAudioRef.current.push("__PAUSE_120__");
    filaAudioRef.current.push({
      texto: normalizarTextoFalado(comentarioRanking) || comentarioRanking,
      contexto: "modo_comico"
    });
    if (textoRisada) {
  filaAudioRef.current.push("__PAUSE_40__");
  filaAudioRef.current.push(textoRisada);
}
  } else {
    // fallback: pergunta/resposta compactadas, mas sempre com ranking antes da risada
    filaAudioRef.current.push({
      texto: normalizarTextoFalado(textoFinal) || textoFinal,
      contexto: "modo_comico"
    });
    filaAudioRef.current.push("__PAUSE_120__");
    filaAudioRef.current.push({
      texto: normalizarTextoFalado(comentarioRanking) || comentarioRanking,
      contexto: "modo_comico"
    });
    if (textoRisada) {
      filaAudioRef.current.push("__PAUSE_160__");
      filaAudioRef.current.push(textoRisada);
    }
  }

  // importante para itens disparados por timeout
  setTimeout(() => {
    try {
      if (!modoComicoAtivoRef.current) {
        return;
      }
      if (!reproduzindoRef.current && filaAudioRef.current.length > 0) {
        console.log("MODO COMICO: forçando dreno da fila");
        drenaFilaAudio();
      }
    } catch (e) {
      console.log("MODO COMICO: erro ao forçar dreno da fila", e);
    }
  }, 80);
}

function agendarProximaPiadaComica() {
  limparTimerModoComico();

  if (!modoComicoAtivoRef.current) {
    console.log("MODO COMICO: não agendou porque está desligado");
    return;
  }

  const delay = obterDelayModoComico();
  console.log(`MODO COMICO: próxima piada em ~${Math.round(delay / 1000)}s`);

  timerComico.current = setTimeout(() => {
    const agora = Date.now();

    if (!modoComicoAtivoRef.current) {
      console.log("MODO COMICO: timeout abortado, modo desligado");
      return;
    }

    if (executandoPiadaComicaRef.current) {
      console.log("MODO COMICO: já existe piada em execução, reagendando");
      agendarProximaPiadaComica();
      return;
    }

    if (agora - ultimoDisparoComicoRef.current < 4000) {
      console.log("MODO COMICO: bloqueado por disparo muito próximo, reagendando");
      agendarProximaPiadaComica();
      return;
    }

    executandoPiadaComicaRef.current = true;
    ultimoDisparoComicoRef.current = agora;

    console.log("MODO COMICO: timeout disparou");

    try {
      falarPiadaComica();
    } catch (e) {
      console.log("MODO COMICO ERRO:", e);
    } finally {
      executandoPiadaComicaRef.current = false;

      if (modoComicoAtivoRef.current) {
        agendarProximaPiadaComica();
      }
    }
  }, delay);
}

function iniciarModoComicoLoop() {
  limparTimerModoComico();
  modoComicoAtivoRef.current = true;
  executandoPiadaComicaRef.current = false;
  console.log("MODO COMICO: ligado");
  agendarProximaPiadaComica();
}

function pararModoComicoLoop() {
  modoComicoAtivoRef.current = false;
  executandoPiadaComicaRef.current = false;
  limparTimerModoComico();
  filaAudioRef.current = [];
  reproduzindoRef.current = false;
  falandoRef.current = false;
  falandoAgoraRef.current = false;

  try {
    Speech.stop();
  } catch {}

  try {
    voicePlayerSubscriptionRef.current?.remove?.();
  } catch {}

  try {
    voicePlayerRef.current?.pause?.();
    voicePlayerRef.current?.remove?.();
  } catch {}

  voicePlayerSubscriptionRef.current = null;
  voicePlayerRef.current = null;
  console.log("MODO COMICO: desligado");
}
 async function carregarLocaisSalvos(){
   try{
     const casa = await AsyncStorage.getItem("casa_salva");
     const trab = await AsyncStorage.getItem("trabalho_salvo");
     const fav = await AsyncStorage.getItem("favoritos_lista");
     const rec = await AsyncStorage.getItem("recentes_lista");
     const amigos = await AsyncStorage.getItem("amigos_lista");
     const raioSalvo = await AsyncStorage.getItem("raio_notificacao_km");
     const veiculoSalvo = await AsyncStorage.getItem("veiculo_gps_id");

     if(amigos) setAmigosLista(JSON.parse(amigos));
     if(veiculoSalvo) setVeiculoGpsId(veiculoSalvo);
     if(casa) setCasaSalva(JSON.parse(casa));
     if(trab) setTrabalhoSalvo(JSON.parse(trab));
     if(fav) setFavoritos(JSON.parse(fav));
     if(rec) setRecentes(JSON.parse(rec));
     if(raioSalvo){
      const numero = Number(raioSalvo);
      if(Number.isFinite(numero) && numero > 0){
        setRaioNotificacaoKm(numero);
      }
     }

   }catch(e){
     console.log("erro carregar locais");
   }
 }
 
  // ==========================================
 // �x�� ESCOLHER COMO SALVAR CASA
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
// �xR� IDIOMA GLOBAL
// ===============================
const IDIOMAS_IDS = IDIOMAS_DISPONIVEIS.map((item) => item.id);

function idiomaEhSuportado(id: string): id is IdiomaId {
  return IDIOMAS_IDS.includes(id as IdiomaId);
}

function idiomaPorLocale(locale: string): IdiomaId {
  const base = String(locale || "pt").toLowerCase().split("-")[0];
  if (idiomaEhSuportado(base)) return base;
  return "pt";
}

function localePorIdioma(id: IdiomaId): string {
  const idioma = IDIOMAS_DISPONIVEIS.find((item) => item.id === id);
  return idioma?.locale || "pt-BR";
}
// ===============================
//  MODO FREE / PRO
// ===============================
const [modoPro, setModoPro] = useState(false);
const [modoComico, setModoComico] = useState(false);
const [somPolicia, setSomPolicia] = useState(true);
const [somRadar, setSomRadar] = useState(true);
//////////////////////////////////////////////////////////////
// �x� DIST�NCIA EM METROS ENTRE 2 PONTOS
//////////////////////////////////////////////////////////////
function getDistanciaMetros(lat1, lon1, lat2, lon2){
  const R = 6371000;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*
    Math.cos(lat2*Math.PI/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

//////////////////////////////////////////////////////////////
// �x�� XINGAMENTO ALEAT�RIO
//////////////////////////////////////////////////////////////
function xingamentoAleatorio(){
  const nivel = nivelPermitido();
  const listaNivel = listaWrongLinesPorNivelComFallback(nivel, idiomaAtual);
  const listaFallback = listaWrongLinesPorNivelComFallback(0, idiomaAtual);
  const lista = (listaNivel.length > 0 ? listaNivel : listaFallback)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if(!lista.length) return "";
  const i = Math.floor(Math.random()*lista.length);
  return lista[i];
}

const [nomePassageiro,setNomePassageiro] = useState("");
;

const [ruaOrigem,setRuaOrigem] = useState("");
const [numeroOrigem,setNumeroOrigem] = useState("");
const [bairroOrigem,setBairroOrigem] = useState("");
const [cidadeOrigem,setCidadeOrigem] = useState("");
const [estadoOrigem,setEstadoOrigem] = useState("");
const [ruaDestino,setRuaDestino] = useState("");
const [numeroDestino,setNumeroDestino] = useState("");
const [bairroDestino,setBairroDestino] = useState("");
const [cidadeDestino,setCidadeDestino] = useState("");
const [estadoDestino,setEstadoDestino] = useState("");
const inputStyle = {
  backgroundColor:"#111",
  color:"#fff",
  padding:15,
  borderRadius:10,
  marginBottom:12
};

type VoiceContext = "modo_comico" | "rota_critica" | "instrucao" | "erro_rota";
type AudioQueueItem = string | {
  texto: string;
  contexto: VoiceContext;
  motivo?: VoiceContext;
  criadoEm?: number;
  ehXingamento?: boolean;
  tentativasCustom?: number;
};

const ultimoComico = useRef(0);
const timerComico = useRef<ReturnType<typeof setTimeout> | null>(null);

const falandoRef = useRef(false);
const filaAudioRef = useRef<AudioQueueItem[]>([]);
const reproduzindoRef = useRef(false);
const contextoAudioAtualRef = useRef<VoiceContext | null>(null);

const modoComicoAtivoRef = useRef(false);
const executandoPiadaComicaRef = useRef(false);
const ultimoDisparoComicoRef = useRef(0);
const bloquearFallbackPorCustomRef = useRef(false);
const falhasCustomConsecutivasRef = useRef(0);
const customCircuitBreakAteRef = useRef(0);
const ultimoAudioFingerprintRef = useRef("");
const ultimoAudioTextoRef = useRef("");
const ultimaInstrucaoRef = useRef("");
const landingInicialPorPlanoAplicadoRef = useRef(false);
const mapInicializadoRef = useRef(false);
const ultimaPiada = useRef("");
const historicoPiadasRef = useRef<string[]>([]);
const piadasJaContadasRef = useRef<Set<string>>(new Set());
const historicoChegadaDestinoRef = useRef<string[]>([]);
const chegadaDestinoFaladaRef = useRef(false);
const tempoParado = useRef<number | null>(null);
const ultimoRecalculo = useRef(0);
const [valorOferta,setValorOferta] = useState("");
const ultimoStepPreAvisadoRef = useRef(-1);
const ultimoStepCurvaFaladoRef = useRef(-1);
const stepMonitoradoRef = useRef(-1);
const stepMuitoLongeCountRef = useRef(0);
const foraRotaCountRef = useRef(0);
const ultimoXingamentoForaRotaRef = useRef(0);
const xingamentosNoEventoForaRotaRef = useRef(0);
const forcarProximosNivel4Ref = useRef(0);
const recalculandoRotaRef = useRef(false);
const silencioAposRecalculoRef = useRef(0);
const ultimoHeadingValidoRef = useRef(0);
const bottomSheetRef = useRef<any>(null);
const sheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ['18%', '45%', '70%'], []);
// ── Planos v2 ────────────────────────────────────────────────
const [planoAtual, setPlanoAtual] = useState<PlanoUsuario>("free");
const [assinatura, setAssinatura] = useState<AssinaturaUsuario | null>(null);
// Mantidos para compatibilidade com código legado que usa assinaturaAtiva/modoPro
const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
const [telaProVisivel, setTelaProVisivel] = useState(false);
// nivelMaxFree/nivelMaxPro mantidos como constantes legadas
const nivelMaxFree = 0;
const nivelMaxPro = 4;
const [nivelAtual, setNivelAtual] = useState(0);
const [reportPendente,setReportPendente] = useState(false);
const [publicando, setPublicando] = useState(false);
const [ofertas, setOfertas] = useState<Oferta[]>([]);
const [ofertasVisivel, setOfertasVisivel] = useState(false);
const [ofertaSelecionada, setOfertaSelecionada] = useState<Oferta | null>(null);
const [menuOfertasVisivel, setMenuOfertasVisivel] = useState(false);
const [mensagens,setMensagens] = useState<any[]>([])
const enviarMensagem = (ofertaId,texto)=>{

const novaMensagem={
id:Date.now().toString(),
ofertaId:ofertaId,
texto:texto,
usuario:usuarioId,
data:Date.now()
}

setMensagens(prev=>[...prev,novaMensagem])
}
const [tipoSelecionado,setTipoSelecionado] =
  useState<"entrega"|"carona_solicitada"|"carona_oferecida">("carona_solicitada");

const aceitarOferta = (oferta)=>{

setOfertas(prev =>
prev.map(o =>

o.id === oferta.id
? {...o, status:"aceita", aceitoPor:usuarioId}
: o

)
)

setOfertaSelecionada(oferta)
}
const [origemOferta,setOrigemOferta] = useState("");
const [destinoOferta,setDestinoOferta] = useState("");
const [tecladoAberto,setTecladoAberto] = useState(false);
const [usuarioId, setUsuarioId] = useState("");
const [usuarioAnonimoId, setUsuarioAnonimoId] = useState("");
const [authUid, setAuthUid] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authSenha, setAuthSenha] = useState("");
const [authEmailConfirmacao, setAuthEmailConfirmacao] = useState("");
const [authSenhaConfirmacao, setAuthSenhaConfirmacao] = useState("");
const [authSenhaVisivel, setAuthSenhaVisivel] = useState(false);
const [authSenhaConfirmacaoVisivel, setAuthSenhaConfirmacaoVisivel] = useState(false);
const [authNome, setAuthNome] = useState("");
const [authErro, setAuthErro] = useState("");
const [authCarregando, setAuthCarregando] = useState(true);
const [authProcessando, setAuthProcessando] = useState(false);
const [authModalVisivel, setAuthModalVisivel] = useState(false);
const [authModoCadastro, setAuthModoCadastro] = useState(false);
const [authMotivoBloqueio, setAuthMotivoBloqueio] = useState("");
const googleExtra = ((Constants as any)?.expoConfig?.extra || {}) as Record<string, any>;
const androidClientId = String((globalThis as any)?.process?.env?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleExtra?.googleAndroidClientId || "").trim();
const googleLoginDisponivel = false;
const entrarComGoogle = () => {
  Alert.alert("Login indisponível", "Login Google será ativado em uma próxima versão.");
};
useEffect(() => {
  if (!__DEV__) return;
  if (!androidClientId) {
    console.warn("GOOGLE_AUTH_ANDROID_CLIENT_ID não configurado; login Google permanece desativado.");
  }
}, [androidClientId]);
const [barraOfertas,setBarraOfertas] = useState(false);
const [abaOfertas,setAbaOfertas] = useState("procurar");
const [modoSelecionar,setModoSelecionar] = useState<"origem" | "destino" | null>(null);
const [chatVisivel,setChatVisivel] = useState(false);
const [chatMensagens,setChatMensagens] = useState<any[]>([]);
const [chatTexto,setChatTexto] = useState("");
const [chatOferta,setChatOferta] = useState<any>(null);
const [usuariosBloqueados, setUsuariosBloqueados] = useState<Record<string, number>>({});
const [usuariosQueMeBloquearam, setUsuariosQueMeBloquearam] = useState<Record<string, number>>({});
const [chatBloqueioManual, setChatBloqueioManual] = useState<{ outroId: string; euBloqueei: boolean; fuiBloqueado: boolean }>({
  outroId: "",
  euBloqueei: false,
  fuiBloqueado: false,
});
const spamHistoricoRef = useRef<Record<string, { texto: string; at: number; rajada: number }>>({});
const chatBloqueado = useMemo(
  () => (
    chatBloqueadoParaUsuario(chatOferta, chatMensagens, usuarioId)
    || chatBloqueioManual.euBloqueei
    || chatBloqueioManual.fuiBloqueado
    || chatFuiBloqueadoNoContexto(chatOferta, chatMensagens, usuarioId)
    || chatBloqueadoPorMimNoContexto(chatOferta, chatMensagens, usuarioId)
  ),
  [chatOferta, chatMensagens, usuarioId, chatBloqueioManual, usuariosBloqueados, usuariosQueMeBloquearam]
);
const [ofertaNotificacaoPendenteId, setOfertaNotificacaoPendenteId] = useState<string | null>(null);
const [abaAtiva, setAbaAtiva] = useState<"procurar" | "oferecer" | "viagens" | "mensagens" | "perfil" | null>(null);
const [usuarioPerfilAbertoId, setUsuarioPerfilAbertoId] = useState<string | null>(null);
const [perfilAtualMini, setPerfilAtualMini] = useState<{nome:string;foto:string}>({ nome:"", foto:"" });
const [rotaVisivel,setRotaVisivel] = useState(false);
const [rotaSelecionada,setRotaSelecionada] = useState<any[]>([]);
const [menuAberto,setMenuAberto] = useState(false);
const [modalDesistenciaVisivel, setModalDesistenciaVisivel] = useState(false);
const [motivoDesistencia, setMotivoDesistencia] = useState("");
const [desistenciaObrigatoria, setDesistenciaObrigatoria] = useState(false);
const [ofertaDesistenciaPendente, setOfertaDesistenciaPendente] = useState<any>(null);


// conversa count for badge
const [conversas, setConversas] = useState<any[]>([]);
const [conversasOcultasMeta, setConversasOcultasMeta] = useState<Record<string, number>>({});
const conversasOcultasSet = useMemo(
  () => new Set(Object.keys(conversasOcultasMeta).map((id)=>String(id))),
  [conversasOcultasMeta]
);
const [naoLidasTotal, setNaoLidasTotal] = useState(0);
const mensagensNotificadasRef = useRef<Set<string>>(new Set());
const conversasInicializadasRef = useRef(false);

const usuarioAutenticado = !!String(authUid || "").trim();

function mapearErroAuthMobile(error:any): string {
  const raw = String(error?.code || error?.message || "").toLowerCase();
  if(raw.includes("auth/invalid-email")) return "E-mail invalido.";
  if(raw.includes("auth/missing-password")) return "Informe a senha.";
  if(raw.includes("auth/weak-password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if(raw.includes("auth/email-already-in-use")) return "Este e-mail ja esta em uso.";
  if(raw.includes("auth/invalid-credential") || raw.includes("auth/wrong-password") || raw.includes("auth/user-not-found")) return "E-mail ou senha incorretos.";
  if(raw.includes("auth/network-request-failed")) return "Falha de rede. Verifique sua conexao.";
  return "Nao foi possivel autenticar agora.";
}

function abrirTelaLogin(motivo:string){
  setAuthMotivoBloqueio(String(motivo || "").trim());
  setAuthErro("");
  setAuthModalVisivel(true);
}

function exigirLoginParaAcao(motivo:string): boolean {
  if(usuarioAutenticado) return true;
  abrirTelaLogin(motivo);
  return false;
}

async function entrarComEmailSenha(){
  const email = String(authEmail || "").trim();
  const senha = String(authSenha || "");
  if(!email || !senha){
    setAuthErro("Informe e-mail e senha.");
    return;
  }

  setAuthProcessando(true);
  setAuthErro("");
  try{
    await signInWithEmailAndPassword(auth, email, senha);
    setAuthModalVisivel(false);
  }catch(error){
    setAuthErro(mapearErroAuthMobile(error));
  }finally{
    setAuthProcessando(false);
  }
}

async function cadastrarComEmailSenha(){
  const email = String(authEmail || "").trim();
  const emailConfirmacao = String(authEmailConfirmacao || "").trim();
  const senha = String(authSenha || "");
  const senhaConfirmacao = String(authSenhaConfirmacao || "");
  const nome = String(authNome || "").trim();

  if(!email || !emailConfirmacao || !senha || !senhaConfirmacao){
    setAuthErro("Preencha e confirme e-mail e senha.");
    return;
  }

  if(email !== emailConfirmacao){
    setAuthErro("Os e-mails nao coincidem.");
    return;
  }

  if(senha !== senhaConfirmacao){
    setAuthErro("As senhas nao coincidem.");
    return;
  }

  if(senha.length < 6){
    setAuthErro("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  setAuthProcessando(true);
  setAuthErro("");
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    if(nome){
      await updateProfile(cred.user, { displayName: nome });
    }

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid: cred.user.uid,
      email: String(cred.user.email || "").trim() || null,
      nome: nome || String(cred.user.displayName || "").trim(),
      foto: String(cred.user.photoURL || "").trim(),
      atualizadoEmCliente: Date.now(),
      atualizadoEm: serverTimestamp(),
    }, { merge: true });

    setAuthModalVisivel(false);
  }catch(error){
    setAuthErro(mapearErroAuthMobile(error));
  }finally{
    setAuthProcessando(false);
  }
}

async function sairContaAuth(){
  try{
    await signOut(auth);
  }catch(error){
    console.log("Erro ao sair da conta:", error);
  }
}

function normalizarMapaBloqueio(valor: any): Record<string, number> {
  if (!valor || typeof valor !== "object") return {};
  return Object.keys(valor).reduce((acc: Record<string, number>, id: string) => {
    const chave = String(id || "").trim();
    if (!chave) return acc;
    const ts = Number((valor as any)[id]);
    acc[chave] = Number.isFinite(ts) ? ts : Date.now();
    return acc;
  }, {});
}
function obterOutroUsuarioChat(oferta: any, mensagens: any[], uid: string): string {
  const eu = String(uid || "").trim();
  const lista = Array.isArray(mensagens) ? mensagens : [];

  const candidatoMensagem = lista
    .flatMap((m: any) => [m?.autor, m?.solicitanteId, m?.destinatarioId])
    .map((id: any) => String(id || "").trim())
    .find((id: string) => !!id && id !== eu);

  const criador = String(oferta?.criadorId || "").trim();
  if (criador && criador !== eu) return criador;

  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes
    : (Array.isArray(oferta?.solicitantes) ? oferta.solicitantes : []);

  const solicitante = solicitacoes
    .map((id: any) => String(id || "").trim())
    .find((id: string) => !!id && id !== eu);
  if (solicitante) return solicitante;

  const aceitaPor = String(oferta?.aceitaPor || "").trim();
  if (aceitaPor && aceitaPor !== eu) return aceitaPor;

  return "";
}

function obterParticipantesChat(oferta: any, mensagens: any[], uid: string): string[] {
  const eu = String(uid || "").trim();
  const ids = new Set<string>();

  const lista = Array.isArray(mensagens) ? mensagens : [];
  lista.forEach((m: any) => {
    [m?.autor, m?.solicitanteId, m?.destinatarioId].forEach((id: any) => {
      const v = String(id || "").trim();
      if (v) ids.add(v);
    });
  });

  [oferta?.criadorId, oferta?.aceitaPor].forEach((id: any) => {
    const v = String(id || "").trim();
    if (v) ids.add(v);
  });

  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes
    : (Array.isArray(oferta?.solicitantes) ? oferta.solicitantes : []);
  solicitacoes.forEach((id: any) => {
    const v = String(id || "").trim();
    if (v) ids.add(v);
  });

  const reservas = Array.isArray(oferta?.reservas) ? oferta.reservas : [];
  reservas.forEach((r: any) => {
    const v = String(r?.passageiroId || r?.usuarioId || "").trim();
    if (v) ids.add(v);
  });

  ids.delete(eu);
  return Array.from(ids);
}

function chatBloqueadoPorMimNoContexto(oferta: any, mensagens: any[], uid: string): boolean {
  const participantes = obterParticipantesChat(oferta, mensagens, uid);
  return participantes.some((id) => !!usuariosBloqueados[String(id)]);
}

function chatFuiBloqueadoNoContexto(oferta: any, mensagens: any[], uid: string): boolean {
  const participantes = obterParticipantesChat(oferta, mensagens, uid);
  return participantes.some((id) => !!usuariosQueMeBloquearam[String(id)]);
}

function usuarioBloqueadoPorMim(outroId: any): boolean {
  const id = String(outroId || "").trim();
  if (!id) return false;
  return !!usuariosBloqueados[id];
}

async function usuarioMeBloqueou(outroId: any): Promise<boolean> {
  const id = String(outroId || "").trim();
  if (!id || !usuarioId) return false;
  try {
    const docId = `${String(id)}__${String(usuarioId)}`;
    const snap = await getDoc(doc(db, "blockedUsers", docId));
    return snap.exists();
  } catch {
    return false;
  }
}

async function sincronizarBloqueioChatAtual(oferta: any, mensagens: any[] = []) {
  const uidAtual = String(usuarioId || "");
  const outroPreferido = obterOutroUsuarioChat(oferta, mensagens, uidAtual);
  const participantes = obterParticipantesChat(oferta, mensagens, uidAtual);
  const candidatos = Array.from(new Set([
    String(outroPreferido || "").trim(),
    ...participantes.map((id) => String(id || "").trim()),
  ].filter(Boolean)));

  const idBloqueadoPorMim = candidatos.find((id) => usuarioBloqueadoPorMim(id)) || "";

  let idQueMeBloqueou = candidatos.find((id) => !!usuariosQueMeBloquearam[String(id)]) || "";
  if (!idQueMeBloqueou) {
    for (const id of candidatos) {
      const bloqueou = await usuarioMeBloqueou(id);
      if (bloqueou) {
        idQueMeBloqueou = id;
        break;
      }
    }
  }

  const euBloqueei = !!idBloqueadoPorMim;
  const fuiBloqueado = !!idQueMeBloqueou;
  const outroId = idBloqueadoPorMim || idQueMeBloqueou || String(outroPreferido || "").trim();
  const estado = { outroId, euBloqueei, fuiBloqueado };
  setChatBloqueioManual(estado);
  return estado;
}

function avaliarModeracaoMensagemTexto(textoBruto: string, ofertaId: string) {
  const texto = String(textoBruto || "").trim();
  if (!texto) return { bloquear: false, ocultar: false, motivo: "" };

  const normalizado = texto.toLowerCase().replace(/\s+/g, " ").trim();
  const possuiLink = /(https?:\/\/|www\.)/i.test(texto);
  const linkSuspeito = /(bit\.ly|tinyurl|t\.co|grabify|rebrand\.ly|discord\.gift|free\-nitro)/i.test(texto);
  if (possuiLink && linkSuspeito) {
    return { bloquear: true, ocultar: false, motivo: "link_suspeito" };
  }

  const termosProibidos = [
    "nudez",
    "conteudo ilegal",
    "ameaça",
    "ameaças",
    "gore",
    "pedofilia",
    "cp",
  ];
  if (termosProibidos.some((termo) => normalizado.includes(termo))) {
    return { bloquear: true, ocultar: false, motivo: "termo_proibido" };
  }

  const chave = `${String(usuarioId || "anon")}::${String(ofertaId || "oferta")}`;
  const agora = Date.now();
  const historico = spamHistoricoRef.current[chave] || { texto: "", at: 0, rajada: 0 };

  const repeticaoCurta = historico.texto && historico.texto === normalizado && (agora - historico.at) <= 45000;
  let rajadaAtual = historico.rajada;
  if ((agora - historico.at) <= 7000) {
    rajadaAtual += 1;
  } else {
    rajadaAtual = 1;
  }

  spamHistoricoRef.current[chave] = {
    texto: normalizado,
    at: agora,
    rajada: rajadaAtual,
  };

  const minhasRecentes = (Array.isArray(chatMensagens) ? chatMensagens : [])
    .slice(-5)
    .filter((m: any) => String(m?.autor || "") === String(usuarioId || ""));
  const excessoSeguidas = minhasRecentes.length >= 4;

  if (repeticaoCurta || rajadaAtual >= 5 || excessoSeguidas) {
    return { bloquear: false, ocultar: true, motivo: repeticaoCurta ? "spam_repetitivo" : "excesso_mensagens" };
  }

  return { bloquear: false, ocultar: false, motivo: "" };
}

function resumoMensagemNotificacao(dados:any){
  const tipo = String(dados?.tipo || "texto");
  const texto = typeof dados?.texto === "string"
    ? dados.texto.trim()
    : String(dados?.texto?.texto || dados?.texto || "").trim();

  if(tipo === "imagem") return texto || "Imagem recebida";
  if(tipo === "audio") return texto || "Audio recebido";
  if(tipo === "localizacao") return texto || "Localizacao compartilhada";
  if(String(dados?.acao || "") === "solicitacao_aceite") return texto || "Nova solicitacao recebida";
  if(String(dados?.acao || "") === "solicitacao_resposta") return texto || "Sua solicitacao teve resposta";
  return texto || "Nova mensagem";
}

function persistirConversasOcultas(meta:Record<string, number>){
  if(!usuarioId) return;
  AsyncStorage.setItem(`conversas_ocultas_${String(usuarioId)}`, JSON.stringify(meta)).catch((error)=>{
    console.log("Erro ao salvar conversas ocultas:", error);
  });
}

useEffect(()=>{

  setFirestoreDebugUid(String(usuarioId || ""));

  let ativo = true;

  async function carregarConversasOcultas(){
    if(!usuarioId){
      if(ativo) setConversasOcultasMeta({});
      return;
    }

    try{
      const chave = `conversas_ocultas_${String(usuarioId)}`;
      const salvo = await AsyncStorage.getItem(chave);
      const lista = salvo ? JSON.parse(salvo) : {};
      let normalizado:Record<string, number> = {};

      if(Array.isArray(lista)){
        normalizado = lista.reduce((acc:Record<string, number>, id:any)=>{
          const idStr = String(id || "").trim();
          if(idStr) acc[idStr] = 0;
          return acc;
        }, {});
      }else if(lista && typeof lista === "object"){
        normalizado = Object.keys(lista).reduce((acc:Record<string, number>, id:string)=>{
          const idStr = String(id || "").trim();
          if(!idStr) return acc;
          const ts = Number((lista as any)[id]);
          acc[idStr] = Number.isFinite(ts) ? ts : 0;
          return acc;
        }, {});
      }

      if(ativo) setConversasOcultasMeta(normalizado);
    }catch(error){
      console.log("Erro ao carregar conversas ocultas:", error);
      if(ativo) setConversasOcultasMeta({});
    }
  }

  carregarConversasOcultas();

  return ()=>{
    ativo = false;
  };
},[usuarioId]);

useEffect(()=>{
  if(!usuarioId) return;

  const qBloqueios = query(
    collection(db, "blockedUsers"),
    where("blockerId", "==", String(usuarioId))
  );

  const unsubscribe = onSnapshot(qBloqueios, (snapshot)=>{
    const mapa:Record<string, number> = {};
    snapshot.forEach((item)=>{
      const dados:any = item.data() || {};
      const blockedId = String(dados?.blockedId || "").trim();
      if(!blockedId) return;

      const criado = dados?.createdAt;
      const createdAtMs = criado && typeof criado?.toMillis === "function"
        ? Number(criado.toMillis())
        : Date.now();

      mapa[blockedId] = createdAtMs;
    });
    setUsuariosBloqueados(mapa);
  }, ()=>{
    setUsuariosBloqueados({});
  });

  return ()=>unsubscribe();
}, [usuarioId]);

useEffect(()=>{
  if(!usuarioId) return;

  const qBloqueiosContraMim = query(
    collection(db, "blockedUsers"),
    where("blockedId", "==", String(usuarioId))
  );

  const unsubscribe = onSnapshot(qBloqueiosContraMim, (snapshot)=>{
    const mapa:Record<string, number> = {};
    snapshot.forEach((item)=>{
      const dados:any = item.data() || {};
      const blockerId = String(dados?.blockerId || "").trim();
      if(!blockerId) return;

      const criado = dados?.createdAt;
      const createdAtMs = criado && typeof criado?.toMillis === "function"
        ? Number(criado.toMillis())
        : Date.now();

      mapa[blockerId] = createdAtMs;
    });
    setUsuariosQueMeBloquearam(mapa);
  }, ()=>{
    setUsuariosQueMeBloquearam({});
  });

  return ()=>unsubscribe();
}, [usuarioId]);

useEffect(()=>{
  Notifications.requestPermissionsAsync().catch((error)=>{
    console.log("Erro ao pedir permissao de notificacao:", error);
  });
},[]);

useEffect(()=>{
  function tratarRespostaNotificacao(response:any){
    const ofertaId = String(response?.notification?.request?.content?.data?.ofertaId || "").trim();
    if(!ofertaId) return;
    setOfertaNotificacaoPendenteId(ofertaId);
  }

  const subscription = Notifications.addNotificationResponseReceivedListener((response)=>{
    tratarRespostaNotificacao(response);
  });

  Notifications.getLastNotificationResponseAsync()
    .then((response)=>{
      if(!response) return;
      tratarRespostaNotificacao(response);
      Notifications.clearLastNotificationResponseAsync().catch(()=>{});
    })
    .catch((error)=>console.log("Erro ao recuperar resposta de notificacao:", error));

  return ()=>{
    subscription.remove();
  };
},[]);

useEffect(()=>{
  Notifications.setBadgeCountAsync(Number(naoLidasTotal || 0)).catch((error)=>{
    console.log("Erro ao atualizar badge:", error);
  });
},[naoLidasTotal]);

useEffect(()=>{
  if(!ofertaNotificacaoPendenteId) return;

  const oferta = ofertas.find((item:any)=>String(item?.id || "") === String(ofertaNotificacaoPendenteId));
  if(!oferta) return;

  setOfertaNotificacaoPendenteId(null);
  setMenuOfertasVisivel(false);
  setAbaAtiva(null);
  setChatOferta(oferta);
  setChatVisivel(true);
},[ofertaNotificacaoPendenteId, ofertas]);

useEffect(()=>{

function usuarioParticipaOferta(oferta:any, uid:any){
  const id = String(uid || "").trim();
  if(!id || !oferta) return false;

  if(String(oferta?.criadorId || "") === id) return true;
  if(String(oferta?.aceitaPor || "") === id) return true;

  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes.map((s:any)=>String(s))
    : (Array.isArray(oferta?.solicitantes)
      ? oferta.solicitantes.map((s:any)=>String(s))
      : []);

  if(solicitacoes.includes(id)) return true;

  const reservas = Array.isArray(oferta?.reservas) ? oferta.reservas : [];
  const estaReservado = reservas.some((r:any)=>{
    const reservaUsuarioId = String(r?.passageiroId || r?.usuarioId || "").trim();
    const statusReserva = String(r?.status || "").trim().toLowerCase();
    if(!reservaUsuarioId || reservaUsuarioId !== id) return false;
    return statusReserva !== "cancelada";
  });

  return estaReservado;
}

function mensagemEhVisivelParaUsuario(mensagem:any, oferta:any, uid:any){
  const id = String(uid || "").trim();
  if(!id || !mensagem || !oferta) return false;

  if(mensagem?.deletedByAdmin) return false;
  if(mensagem?.hiddenByModeration && String(mensagem?.autor || "") !== id) return false;

  const autorId = String(mensagem?.autor || "").trim();
  const bloqueadosAutor = normalizarMapaBloqueio(mensagem?.blockedForAuthor || {});
  if(!!bloqueadosAutor[id]) return false;
  const solicitanteId = String(mensagem?.solicitanteId || "").trim();
  const destinatarioId = String(mensagem?.destinatarioId || "").trim();
  const acao = String(mensagem?.acao || "").trim();

  if(autorId === id) return true;
  if(String(oferta?.criadorId || "") === id) return true;

  if(destinatarioId){
    return destinatarioId === id;
  }

  if(acao === "solicitacao_aceite" || acao === "solicitacao_resposta"){
    return solicitanteId === id;
  }

  if(solicitanteId && solicitanteId === id) return true;

  return usuarioParticipaOferta(oferta, id);
}

const q = query(collectionGroup(db,"mensagens"))

const unsubscribe = onSnapshot(q,(snapshot)=>{

const mapa = new Map()
const buckets = new Map<string, {
  oferta:any;
  involved:boolean;
  lastMessage:any;
  lastMessageId:string;
  unreadCount:number;
}>()
let totalNaoLidas = 0;

snapshot.forEach((doc)=>{

const dados:any = doc.data()

if(!dados.ofertaId) return;

const oferta = ofertas.find(o=>o.id === dados.ofertaId)

if(!oferta) return;
if(!mensagemEhVisivelParaUsuario(dados, oferta, usuarioId)) return;

const ofertaId = String(dados.ofertaId || "");
if(conversasOcultasSet.has(ofertaId)){
  const ocultadaEm = Number(conversasOcultasMeta[ofertaId] || 0);
  const criadoEm = Number(dados?.criadoEm || 0);
  const mensagemDeOutroUsuario = String(dados?.autor || "") !== String(usuarioId);
  // Só mostra na lista mensagens do outro usuário enviadas DEPOIS da exclusão
  if(!(mensagemDeOutroUsuario && criadoEm > ocultadaEm)){
    return;
  }
}
const bucketAtual = buckets.get(ofertaId) || {
  oferta,
  involved:false,
  lastMessage:null,
  lastMessageId:"",
  unreadCount:0
};

bucketAtual.involved = true;
bucketAtual.oferta = oferta;

if(
  !bucketAtual.lastMessage ||
  Number(dados?.criadoEm || 0) > Number(bucketAtual.lastMessage?.criadoEm || 0) ||
  (
    Number(dados?.criadoEm || 0) === Number(bucketAtual.lastMessage?.criadoEm || 0) &&
    String(doc.id || "") > String(bucketAtual.lastMessageId || "")
  )
){
  bucketAtual.lastMessage = dados;
  bucketAtual.lastMessageId = String(doc.id || "");
}

const lidoPorNormalizado = Array.isArray(dados?.lidoPor)
  ? dados.lidoPor.map((id:any)=>String(id))
  : [];
const naoLida = String(dados?.autor || "") !== String(usuarioId) && !lidoPorNormalizado.includes(String(usuarioId));
const mensagemKey = `${ofertaId}:${String(doc.id)}`;

if(bucketAtual.involved && naoLida){
  bucketAtual.unreadCount = Number(bucketAtual.unreadCount || 0) + 1;

  totalNaoLidas += 1;

  const chatAbertoNestaOferta = chatVisivel && String(chatOferta?.id || "") === ofertaId;
  const ehSolicitacaoRecente =
    String(dados?.acao || "") === "solicitacao_aceite" &&
    Number.isFinite(Number(dados?.criadoEm || 0)) &&
    (Date.now() - Number(dados?.criadoEm || 0)) <= 90000;

  if((conversasInicializadasRef.current || ehSolicitacaoRecente) && !chatAbertoNestaOferta && !mensagensNotificadasRef.current.has(mensagemKey)){
    mensagensNotificadasRef.current.add(mensagemKey);
    const ehMensagemDoCriador =
      String(dados?.acao || "") !== "solicitacao_aceite" &&
      String(dados?.autor || "") === String(oferta?.criadorId || "") &&
      String(usuarioId || "") !== String(oferta?.criadorId || "");

    // Vibração para todos os tipos de mensagem nova
    Vibration.vibrate(ehMensagemDoCriador ? [0, 140, 80, 180] : [0, 80]);

    // Som in-app apenas se oferta está próxima (não toca para ofertas distantes)
    (async () => {
      try {
        const lat = Number(oferta?.origem?.lat);
        const lng = Number(oferta?.origem?.lng);
        if(!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        
        const raioKm = Number(raioNotificacaoKm || 0);
        if(!Number.isFinite(raioKm) || raioKm <= 0) return;
        
        let posicao:any = null;
        try{
          posicao = await Location.getLastKnownPositionAsync();
          if(!posicao){
            posicao = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
          }
        }catch(error){
          return;
        }
        
        const userLat = Number(posicao?.coords?.latitude);
        const userLng = Number(posicao?.coords?.longitude);
        if(!Number.isFinite(userLat) || !Number.isFinite(userLng)) return;
        
        const distanciaM = getDistanciaMetros(userLat, userLng, lat, lng);
        if(Number.isFinite(distanciaM) && distanciaM <= raioKm * 1000) {
          tocarSomMoeda().catch(()=>{});
        }
      }catch(error){
        // silenciar erro
      }
    })();

    Notifications.scheduleNotificationAsync({
      content: {
        title: String(dados?.acao || "") === "solicitacao_aceite"
          ? "Nova solicitacao"
          : ehMensagemDoCriador
            ? "Mensagem do criador"
            : "Nova mensagem",
        body: resumoMensagemNotificacao(dados),
        sound: "default",
        data: {
          ofertaId,
          tipo: ehMensagemDoCriador ? "mensagem_criador" : "mensagem"
        }
      },
      trigger: null
    }).catch((error)=>console.log("Erro ao notificar mensagem:", error));
  }
}

buckets.set(ofertaId, bucketAtual);

})

buckets.forEach((bucket, ofertaId)=>{
  if(!bucket.involved || !bucket.lastMessage) return;
  mapa.set(ofertaId, {
    oferta: bucket.oferta,
    lastMessage: bucket.lastMessage,
    unreadCount: Number(bucket.unreadCount || 0)
  });
})

setConversas(Array.from(mapa.values()))
setNaoLidasTotal(totalNaoLidas)
conversasInicializadasRef.current = true;

})

return ()=>unsubscribe()

},[ofertas,usuarioId,chatVisivel,chatOferta?.id,conversasOcultasSet,conversasOcultasMeta,usuariosBloqueados])

useEffect(()=>{

  if(!chatOferta || !chatVisivel) return;

const q = query(
collection(db,"ofertas",chatOferta.id,"mensagens"),
orderBy("criadoEm","asc")
);

const unsubscribe = onSnapshot(q,(snapshot)=>{

const lista:any[] = []
const ocultadaEm = Number(conversasOcultasMeta[String(chatOferta?.id || "")] || 0);

const usuarioIdAtual = String(usuarioId || "").trim();
const criadorIdOferta = String(chatOferta?.criadorId || "").trim();

function mensagemEhVisivelNoChat(dadosMsg:any){
  if(!usuarioIdAtual) return false;

  if(dadosMsg?.deletedByAdmin) return false;
  if(dadosMsg?.hiddenByModeration && String(dadosMsg?.autor || "") !== usuarioIdAtual) return false;

  const autorId = String(dadosMsg?.autor || "").trim();
  const bloqueadosAutor = normalizarMapaBloqueio(dadosMsg?.blockedForAuthor || {});
  if(!!bloqueadosAutor[usuarioIdAtual]) return false;
  const solicitanteId = String(dadosMsg?.solicitanteId || "").trim();
  const destinatarioId = String(dadosMsg?.destinatarioId || "").trim();
  const acao = String(dadosMsg?.acao || "").trim();

  if(autorId === usuarioIdAtual) return true;
  if(criadorIdOferta && criadorIdOferta === usuarioIdAtual) return true;

  if(destinatarioId){
    return destinatarioId === usuarioIdAtual;
  }

  if(acao === "solicitacao_aceite" || acao === "solicitacao_resposta"){
    return solicitanteId === usuarioIdAtual;
  }

  if(solicitanteId && solicitanteId === usuarioIdAtual) return true;

  return usuarioTemVinculoComCriadorDaOferta(chatOferta, usuarioIdAtual);
}

snapshot.forEach((doc)=>{
const dadosMsg:any = doc.data();
// Esconder para o usuário que excluiu mensagens anteriores ao momento da exclusão
if(ocultadaEm > 0 && Number(dadosMsg?.criadoEm || 0) < ocultadaEm) return;
if(!mensagemEhVisivelNoChat(dadosMsg)) return;
lista.push({
id:doc.id,
...dadosMsg
})

})

setChatMensagens(lista)

snapshot.forEach((mensagemDoc)=>{
  const dados:any = mensagemDoc.data();
  if(!mensagemEhVisivelNoChat(dados)) return;
  const lidoPorNormalizado = Array.isArray(dados?.lidoPor)
    ? dados.lidoPor.map((id:any)=>String(id))
    : [];

  if(String(dados?.autor || "") === String(usuarioId)) return;
  if(lidoPorNormalizado.includes(String(usuarioId))) return;

  updateDoc(mensagemDoc.ref, {
    lidoPor:[...lidoPorNormalizado, usuarioId]
  }).catch((error)=>console.log("Erro ao marcar mensagem como lida:", error));
})

})

return ()=>unsubscribe()

},[chatOferta, chatVisivel, usuarioId, conversasOcultasMeta, usuariosBloqueados])

useEffect(()=>{
  if(!chatVisivel || !chatOferta) {
    setChatBloqueioManual({ outroId: "", euBloqueei: false, fuiBloqueado: false });
    return;
  }

  sincronizarBloqueioChatAtual(chatOferta, chatMensagens).catch(()=>{
    setChatBloqueioManual({ outroId: "", euBloqueei: false, fuiBloqueado: false });
  });
}, [chatVisivel, chatOferta, chatMensagens, usuariosBloqueados, usuariosQueMeBloquearam]);

useEffect(()=>{
  if(!chatOferta?.id) return;

  const ofertaAtualizada = ofertas.find((item:any)=>String(item?.id) === String(chatOferta?.id));

  if(!ofertaAtualizada){
    setChatVisivel(false);
    setChatOferta(null);
    return;
  }

  setChatOferta(ofertaAtualizada);
}, [ofertas, chatOferta?.id])

const [tipoCriacao, setTipoCriacao] = useState<
  "entrega" | "carona_solicitada" | "carona_oferecida" | null
>(null);


const [descricaoObjeto, setDescricaoObjeto] = useState("");
async function criarOfertaNova(novaOferta){
  if(!exigirLoginParaAcao("Faca login para criar oferta.")) throw new Error("Login necessario");
  if(!usuarioId) throw new Error("usuarioId indisponivel");

  console.log("OFERTA RECEBIDA:", novaOferta)

  const ofertaCriada = await addDoc(collection(db,"ofertas"), {
    ...novaOferta,
    criadorId: usuarioId,
    criadorNome: usuarioId,
    criadoEm: Date.now(),
    status: "ativa"
  });

  // Feedback imediato para quem criou a oferta.
  await tocarSomMoeda();

  return ofertaCriada;
}

async function atualizarOfertaExistente(ofertaId:string, novaOferta:any){
  if(!ofertaId) return;

  await updateDoc(doc(db,"ofertas",ofertaId), {
    ...novaOferta,
    atualizadoEm: Date.now()
  });
}

function usuarioTemSolicitacaoAtivaNaOferta(oferta:any, uid:any): boolean {
  const id = String(uid || "").trim();
  if(!id || !oferta) return false;

  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes.map((s:any)=>String(s).trim()).filter(Boolean)
    : (Array.isArray(oferta?.solicitantes)
      ? oferta.solicitantes.map((s:any)=>String(s).trim()).filter(Boolean)
      : []);

  return solicitacoes.includes(id);
}

function usuarioFoiRecusadoNaOferta(oferta:any, mensagens:any[], uid:any): boolean {
  const id = String(uid || "").trim();
  if(!id || !oferta) return false;

  if(String(oferta?.criadorId || "").trim() === id) return false;
  if(String(oferta?.aceitaPor || "").trim() === id) return false;
  if(usuarioTemSolicitacaoAtivaNaOferta(oferta, id)) return false;

  const lista = Array.isArray(mensagens) ? mensagens : [];
  return lista.some((msg:any)=>{
    const status = String(msg?.statusSolicitacao || "").trim().toLowerCase();
    if(status !== "recusada") return false;

    const solicitanteId = String(msg?.solicitanteId || msg?.autor || "").trim();
    if(solicitanteId !== id) return false;

    const destinatarioId = String(msg?.destinatarioId || "").trim();
    if(destinatarioId && destinatarioId !== id) return false;

    return true;
  });
}

function chatBloqueadoParaUsuario(oferta:any, mensagens:any[], uid:any): boolean {
  if(!oferta || !uid) return false;

  const status = String(oferta?.status || "").trim().toLowerCase();
  if(status === "cancelada" || status === "finalizada") return true;

  return usuarioFoiRecusadoNaOferta(oferta, mensagens, uid);
}

function parseDataHoraOferta(oferta:any): Date | null {
  const data = String(oferta?.dataSaida || "").trim();
  const hora = String(oferta?.horarioSaida || "").trim();
  const matchDataBr = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const matchDataIso = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const matchHora = hora.match(/^(\d{1,2}):(\d{2})$/);

  if(!matchHora) return null;
  const hh = Number(matchHora[1]);
  const mm = Number(matchHora[2]);

  if(matchDataBr){
    const dia = Number(matchDataBr[1]);
    const mes = Number(matchDataBr[2]) - 1;
    const ano = Number(matchDataBr[3]);
    return new Date(ano, mes, dia, hh, mm, 0, 0);
  }

  if(matchDataIso){
    const ano = Number(matchDataIso[1]);
    const mes = Number(matchDataIso[2]) - 1;
    const dia = Number(matchDataIso[3]);
    return new Date(ano, mes, dia, hh, mm, 0, 0);
  }

  return null;
}

function horasParaInicioOferta(oferta:any): number | null {
  const inicio = parseDataHoraOferta(oferta);
  if(!inicio) return null;
  return (inicio.getTime() - Date.now()) / (1000 * 60 * 60);
}

async function enviarMensagemSistemaOferta(oferta:any, texto:string, extra:any = {}){
  const ofertaId = String(oferta?.id || "");
  if(!ofertaId || !texto) return;

  await addDoc(collection(db,"ofertas",ofertaId,"mensagens"), {
    tipo:"texto",
    texto,
    autor:usuarioId,
    ofertaId,
    criadoEm:Date.now(),
    lidoPor:[usuarioId],
    reported:false,
    hiddenByModeration:false,
    moderated:false,
    deletedByAdmin:false,
    ...extra
  });
}

function participantesOfertaCarona(oferta:any): Array<{id:string;nome:string}>{
  const ids = new Set<string>();
  const participantes:Array<{id:string;nome:string}> = [];

  (oferta?.reservas || [])
    .filter((r:any)=>String(r?.status || "") !== "cancelada")
    .forEach((r:any)=>{
      const id = String(r?.passageiroId || r?.usuarioId || "").trim();
      if(!id || ids.has(id)) return;
      ids.add(id);
      participantes.push({
        id,
        nome:String(r?.passageiroNome || id)
      });
    });

  return participantes;
}

function usuarioTemVinculoComCriadorDaOferta(oferta:any, uid:any): boolean {
  const id = String(uid || "").trim();
  const criadorId = String(oferta?.criadorId || "").trim();

  if(!id || !criadorId || id === criadorId || !oferta) return false;

  if(String(oferta?.aceitaPor || "").trim() === id) return true;

  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes.map((s:any)=>String(s).trim()).filter(Boolean)
    : (Array.isArray(oferta?.solicitantes)
      ? oferta.solicitantes.map((s:any)=>String(s).trim()).filter(Boolean)
      : []);

  if(solicitacoes.includes(id)) return true;

  const reservas = Array.isArray(oferta?.reservas) ? oferta.reservas : [];
  return reservas.some((r:any)=>{
    const reservaUsuarioId = String(r?.passageiroId || r?.usuarioId || "").trim();
    const statusReserva = String(r?.status || "").trim().toLowerCase();
    if(!reservaUsuarioId || reservaUsuarioId !== id) return false;
    return statusReserva !== "cancelada";
  });
}

async function efetivarDesistenciaOferta(oferta:any, motivoInformado?:string){
  const ofertaId = String(oferta?.id || "");
  if(!ofertaId) return;

  const motivo = String(motivoInformado || "").trim();
  const horasParaInicio = horasParaInicioOferta(oferta);
  const desistiuEmCimaDaHora = horasParaInicio !== null && horasParaInicio <= 2;
  const textoMotivo = motivo ? ` Motivo: ${motivo}` : "";

  if(String(oferta?.criadorId || "") !== String(usuarioId)){
    await updateDoc(doc(db,"ofertas",ofertaId), {
      status:"ativa",
      aceitaPor:null,
      aceitaPorNome:null,
      motivoCancelamento: motivo || null,
      cancelamentoEmCimaDaHora: desistiuEmCimaDaHora,
      atualizadoEm:Date.now()
    });

    await enviarMensagemSistemaOferta(
      oferta,
      String(oferta?.tipo || "").includes("entrega")
        ? `O solicitante desistiu de entregar o objeto.${textoMotivo}`
        : `O solicitante desistiu de fazer a viagem.${textoMotivo}`,
      {
        acao:"desistencia_solicitante",
        destinatarioId:String(oferta?.criadorId || "")
      }
    );

    return;
  }

  await updateDoc(doc(db,"ofertas",ofertaId), {
    status:"cancelada",
    motivoCancelamento: motivo || null,
    cancelamentoEmCimaDaHora: desistiuEmCimaDaHora,
    atualizadoEm:Date.now()
  });

  await enviarMensagemSistemaOferta(
    oferta,
    `Oferta cancelada pelo criador.${textoMotivo}`,
    { acao:"cancelamento_criador" }
  );
}

// ===============================
// �x� FUN�!�"ES DE CHAT / OFERTA
// ===============================
function openChat(oferta:any){
  if(!exigirLoginParaAcao("Faca login para abrir o chat.")) return;
  // Não limpa conversasOcultasMeta ao abrir — o filtro de mensagens antigas persiste
  setChatOferta(oferta);
  setChatVisivel(true);
}

function openRoute(oferta:any){
  setOfertaSelecionada(oferta);
  setRotaVisivel(true);
}

async function excluirMensagem(mensagem:any, apenasParaMim:boolean = false){
  const ofertaId = String(chatOferta?.id || mensagem?.ofertaId || "").trim();
  const mensagemId = String(mensagem?.id || "").trim();

  if(!ofertaId || !mensagemId){
    setChatMensagens(prev => prev.filter((m:any) => String(m?.id || "") !== mensagemId));
    return;
  }

  // Se apagar apenas para mim, adiciona usuarioId ao array apagadoPara
  if(apenasParaMim){
    const apagadoParaAtual = Array.isArray(mensagem?.apagadoPara) ? [...mensagem.apagadoPara] : [];
    const usuarioIdStr = String(usuarioId || "");
    
    if(!apagadoParaAtual.includes(usuarioIdStr)){
      apagadoParaAtual.push(usuarioIdStr);
    }

    const patchParaMim = {
      apagadoPara: apagadoParaAtual,
      apagadoParaMimEm: Date.now()
    };

    setChatMensagens((prev:any[]) =>
      prev.filter((m:any) => String(m?.id || "") !== mensagemId)
    );

    try{
      await updateDoc(doc(db,"ofertas",ofertaId,"mensagens",mensagemId), patchParaMim);
    }catch(error){
      console.log("Erro ao marcar mensagem como apagada para mim:", error);
    }
    return;
  }

  // Apagar para todos (soft delete global)
  const patch = {
    apagada:true,
    tipo:"apagada",
    texto:"mensagem apagada",
    mediaUrl:null,
    duracaoMs:null,
    latitude:null,
    longitude:null,
    acao:null,
    statusSolicitacao:null,
    solicitanteId:null,
    apagadaEm:Date.now(),
    apagadaPor:String(usuarioId || "")
  };

  setChatMensagens((prev:any[]) =>
    prev.map((m:any)=>String(m?.id || "") === mensagemId ? { ...m, ...patch } : m)
  );

  try{
    await updateDoc(doc(db,"ofertas",ofertaId,"mensagens",mensagemId), patch);
  }catch(error){
    console.log("Erro ao marcar mensagem como apagada:", error);
  }
}

async function solicitarAceite(oferta:any){
  const ofertaId = String(oferta?.id || "");
  if(!exigirLoginParaAcao("Faca login para solicitar carona/entrega.")) return;
  if(!ofertaId || !usuarioId) return;

  const bloqueioAtual = await sincronizarBloqueioChatAtual(oferta, []);
  if(bloqueioAtual.euBloqueei || bloqueioAtual.fuiBloqueado){
    Alert.alert(
      "Solicitação indisponível",
      bloqueioAtual.fuiBloqueado
        ? "Você foi bloqueado por este usuário."
        : "Você bloqueou este usuário. Desbloqueie para continuar."
    );
    return;
  }

  const solicitacoesAtuais = Array.isArray((oferta as any)?.solicitacoes)
    ? (oferta as any).solicitacoes.map((id:any)=>String(id))
    : (Array.isArray((oferta as any)?.solicitantes)
        ? (oferta as any).solicitantes.map((id:any)=>String(id))
        : []);

  if(solicitacoesAtuais.includes(String(usuarioId))){
    if(usuarioEhPro()){
      openChat(oferta);
    }
    return;
  }

  if(solicitacoesAtuais.length > 0 && !solicitacoesAtuais.includes(String(usuarioId))){
    Alert.alert(
      tComFallback("solicitacaoBloqueada", "Solicitação bloqueada"),
      tComFallback("ofertaSolicitacaoAnalise", "Esta oferta já possui uma solicitação em análise.")
    );
    return;
  }

  const textoSolicitacao = String(oferta?.tipo || "").includes("entrega")
    ? "Solicitei esta entrega."
    : "Solicitei esta oferta.";

  try{
    await updateDoc(doc(db,"ofertas",ofertaId), {
      solicitacoes: [...solicitacoesAtuais, usuarioId],
      atualizadoEm: Date.now()
    });

    await addDoc(collection(db,"ofertas",ofertaId,"mensagens"), {
      tipo:"texto",
      texto:textoSolicitacao,
      acao:"solicitacao_aceite",
      statusSolicitacao:"pendente",
      solicitanteId:usuarioId,
      destinatarioId:String(oferta?.criadorId || ""),
      solicitanteNome: perfilAtualMini.nome || usuarioId,
      autor:usuarioId,
      autorNome: perfilAtualMini.nome || usuarioId,
      autorFoto: perfilAtualMini.foto || null,
      ofertaId,
      criadoEm:Date.now(),
      lidoPor:[usuarioId],
      reported:false,
      hiddenByModeration:false,
      moderated:false,
      deletedByAdmin:false
    });

    if(usuarioEhPro()){
      openChat(oferta);
    }
  }catch(error){
    console.log("Erro ao solicitar aceite:", error);
  }
}

async function desistirSolicitacao(oferta:any){
  const ofertaId = String(oferta?.id || "");
  const solicitacoesAtuais = Array.isArray((oferta as any)?.solicitacoes)
    ? (oferta as any).solicitacoes.map((id:any)=>String(id))
    : [];

  await updateDoc(doc(db,"ofertas",ofertaId), {
    solicitacoes: solicitacoesAtuais.filter((s:string) => s !== usuarioId),
    atualizadoEm: Date.now()
  }).catch((error)=>console.log("Erro ao desistir solicitacao:", error));
}

async function aceitarSolicitacaoChat(mensagem:any){
  const ofertaId = String(chatOferta?.id || mensagem?.ofertaId || "");
  const solicitanteId = String(mensagem?.solicitanteId || mensagem?.autor || "").trim();
  if(!ofertaId || !solicitanteId) return;

  const lidoPorAtual = Array.isArray(mensagem?.lidoPor)
    ? mensagem.lidoPor.map((id:any)=>String(id))
    : [];
  const solicitacoesAtuais = Array.isArray(chatOferta?.solicitacoes)
    ? chatOferta.solicitacoes.map((id:any)=>String(id))
    : [];

  try{
    await updateDoc(doc(db,"ofertas",ofertaId,"mensagens",String(mensagem.id)), {
      statusSolicitacao:"aceita",
      lidoPor:[...new Set([...lidoPorAtual, usuarioId])],
      respondidoEm:Date.now()
    });

    await updateDoc(doc(db,"ofertas",ofertaId), {
      status:"aceita",
      aceitaPor:solicitanteId,
      aceitaPorNome:solicitanteId,
      solicitacoes: solicitacoesAtuais.filter((id:string)=>id !== solicitanteId),
      atualizadoEm:Date.now()
    });

    await addDoc(collection(db,"ofertas",ofertaId,"mensagens"), {
      tipo:"texto",
      texto:"Sua solicitação foi aceita.",
      acao:"solicitacao_resposta",
      statusSolicitacao:"aceita",
      solicitanteId,
      destinatarioId:solicitanteId,
      autor:usuarioId,
      autorNome: perfilAtualMini.nome || usuarioId,
      autorFoto: perfilAtualMini.foto || null,
      ofertaId,
      criadoEm:Date.now(),
      lidoPor:[usuarioId],
      reported:false,
      hiddenByModeration:false,
      moderated:false,
      deletedByAdmin:false
    });
  }catch(error){
    console.log("Erro ao aceitar solicitação no chat:", error);
  }
}

async function recusarSolicitacaoChat(mensagem:any){
  const ofertaId = String(chatOferta?.id || mensagem?.ofertaId || "");
  const solicitanteId = String(mensagem?.solicitanteId || mensagem?.autor || "").trim();
  if(!ofertaId || !solicitanteId) return;

  const lidoPorAtual = Array.isArray(mensagem?.lidoPor)
    ? mensagem.lidoPor.map((id:any)=>String(id))
    : [];
  const solicitacoesAtuais = Array.isArray(chatOferta?.solicitacoes)
    ? chatOferta.solicitacoes.map((id:any)=>String(id))
    : [];

  try{
    await updateDoc(doc(db,"ofertas",ofertaId,"mensagens",String(mensagem.id)), {
      statusSolicitacao:"recusada",
      lidoPor:[...new Set([...lidoPorAtual, usuarioId])],
      respondidoEm:Date.now()
    });

    await updateDoc(doc(db,"ofertas",ofertaId), {
      solicitacoes: solicitacoesAtuais.filter((id:string)=>id !== solicitanteId),
      atualizadoEm:Date.now()
    });

    await addDoc(collection(db,"ofertas",ofertaId,"mensagens"), {
      tipo:"texto",
      texto:"Sua solicitação foi recusada.",
      acao:"solicitacao_resposta",
      statusSolicitacao:"recusada",
      solicitanteId,
      destinatarioId:solicitanteId,
      autor:usuarioId,
      autorNome: perfilAtualMini.nome || usuarioId,
      autorFoto: perfilAtualMini.foto || null,
      ofertaId,
      criadoEm:Date.now(),
      lidoPor:[usuarioId],
      reported:false,
      hiddenByModeration:false,
      moderated:false,
      deletedByAdmin:false
    });
  }catch(error){
    console.log("Erro ao recusar solicitação no chat:", error);
  }
}

async function bloquearUsuarioChat(alvoId:any){
  const alvo = String(alvoId || "").trim();
  const eu = String(usuarioId || "").trim();
  if(!alvo || !eu || alvo === eu) return;

  const proximo = {
    ...usuariosBloqueados,
    [alvo]: Date.now()
  };

  setUsuariosBloqueados(proximo);
  setChatBloqueioManual((prev)=> ({ ...prev, outroId: alvo, euBloqueei: true }));

  try{
    const docId = `${eu}__${alvo}`;
    await setDoc(doc(db, "blockedUsers", docId), {
      blockerId: eu,
      blockedId: alvo,
      createdAt: serverTimestamp()
    }, { merge: true });
  }catch(error){
    console.log("Erro ao bloquear usuário no chat:", error);
  }
}

async function desbloquearUsuarioChat(alvoId:any){
  const alvo = String(alvoId || "").trim();
  const eu = String(usuarioId || "").trim();
  if(!alvo || !eu) return;

  const proximo = { ...usuariosBloqueados };
  delete proximo[alvo];

  setUsuariosBloqueados(proximo);
  setChatBloqueioManual((prev)=> ({ ...prev, outroId: alvo, euBloqueei: false }));

  try{
    const docId = `${eu}__${alvo}`;
    await deleteDoc(doc(db, "blockedUsers", docId));
  }catch(error){
    console.log("Erro ao desbloquear usuário no chat:", error);
  }
}

function normalizarMotivoReport(valor:any): "spam" | "nudez" | "assedio" | "violencia" | "golpe" | "linguagem_ofensiva" | "outro" {
  const txt = String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  if(txt === "spam") return "spam";
  if(txt === "nudez") return "nudez";
  if(txt === "assedio") return "assedio";
  if(txt === "violencia") return "violencia";
  if(txt === "golpe") return "golpe";
  if(txt === "linguagem_ofensiva") return "linguagem_ofensiva";
  return "outro";
}

function tipoReportPorMensagem(mensagem:any): "usuario" | "mensagem" | "imagem" | "audio" {
  const tipoMsg = String(mensagem?.tipo || "").trim().toLowerCase();
  if(tipoMsg === "imagem") return "imagem";
  if(tipoMsg === "audio") return "audio";
  if(mensagem?.id) return "mensagem";
  return "usuario";
}

async function denunciarNoChat(payload: { motivo: string; descricao?: string; message?: any; reportedUserId?: string }){
  const motivo = String(payload?.motivo || "").trim();
  if(!motivo || !chatOferta?.id || !usuarioId) return;

  const mensagem = payload?.message || null;
  const reportedUserId = String(payload?.reportedUserId || mensagem?.autor || chatBloqueioManual.outroId || "").trim();
  const tipoReport = tipoReportPorMensagem(mensagem);
  const motivoNormalizado = normalizarMotivoReport(motivo);

  try{
    await addDoc(collection(db, "reports"), {
      tipo: tipoReport,
      motivo: motivoNormalizado,
      descricao: String(payload?.descricao || "").trim() || null,
      reporterId: String(usuarioId),
      targetUserId: reportedUserId || null,
      messageId: String(mensagem?.id || "") || null,
      chatId: String(chatOferta?.id || ""),
      createdAt: serverTimestamp(),
      status: "pendente"
    });

    if(mensagem?.id){
      await updateDoc(doc(db, "ofertas", String(chatOferta?.id), "mensagens", String(mensagem.id)), {
        reported: true,
        moderated: true,
        reportedAt: Date.now(),
        reportedBy: String(usuarioId)
      });
    }
  }catch(error){
    console.log("Erro ao denunciar conteúdo do chat:", error);
    throw error;
  }
}

async function moderarMensagemChat(mensagem:any, acao: "ocultar" | "restaurar" | "excluir"){
  const ofertaId = String(chatOferta?.id || mensagem?.ofertaId || "").trim();
  const mensagemId = String(mensagem?.id || "").trim();
  if(!ofertaId || !mensagemId) return;

  if(String(chatOferta?.criadorId || "") !== String(usuarioId || "")){
    Alert.alert("Permissão negada", "Apenas o criador da oferta pode moderar mensagens desta conversa.");
    return;
  }

  const patch = acao === "ocultar"
    ? { hiddenByModeration: true, moderated: true, moderationBy: String(usuarioId), moderationAt: Date.now() }
    : acao === "restaurar"
      ? { hiddenByModeration: false, moderated: true, moderationBy: String(usuarioId), moderationAt: Date.now() }
      : {
          deletedByAdmin: true,
          moderated: true,
          hiddenByModeration: false,
          texto: "mensagem removida pela moderação",
          tipo: "apagada",
          mediaUrl: null,
          moderationBy: String(usuarioId),
          moderationAt: Date.now()
        };

  try{
    await updateDoc(doc(db, "ofertas", ofertaId, "mensagens", mensagemId), patch as any);
  }catch(error){
    console.log("Erro ao moderar mensagem:", error);
  }
}

function excluirConversa(_oferta:any){
  const ofertaId = String(_oferta?.id || "").trim();
  if(ofertaId){
    setConversasOcultasMeta((prev)=>{
      if(prev[ofertaId]) return prev;
      const proximo = {
        ...prev,
        [ofertaId]: Date.now()
      };
      persistirConversasOcultas(proximo);
      return proximo;
    });
    setConversas((prev)=>prev.filter((item:any)=>String(item?.oferta?.id || "") !== ofertaId));
  }

  setChatMensagens([]);
  setChatVisivel(false);
}

function reservarVaga(oferta:any, quantidade:number, embarcaIdx:number, embarcaLabel:string, desembarcaIdx:number, desembarcaLabel:string){
  if(!exigirLoginParaAcao("Faca login para reservar vaga.")) return;
  const reservas = [
    ...((oferta as any).reservas || []),
    {
      id: Date.now().toString(),
      usuarioId,
      passageiroId: usuarioId,
      passageiroNome: usuarioId,
      quantidade,
      embarcaIdx,
      embarcaLabel,
      desembarcaIdx,
      desembarcaLabel,
      status: 'pendente'
    }
  ];

  updateDoc(doc(db,"ofertas",String(oferta.id)), {
    reservas,
    atualizadoEm: Date.now()
  }).catch((error)=>console.log("Erro ao reservar vaga:", error));
}

function cancelarMinhaReserva(oferta:any, reservaId:string){
  const reservas = ((oferta as any).reservas || []).filter((r:any) => r.id !== reservaId);
  updateDoc(doc(db,"ofertas",String(oferta.id)), {
    reservas,
    atualizadoEm: Date.now()
  }).catch((error)=>console.log("Erro ao cancelar reserva:", error));
}

function responderReserva(oferta:any, reservaId:string, novoStatus:'confirmada'|'cancelada'){
  const reservas = ((oferta as any).reservas || []).map((r:any) =>
    r.id === reservaId ? { ...r, status: novoStatus } : r
  );
  updateDoc(doc(db,"ofertas",String(oferta.id)), {
    reservas,
    atualizadoEm: Date.now()
  }).catch((error)=>console.log("Erro ao responder reserva:", error));
}

async function iniciarViagem(oferta:any){
  const ofertaId = String(oferta?.id || "");
  if(!ofertaId) return;

  try{
    await updateDoc(doc(db,"ofertas",ofertaId), {
      status: 'em_andamento',
      atualizadoEm: Date.now()
    });

    if(String(oferta?.tipo || "") === "carona_oferecida"){
      const participantes = participantesOfertaCarona(oferta);
      for(const participante of participantes){
        await enviarMensagemSistemaOferta(
          oferta,
          `Viagem iniciada para ${participante.nome}.`,
          {
            acao:"viagem_iniciada",
            destinatarioId:participante.id
          }
        );
      }
    } else if(String(oferta?.tipo || "") === "entrega"){
      await enviarMensagemSistemaOferta(
        oferta,
        "Indo pegar o objeto.",
        {
          acao:"entrega_indo_pegar",
          destinatarioId:String(oferta?.criadorId || "")
        }
      );
    }
  }catch(error){
    console.log("Erro ao iniciar viagem:", error);
  }
}

async function confirmarFinalizacaoViagem(oferta:any){
  const ofertaId = String(oferta?.id || "");
  if(!ofertaId) return;

  try{
    await updateDoc(doc(db,"ofertas",ofertaId), {
      status: 'finalizada',
      atualizadoEm: Date.now()
    });

    if(String(oferta?.tipo || "") === "entrega"){
      await enviarMensagemSistemaOferta(
        oferta,
        "Objeto entregue. Viagem encerrada.",
        {
          acao:"entrega_concluida",
          destinatarioId:String(oferta?.criadorId || "")
        }
      );
    } else if(String(oferta?.tipo || "") === "carona_oferecida"){
      await enviarMensagemSistemaOferta(
        oferta,
        "Viagem encerrada.",
        { acao:"viagem_encerrada" }
      );
    }
  }catch(error){
    console.log("Erro ao finalizar viagem:", error);
  }
}

function desistirOferta(oferta:any){
  const horasParaInicio = horasParaInicioOferta(oferta);
  const precisaMotivo = horasParaInicio !== null && horasParaInicio <= 2;

  setDesistenciaObrigatoria(precisaMotivo);
  setOfertaDesistenciaPendente(oferta);
  setMotivoDesistencia("");
  setModalDesistenciaVisivel(true);
}

function ofertaComSolicitacaoOuReservaAtiva(oferta:any){
  const solicitacoes = Array.isArray(oferta?.solicitacoes)
    ? oferta.solicitacoes.map((s:any)=>String(s).trim()).filter(Boolean)
    : (Array.isArray(oferta?.solicitantes)
      ? oferta.solicitantes.map((s:any)=>String(s).trim()).filter(Boolean)
      : []);

  const reservasAtivas = Array.isArray(oferta?.reservas)
    ? oferta.reservas.filter((r:any)=>String(r?.status || "").toLowerCase() !== "cancelada")
    : [];

  return solicitacoes.length > 0 || reservasAtivas.length > 0;
}

function editarOferta(oferta:any){
  if(ofertaComSolicitacaoOuReservaAtiva(oferta)){
    Alert.alert(
      "Oferta bloqueada",
      "Esta oferta já possui solicitação ou reserva ativa e não pode mais ser editada."
    );
    return;
  }
  setOfertaEditandoId(oferta.id);
  setAbaOfertas("oferecer");
  setMenuOfertasVisivel(true);
}

function excluirOferta(oferta:any){
  if(ofertaComSolicitacaoOuReservaAtiva(oferta)){
    Alert.alert(
      "Oferta bloqueada",
      "Esta oferta já possui solicitação ou reserva ativa e não pode ser excluída."
    );
    return;
  }
  deleteDoc(doc(db,"ofertas",String(oferta.id))).catch((error)=>console.log("Erro ao excluir oferta:", error));
}

function openProfile(usuarioPerfilId:any, _ofertaParaAceite?:any){
  if(!exigirLoginParaAcao("Faca login para acessar perfil.")) return;
  const idPerfil = String(usuarioPerfilId || "").trim();

  if(usuarioEhFree() && idPerfil && idPerfil !== String(usuarioId || "")){
    Alert.alert(t("recursoPro"), t("perfilProOnly"));
    return;
  }

  setUsuarioPerfilAbertoId(idPerfil || null);
  setAbaOfertas("perfil");
  setMenuOfertasVisivel(true);
  setAbaAtiva(null);
}

const [sugestoesOrigem,setSugestoesOrigem] = useState<any[]>([]);
const [sugestoesDestino,setSugestoesDestino] = useState<any[]>([]);
// ================================
// ================================
const [regiaoInicial, setRegiaoInicial] = useState<any>(null);

const [destinoTxt,setDestinoTxt] = useState("");



const [origemTemp,setOrigemTemp] = useState(null);
const [destinoTemp,setDestinoTemp] = useState(null);
const [rotaPronta, setRotaPronta] = useState(false);
const [quantidadePessoas,setQuantidadePessoas] = useState(1);
const [ofertaEditandoId,setOfertaEditandoId] = useState<string | null>(null);



// barra visível
const [barraVisivel, setBarraVisivel] = useState(false);
const [mostrarBotaoPro, setMostrarBotaoPro] = useState(false);
const [editorCasaVisivel, setEditorCasaVisivel] = useState(false);
const [rotaCarregando, setRotaCarregando] = useState(false);

const [painelVisivel, setPainelVisivel] = useState(false);
const [idiomaAtual, setIdiomaAtual] = useState<IdiomaId>("pt");
const textos = TEXTOS[idiomaAtual];
const nomesCasaZoeira = useMemo(() => getNomesCasaZoeira(idiomaAtual), [idiomaAtual]);
const nomesAmigoZoeira = useMemo(() => getNomesAmigoZoeira(idiomaAtual), [idiomaAtual]);
const nomesTrabalhoZoeira = useMemo(() => getNomesTrabalhoZoeira(idiomaAtual), [idiomaAtual]);
const [modalAlerta, setModalAlerta] = useState(false);
const [motivoAlerta, setMotivoAlerta] = useState("");
const [menuReportRapido, setMenuReportRapido] = useState(false);
const [coordsReportTemp, setCoordsReportTemp] = useState(null);
const reportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const [coordsAlerta, setCoordsAlerta] = useState<any>(null);
const [denunciaOfertaAtual, setDenunciaOfertaAtual] = useState<null | { alvoId:string; ofertaId:string; ofertaTipo:string }>(null);
const [reportsTrajeto, setReportsTrajeto] = useState<any[]>([]);
const reportsAvisadosRef = useRef<Record<string, number>>({});
const [escutandoVoz, setEscutandoVoz] = useState(false);
const animPulse = useRef(new Animated.Value(1)).current;


function t(chave:string){
  return TEXTOS[idiomaAtual]?.[chave] || chave;
}

function tComFallback(chave:string, fallback:string){
  const valor = TEXTOS[idiomaAtual]?.[chave];
  return typeof valor === "string" && valor.length ? valor : fallback;
}

function regiaoDoDispositivo(){
  const localeAtual = Localization.getLocales()?.[0];
  const regionCode = String(localeAtual?.regionCode || "").trim().toUpperCase();
  if(regionCode) return regionCode;

  const languageTag = String(localeAtual?.languageTag || localePorIdioma(idiomaAtual) || "").trim();
  const match = languageTag.match(/-([A-Za-z]{2}|\d{3})$/);
  if(match?.[1]) return String(match[1]).toUpperCase();

  return "GLOBAL";
}

function tComRegiao(chave:string, fallback:string){
  const regiao = regiaoDoDispositivo();
  const valor = tComFallback(chave, fallback);
  return valor.replace(/\{\{regiao\}\}/g, regiao);
}

function iconePorTipoReport(tipo:string){
  if(tipo === "objeto") return "alert";
  if(tipo === "policia") return "police-badge";
  if(tipo === "radar") return "radar";
  if(tipo === "obra") return "cone";
  if(tipo === "lentidao") return "car-brake-alert";
  if(tipo === "transito") return "traffic-light";
  return "close-circle";
}

const opcoesReportTrajeto = useMemo(() => ([
  { tipo:"objeto", label:tComFallback("reportObjetoPista", "Objeto na pista") },
  { tipo:"policia", label:tComFallback("reportPolicia", "Policia") },
  { tipo:"radar", label:tComFallback("reportRadar", "Radar") },
  { tipo:"obra", label:tComFallback("reportObra", "Obra") },
  { tipo:"lentidao", label:tComFallback("reportLentidao", "Lentidão") },
  { tipo:"transito", label:tComFallback("reportTransito", "Transito") },
  { tipo:"cancelar", label:tComFallback("cancelar", "Cancelar") }
]), [idiomaAtual]);

function renderMenuReportTrajeto(bottom:number, modo:"rapido"|"normal"){
  const visivel = modo === "rapido" ? menuReportRapido : menuReportVisivel;
  if(!visivel) return null;

  return (
    <View style={{
      position:"absolute",
      bottom,
      left:16,
      right:16,
      backgroundColor:"#ffffff",
      borderRadius:24,
      padding:16,
      zIndex:9999,
      elevation:24,
      shadowColor:"#000",
      shadowOpacity:0.16,
      shadowRadius:14,
      shadowOffset:{ width:0, height:6 },
      borderWidth:1,
      borderColor:"rgba(15,23,42,0.08)"
    }}>
      <View style={{
        width:42,
        height:5,
        borderRadius:999,
        backgroundColor:"#d1d5db",
        alignSelf:"center",
        marginBottom:12
      }} />

      
           <Text style={{
        fontSize:16,
        fontWeight:"700",
        color:"#0f172a",
        marginBottom:12,
        textAlign:"center"
      }}>
        {tComFallback("reportarNoTrajeto", "Reportar no trajeto")}
      </Text>

      {opcoesReportTrajeto.map((item, index) => (
        <TouchableOpacity
          key={`${modo}-${item.tipo}-${index}`}
          onPress={()=>{
            if(reportTimeoutRef.current){
              clearTimeout(reportTimeoutRef.current);
              reportTimeoutRef.current = null;
            }

            if(item.tipo === "cancelar"){
              setMenuReportVisivel(false);
              setMenuReportRapido(false);
              setReportPendente(false);
              return;
            }

            salvarReportFirebase(item.tipo);

            setMenuReportVisivel(false);
            setMenuReportRapido(false);
            setReportPendente(false);

            Vibration.vibrate(60);

            try{
              falar(tComFallback("reportado", "Reportado"));
            }catch{}
          }}
          style={{
            backgroundColor:item.tipo === "cancelar" ? "#fff1f2" : "#f8fafc",
            padding:14,
            borderRadius:16,
            marginBottom:8
          }}
        >
          <View style={{ flexDirection:"row", alignItems:"center" }}>
            <MaterialCommunityIcons
              name={iconePorTipoReport(item.tipo) as any}
              size={18}
              color={item.tipo === "cancelar" ? "#e11d48" : "#0f172a"}
              style={{ marginRight:10 }}
            />
            <Text style={{ color:item.tipo === "cancelar" ? "#be123c" : "#0f172a", fontWeight:"600" }}>
              {item.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function frasesNavegacaoAtuais(){
  const banco = {
    pt: {
      straight: "Siga em frente",
      left: "Vire à esquerda",
      right: "Vire à direita",
      roundabout: "Entre na rotatória",
      arriveTop: "Chegue ao destino",
      arriveNow: "Chegou ao destino",
      inMeters: (metros:number, corpo:string) => `Em ${metros} metros ${corpo}`,
      viaTurn: (corpo:string, via:string) => corpo + (via ? ` na ${via}` : ""),
      viaLabel: (corpo:string, via:string) => corpo + (via ? ` • ${via}` : "")
    },
    en: {
      straight: "Go straight",
      left: "Turn left",
      right: "Turn right",
      roundabout: "Enter the roundabout",
      arriveTop: "Arrive at destination",
      arriveNow: "You have arrived at your destination",
      inMeters: (metros:number, corpo:string) => `In ${metros} meters ${corpo.charAt(0).toLowerCase() + corpo.slice(1)}`,
      viaTurn: (corpo:string, via:string) => corpo + (via ? ` onto ${via}` : ""),
      viaLabel: (corpo:string, via:string) => corpo + (via ? ` • ${via}` : "")
    },
    es: {
      straight: "Sigue recto",
      left: "Gira a la izquierda",
      right: "Gira a la derecha",
      roundabout: "Entra en la rotonda",
      arriveTop: "Llega al destino",
      arriveNow: "Has llegado al destino",
      inMeters: (metros:number, corpo:string) => `En ${metros} metros ${corpo.charAt(0).toLowerCase() + corpo.slice(1)}`,
      viaTurn: (corpo:string, via:string) => corpo + (via ? ` por ${via}` : ""),
      viaLabel: (corpo:string, via:string) => corpo + (via ? ` • ${via}` : "")
    },
    fr: {
      straight: "Continuez tout droit",
      left: "Tournez à gauche",
      right: "Tournez à droite",
      roundabout: "Entrez dans le rond-point",
      arriveTop: "Arrivez à destination",
      arriveNow: "Vous êtes arrivé à destination",
      inMeters: (metros:number, corpo:string) => `Dans ${metros} mètres ${corpo.charAt(0).toLowerCase() + corpo.slice(1)}`,
      viaTurn: (corpo:string, via:string) => corpo + (via ? ` sur ${via}` : ""),
      viaLabel: (corpo:string, via:string) => corpo + (via ? ` • ${via}` : "")
    },
    de: {
      straight: "Geradeaus fahren",
      left: "Links abbiegen",
      right: "Rechts abbiegen",
      roundabout: "In den Kreisverkehr fahren",
      arriveTop: "Am Ziel ankommen",
      arriveNow: "Du hast dein Ziel erreicht",
      inMeters: (metros:number, corpo:string) => `In ${metros} Metern ${corpo.charAt(0).toLowerCase() + corpo.slice(1)}`,
      viaTurn: (corpo:string, via:string) => corpo + (via ? ` auf ${via}` : ""),
      viaLabel: (corpo:string, via:string) => corpo + (via ? ` • ${via}` : "")
    }
  } as const;

  return banco[idiomaAtual] || banco.pt;
}

function montarInstrucaoNavegacao(step:any, momento:"topo"|"pre"|"agora", distancia:number = 0){
  const frases = frasesNavegacaoAtuais();
  if(!step) return frases.straight;

  const instrucaoComDistancia = (corpo:string, dist:number) => {
    const metros = Math.max(60, Math.round(Number(dist) || 0));
    if(idiomaAtual === "pt" && metros >= 1000){
      const km = metros >= 2000
        ? (metros / 1000).toFixed(0)
        : (metros / 1000).toFixed(1).replace(".", ",");
      const corpoMin = corpo ? corpo.charAt(0).toLowerCase() + corpo.slice(1) : "";
      return `Em ${km} quilometros ${corpoMin}`.trim();
    }
    return frases.inMeters(metros, corpo);
  };

  const tipo = String(step?.maneuver?.type || "").toLowerCase();
  const modifier = String(step?.maneuver?.modifier || "").toLowerCase();
  const via = String(step?.name || step?.ref || "").trim();
  const lado =
    modifier.includes("left") || modifier.includes("esquerda") ? "left" :
    modifier.includes("right") || modifier.includes("direita") ? "right" :
    "straight";

  if(momento === "topo"){
    if(tipo === "arrive") return frases.arriveTop;
    if(tipo === "roundabout" || tipo === "rotary") return frases.roundabout;
    if(lado === "left") return frases.viaLabel(frases.left, via);
    if(lado === "right") return frases.viaLabel(frases.right, via);
    return frases.viaLabel(frases.straight, via);
  }

  if(tipo === "arrive"){
    return momento === "pre"
      ? instrucaoComDistancia(frases.arriveTop, distancia)
      : frases.arriveNow;
  }

  if(tipo === "roundabout" || tipo === "rotary"){
    return momento === "pre"
      ? instrucaoComDistancia(frases.roundabout, distancia)
      : frases.roundabout;
  }

  const corpo =
    lado === "left"
      ? frases.viaTurn(frases.left, via)
      : lado === "right"
        ? frases.viaTurn(frases.right, via)
        : frases.viaTurn(frases.straight, via);

  return momento === "pre"
    ? instrucaoComDistancia(corpo, distancia)
    : corpo;
}


async function trocarIdiomaManual(id: IdiomaId){
  setIdiomaAtual(id);
  await AsyncStorage.setItem("idioma_manual", id);
}
const [nivelBloqueado, setNivelBloqueado] = useState(4);
// =================================
// �x� CONTROLE REAL FREE vs PRO
// =================================
const [idiomaManual, setIdiomaManual] = useState(false);
// nível máximo permitido pelo usuário
;
const [stepsRota, setStepsRota] = useState<any[]>([]);
const stepAtualRef = useRef(0);

function limiteNivelUsuario(): number{
  return obterPermissoesDoPlano(planoAtual).nivelMaxXingamento;
}

function nivelPermitido(): 0|1|2|3|4{
  const limiteConta = obterPermissoesDoPlano(planoAtual).nivelMaxXingamento;
  const limiteUsuario = Math.max(0, Math.min(4, Number(nivelBloqueado) || 0));
  const final = Math.min(limiteConta, limiteUsuario);
  return final as 0|1|2|3|4;
}
function usuarioEhPro(){
  return planoEhPro(planoAtual);
}
function usuarioEhPremiumAtual(){
  return planoEhPremium(planoAtual);
}
// timer esconder barra
const barraTimer = useRef<any>(null);
function usuarioEhFree(){
  return planoEhFree(planoAtual);
}

useEffect(()=>{
  if(assinatura === null) return;

  if(!usuarioEhFree()) return;

  if(Number(nivelBloqueado) > 0){
    setNivelBloqueado(0);
  }

  if(Number(nivelAtual) > 0){
    setNivelAtual(0);
  }
}, [assinatura, planoAtual, nivelBloqueado, nivelAtual]);

function nivelXingamentoLiberadoParaUsuario(nivel:number){
  const nivelSeguro = Math.max(0, Math.min(4, Number(nivel) || 0));
  return nivelSeguro <= nivelPermitido();
}

function podeOuvirNivel(nivel:number){
  return nivelXingamentoLiberadoParaUsuario(nivel);
}

function podeCriarOfertaTipo(tipo:any){
  const tipoNormalizado = String(tipo || "").trim();
  if(!tipoNormalizado) return false;

  // Publicacao de ofertas monetizaveis fica restrita ao Premium.
  return usuarioEhPremiumAtual();
}

function podeSolicitarAcaoEmOferta(oferta:any){
  const tipo = String(oferta?.tipo || "").trim();
  const permissoes = obterPermissoesDoPlano(planoAtual);

  // Qualquer usuário pode solicitar carona ou entrega
  // Apenas Premium pode aceitar (dar carona / fazer entrega)
  return {
    solicitarCarona: tipo === "carona_oferecida",
    solicitarEntrega: tipo === "entrega",
    aceitarDarCarona: permissoes.podeDarCarona && tipo === "carona_solicitada",
    aceitarFazerEntrega: permissoes.podeFazerEntrega && tipo === "entrega",
  };
}

function podeVerDetalhesCompletosOferta(oferta:any){
  if(usuarioEhPremiumAtual()) return true;

  // FREE pode ver detalhes completos de carona ofertada (cliente/passageiro).
  if(String(oferta?.tipo || "") === "carona_oferecida") return true;

  const criadorId = String(oferta?.criadorId || "").trim();
  if(criadorId && criadorId === String(usuarioId || "").trim()) return true;

  // FREE só vê valor
  return false;
}

function dadosOfertaParaUsuario(oferta:any){
  if(podeVerDetalhesCompletosOferta(oferta)){
    return oferta;
  }

  return {
    id: oferta?.id || "",
    tipo: oferta?.tipo || "",
    valor: Number(oferta?.valor || 0),
    status: oferta?.status || "ativa",
    bloqueadaNoFree: true,
    origem: null,
    destino: null,
    criadorId: null,
    criadorNome: "",
    nomeOuDescricao: "Oferta protegida",
    quantidadePessoas: null,
    dataSaida: null,
    horarioSaida: null
  };
}

const ofertasVisiveisUsuario = useMemo(() => {
  const lista = Array.isArray(ofertas) ? ofertas : [];

  if(!usuarioEhPremiumAtual()){
    // FREE/PRO visualizam apenas caronas ofertadas para contratar.
    return lista
      .filter((oferta:any)=>String(oferta?.tipo || "") === "carona_oferecida")
      .map((oferta:any)=>(podeVerDetalhesCompletosOferta(oferta) ? oferta : dadosOfertaParaUsuario(oferta)));
  }

  return lista.map((oferta:any)=>(podeVerDetalhesCompletosOferta(oferta) ? oferta : dadosOfertaParaUsuario(oferta)));
}, [ofertas, planoAtual, usuarioId]);

function abrirTelaProSeNecessario(){
  setTelaProVisivel(true);
}

function bloquearSeFreeComTelaPro(){
  if(usuarioEhFree()){
    abrirTelaProSeNecessario();
    return true;
  }
  return false;
}
function esconderBarraNivelComDelay(ms:number = 3000){
  if(barraTimer.current){
    clearTimeout(barraTimer.current);
  }

  barraTimer.current = setTimeout(()=>{
    setBarraVisivel(false);
  }, ms);
}

function mostrarBarraNivelTemporariamente(){
  setBarraVisivel(true);
  esconderBarraNivelComDelay(3000);
}
useEffect(()=>{
  return ()=>{
    if(barraTimer.current){
      clearTimeout(barraTimer.current);
    }
  };
},[]);
const [aceitouTermo, setAceitouTermo] = useState(false);
useEffect(()=>{

 async function carregarPerfilMiniAtual(){
  if(!usuarioId) return;

  try{
    const salvoPerfil = await AsyncStorage.getItem(`perfil_${usuarioId}`);
      let perfil = salvoPerfil ? JSON.parse(salvoPerfil) : {};

      if(usuarioAutenticado){
        perfil = {
          ...perfil,
          nome: String(perfil?.nome || auth.currentUser?.displayName || "").trim(),
          foto: String(perfil?.foto || auth.currentUser?.photoURL || "").trim(),
        };
      }

      if(!String(perfil?.nome || "").trim() || !String(perfil?.foto || "").trim()){
        try{
          const [snapUsuario, snapPerfilLegado] = await Promise.all([
            getDoc(doc(db, "usuarios", String(usuarioId))),
            getDoc(doc(db, "perfisUsuarios", String(usuarioId))),
          ]);
          const remoto:any = snapUsuario.exists()
            ? (snapUsuario.data() || {})
            : (snapPerfilLegado.exists() ? (snapPerfilLegado.data() || {}) : null);

          if(remoto){
            perfil = {
              ...perfil,
              nome: String(perfil?.nome || remoto?.nome || "").trim(),
              foto: String(perfil?.foto || remoto?.foto || "").trim()
            };

            await AsyncStorage.setItem(`perfil_${usuarioId}`, JSON.stringify({
              ...(salvoPerfil ? JSON.parse(salvoPerfil) : {}),
              ...perfil,
            }));
          }
        }catch(errorRemoto){
          console.log("Erro ao carregar perfil mini remoto:", errorRemoto);
        }
      }

    setPerfilAtualMini({
      nome: String(perfil?.nome || "").trim(),
      foto: String(perfil?.foto || "").trim()
    });
  }catch(error){
    console.log("Erro ao carregar perfil resumido:", error);
    setPerfilAtualMini({ nome:"", foto:"" });
  }
 }

 async function carregarIdioma(){

  const salvo = await AsyncStorage.getItem("idioma_manual");

  if(salvo && idiomaEhSuportado(salvo)){
    setIdiomaAtual(salvo);
    return;
  }

  // detectar idioma celular
  const locale = Localization.getLocales()?.[0]?.languageTag ?? "pt-BR";
  setIdiomaAtual(idiomaPorLocale(locale));
 }

 async function verificarTermo(){
   const [ok, versao] = await Promise.all([
     AsyncStorage.getItem("aceitou_termo"),
     AsyncStorage.getItem("aceitou_termo_versao")
   ]);

   if(ok === "sim" && versao === TERMO_VERSAO_ATUAL){
     setAceitouTermo(true);
     return;
   }

   setAceitouTermo(false);
 }

 carregarIdioma();
 verificarTermo();
 carregarPerfilMiniAtual();

},[abaAtiva, usuarioId]);
useEffect(()=>{
  let ativo = true;

  async function carregarUsuarioAnonimo(){
    try{
      const salvo = await AsyncStorage.getItem("usuario_id_dispositivo");
      if(!ativo) return;

      if(salvo){
        setUsuarioAnonimoId(String(salvo));
        return;
      }

      const novoId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await AsyncStorage.setItem("usuario_id_dispositivo", novoId);
      if(ativo) setUsuarioAnonimoId(novoId);
    }catch(error){
      console.log("Erro ao carregar usuarioId do dispositivo:", error);
      if(ativo) setUsuarioAnonimoId(`user_${Date.now()}`);
    }
  }

  carregarUsuarioAnonimo();

  return ()=>{
    ativo = false;
  };
},[]);

useEffect(()=>{
  let ativo = true;

  const unsubscribe = onAuthStateChanged(auth, (usuario)=>{
    if(!ativo) return;
    setAuthUid(String(usuario?.uid || "").trim());
    setAuthCarregando(false);
  });

  return ()=>{
    ativo = false;
    unsubscribe();
  };
}, []);

useEffect(()=>{
  const uid = String(authUid || "").trim();
  if(uid){
    setUsuarioId(uid);
    return;
  }

  setUsuarioId(String(usuarioAnonimoId || "").trim());
}, [authUid, usuarioAnonimoId]);

useEffect(()=>{
  const uid = String(authUid || "").trim();
  if(!uid) return;

  let ativo = true;

  async function sincronizarPerfilAuth(){
    try{
      const [perfilUidRaw, perfilAnonRaw] = await Promise.all([
        AsyncStorage.getItem(`perfil_${uid}`),
        usuarioAnonimoId ? AsyncStorage.getItem(`perfil_${usuarioAnonimoId}`) : Promise.resolve(null),
      ]);

      const perfilUid = perfilUidRaw ? JSON.parse(perfilUidRaw) : {};
      const perfilAnon = perfilAnonRaw ? JSON.parse(perfilAnonRaw) : {};

      const perfilMesclado = {
        ...perfilAnon,
        ...perfilUid,
        nome: String(perfilUid?.nome || perfilAnon?.nome || auth.currentUser?.displayName || "").trim(),
        foto: String(perfilUid?.foto || perfilAnon?.foto || auth.currentUser?.photoURL || "").trim(),
        cidade: String(perfilUid?.cidade || perfilAnon?.cidade || "").trim(),
        telefone: String(perfilUid?.telefone || perfilAnon?.telefone || "").trim(),
        veiculos: Array.isArray(perfilUid?.veiculos)
          ? perfilUid.veiculos
          : (Array.isArray(perfilAnon?.veiculos) ? perfilAnon.veiculos : []),
      };

      await AsyncStorage.setItem(`perfil_${uid}`, JSON.stringify(perfilMesclado));

      if(ativo){
        setPerfilAtualMini({
          nome: String(perfilMesclado?.nome || "").trim(),
          foto: String(perfilMesclado?.foto || "").trim(),
        });
      }

      const payloadUsuario = {
        uid,
        email: String(auth.currentUser?.email || "").trim() || null,
        nome: String(perfilMesclado?.nome || "").trim(),
        foto: String(perfilMesclado?.foto || "").trim(),
        cidade: String(perfilMesclado?.cidade || "").trim(),
        telefone: String(perfilMesclado?.telefone || "").trim(),
        veiculos: Array.isArray(perfilMesclado?.veiculos) ? perfilMesclado.veiculos : [],
        migradoDePerfilLocal: !!usuarioAnonimoId,
        usuarioAnonimoIdOrigem: usuarioAnonimoId || null,
        atualizadoEmCliente: Date.now(),
        atualizadoEm: serverTimestamp(),
      };

      await Promise.all([
        setDoc(doc(db, "usuarios", uid), payloadUsuario, { merge: true }),
        setDoc(doc(db, "perfisUsuarios", uid), payloadUsuario, { merge: true }),
      ]);
    }catch(error){
      console.log("Erro ao sincronizar perfil autenticado:", error);
    }
  }

  sincronizarPerfilAuth();

  return ()=>{
    ativo = false;
  };
}, [authUid, usuarioAnonimoId]);
useEffect(()=>{

const show = Keyboard.addListener("keyboardDidShow",()=>{
setTecladoAberto(true);
});

const hide = Keyboard.addListener("keyboardDidHide",()=>{
setTecladoAberto(false);
});

return ()=>{
show.remove();
hide.remove();
};

},[]);

useEffect(()=>{

const unsubscribe = onSnapshot(
collection(db,"ofertas"),
(snapshot)=>{

const lista:any[]=[];

snapshot.forEach((doc)=>{

const dados:any = doc.data();

console.log("OFERTA RECEBIDA:",dados);

lista.push({
id:doc.id,
...dados
});

});

// �x� AQUI ESTAVA FALTANDO
setOfertas(lista);

const agora = Date.now();
snapshot.docChanges().forEach((change)=>{
  if(change.type !== "added") return;
  const ofertaId = String(change.doc.id || "");
  const dados = change.doc.data() || {};

  const criadoEm = Number(dados?.criadoEm || 0);
  const ofertaRecente = Number.isFinite(criadoEm) && criadoEm > 0 && (agora - criadoEm) <= 120000;
  const deveNotificar = ofertasSnapshotInicializadoRef.current || ofertaRecente;

  if(!deveNotificar) return;

  notificarOfertaProximaSeNecessario(ofertaId, dados).catch((error)=>{
    console.log("Erro ao processar oferta proxima:", error);
  });
});

ofertasSnapshotInicializadoRef.current = true;

});

return ()=>unsubscribe();

},[usuarioId, raioNotificacaoKm, somRadar, idiomaAtual]);

useEffect(()=>{

if(!ofertaSelecionada) return;

if(!rotaVisivel) return;

buscarRotaORS(
ofertaSelecionada.origem,
ofertaSelecionada.destino
)

},[ofertaSelecionada, rotaVisivel])
// ===============================
// CARREGAR ASSINATURA SALVA
// ===============================
useEffect(()=>{
 let ativo = true;

 async function revalidarAssinatura(){
  const dados = await carregarAssinaturaLocal();
  const plano = normalizarStatusAssinatura(dados);

  if(!ativo) return;

  // Mantém o estado coerente quando a assinatura expira durante a sessão.
  let assinaturaNormalizada: AssinaturaUsuario = dados;
  if(plano === "free" && dados.plano !== "free"){
    assinaturaNormalizada = {
      ...dados,
      plano: "free" as PlanoUsuario,
      ativo: false,
    };
  }

  setAssinatura(assinaturaNormalizada);
  setPlanoAtual(plano);

  // Compatibilidade legada
  const ehPro = plano === "pro" || plano === "premium" || plano === "premium_free";
  setAssinaturaAtiva(ehPro);
  setModoPro(ehPro);
 }

 revalidarAssinatura().catch((error)=>{
  console.log("Erro ao carregar assinatura:", error);
 });

 const timerId = setInterval(()=>{
  revalidarAssinatura().catch((error)=>{
    console.log("Erro ao revalidar assinatura:", error);
  });
 }, 60 * 1000);

 const appStateSubscription = AppState.addEventListener("change", (nextState)=>{
  if(nextState !== "active") return;
  revalidarAssinatura().catch((error)=>{
    console.log("Erro ao revalidar assinatura no foreground:", error);
  });
 });

 return ()=>{
  ativo = false;
  clearInterval(timerId);
  appStateSubscription.remove();
 };
},[]);

useEffect(()=>{
  if(assinatura === null) return;
  if(landingInicialPorPlanoAplicadoRef.current) return;

  if(!usuarioAutenticado){
    landingInicialPorPlanoAplicadoRef.current = true;
    setOfertaSelecionada(null);
    setChatVisivel(false);
    setRotaVisivel(false);
    setAbaAtiva(null);
    setMenuOfertasVisivel(false);
    return;
  }

  landingInicialPorPlanoAplicadoRef.current = true;

  setOfertaSelecionada(null);
  setChatVisivel(false);
  setRotaVisivel(false);
  setAbaAtiva(null);

  if(planoAtual === "premium"){
    setAbaOfertas("procurar");
    setMenuOfertasVisivel(true);
    return;
  }

  if(planoAtual === "free"){
    setAbaOfertas("oferecer");
    setMenuOfertasVisivel(true);
    return;
  }

  setAbaOfertas("procurar");
  setMenuOfertasVisivel(false);
},[assinatura, planoAtual, usuarioAutenticado]);

useEffect(()=>{
  if(usuarioAutenticado) return;
  const existeAbaRestrita = !!abaAtiva || menuOfertasVisivel || chatVisivel;
  if(!existeAbaRestrita) return;

  setAbaAtiva(null);
  setMenuOfertasVisivel(false);
  setChatVisivel(false);
  abrirTelaLogin("Faca login para usar caronas, entregas, chat, reservas e perfil.");
}, [usuarioAutenticado, abaAtiva, menuOfertasVisivel, chatVisivel]);
 // carregar config toque duplo
 useEffect(()=>{
  async function loadTouch(){
    const v = await AsyncStorage.getItem("toque_duplo");
    if(v==="off") setToqueDuploAtivo(false);
  }
  loadTouch();
 },[]);

// ===============================
// �x� AN�aNCIOS (placeholder futuro)
// ===============================
const [mostrarAds, setMostrarAds] = useState(true);

// Rastreamento online (lastSeen em Firestore)
useEffect(() => {
  if (!usuarioAutenticado || !authUid) return;

  const atualizarPresenca = async () => {
    try {
      const docRef = doc(db, "usuarios", authUid);
      await setDoc(docRef, {
        uid: authUid,
        lastSeen: Date.now(),
      }, { merge: true });
    } catch {
      // Ignorar erros de networking
    }
  };

  // Pulso inicial imediato para não ficar offline ao abrir o app
  atualizarPresenca();

  const intervalo = setInterval(async () => {
    atualizarPresenca();
  }, 30000);

  return () => clearInterval(intervalo);
}, [usuarioAutenticado, authUid]);

// só mostra anúncio parado
function podeMostrarAd(vel:number){

  return vel < 3;
}


// ==========================================
// �x�� ZOEIRA POR TRANSPORTE
// ==========================================
const FRASES_TRANSPORTE_POR_IDIOMA:any = {
  pt: {
    carro:[
      "Vamos ver quantas decisoes ruins hoje.",
      "Dirigindo... infelizmente.",
      "Confio em voce... infelizmente.",
      "Isso vai dar errado.",
      "Expectativa baixa ativada."
    ],
    moto:[
      "Alta chance de dar ruim.",
      "Cuidado pra nao virar estatistica.",
      "Se cair nao me culpa.",
      "Isso parece perigoso.",
      "Seguro de vida em dia?"
    ],
    bike:[
      "Pelo menos vai emagrecer.",
      "Demora, mas chega... talvez.",
      "Cardio forcado.",
      "Vai suar pra chegar.",
      "Pedala e reflete."
    ],
    pe:[
      "Chega em 2999.",
      "Boa caminhada, tartaruga.",
      "Isso vai demorar muito.",
      "Passos de arrependimento.",
      "Modo lento ativado."
    ],
    bus:[
      "Boa sorte dependendo disso.",
      "Talvez chegue hoje.",
      "Se passar ja e milagre.",
      "Confiar nisso e coragem.",
      "Isso vai testar sua fe."
    ]
  },
  en: {
    carro:[
      "Let us see how bad this goes today.",
      "Driving... sadly.",
      "I trust you... unfortunately.",
      "This will probably go wrong.",
      "Low expectations enabled."
    ],
    moto:[
      "High chance of chaos.",
      "Try not to become a statistic.",
      "If you fall, do not blame me.",
      "This looks dangerous.",
      "Hope your insurance is active."
    ],
    bike:[
      "At least you burn calories.",
      "Slow, but maybe you arrive.",
      "Forced cardio mode.",
      "You will sweat for this.",
      "Pedal and reflect."
    ],
    pe:[
      "ETA: next century.",
      "Nice walk, turtle.",
      "This will take forever.",
      "Regret steps activated.",
      "Slow mode enabled."
    ],
    bus:[
      "Good luck depending on that.",
      "Maybe it arrives today.",
      "If it comes, it is a miracle.",
      "Urban adventure started.",
      "This will test your faith."
    ]
  },
  es: {
    carro:[
      "Vamos a ver cuantas malas decisiones hoy.",
      "Conduciendo... lamentablemente.",
      "Confio en ti... por desgracia.",
      "Esto va a salir mal.",
      "Expectativa baja activada."
    ],
    moto:[
      "Alta probabilidad de desastre.",
      "No te vuelvas estadistica.",
      "Si caes, no me culpes.",
      "Esto se ve peligroso.",
      "Seguro de vida al dia?"
    ],
    bike:[
      "Al menos vas a adelgazar.",
      "Lento, pero tal vez llegas.",
      "Cardio forzado activado.",
      "Vas a sudar para llegar.",
      "Pedalea y reflexiona."
    ],
    pe:[
      "Llegas en 2999.",
      "Buena caminata, tortuga.",
      "Esto tardara muchisimo.",
      "Pasos de arrepentimiento.",
      "Modo lento activado."
    ],
    bus:[
      "Suerte dependiendo de eso.",
      "Tal vez llega hoy.",
      "Si pasa, es un milagro.",
      "Aventura urbana iniciada.",
      "Esto pondra a prueba tu fe."
    ]
  },
  fr: {
    carro:[
      "Voyons combien de mauvaises decisions aujourd'hui.",
      "Conduite... malheureusement.",
      "Je te fais confiance... helas.",
      "Ca va mal finir.",
      "Attentes basses activees."
    ],
    moto:[
      "Risque eleve de chaos.",
      "Essaie de ne pas devenir une statistique.",
      "Si tu tombes, ne m'accuse pas.",
      "Ca semble dangereux.",
      "Assurance vie a jour?"
    ],
    bike:[
      "Au moins tu maigris.",
      "Lent, mais tu arrives peut-etre.",
      "Mode cardio force.",
      "Tu vas transpirer pour arriver.",
      "Pedale et reflechis."
    ],
    pe:[
      "Arrivee en 2999.",
      "Bonne marche, tortue.",
      "Ca va prendre tres longtemps.",
      "Pas de regret actives.",
      "Mode lent active."
    ],
    bus:[
      "Bonne chance avec ca.",
      "Peut-etre qu'il arrive aujourd'hui.",
      "S'il passe, c'est un miracle.",
      "Aventure urbaine lancee.",
      "Ca va tester ta foi."
    ]
  },
  de: {
    carro:[
      "Mal sehen, wie viele schlechte Entscheidungen heute.",
      "Fahren... leider.",
      "Ich vertraue dir... leider.",
      "Das wird schiefgehen.",
      "Niedrige Erwartungen aktiviert."
    ],
    moto:[
      "Hohe Chance auf Chaos.",
      "Werde bitte keine Statistik.",
      "Wenn du fallst, gib mir nicht die Schuld.",
      "Das sieht gefahrlich aus.",
      "Versicherung noch gultig?"
    ],
    bike:[
      "Wenigstens verbrennst du Kalorien.",
      "Langsam, aber vielleicht kommst du an.",
      "Cardio-Zwangsmodus aktiviert.",
      "Du wirst dafur schwitzen.",
      "Treten und nachdenken."
    ],
    pe:[
      "Ankunft in 2999.",
      "Schoner Spaziergang, Schildkrote.",
      "Das dauert ewig.",
      "Schritte des Bedauerns.",
      "Langsam-Modus aktiviert."
    ],
    bus:[
      "Viel Gluck, wenn du davon abhangst.",
      "Vielleicht kommt er heute.",
      "Wenn er kommt, ist es ein Wunder.",
      "Stadt-Abenteuer gestartet.",
      "Das testet deinen Glauben."
    ]
  }
};

const FRASES_TRANSPORTE:any =
  FRASES_TRANSPORTE_POR_IDIOMA[idiomaAtual] || FRASES_TRANSPORTE_POR_IDIOMA.pt;


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
// �x�� PERSONALIDADE BASE
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
  const fallbackProviderTimerRef = useRef<any>(null);
  const mapaBaseCarregadoRef = useRef(false);
  const [forcarProviderPadrao, setForcarProviderPadrao] = useState(false);
  const ultimoPoiFalado = useRef("");

  const [origem, setOrigem] = useState<any>(null);
  const [gpsPronto, setGpsPronto] = useState(false);
  const [poisProximos, setPoisProximos] = useState<any[]>([]);
  const [tipoOferta,setTipoOferta] = useState("carona");

  
  // ===============================
// �xR" MODO NOTURNO AUTOMÁTICO
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

useEffect(() => {
  return () => {
    if (fallbackProviderTimerRef.current) {
      clearTimeout(fallbackProviderTimerRef.current);
    }
  };
}, []);

  
  const [destinoLat, setDestinoLat] = useState<number | null>(null);
const [destinoLng, setDestinoLng] = useState<number | null>(null);

  const [rua, setRua] = useState("");
  const [nomeCasaEscolhido, setNomeCasaEscolhido] = useState("");

const [numero, setNumero] = useState("");
const [bairro, setBairro] = useState("");
const [cidade, setCidade] = useState("");


  
  const [altRouteCoords, setAltRouteCoords] = useState<any[]>([]);
  const [rotaPrincipalCache, setRotaPrincipalCache] = useState<any>(null);
const [rotaAlternativaCache, setRotaAlternativaCache] = useState<any>(null);
const [destinoLatCache, setDestinoLatCache] = useState<number | null>(null);
const [destinoLngCache, setDestinoLngCache] = useState<number | null>(null);
const [origemRua,setOrigemRua] = useState("");
const [origemNumero,setOrigemNumero] = useState("");
const [origemBairro,setOrigemBairro] = useState("");
const [origemCidade,setOrigemCidade] = useState("");
const [origemEstado,setOrigemEstado] = useState("");
const item = ofertaSelecionada;
const [destinoRua,setDestinoRua] = useState("");
const [destinoNumero,setDestinoNumero] = useState("");
const [destinoBairro,setDestinoBairro] = useState("");
const [destinoCidade,setDestinoCidade] = useState("");
const [destinoEstado,setDestinoEstado] = useState("");
const publicarOferta = async () => {

if(
!origemRua ||
!origemNumero ||
!origemBairro ||
!origemCidade ||
!origemEstado ||
!destinoRua ||
!destinoNumero ||
!destinoBairro ||
!destinoCidade ||
!destinoEstado
){
Alert.alert(t("preenchaTodosCampos"));
return;
}

try{

await addDoc(collection(db,"ofertas"),{

origem:{
rua:origemRua,
numero:origemNumero,
bairro:origemBairro,
cidade:origemCidade,
estado:origemEstado
},

destino:{
rua:destinoRua,
numero:destinoNumero,
bairro:destinoBairro,
cidade:destinoCidade,
estado:destinoEstado
},

userId:usuarioId,
status:"ativa",
criadoEm:Date.now()

});

Alert.alert(t("viagemPublicada"));

}catch(e){

Alert.alert(t("erroPublicarViagem"));

}

};

   // ==========================================
 // �x� BANCO LOCAL DE LOCAIS (CASA/TRAB/FAV)
 // ==========================================
 const [casaSalva, setCasaSalva] = useState<any>(null);
 const [editorTrabalhoVisivel, setEditorTrabalhoVisivel] = useState(false);
const [nomeTrabalhoEscolhido, setNomeTrabalhoEscolhido] = useState("");

 const [trabalhoSalvo, setTrabalhoSalvo] = useState<any>(null);
 const [favoritos, setFavoritos] = useState<any[]>([]);
 const [recentes, setRecentes] = useState<any[]>([]);
 const [amigosLista, setAmigosLista] = useState<any[]>([]);
 const [listaAmigosVisivel, setListaAmigosVisivel] = useState(false);
 const painelAtalhosRef = useRef<ScrollView>(null);
 const [painelAtalhosNoFim, setPainelAtalhosNoFim] = useState(false);
const alturaPainelAtalhosMin = Math.max(76, Math.round((insets.bottom || 0) + 64));
const alturaPainelAtalhosMax = Math.round(Dimensions.get("window").height - (insets.bottom || 56));
const painelAtalhosAltura = useRef(new Animated.Value(alturaPainelAtalhosMin)).current;
const painelAtalhosBaseAltura = useRef(alturaPainelAtalhosMin);
const [painelAtalhosExpandido, setPainelAtalhosExpandido] = useState(false);
const [rotaCoords, setRotaCoords] = useState<any[]>([]);
const [carroPos, setCarroPos] = useState<any>(null);
const [navegando, setNavegando] = useState(false);
const [routeCoords, setRouteCoords] = useState<any[]>([]);
const [routeCoordsFull, setRouteCoordsFull] = useState<any[]>([]);
const [altRouteCoordsFull, setAltRouteCoordsFull] = useState<any[]>([]);
const [destinoPreview, setDestinoPreview] = useState<{ lat:number; lng:number } | null>(null);
const [editorAmigoVisivel, setEditorAmigoVisivel] = useState(false);
const [nomeAmigoEscolhido, setNomeAmigoEscolhido] = useState("");
const [amigoEditandoIndex, setAmigoEditandoIndex] = useState<number | null>(null);
const [routeCoordsDone, setRouteCoordsDone] = useState<any[]>([]);
const [routeCoordsAhead, setRouteCoordsAhead] = useState<any[]>([]);
const FREE_LIMITE_NOMES = 3;

function coordenadaValida(p:any){
  return !!p &&
    Number.isFinite(Number(p.latitude)) &&
    Number.isFinite(Number(p.longitude));
}

function calcularIndiceMaisProximoNaRota(
  pontos:any[],
  lat:number,
  lng:number
){
  if(!Array.isArray(pontos) || pontos.length === 0) return 0;

  let menorDist = Infinity;
  let melhorIdx = 0;

  for(let i=0; i<pontos.length; i++){
    const p = pontos[i];

    const dist = getDistanciaMetros(
      lat,
      lng,
      Number(p.latitude),
      Number(p.longitude)
    );

    if(dist < menorDist){
      menorDist = dist;
      melhorIdx = i;
    }
  }

  return melhorIdx;
}

function separarTrechosRotaPorProgresso(
  pontos:any[],
  lat:number,
  lng:number
){
  const coords = (Array.isArray(pontos) ? pontos : []).filter(coordenadaValida);

  if(coords.length <= 1){
    return {
      done: [],
      ahead: coords
    };
  }

  const idx = calcularIndiceMaisProximoNaRota(coords, lat, lng);

  const done = coords.slice(0, Math.max(2, idx + 1));
  const ahead = coords.slice(Math.max(0, idx));

  return {
    done,
    ahead: ahead.length > 1 ? ahead : coords.slice(Math.max(0, coords.length - 2))
  };
}

useEffect(()=>{
  const base = Array.isArray(routeCoords) && routeCoords.length > 0
    ? routeCoords
    : routeCoordsFull;
  const coords = (Array.isArray(base) ? base : []).filter(coordenadaValida);

  if(coords.length === 0){
    setRouteCoordsDone([]);
    setRouteCoordsAhead([]);
    return;
  }

  if(!navegando || !carroPos){
    setRouteCoordsDone([]);
    setRouteCoordsAhead(coords);
    return;
  }

  const { done, ahead } = separarTrechosRotaPorProgresso(
    coords,
    Number(carroPos.latitude),
    Number(carroPos.longitude)
  );

  setRouteCoordsDone(done);
  setRouteCoordsAhead(ahead);
}, [routeCoords, routeCoordsFull, carroPos, navegando]);
const panResponderPainelAtalhos = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dy) > 3,
    onPanResponderMove: (_evt, gesture) => {
      const proximaAltura = painelAtalhosBaseAltura.current - gesture.dy;
      const clamp = Math.max(alturaPainelAtalhosMin, Math.min(alturaPainelAtalhosMax, proximaAltura));
      painelAtalhosAltura.setValue(clamp);
    },
    onPanResponderRelease: (_evt, gesture) => {
      const alturaAtual = painelAtalhosBaseAltura.current - gesture.dy;
      const destino = Math.max(alturaPainelAtalhosMin, Math.min(alturaPainelAtalhosMax, alturaAtual));
      painelAtalhosBaseAltura.current = destino;
      setPainelAtalhosExpandido(destino > (alturaPainelAtalhosMin + 16));
      Animated.spring(painelAtalhosAltura, {
        toValue: destino,
        damping: 18,
        stiffness: 180,
        mass: 0.9,
        useNativeDriver: false,
      }).start();
    },
  })
).current;

  // ==========================================
 // �x�� POPUP DEFINIR CASA
 // ==========================================
 const [modalCasa, setModalCasa] = useState(false);
 const [modalEnderecoCasa, setModalEnderecoCasa] = useState(false);
const [inputEnderecoCasa, setInputEnderecoCasa] = useState("");

 const [apelidoCasaTemp, setApelidoCasaTemp] = useState("");

  const [sugestoes, setSugestoes] = useState<any[]>([]);
  
  async function buscarPOIsReais(lat:number,lng:number){

 try{

  const raio = 400; // metros

  const query = `
  [out:json];
  (
    node["amenity"="police"](around:${raio},${lat},${lng});
    node["amenity"="fuel"](around:${raio},${lat},${lng});
    node["amenity"="hospital"](around:${raio},${lat},${lng});
    node["amenity"="school"](around:${raio},${lat},${lng});
  );
  out body;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter",{
    method:"POST",
    body: query
  });

  const data = await res.json();

  if(!data.elements) return;

  const resultados = data.elements.map((p:any)=>({
    tipo:
      p.tags?.amenity === "police" ? "police" :
      p.tags?.amenity === "fuel" ? "gas" :
      p.tags?.amenity === "hospital" ? "hospital" :
      p.tags?.amenity === "school" ? "school" :
      "",
    lat: Number(p.lat),
    lng: Number(p.lon)
  })).filter((p:any)=>p.tipo && Number.isFinite(p.lat) && Number.isFinite(p.lng));

  setPoisProximos(resultados);

  data.elements.forEach((p:any)=>{

    const dx = lat - p.lat;
    const dy = lng - p.lon;
    const dist = Math.sqrt(dx*dx+dy*dy)*111000;

    let tipo = "";

    if(p.tags?.amenity === "police") tipo = "police";
    if(p.tags?.amenity === "fuel") tipo = "gas";
    if(p.tags?.amenity === "hospital") tipo = "hospital";
    if(p.tags?.amenity === "school") tipo = "school";

    if(!tipo) return;

    const chave = `${tipo}:${Math.round(Number(p.lat) * 1000)}:${Math.round(Number(p.lon) * 1000)}`;

        if(dist < 180){
      const ultimoDisparo = Number(poisMemoria.current[chave] || 0);
      const agora = Date.now();

      if((agora - ultimoDisparo) > 60000){
        falarPoi(tipo);
        poisMemoria.current[chave] = agora;
      }
    }
  });

 }catch(e){
   console.log("ERRO OSM POI", e);
 }

}

  const [tempo, setTempo] = useState<number | null>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  
  const RAIO_OFERTA_NAVEGANDO_METROS = 2000;

  function ofertaVisivelParaUsuario(oferta:any, uid:any){
    const id = String(uid || "").trim();
    if(!oferta) return false;

    const solicitacoes = Array.isArray(oferta?.solicitacoes)
      ? oferta.solicitacoes.map((s:any)=>String(s))
      : (Array.isArray(oferta?.solicitantes)
        ? oferta.solicitantes.map((s:any)=>String(s))
        : []);

    if(solicitacoes.length === 0) return true;

    if(String(oferta?.criadorId || "") === id) return true;
    if(solicitacoes.includes(id)) return true;

    return false;
  }

  function podeExibirOfertaNoMapa(oferta:any){
    if(!oferta?.origem) return false;
    if(!navegando || !carroPos) return true;

    const distanciaM = getDistanciaMetros(
      Number(carroPos.latitude),
      Number(carroPos.longitude),
      Number(oferta.origem.lat),
      Number(oferta.origem.lng)
    );

    return Number.isFinite(distanciaM) && distanciaM <= RAIO_OFERTA_NAVEGANDO_METROS;
  }
useEffect(()=>{

  if(navegando || routeCoords.length > 0){
    painelAtalhosBaseAltura.current = alturaPainelAtalhosMin;
    setPainelAtalhosExpandido(false);
    painelAtalhosAltura.setValue(alturaPainelAtalhosMin);
  }

}, [navegando, routeCoords.length, alturaPainelAtalhosMin]);

useEffect(()=>{

  const onBackPress = () => {

    if(rotaPronta){
      sheetRef.current?.close?.();
      setRotaPronta(false);
      setAbaAtiva(null);
      setMenuOfertasVisivel(true);
      return true;
    }

    if(menuAberto){
      setMenuAberto(false);
      return true;
    }

    if(navegando){
      sheetRef.current?.close?.();
      setNavegando(false);
      setRotaPronta(false);
      setRouteCoords([]);
      setAltRouteCoords([]);
      setDestinoTxt("");
      setStepsRota([]);
      stepAtualRef.current = 0;
      return true;
    }

    if(chatVisivel){
      setChatVisivel(false);
      setAbaAtiva(null);
      setAbaOfertas("procurar");
      setMenuOfertasVisivel(true);
      return true;
    }

    if(rotaVisivel){
      setRotaVisivel(false);
      return true;
    }

    if(abaAtiva){
      setAbaAtiva(null);
      setAbaOfertas("procurar");
      setMenuOfertasVisivel(true);
      return true;
    }

    // se menu aberto �  fechar
    if(menuOfertasVisivel){
      setAbaOfertas("procurar");
      setMenuOfertasVisivel(false);
      return true;
    }

    // se card oferta aberto �  fechar
    if(ofertaSelecionada){
      setOfertaSelecionada(null);
      return true;
    }

    if(routeCoords.length > 0){
      setRouteCoords([]);
      setAltRouteCoords([]);
      setDestinoTxt("");
      setStepsRota([]);
      stepAtualRef.current = 0;
      return true;
    }

    // se nada estiver aberto, deixa o Android fechar o app
    return false;
  };

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    onBackPress
  );

  return ()=> subscription.remove();

},[abaAtiva, chatVisivel, menuAberto, menuOfertasVisivel, ofertaSelecionada, navegando, rotaVisivel, routeCoords.length, rotaPronta]);

useEffect(()=>{
  if(!rotaPronta){
    sheetRef.current?.close?.();
  }
}, [rotaPronta]);


  useEffect(()=>{
  console.log("ESTADO NAVEGANDO:", navegando);
},[navegando]);
 
  const [modoTransporte, setModoTransporte] = useState("carro");
  // opções com tempo estimado estilo Google Maps
  const [frasesLateral, setFrasesLateral] = useState<any>(null);
const opcoesTransporte = [
  {
    iconName:"car",
    frase: frasesLateral?.carro || FRASES_TRANSPORTE?.carro?.[0] || "Route mode",
    tempo: tempo || 0,
    tipo:"carro"
  },
  {
    iconName:"motorbike",
    frase: frasesLateral?.moto || FRASES_TRANSPORTE?.moto?.[0] || "Motorbike mode",
    tempo: tempo ? Math.round(tempo * 0.8) : 0,
    tipo:"moto"
  },
  {
    iconName:"bike",
    frase: frasesLateral?.bike || FRASES_TRANSPORTE?.bike?.[0] || "Bike mode",
    tempo: tempo ? Math.round(tempo * 2.5) : 0,
    tipo:"bike"
  },
  {
    iconName:"walk",
    frase: frasesLateral?.pe || FRASES_TRANSPORTE?.pe?.[0] || "Walk mode",
    tempo: tempo ? Math.round(tempo * 8) : 0,
    tipo:"pe"
  },
  {
    iconName:"bus",
    frase: frasesLateral?.bus || FRASES_TRANSPORTE?.bus?.[0] || "Bus mode",
    tempo: tempo ? Math.round(tempo * 1.5) : 0,
    tipo:"bus"
  }
];

useEffect(() => {
  const frasesGeradas:any = {};

  Object.keys(FRASES_TRANSPORTE).forEach((tipo) => {
    const lista = FRASES_TRANSPORTE[tipo];
    if(lista && lista.length){
      const frase = lista[Math.floor(Math.random() * lista.length)];
      frasesGeradas[tipo] = frase;
    }
  });

  setFrasesLateral(frasesGeradas);
}, [idiomaAtual]);

 
useEffect(() => {

  if(!carroPos) return;

  reportsTrajeto.forEach((r) => {

    const dx = carroPos.latitude - r.lat;
    const dy = carroPos.longitude - r.lng;

    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 0.001){

      const jaFalou = reportsAvisadosRef.current[r.id];

      if(jaFalou && Date.now() - jaFalou < 60000) return;

      reportsAvisadosRef.current[r.id] = Date.now();

      try{

        const tipoNormalizado = String(r?.tipo || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        if(tipoNormalizado.includes("pol")){
          falar("Polícia à frente");
        }

        if(tipoNormalizado.includes("radar")){
          falar("Radar à frente");
        }

        if(tipoNormalizado.includes("lentidao")){
          falar("Lentidão à frente");
        }

        if(tipoNormalizado.includes("trans")){
          falar("Trânsito à frente");
        }

        if(tipoNormalizado.includes("obra")){
          falar("Obra à frente");
        }

      }catch{}

    }

  });

}, [carroPos, reportsTrajeto]);
const stepAtualVisual =
  navegando && stepsRota.length > 0
    ? stepsRota[Math.min(stepAtualRef.current, stepsRota.length - 1)]
    : null;

function obterAlvoStep(step:any){
  if(!step) return null;

  const alvoManeuver = step?.maneuver?.location;
  if(Array.isArray(alvoManeuver) && alvoManeuver.length >= 2){
    const latitude = Number(alvoManeuver[1]);
    const longitude = Number(alvoManeuver[0]);

    if(Number.isFinite(latitude) && Number.isFinite(longitude)){
      return { latitude, longitude };
    }
  }

  if(
    Array.isArray(step?.way_points) &&
    Array.isArray(routeCoordsFull) &&
    routeCoordsFull.length > 0
  ){
    const waypointIndex = Number(step.way_points[step.way_points.length - 1]);
    const ponto = routeCoordsFull[waypointIndex];

    if(
      ponto &&
      Number.isFinite(Number(ponto.latitude)) &&
      Number.isFinite(Number(ponto.longitude))
    ){
      return {
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude)
      };
    }
  }

  return null;
}

function indiceWaypointFinalDoStep(step:any){
  if(!Array.isArray(step?.way_points) || step.way_points.length === 0) return null;
  const idx = Number(step.way_points[step.way_points.length - 1]);
  return Number.isFinite(idx) ? idx : null;
}

const distanciaStepAtualM = useMemo(() => {
  if (!navegando || !carroPos || !stepAtualVisual) return null;

  const alvo = obterAlvoStep(stepAtualVisual);
  const alvoLat = alvo?.latitude;
  const alvoLng = alvo?.longitude;

  if(
    !Number.isFinite(Number(alvoLat)) ||
    !Number.isFinite(Number(alvoLng))
  ){
    return null;
  }

  return Math.round(
    calcularDistancia(
      Number(carroPos.latitude),
      Number(carroPos.longitude),
      Number(alvoLat),
      Number(alvoLng)
    ) * 1000
  );
}, [navegando, carroPos, stepAtualVisual, routeCoordsFull]);

const instrucaoTopoTitulo = useMemo(() => {
  return montarInstrucaoNavegacao(stepAtualVisual, "topo");
}, [stepAtualVisual, idiomaAtual]);

const instrucaoTopoDistancia = useMemo(() => {
  if (!Number.isFinite(Number(distanciaStepAtualM))) return "";
  const metros = Number(distanciaStepAtualM);
  if (metros >= 1000) return `${(metros / 1000).toFixed(1)} km`;
  return `${metros} m`;
}, [distanciaStepAtualM]);
 
  const ultimoStepFalado = useRef(-1);

useEffect(()=>{

  
 if(!navegando) return;
 if(!carroPos) return;
 if(!stepsRota || stepsRota.length===0) return;
 const velocidadeLocalKmH = Math.max(0, Number(carroPos?.speed || 0) * 3.6);
 if(velocidadeLocalKmH < 6) return;
if(routeCoords.length > 0 && carroPos){

  // pega ponto mais próximo da rota
  const pontoMaisProximo = routeCoords.reduce((prev:any, curr:any)=>{
    const distPrev = calcularDistancia(
      carroPos.latitude,
      carroPos.longitude,
      prev.latitude,
      prev.longitude
    );

    const distCurr = calcularDistancia(
      carroPos.latitude,
      carroPos.longitude,
      curr.latitude,
      curr.longitude
    );

    return distCurr < distPrev ? curr : prev;
  });

  const distancia = calcularDistancia(
    carroPos.latitude,
    carroPos.longitude,
    pontoMaisProximo.latitude,
    pontoMaisProximo.longitude
  );

  // o recálculo principal acontece no watcher de GPS para evitar duplicidade
  if(distancia > 0.05){
    return;
  }
}
 const stepIndex = stepAtualRef.current;
 const step = stepsRota[stepIndex];

 if(!step) return;

 const alvo = obterAlvoStep(step);
 if(!alvo) return;

 const lat = alvo.latitude;
 const lng = alvo.longitude;

 const dx = carroPos.latitude - lat;
 const dy = carroPos.longitude - lng;
 const distancia = Math.sqrt(dx*dx+dy*dy)*111000;

 // ===== FALAR INSTRU�!ÒO =====
 if(distancia < 220){

   if(stepIndex !== ultimoStepFalado.current){
     ultimoStepFalado.current = stepIndex;
     falarInstrucao(step, distancia);
   }

 }

 // ===== PASSOU DO PONTO �  PROX STEP =====
 if(distancia < 30){
   stepAtualRef.current++;
 }

}, [carroPos, navegando]);

  const [velocidade, setVelocidade] = useState(0);
   // ==========================================
 // �xa� BOTÒO REPORT FLUTUANTE
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

  const poisMemoria = useRef<Record<string, number>>({});
  const ultimaBuscaPOI = useRef<{lat:number,lng:number} | null>(null);


const ultimoAviso = useRef(0);
const contadorErros = useRef(0);
const memoriaErros = useRef<Record<string,number>>({});
const historicoWrongLinesRef = useRef<string[]>([]);
const contadorXingamentosRef = useRef(0);

const ultimoPensamento = useRef(0);
const ultimaDistanciaStepRef = useRef<number | null>(null);
const afastandoStepCountRef = useRef(0);

// distância inteligente baseada na velocidade
function distanciaAlerta(){
 if(velocidade < 20) return 120;
 if(velocidade < 40) return 200;
 if(velocidade < 70) return 300;
 if(velocidade < 100) return 450;
 return 600;
}
function podeBuscarPOI(lat:number,lng:number){

  if(!navegando) return false;
  if(velocidade < 6) return false;

  if(!ultimaBuscaPOI.current){
    ultimaBuscaPOI.current = {lat,lng};
    return true;
  }

  const dx = lat - ultimaBuscaPOI.current.lat;
  const dy = lng - ultimaBuscaPOI.current.lng;
  const dist = Math.sqrt(dx*dx+dy*dy)*111000;

  if(dist > 250){
    ultimaBuscaPOI.current = {lat,lng};
    return true;
  }

  return false;
}

  const [mapMovido, setMapMovido] = useState(false);
  const mapMovidoRef = useRef(false);
  const bloqueioAutoCamera = useRef(false);

useEffect(() => {
  if (!navegando) {
    setMapMovido(false);
    mapMovidoRef.current = false;
  }
}, [navegando]);

   // ==========================================
 // �x  SISTEMA TOQUE INTELIGENTE
 // ==========================================
 const ultimoToque = useRef(0);
 const timeoutToque = useRef<any>(null);
 const [menuReportVisivel, setMenuReportVisivel] = useState(false);

 // config salva
 const [toqueDuploAtivo, setToqueDuploAtivo] = useState(true);

// libera após 2 segundos

  const [foraRota, setForaRota] = useState(false);
  
 function clamp(valor:number, min:number, max:number){
  return Math.max(min, Math.min(max, valor));
}

function grausParaRadianos(g:number){
  return (g * Math.PI) / 180;
}
function headingMapaAtual(){
  return Number(carroPos?.heading || 0) + Number(getVeiculoPorId(veiculoGpsId)?.headingOffset || 0);
}
function bearingEntrePontos(
  lat1:number,
  lng1:number,
  lat2:number,
  lng2:number
){
  const phi1 = grausParaRadianos(lat1);
  const phi2 = grausParaRadianos(lat2);
  const lambda1 = grausParaRadianos(lng1);
  const lambda2 = grausParaRadianos(lng2);

  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);

  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

function deslocarCentroPelaDirecao(
  lat:number,
  lng:number,
  heading:number,
  metros:number
){
  const rad = grausParaRadianos(heading);
  const dLat = (Math.cos(rad) * metros) / 111111;
  const dLng =
    (Math.sin(rad) * metros) /
    (111111 * Math.max(0.2, Math.cos(grausParaRadianos(lat))));

  return {
    latitude: lat + dLat,
    longitude: lng + dLng
  };
}
 function suavizarHeading(atual:number, alvo:number, fator:number = 0.18){
  let diff = alvo - atual;

  while(diff > 180) diff -= 360;
  while(diff < -180) diff += 360;

  return (atual + diff * fator + 360) % 360;
}
// ==========================================
// �xa GPS REAL � RASTREAMENTO CONTÍNUO
// ==========================================
useEffect(()=>{

  let sub:any = null;

  async function iniciarGPS(){

    const { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== "granted") return;

    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 900,
        distanceInterval: 2,
      },
      (loc)=>{

        const lat = Number(loc.coords.latitude);
        const lng = Number(loc.coords.longitude);

        setCarroPos(loc.coords);

        if(!regiaoInicial){
          setRegiaoInicial({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        const velocidadeAtual = Math.max(0, Number(loc.coords.speed || 0) * 3.6);
        setVelocidade(Math.round(velocidadeAtual));

        if(!navegando) return;

      // =============================
// �x}� C�MERA MAIS BAIXA E MUITO MAIS PR�XIMA
// =============================
if(!mapMovidoRef.current){

  let headingReal = Number(loc.coords.heading ?? 0);

  if(!(Number.isFinite(headingReal) && headingReal > 0)){
    const proxStep = stepsRota?.[stepAtualRef.current];
    const alvo = obterAlvoStep(proxStep);

    if(alvo){
      headingReal = bearingEntrePontos(
        lat,
        lng,
        Number(alvo.latitude),
        Number(alvo.longitude)
      );
    }else{
      headingReal = ultimoHeadingValidoRef.current || 0;
    }
  }

  if(!Number.isFinite(ultimoHeadingValidoRef.current) || ultimoHeadingValidoRef.current <= 0){
    ultimoHeadingValidoRef.current = headingReal;
  }else{
    ultimoHeadingValidoRef.current = suavizarHeading(
      ultimoHeadingValidoRef.current,
      headingReal,
      0.12
    );
  }

  const headingSuave = ultimoHeadingValidoRef.current;

  let zoomCamera = 17.95;
  let pitchCamera = 52;
  let metrosFrente = 34;
  let duracaoCamera = 260;
  let altitudeCamera = 360;

  if(velocidadeAtual >= 20 && velocidadeAtual < 45){
    zoomCamera = 17.8;
    pitchCamera = 54;
    metrosFrente = 48;
    duracaoCamera = 280;
    altitudeCamera = 430;
  }else if(velocidadeAtual >= 45 && velocidadeAtual < 75){
    zoomCamera = 17.55;
    pitchCamera = 56;
    metrosFrente = 62;
    duracaoCamera = 300;
    altitudeCamera = 500;
  }else if(velocidadeAtual >= 75){
    zoomCamera = 17.25;
    pitchCamera = 58;
    metrosFrente = 76;
    duracaoCamera = 320;
    altitudeCamera = 580;
  }

  const centro = deslocarCentroPelaDirecao(
    lat,
    lng,
    headingSuave,
    metrosFrente
  );

  mapRef.current?.animateCamera(
    {
      center: centro,
      heading: headingSuave,
      pitch: pitchCamera,
      zoom: zoomCamera,
      altitude: altitudeCamera
    },
    { duration: duracaoCamera }
  );
}
        // ===== POIs =====
        if(podeBuscarPOI(lat,lng)){
          buscarPOIsReais(lat,lng);
        }

        // ===== FORA DA ROTA =====
        const podeAvaliarErroRota =
          velocidadeAtual >= 2 &&
          stepsRota.length > 0 &&
          Array.isArray(routeCoordsFull) && routeCoordsFull.length > 8;

        const distRota = podeAvaliarErroRota
          ? distanciaAteRota(lat,lng)
          : 0;

               let toleranciaForaRota = 95;
        if(velocidadeAtual >= 20 && velocidadeAtual < 50){
          toleranciaForaRota = 120;
        }else if(velocidadeAtual >= 50 && velocidadeAtual < 80){
          toleranciaForaRota = 150;
        }else if(velocidadeAtual >= 80){
          toleranciaForaRota = 190;
        }

        const realmenteForaRota = distRota > toleranciaForaRota;
        const agoraForaRota = Date.now();
        const emSilencioForaRota = agoraForaRota < silencioAposRecalculoRef.current;
        const amostrasMinimasForaRota = 1;

        if(!podeAvaliarErroRota){
          foraRotaCountRef.current = 0;
          ultimoXingamentoForaRotaRef.current = 0;
          xingamentosNoEventoForaRotaRef.current = 0;
          setForaRota(false);
        }else{
          if(realmenteForaRota){
            const primeiraDeteccaoEvento = foraRotaCountRef.current === 0;
            foraRotaCountRef.current += 1;
            const repeticoesNoEvento = xingamentosNoEventoForaRotaRef.current;
            const intervaloXingamentoMs =
              repeticoesNoEvento === 0
                ? 1200
                : repeticoesNoEvento < 2
                  ? 1800
                  : repeticoesNoEvento < 4
                    ? 3500
                    : 6000;

            if(
              !emSilencioForaRota &&
              (
                primeiraDeteccaoEvento ||
                agoraForaRota - ultimoXingamentoForaRotaRef.current > intervaloXingamentoMs
              )
            ){
              ultimoXingamentoForaRotaRef.current = agoraForaRota;
              falarErroRota();
              xingamentosNoEventoForaRotaRef.current += 1;
            }
          }else{
            foraRotaCountRef.current = 0;
            ultimoXingamentoForaRotaRef.current = 0;
            xingamentosNoEventoForaRotaRef.current = 0;
          }

          const foraRotaConfirmada = foraRotaCountRef.current >= amostrasMinimasForaRota;
          setForaRota(realmenteForaRota && foraRotaConfirmada);

          if(realmenteForaRota && foraRotaConfirmada && distRota > (toleranciaForaRota + 12)){
            if(
              agoraForaRota - ultimoRecalculo.current > 1400 &&
              !recalculandoRotaRef.current
            ){
              if(xingamentosNoEventoForaRotaRef.current === 0){
                ultimoXingamentoForaRotaRef.current = agoraForaRota;
                falarErroRota();
                xingamentosNoEventoForaRotaRef.current += 1;
              }

              recalculandoRotaRef.current = true;
              ultimoRecalculo.current = agoraForaRota;
              silencioAposRecalculoRef.current = agoraForaRota + 250;
              foraRotaCountRef.current = 0;

              setTimeout(()=>{
                Promise.resolve(buscarDestino(true))
                  .finally(()=>{
                    recalculandoRotaRef.current = false;
                  });
              }, 120);

              return;
            }
          }
        }

        // ===== INSTRU�!�"ES DE CURVA =====
       if(stepsRota.length > 0){

  let stepIndexAtual = stepAtualRef.current;
  let stepAtual = stepsRota[stepIndexAtual];

  if(!stepAtual) return;

      const alvo = obterAlvoStep(stepAtual);
      if(!alvo) return;

      const dLat = lat - Number(alvo.latitude);
      const dLng = lng - Number(alvo.longitude);
  let dist = Math.sqrt(dLat*dLat + dLng*dLng) * 111000;

  // sincroniza o step com o progresso real na polilinha para não travar em via antiga.
  if(
    Array.isArray(routeCoordsFull) &&
    routeCoordsFull.length > 20 &&
    stepIndexAtual < stepsRota.length - 1 &&
    velocidadeAtual >= 8
  ){
    const idxRotaAtual = calcularIndiceMaisProximoNaRota(routeCoordsFull, lat, lng);
    const idxStepAtual = indiceWaypointFinalDoStep(stepAtual);

    if(
      Number.isFinite(idxRotaAtual) &&
      Number.isFinite(Number(idxStepAtual)) &&
      idxRotaAtual > Number(idxStepAtual) + 14 &&
      dist > 42
    ){
      let novoStep = stepIndexAtual;

      for(let idx = stepIndexAtual + 1; idx < stepsRota.length; idx++){
        const candIdx = indiceWaypointFinalDoStep(stepsRota[idx]);
        if(!Number.isFinite(Number(candIdx))) continue;

        if(Number(candIdx) >= idxRotaAtual - 6){
          novoStep = idx;
          break;
        }
      }

      if(novoStep > stepIndexAtual){
        stepAtualRef.current = novoStep;
        ultimoStepPreAvisadoRef.current = -1;
        ultimoStepCurvaFaladoRef.current = -1;
        stepMonitoradoRef.current = -1;
        ultimaDistanciaStepRef.current = null;
        afastandoStepCountRef.current = 0;
        stepMuitoLongeCountRef.current = 0;
        falarErroRota();
        return;
      }
    }
  }

  if(stepMonitoradoRef.current !== stepIndexAtual){
    stepMonitoradoRef.current = stepIndexAtual;
    ultimaDistanciaStepRef.current = null;
    afastandoStepCountRef.current = 0;
    stepMuitoLongeCountRef.current = 0;
  }

  // se já passou muito do step atual, tenta achar um próximo mais coerente
  if(dist > 280 && stepIndexAtual < stepsRota.length - 1){
    let melhorIdx = stepIndexAtual;
    let melhorDist = dist;
    const limiteBusca = Math.min(stepsRota.length - 1, stepIndexAtual + 8);

    for(let idx = stepIndexAtual + 1; idx <= limiteBusca; idx++){
      const candidato = stepsRota[idx];
      const alvoCand = obterAlvoStep(candidato);
      if(!alvoCand) continue;

      const cdLat = lat - Number(alvoCand.latitude);
      const cdLng = lng - Number(alvoCand.longitude);
      const distCand = Math.sqrt(cdLat*cdLat + cdLng*cdLng) * 111000;

      if(distCand < melhorDist){
        melhorDist = distCand;
        melhorIdx = idx;
      }
    }

    if(melhorIdx !== stepIndexAtual && melhorDist + 60 < dist){
      stepAtualRef.current = melhorIdx;
      ultimoStepPreAvisadoRef.current = -1;
      ultimoStepCurvaFaladoRef.current = -1;
      stepMonitoradoRef.current = -1;
      ultimaDistanciaStepRef.current = null;
      afastandoStepCountRef.current = 0;
      stepMuitoLongeCountRef.current = 0;
      falarErroRota();
      return;
    }
  }

  const passouDoPonto =
    ultimaDistanciaStepRef.current !== null &&
    dist > (ultimaDistanciaStepRef.current + 16) &&
    dist < 90;

  if(ultimaDistanciaStepRef.current !== null && dist > ultimaDistanciaStepRef.current + 30){
    afastandoStepCountRef.current += 1;
  }else{
    afastandoStepCountRef.current = 0;
  }

  if(dist > 240){
    stepMuitoLongeCountRef.current += 1;
  }else{
    stepMuitoLongeCountRef.current = 0;
  }

  const agora = Date.now();
const emSilencio = agora < silencioAposRecalculoRef.current;

const stepFalavel = stepEhFalavel(stepAtual);
  const tipoStepAtual = String(stepAtual?.maneuver?.type || "").toLowerCase();
  const modifierStepAtual = String(stepAtual?.maneuver?.modifier || "").toLowerCase();
  const stepReto =
    modifierStepAtual.includes("straight") ||
    tipoStepAtual === "continue" ||
    tipoStepAtual === "depart" ||
    tipoStepAtual === "new name";
  const distanciaMaxPreAviso = stepReto ? 1800 : 140;
  const distanciaMinPreAviso = stepReto ? 120 : 45;

// pré-aviso só para step falável
if(
  stepFalavel &&
    dist < distanciaMaxPreAviso &&
    dist > distanciaMinPreAviso &&
  ultimoStepPreAvisadoRef.current !== stepIndexAtual
){
  ultimoStepPreAvisadoRef.current = stepIndexAtual;
  falarInstrucao(stepAtual, dist);
}

// manobra final
if(
  stepFalavel &&
  (dist < 26 || passouDoPonto) &&
  ultimoStepCurvaFaladoRef.current !== stepIndexAtual
){
  if(dist < 26){
    falarInstrucao(stepAtual, 0);
  }

  ultimoStepCurvaFaladoRef.current = stepIndexAtual;
  stepAtualRef.current++;
  stepMonitoradoRef.current = -1;
  ultimaDistanciaStepRef.current = null;
  afastandoStepCountRef.current = 0;
  stepMuitoLongeCountRef.current = 0;
  return;
}

// se o step não é falável e já está perto, avança silenciosamente
if(!stepFalavel && dist < 22){
  stepAtualRef.current++;
  stepMonitoradoRef.current = -1;
  ultimaDistanciaStepRef.current = null;
  afastandoStepCountRef.current = 0;
  stepMuitoLongeCountRef.current = 0;
  return;
}

  ultimaDistanciaStepRef.current = dist;
}
      }
    );
  }

  iniciarGPS();

  return ()=>{
    if(sub) sub.remove();
  };

},[navegando, stepsRota]);

useEffect(()=>{
  if(!navegando || !stepAtualVisual) return;
  if(ultimaInstrucaoRef.current) return;

  const distanciaInicial = Number(distanciaStepAtualM);
  const distanciaFalavel = Number.isFinite(distanciaInicial) && distanciaInicial > 0
    ? Math.max(60, distanciaInicial)
    : 120;

  const timer = setTimeout(()=>{
    if(!ultimaInstrucaoRef.current){
      falarInstrucao(stepAtualVisual, distanciaFalavel);
    }
  }, 650);

  return ()=>clearTimeout(timer);
}, [navegando, stepAtualVisual, distanciaStepAtualM]);

useEffect(() => {
  let ativo = true;

  (async () => {
    try{
      const keepAwakeDisponivel = await keepAwakeDisponivelAsync();
      if(!keepAwakeDisponivel) return;

      if(navegando){
        await activateKeepAwakeAsync("gpsclean-navigation");
      }else{
        await deactivateKeepAwake("gpsclean-navigation");
      }
    }catch(e){
      if(ativo){
        console.log("keep-awake aviso:", e);
      }
    }
  })();

  return () => {
    ativo = false;
  };
}, [navegando]);

useEffect(() => {
  return () => {
    deactivateKeepAwake("gpsclean-navigation").catch(()=>{});
  };
}, []);
useEffect(() => {
  let ativo = true;

  (async () => {
    try {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        shouldRouteThroughEarpiece: false,
        shouldPlayInBackground: false,
      });
    } catch (e) {
      if (ativo) {
        console.log("audio-mode aviso:", e);
      }
    }
  })();

  return () => {
    ativo = false;
  };
}, []);

useEffect(()=>{
  if (!usuarioEhPro() || !modoComico) {
    pararModoComicoLoop();
    return;
  }

  iniciarModoComicoLoop();

  return ()=>{
    pararModoComicoLoop();
  };

},[modoComico, planoAtual, idiomaAtual]);

  
  // ===============================
async function buscarSugestoes(texto:string){

  setDestinoTxt(texto);

  if(texto.length < 3){
    setSugestoes([]);
    return;
  }

  try{

    const response = await fetch(
      `https://api.openrouteservice.org/geocode/autocomplete?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0=&text=${encodeURIComponent(texto)}&size=5`
    );

    const json = await response.json();

    if(json.features){
      const lista = json.features.map((f:any)=>({
        description: f.properties.label
      }));

      setSugestoes(lista);
    }else{
      setSugestoes([]);
    }

  }catch(e){
    console.log("erro autocomplete ORS",e);
    setSugestoes([]);
  }
}

async function buscarSugestoesOrigem(texto:string){

 if(texto.length < 3){
   setSugestoesOrigem([]);
   return;
 }

 try{

  const response = await fetch(
    `https://api.openrouteservice.org/geocode/autocomplete?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0=&text=${encodeURIComponent(texto)}&size=5`
  );

  const json = await response.json();

  if(json.features){
    const lista = json.features.map((f:any)=>({
      description: f.properties.label
    }));

    setSugestoesOrigem(lista);
  }else{
    setSugestoesOrigem([]);
  }

 }catch(e){
  console.log("erro origem ORS",e);
  setSugestoesOrigem([]);
 }

}

async function buscarSugestoesDestino(texto:string){

  setDestinoTxt(texto);

  const textoLimpo = String(texto || "").trim();

  if(textoLimpo.length < 3){
    setSugestoes([]);
    setSugestoesDestino([]);
    return;
  }

  try{
    const geocodeQuery = textoLimpo;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(geocodeQuery)}&limit=8&addressdetails=1`;
    console.log("[GEOCODE_QUERY]", geocodeQuery);
    console.log("[GEOCODE_URL]", url);

    const response = await fetch(url, {
      headers:{ "User-Agent":"gps-clean-app" }
    });

    const json = await response.json();
    const primeiroResultado = Array.isArray(json) ? json[0] : null;
    console.log("[GEOCODE_RESULT]", primeiroResultado);

    const consulta = normalizarTextoBusca(textoLimpo);
    const tokens = consulta.split(/\s+/).filter(Boolean);

    let lista = (Array.isArray(json) ? json : [])
      .map((item:any)=>{
        const address = item?.address || {};

        const rua = String(
          address?.road ||
          address?.pedestrian ||
          address?.footway ||
          address?.path ||
          address?.cycleway ||
          address?.street ||
          ""
        ).trim();
        const numero = String(address?.house_number || "").trim();
        const enderecoRua = numero && rua ? `${rua}, ${numero}` : rua;

        const cidade = String(
          address?.city ||
          address?.town ||
          address?.village ||
          address?.municipality ||
          address?.county ||
          ""
        ).trim();

        const estado = String(address?.state || "").trim();

        let description: string;
        if(enderecoRua && cidade){
          description = `${enderecoRua}, ${cidade}${estado ? `, ${estado}` : ""}`;
        } else if(enderecoRua){
          description = `${enderecoRua}${cidade ? `, ${cidade}` : ""}${estado ? `, ${estado}` : ""}`;
        } else if(cidade && estado){
          description = `${cidade}, ${estado}`;
        } else if(cidade){
          description = cidade;
        } else {
          description = String(item?.display_name || "").split(",").slice(0,3).join(", ").trim();
        }

        const enderecoCompleto = String(item?.display_name || "").trim();
        const normalizado = normalizarTextoBusca(description || enderecoCompleto);
        const classe = String(item?.class || "").toLowerCase();
        const tipo = String(item?.type || "").toLowerCase();

        let score = 0;
        if(normalizado.startsWith(consulta)) score += 100;
        if(normalizado.includes(consulta)) score += 50;
        if(tokens.length > 0 && tokens.every((t)=>normalizado.includes(t))) score += 30;
        // Preferir resultados com rua específica (highway, building)
        if(enderecoRua) score += 40;
        if(classe === "highway" || tipo === "residential" || tipo === "primary" || tipo === "secondary" || tipo === "tertiary" || tipo === "unclassified" || tipo === "service") score += 35;
        if(classe === "place") score += 20;
        if(["city","town","village","municipality","administrative","state","county"].includes(tipo)) score += 10;

        return {
          description,
          enderecoCompleto,
          lat: parseFloat(item?.lat),
          lng: parseFloat(item?.lon),
          score
        };
      })
      .filter((item:any)=>item.description && Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .sort((a:any,b:any)=>b.score - a.score)
      .slice(0,6)
      .map((item:any)=>({
        description: item.description,
        enderecoCompleto: item.enderecoCompleto,
        lat: item.lat,
        lng: item.lng
      }));

    if(lista.length === 0){
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(geocodeQuery)}&limit=8`;
      console.log("[GEOCODE_URL]", photonUrl);
      const photonRes = await fetch(photonUrl, { headers:{ "Accept":"application/json" } });
      const photonJson = await photonRes.json();

      lista = (Array.isArray(photonJson?.features) ? photonJson.features : [])
        .map((feature:any)=>{
          const props = feature?.properties || {};
          const rua = String(props?.street || props?.name || "").trim();
          const numero = String(props?.housenumber || "").trim();
          const enderecoRua = numero && rua ? `${rua}, ${numero}` : rua;
          const cidade = String(props?.city || props?.town || props?.village || "").trim();
          const estado = String(props?.state || props?.county || "").trim();
          const pais = String(props?.country || "").trim();
          const nome = String(props?.name || "").trim();

          // Se é uma rua/endereço, montar com rua primeiro
          let description: string;
          if(enderecoRua && enderecoRua !== nome && cidade){
            description = [enderecoRua, cidade, estado, pais].filter(Boolean).join(", ");
          } else {
            description = [nome || cidade, estado, pais].filter(Boolean).join(", ");
          }
          const lng = Number(feature?.geometry?.coordinates?.[0]);
          const lat = Number(feature?.geometry?.coordinates?.[1]);

          return {
            description: description || `${cidade}${estado ? `, ${estado}` : ""}`,
            enderecoCompleto: description || `${cidade}${estado ? `, ${estado}` : ""}`,
            lat,
            lng,
          };
        })
        .filter((item:any)=>item.description && Number.isFinite(item.lat) && Number.isFinite(item.lng))
        .slice(0, 6);
    }

    if(lista.length === 0){
      const orsUrl = `https://api.openrouteservice.org/geocode/autocomplete?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0=&text=${encodeURIComponent(geocodeQuery)}&size=5`;
      console.log("[GEOCODE_URL]", orsUrl);
      const orsRes = await fetch(orsUrl, { headers:{ "Accept":"application/json" } });
      const orsJson = await orsRes.json();

      lista = (Array.isArray(orsJson?.features) ? orsJson.features : [])
        .map((f:any)=>{
          const description = String(f?.properties?.label || "").trim();
          const lng = Number(f?.geometry?.coordinates?.[0]);
          const lat = Number(f?.geometry?.coordinates?.[1]);
          return {
            description,
            enderecoCompleto: description,
            lat,
            lng
          };
        })
        .filter((item:any)=>item.description && Number.isFinite(item.lat) && Number.isFinite(item.lng));
    }

    setSugestoes(lista);
    setSugestoesDestino(lista);

  }catch(e){
    console.log("erro nominatim",e);
    setSugestoes([]);
    setSugestoesDestino([]);
  }
}
function decodificarPolylineORS(encoded:string){
  const points:{ latitude:number; longitude:number }[] = [];

  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while(index < len){
    let b = 0;
    let shift = 0;
    let result = 0;

    do{
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    }while(b >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do{
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    }while(b >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return points;
}
function recortarPreviewFinalDaRota(
  coords:any[],
  destinoLat:number,
  destinoLng:number,
  maxPontos:number = 28
){
  const lista = Array.isArray(coords) ? coords : [];
  if(lista.length <= maxPontos){
    const ultimo = lista[lista.length - 1];
    if(
      !ultimo ||
      Number(ultimo.latitude) !== Number(destinoLat) ||
      Number(ultimo.longitude) !== Number(destinoLng)
    ){
      return [
        ...lista,
        { latitude: Number(destinoLat), longitude: Number(destinoLng) }
      ];
    }
    return lista;
  }

  const cortada = lista.slice(-maxPontos);
  const ultimo = cortada[cortada.length - 1];

  if(
    !ultimo ||
    Number(ultimo.latitude) !== Number(destinoLat) ||
    Number(ultimo.longitude) !== Number(destinoLng)
  ){
    cortada.push({
      latitude: Number(destinoLat),
      longitude: Number(destinoLng)
    });
  }

  return cortada;
}

const buscarRotaORS = async (origem:any, destino:any) => {
  if(
    !origem ||
    !destino ||
    origem.lat === undefined ||
    origem.lng === undefined ||
    destino.lat === undefined ||
    destino.lng === undefined
  ){
    console.log("Rota cancelada � coordenadas inválidas");
    return null;
  }

  try{
    console.log("ORIGEM ENVIADA:", origem);
    console.log("DESTINO ENVIADO:", destino);

    const res = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEyODU2NWExYzJiNTQ4MDVhMWMyYjQ0YjkzMTYxMDhlIiwiaCI6Im11cm11cjY0In0="
        },
        body: JSON.stringify({
          coordinates:[
            [Number(origem.lng), Number(origem.lat)],
            [Number(destino.lng), Number(destino.lat)]
          ],
          instructions: true
        })
      }
    );

    const texto = await res.text();

    if(!res.ok){
      console.log("ORS HTTP STATUS:", res.status);
      console.log("ORS BODY:", String(texto || "").slice(0, 300));
      throw new Error(`ORS HTTP ${res.status}`);
    }

    if(!texto || String(texto).trim().startsWith("<")){
      console.log("ORS resposta inválida:", String(texto || "").slice(0, 300));
      throw new Error("ORS resposta inválida");
    }

    let data:any = null;

    try{
      data = JSON.parse(texto);
    }catch(e){
      console.log("Erro parse ORS:", e);
      throw new Error("Falha parse ORS");
    }

    let coords:any[] = [];
    let distanciaMetros = 0;
    let duracaoSegundos = 0;
    let steps:any[] = [];

    if(Array.isArray(data?.features) && data.features.length > 0){
      const feat = data.features[0];

      if(Array.isArray(feat?.geometry?.coordinates)){
        coords = feat.geometry.coordinates.map((c:any)=>({
          latitude: Number(c[1]),
          longitude: Number(c[0])
        }));
      }

      distanciaMetros = Number(
        feat?.properties?.summary?.distance ||
        feat?.properties?.segments?.[0]?.distance ||
        0
      );

      duracaoSegundos = Number(
        feat?.properties?.summary?.duration ||
        feat?.properties?.segments?.[0]?.duration ||
        0
      );

      steps = Array.isArray(feat?.properties?.segments?.[0]?.steps)
        ? feat.properties.segments[0].steps
        : [];
    }

    if((!coords || coords.length < 2) && Array.isArray(data?.routes) && data.routes.length > 0){
      const rota = data.routes[0];

      if(Array.isArray(rota?.geometry?.coordinates)){
        coords = rota.geometry.coordinates.map((c:any)=>({
          latitude: Number(c[1]),
          longitude: Number(c[0])
        }));
      }else if(typeof rota?.geometry === "string" && rota.geometry.trim()){
        coords = decodificarPolylineORS(rota.geometry);
      }

      distanciaMetros = Number(rota?.summary?.distance || rota?.distance || 0);
      duracaoSegundos = Number(rota?.summary?.duration || rota?.duration || 0);

      steps = Array.isArray(rota?.segments?.[0]?.steps)
        ? rota.segments[0].steps
        : [];
    }

    if(!coords || coords.length < 2){
      console.log("ROTA INVÁLIDA ORS");
      throw new Error("Rota ORS inválida");
    }

    const coordsComOrigem = carroPos
      ? [
          {
            latitude: Number(carroPos.latitude),
            longitude: Number(carroPos.longitude)
          },
          ...coords
        ]
      : coords;

    const preview = recortarPreviewFinalDaRota(
      coordsComOrigem,
      Number(destino.lat),
      Number(destino.lng),
      28
    );

    setRouteCoordsFull(coordsComOrigem);
    setAltRouteCoordsFull([]);
    setRouteCoords(preview);
    setRotaCoords(preview);
    setRotaSelecionada(coordsComOrigem);
    setAltRouteCoords([]);
    setStepsRota(Array.isArray(steps) ? steps : []);
    stepAtualRef.current = 0;
    ultimoStepPreAvisadoRef.current = -1;
    ultimoStepCurvaFaladoRef.current = -1;

    setTempo(Math.round(duracaoSegundos / 60));
    setDistancia(Math.round((distanciaMetros / 1000) * 10) / 10);
    setDestinoPreview({
      lat: Number(destino.lat),
      lng: Number(destino.lng)
    });

    console.log("ROTA ORS OK. PONTOS:", coordsComOrigem.length);

    return {
      coords: coordsComOrigem,
      preview,
      distanciaMetros,
      duracaoSegundos,
      steps
    };
  }catch(e){
    console.log("ERRO ROTA ORS", e);

    const origemLat = Number(origem?.lat);
    const origemLng = Number(origem?.lng);
    const destLat = Number(destino?.lat);
    const destLng = Number(destino?.lng);

    if(!Number.isFinite(origemLat) || !Number.isFinite(origemLng) || !Number.isFinite(destLat) || !Number.isFinite(destLng)){
      return null;
    }

    try{
      const rotaFallback = await buscarRotaComFallback(origemLat, origemLng, destLat, destLng);
      if(!rotaFallback || !Array.isArray(rotaFallback.coords) || rotaFallback.coords.length < 2){
        return null;
      }

      const previewFallback = recortarPreviewFinalDaRota(
        rotaFallback.coords,
        destLat,
        destLng,
        28
      );

      setRouteCoordsFull(rotaFallback.coords);
      setAltRouteCoordsFull(Array.isArray(rotaFallback.altCoords) ? rotaFallback.altCoords : []);
      setRouteCoords(previewFallback);
      setRotaCoords(previewFallback);
      setRotaSelecionada(rotaFallback.coords);
      setAltRouteCoords(Array.isArray(rotaFallback.altCoords) ? rotaFallback.altCoords : []);
      setStepsRota(Array.isArray(rotaFallback.steps) ? rotaFallback.steps : []);
      stepAtualRef.current = 0;
      ultimoStepPreAvisadoRef.current = -1;
      ultimoStepCurvaFaladoRef.current = -1;

      setTempo(Math.round(Number(rotaFallback.duration || 0) / 60));
      setDistancia(Math.round((Number(rotaFallback.distance || 0) / 1000) * 10) / 10);
      setDestinoPreview({ lat: destLat, lng: destLng });

      return {
        coords: rotaFallback.coords,
        preview: previewFallback,
        distanciaMetros: Number(rotaFallback.distance || 0),
        duracaoSegundos: Number(rotaFallback.duration || 0),
        steps: Array.isArray(rotaFallback.steps) ? rotaFallback.steps : []
      };
    }catch(fallbackError){
      console.log("ERRO ROTA FALLBACK", fallbackError);
      return null;
    }
  }
};
function restaurarRotaCompletaParaNavegacao(
  rotaPrincipal:any,
  rotaAlt:any,
  destinoLatNum:number,
  destinoLngNum:number
){
  const coordsFull = rotaPrincipal.geometry.coordinates.map((c:any)=>({
    latitude: Number(c[1]),
    longitude: Number(c[0]),
  }));

  const ultimoFull = coordsFull[coordsFull.length - 1];
  if(
    !ultimoFull ||
    Number(ultimoFull.latitude) !== Number(destinoLatNum) ||
    Number(ultimoFull.longitude) !== Number(destinoLngNum)
  ){
    coordsFull.push({
      latitude: Number(destinoLatNum),
      longitude: Number(destinoLngNum)
    });
  }

  setRouteCoords(coordsFull);
  setRouteCoordsFull(coordsFull);

  if(rotaAlt){
    const altcoordsFull = rotaAlt.geometry.coordinates.map((c:any)=>({
      latitude: Number(c[1]),
      longitude: Number(c[0]),
    }));

    const ultimoAlt = altcoordsFull[altcoordsFull.length - 1];
    if(
      !ultimoAlt ||
      Number(ultimoAlt.latitude) !== Number(destinoLatNum) ||
      Number(ultimoAlt.longitude) !== Number(destinoLngNum)
    ){
      altcoordsFull.push({
        latitude: Number(destinoLatNum),
        longitude: Number(destinoLngNum)
      });
    }

    setAltRouteCoords(altcoordsFull);
    setAltRouteCoordsFull(altcoordsFull);
  }else{
    setAltRouteCoordsFull([]);
    setAltRouteCoords([]);
  }
}
async function prepararDestinoParaViagem(
  destinoOverride?: { texto?: string; lat?: number | null; lng?: number | null }
){
  if(rotaCarregando) return;

  Keyboard.dismiss();

  const destinoTextoAtual = String(destinoOverride?.texto ?? destinoTxt ?? "").trim();

  const latRaw =
    destinoOverride?.lat !== undefined ? destinoOverride.lat : destinoLat;

  const lngRaw =
    destinoOverride?.lng !== undefined ? destinoOverride.lng : destinoLng;

  let destLat = latRaw != null ? Number(latRaw) : NaN;
  let destLng = lngRaw != null ? Number(lngRaw) : NaN;

  if(!destinoTextoAtual && (!Number.isFinite(destLat) || !Number.isFinite(destLng))){
    Alert.alert(t("erro"), t("digiteDestino"));
    return;
  }

  setNavegando(false);
  setRotaPronta(false);
  setRotaVisivel(false);
  setRotaCarregando(true);

  setAltRouteCoords([]);
  setRouteCoords([]);
  setRotaCoords([]);
  setRotaSelecionada([]);
  setStepsRota([]);
  stepAtualRef.current = 0;
  ultimoStepPreAvisadoRef.current = -1;
  ultimoStepCurvaFaladoRef.current = -1;
  ultimaInstrucaoRef.current = "";
  resetarControleChegadaDestino();

  try{
    if(!Number.isFinite(destLat) || !Number.isFinite(destLng)){
      const coordsDestino = await buscarCoordenadas(destinoTextoAtual);

      if(!coordsDestino){
        Alert.alert(t("erro"), t("enderecoNaoEncontrado"));
        return;
      }

      destLat = Number(coordsDestino.lat);
      destLng = Number(coordsDestino.lng);
    }

    setDestinoTxt(destinoTextoAtual);
    setDestinoLat(destLat);
    setDestinoLng(destLng);
    setSugestoes([]);
    setSugestoesDestino([]);

    const loc =
      await Location.getLastKnownPositionAsync() ||
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

    const origemLat = Number(loc?.coords?.latitude);
    const origemLng = Number(loc?.coords?.longitude);

    if(!Number.isFinite(origemLat) || !Number.isFinite(origemLng)){
      Alert.alert(t("erro"), t("naoFoiPossivelObterLocalizacao"));
      return;
    }

    console.log("�x�️ PR�0VIA DESTINO TEXTO:", destinoTextoAtual);
    console.log("�x�️ PR�0VIA DESTINO COORDS:", destLat, destLng);
    console.log("�x�️ PR�0VIA ORIGEM COORDS:", origemLat, origemLng);

    let rota = await buscarRotaORS(
      { lat: origemLat, lng: origemLng },
      { lat: destLat, lng: destLng }
    );

    if(!rota || !Array.isArray(rota.coords) || rota.coords.length < 2){
      const rotaFallback = await buscarRotaComFallback(
        origemLat,
        origemLng,
        destLat,
        destLng
      );

      if(!rotaFallback || !Array.isArray(rotaFallback.coords) || rotaFallback.coords.length < 2){
        Alert.alert(t("erro"), t("naoFoiPossivelGerarRota"));
        return;
      }

      const previewFallback = recortarPreviewFinalDaRota(
        rotaFallback.coords,
        Number(destLat),
        Number(destLng),
        28
      );

      setRouteCoordsFull(rotaFallback.coords);
      setAltRouteCoordsFull(Array.isArray(rotaFallback.altCoords) ? rotaFallback.altCoords : []);
      setRouteCoords(previewFallback);
      setRotaCoords(previewFallback);
      setRotaSelecionada(rotaFallback.coords);
      setAltRouteCoords(Array.isArray(rotaFallback.altCoords) ? rotaFallback.altCoords : []);
      setStepsRota(Array.isArray(rotaFallback.steps) ? rotaFallback.steps : []);
      stepAtualRef.current = 0;
      ultimoStepPreAvisadoRef.current = -1;
      ultimoStepCurvaFaladoRef.current = -1;
      setTempo(Math.round(Number(rotaFallback.duration || 0) / 60));
      setDistancia(Math.round((Number(rotaFallback.distance || 0) / 1000) * 10) / 10);
      setDestinoPreview({ lat: Number(destLat), lng: Number(destLng) });

      rota = {
        coords: rotaFallback.coords,
        steps: rotaFallback.steps,
      } as any;
    }

    setRotaPronta(true);
    setPainelVisivel(true);

    mapRef.current?.animateCamera(
      {
        center:{
          latitude: Number(destLat),
          longitude: Number(destLng)
        },
        zoom: 16.8,
        pitch: 0
      },
      { duration: 550 }
    );

    setTimeout(()=>{
      sheetRef.current?.snapToIndex?.(1);
    }, 300);

  }catch(e){
    console.log("Erro prepararDestinoParaViagem:", e);
    Alert.alert(t("erro"), t("falhaBuscarRota"));
  }finally{
    setRotaCarregando(false);
  }
}
async function buscarDestino(
  forcar = false,
  destinoOverride?: { texto?: string; lat?: number | null; lng?: number | null }
) {

  // �x� se for recálculo, não mexe no estado de navegação
  if(!forcar){
    resetarControleChegadaDestino();
    setNavegando(false);
    setBarraVisivel(false);

if(barraTimer.current){
  clearTimeout(barraTimer.current);
}
  }

  // �x� evita criar rota duplicada enquanto navega
  if(navegando && !forcar) return;

  if(!forcar){
    console.log("Chamado sem forçar");
  }

  setPainelVisivel(true);
  setRotaCarregando(true);
  const destinoTextoAtual = String(destinoOverride?.texto ?? destinoTxt ?? "").trim();
  const latRaw = destinoOverride?.lat !== undefined ? destinoOverride.lat : destinoLat;
  const lngRaw = destinoOverride?.lng !== undefined ? destinoOverride.lng : destinoLng;
  const destinoLatAtual = latRaw != null ? Number(latRaw) : NaN;
  const destinoLngAtual = lngRaw != null ? Number(lngRaw) : NaN;
  const podeUsarDestinoSalvo =
    Number.isFinite(destinoLatAtual) && Number.isFinite(destinoLngAtual);

  if (!forcar && !destinoTextoAtual) return;
  if (forcar && !destinoTextoAtual && !podeUsarDestinoSalvo) {
    console.log("Recalculo ignorado: destino indisponivel");
    return;
  }
  // �!️ IMPORTANTE: dar respiro para UI renderizar
  await new Promise(r => setTimeout(r, 50));


    try{
      const { status } = await Location.getForegroundPermissionsAsync();

if (status !== "granted") {
  alert(t("permitaLocalizacaoPrimeiro"));
  return;
}

      let destLat = destinoLatAtual;
      let destLng = destinoLngAtual;

      if(!Number.isFinite(destLat) || !Number.isFinite(destLng)){

        try {
          // tenta Nominatim primeiro para busca mundial
          const geocodeQuery = destinoTextoAtual;
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geocodeQuery)}&limit=1`;
          console.log("[GEOCODE_QUERY]", geocodeQuery);
          console.log("[GEOCODE_URL]", nomUrl);
          const nomRes = await fetch(nomUrl, { headers:{ "User-Agent":"gps-clean-app" } });
          const nomJson = await nomRes.json();
          const primeiroResultado = Array.isArray(nomJson) ? nomJson[0] : null;
          console.log("[GEOCODE_RESULT]", primeiroResultado);

          if(nomJson && nomJson.length > 0){
            destLat = parseFloat(nomJson[0].lat);
            destLng = parseFloat(nomJson[0].lon);
          } else {
            // fallback para geocodeAsync do dispositivo
            const geo = await Location.geocodeAsync(destinoTextoAtual);
            if(!geo || geo.length === 0){
              setRotaCarregando(false);
              alert(t("enderecoNaoEncontrado"));
              return;
            }
            destLat = geo[0].latitude;
            destLng = geo[0].longitude;
          }
        } catch (err) {
          console.log("ERRO GEOCODE:", err);
          setRotaCarregando(false);
          alert(t("erroBuscarEnderecoConexao"));
          return;
        }
      }
// ===== ABRE PAINEL IMEDIATAMENTE =====
setDestinoTxt(destinoTextoAtual);
setDestinoLat(destLat);
setDestinoLng(destLng);

setRotaCarregando(true);


  
      const loc = forcar
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
        : await Location.getLastKnownPositionAsync() || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      const origemLat = loc.coords.latitude;
      const origemLng = loc.coords.longitude;

      const continueStraight = forcar ? "&continue_straight=true" : "";
      const headingAtual = Number(loc?.coords?.heading);
      const montarUrlOsrm = (usarPreferenciasRecalculo:boolean) => {
        const continueStraightParam = forcar && usarPreferenciasRecalculo
          ? continueStraight
          : "";
        const bearings = forcar && usarPreferenciasRecalculo && Number.isFinite(headingAtual) && headingAtual >= 0
          ? `&bearings=${Math.round(headingAtual)},45;`
          : "";

        return `https://router.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destLng},${destLat}?alternatives=3&overview=full&geometries=geojson&steps=true&annotations=false${continueStraightParam}${bearings}`;
      };

      const buscarRotaOsrm = async (usarPreferenciasRecalculo:boolean) => {
        const url = montarUrlOsrm(usarPreferenciasRecalculo);

        console.log("�x�️ DESTINO TEXTO:", destinoTextoAtual);
        console.log("�x�️ DESTINO COORDS:", destLat, destLng);
        console.log("�x�️ ORIGEM COORDS:", origemLat, origemLng);
        console.log("�x�️ URL OSRM:", url);

        const res = await fetch(url);
        const jsonResposta = await res.json();
        console.log("�xa� ROTA SENDO CHAMADA");
        console.log("ROTAS RECEBIDAS:", jsonResposta.routes?.length);
        if(!jsonResposta?.routes?.length) console.log("�xa� OSRM ERRO RESP:", JSON.stringify(jsonResposta).slice(0,200));

        return jsonResposta;
      };

      let json = await buscarRotaOsrm(true);

      if(forcar && !json?.routes?.length){
        console.log("Recalculo sem rota com preferencia de heading; tentando fallback simples");
        json = await buscarRotaOsrm(false);
      }

      if(!json?.routes?.length){
       console.log("Nenhuma rota recebida no OSRM");
       setRotaCarregando(false);
       return;
      }

      const indicePrincipal = 0;
      const rotaPrincipal = json.routes[indicePrincipal];

     // salvar instruções reais da rota
if(rotaPrincipal.legs && rotaPrincipal.legs[0].steps){
  setStepsRota(rotaPrincipal.legs[0].steps);
  stepAtualRef.current = 0;
  ultimoStepPreAvisadoRef.current = -1;
  ultimoStepCurvaFaladoRef.current = -1;
}

    const rotaAlt = json.routes.length > 1
     ? json.routes.find((_:any, idx:number)=> idx !== indicePrincipal) || null
     : null;

setTempo(Math.round(rotaPrincipal.duration/60));
setRotaCarregando(false);

setDistancia(Math.round((rotaPrincipal.distance/1000)*10)/10);
setTimeout(() => {
  setRotaPronta(true);
  sheetRef.current?.snapToIndex(1);
}, 400);


// rota principal (azul)
// rota principal (azul) - preview curta antes de iniciar navegação
const coordsFull = rotaPrincipal.geometry.coordinates.map((c:any)=>({
  latitude: Number(c[1]),
  longitude: Number(c[0]),
}));

setRouteCoordsFull(coordsFull);

let coordsPreview = coordsFull;

// enquanto ainda não iniciou navegação, mostra só o final da rota
if(!navegando && coordsFull.length > 28){
  coordsPreview = coordsFull.slice(-28);
}

// garante que o último ponto seja o destino
const ultimoPreview = coordsPreview[coordsPreview.length - 1];
if(
  !ultimoPreview ||
  Number(ultimoPreview.latitude) !== Number(destLat) ||
  Number(ultimoPreview.longitude) !== Number(destLng)
){
  coordsPreview.push({
    latitude: Number(destLat),
    longitude: Number(destLng)
  });
}

setRouteCoords(coordsPreview);
setRotaPronta(true);

const ultimoPonto = coordsPreview[coordsPreview.length - 1];

if(!forcar){
  mapRef.current?.animateCamera({
    center:{
      latitude: ultimoPonto.latitude,
      longitude: ultimoPonto.longitude
    },
    zoom: 16
  }, { duration: 800 });
} else if(loc?.coords){
  mapRef.current?.animateCamera({
    center:{
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    },
    heading: loc.coords.heading || 0,
    pitch: 60,
    zoom: 18
  }, { duration: 450 });
}
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
  const altcoordsFull = rotaAlt.geometry.coordinates.map((c:any)=>({
    latitude: Number(c[1]),
    longitude: Number(c[0]),
  }));

  setAltRouteCoordsFull(altcoordsFull);

  let altcoordsPreview = altcoordsFull;

  if(!navegando && altcoordsFull.length > 28){
    altcoordsPreview = altcoordsFull.slice(-28);
  }

  const ultimoAltPreview = altcoordsPreview[altcoordsPreview.length - 1];
  if(
    !ultimoAltPreview ||
    Number(ultimoAltPreview.latitude) !== Number(destLat) ||
    Number(ultimoAltPreview.longitude) !== Number(destLng)
  ){
    altcoordsPreview.push({
      latitude: Number(destLat),
      longitude: Number(destLng)
    });
  }

  setAltRouteCoords(altcoordsPreview);

  setTimeout(()=>{
    sheetRef.current?.snapToIndex(1);
  }, 600);

}else{
  setAltRouteCoordsFull([]);
  setAltRouteCoords([]);
}
    }catch(e){
      console.log(e);
    }
  }
// ===============================
// �x� DIST�NCIA DO CARRO AT�0 ROTA
// ===============================
function distanciaAteRota(lat:number,lng:number){

  const rotaBase = (Array.isArray(routeCoordsFull) && routeCoordsFull.length > 0)
    ? routeCoordsFull
    : [];

  if(rotaBase.length === 0) return 0;

  let menor = 999999;

  for(let i=0;i<rotaBase.length;i++){
    const p = rotaBase[i];

    const dx = lat - p.latitude;
    const dy = lng - p.longitude;
    const d = Math.sqrt(dx*dx + dy*dy);

    if(d < menor) menor = d;
  }

 return menor * 111000; // metros
}
// ==========================================
// SISTEMA DE VOZ PROFISSIONAL (CUSTOM XTTS)
// ==========================================

let voiceEngineLogado = false;
function traduzir(texto:string){

  if(idiomaAtual === "pt") return texto;

  const miniDic:any = FALAS_TRADUCAO_POR_IDIOMA[idiomaAtual] || {};

  let t = texto;

  Object.keys(miniDic).forEach(pt=>{
    t = t.replace(pt, miniDic[pt]);
  });

  return t;
}

function cancelarTtsSistema(){
  try{
    Speech.stop();
    console.log("TTS SISTEMA CANCELADO");
  }catch(error){
    console.log("Erro ao cancelar TTS sistema:", error);
  }
}

async function limparPlayerCustomAtivo(){
  try{
    voicePlayerSubscriptionRef.current?.remove?.();
  }catch(error){
    console.log("Erro ao remover listener do player custom:", error);
  }

  try{
    await voicePlayerRef.current?.pause?.();
  }catch(error){
    console.log("Erro ao pausar player custom:", error);
  }

  try{
    await voicePlayerRef.current?.remove?.();
  }catch(error){
    console.log("Erro ao remover player custom:", error);
  }

  voicePlayerSubscriptionRef.current = null;
  voicePlayerRef.current = null;
}

async function falarFallbackSistema(texto:string, opcoes?:{ forcar?:boolean; estiloInsano?: boolean; permitirErroRota?: boolean }){
  const textoFalado = String(texto || "").trim();
  if(!textoFalado) return;

  const forcarFallback = !!opcoes?.forcar;
  const estiloInsano = !!opcoes?.estiloInsano;
  const permitirErroRota = !!opcoes?.permitirErroRota;

  const contextoAtual = String(contextoAudioAtualRef.current || "").trim();
  if(contextoAtual === "modo_comico"){
    console.log(`FALLBACK SISTEMA BLOQUEADO: contexto=${contextoAtual}`);
    return;
  }

  if(contextoAtual === "erro_rota" && !(forcarFallback && permitirErroRota)){
    console.log(`FALLBACK SISTEMA BLOQUEADO: contexto=${contextoAtual}`);
    return;
  }

  if(!forcarFallback && (!USAR_TTS_SISTEMA_PRIMARIO || DESATIVAR_FALLBACK_SISTEMA_EM_CUSTOM)){
    console.log("FALLBACK BLOQUEADO");
    return;
  }

  if(!forcarFallback && bloquearFallbackPorCustomRef.current){
    console.log("FALLBACK BLOQUEADO");
    return;
  }

  console.log("FALLBACK SISTEMA ACIONADO");
  console.log("VOICE_ENGINE_USADO:", "system_fallback");

  return new Promise<void>((resolve) => {
    let finalizado = false;

    const finalizar = () => {
      if(finalizado) return;
      finalizado = true;
      try{ clearTimeout(timeoutId); }catch{}
      resolve();
    };

    const timeoutId = setTimeout(() => {
      try{ Speech.stop(); }catch{}
      console.log("FALLBACK SISTEMA TIMEOUT");
      finalizar();
    }, 15000);

    try{ Speech.stop(); }catch{}

    try{
      Speech.speak(textoFalado, {
        language: localePorIdioma(idiomaAtual),
        pitch: estiloInsano ? 1.25 : 1.0,
        rate: estiloInsano ? 1.06 : 1.0,
        onStart: () => console.log("FALLBACK SISTEMA INICIOU"),
        onDone: () => {
          console.log("FALLBACK SISTEMA TERMINOU");
          finalizar();
        },
        onStopped: () => {
          console.log("FALLBACK SISTEMA PAROU");
          finalizar();
        },
        onError: (e:any) => {
          console.log("FALLBACK SISTEMA ERRO:", e);
          finalizar();
        },
      } as any);
    }catch(error){
      console.log("FALLBACK SISTEMA ERRO AO CHAMAR Speech.speak:", error);
      finalizar();
    }
  });
}

async function reproduzirAudioBase64(audioBase64:string){
  const base64 = String(audioBase64 || "")
    .trim()
    .replace(/^data:[^;]+;base64,/i, "")
    .replace(/\s+/g, "");
  if(!base64){
    throw new Error("audioBase64 vazio");
  }

  console.log("USANDO AUDIO CUSTOM");

  try{
    voicePlayerSubscriptionRef.current?.remove?.();
  }catch{}

  try{
    await voicePlayerRef.current?.pause?.();
  }catch{}

  try{
    await voicePlayerRef.current?.remove?.();
  }catch{}

  voicePlayerSubscriptionRef.current = null;
  voicePlayerRef.current = null;

  try{
    Speech.stop();
    console.log("TTS SISTEMA CANCELADO");
  }catch{}

  try{
    await setIsAudioActiveAsync(true);
  }catch(error){
    console.log("Erro ao ativar audio:", error);
  }

  try{
    await setAudioModeAsync({
      shouldRouteThroughEarpiece: false,
      shouldPlayInBackground: false,
      playsInSilentMode: true,
    } as any);
  }catch(error){
    console.log("Erro ao configurar audio mode:", error);
  }

  const nomeArquivo = `voz_custom_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`;
  const uriArquivo = `${FileSystem.cacheDirectory}${nomeArquivo}`;

  await FileSystem.writeAsStringAsync(uriArquivo, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log("ARQUIVO AUDIO TEMP:", uriArquivo);

  try{
    const info = await FileSystem.getInfoAsync(uriArquivo);
    console.log("ARQUIVO AUDIO INFO:", JSON.stringify(info));
  }catch(error){
    console.log("Erro ao obter info do arquivo:", error);
  }

  return new Promise<void>((resolve, reject) => {
    let finalizado = false;
    let iniciou = false;
    let timeoutBuffer:any = null;
    let timeoutGeral:any = null;
    let timeoutFimAudio:any = null;
    let ultimoStatusLogado = "";
    let ultimoCurrentTimeMs = 0;
    let ultimoAvancoEmMs = Date.now();

    const finalizar = async (erro?:any) => {
      if(finalizado) return;
      finalizado = true;

      try{ if(timeoutBuffer) clearTimeout(timeoutBuffer); }catch{}
      try{ if(timeoutGeral) clearTimeout(timeoutGeral); }catch{}
      try{ if(timeoutFimAudio) clearTimeout(timeoutFimAudio); }catch{}

      try{
        voicePlayerSubscriptionRef.current?.remove?.();
      }catch{}

      voicePlayerSubscriptionRef.current = null;

      try{
        await voicePlayerRef.current?.pause?.();
      }catch{}

      try{
        await voicePlayerRef.current?.remove?.();
      }catch{}

      voicePlayerRef.current = null;

      if(erro){
        console.log("CUSTOM FALHOU", erro);
        reject(erro);
        return;
      }

      console.log("CUSTOM TERMINOU");
      resolve();
    };

    try{
      const player = createAudioPlayer(
        { uri: uriArquivo },
        { updateInterval: 80 }
      );

      voicePlayerRef.current = player;

      timeoutBuffer = setTimeout(() => {
        if(!iniciou){
          finalizar(new Error("player ficou travado em buffering / nao carregou o audio"));
        }
      }, 8000);

      timeoutGeral = setTimeout(() => {
        finalizar(new Error("timeout geral do player"));
      }, 45000);

      voicePlayerSubscriptionRef.current = player.addListener(
        "playbackStatusUpdate",
        (status:any) => {
          const currentTime = Number(status?.currentTime || 0);
          const duration = Number(status?.duration || 0);
          const isLoaded = !!status?.isLoaded;
          const isBuffering = !!status?.isBuffering;
          const resumoStatus = JSON.stringify({
            isLoaded,
            playing: status?.playing,
            playbackState: status?.playbackState,
            currentTime,
            duration,
            didJustFinish: status?.didJustFinish,
            isBuffering,
          });

          if(resumoStatus !== ultimoStatusLogado){
            ultimoStatusLogado = resumoStatus;
            console.log("STATUS AUDIO:", resumoStatus);
          }

          if(status?.error){
            finalizar(new Error(String(status.error)));
            return;
          }

          const tocando =
            !!status?.playing || status?.playbackState === "playing";

          if(currentTime > ultimoCurrentTimeMs + 20){
            ultimoCurrentTimeMs = currentTime;
            ultimoAvancoEmMs = Date.now();
          }

          const progressoRealDetectado = currentTime > 40;
          const carregouCurto = isLoaded && duration > 0 && !isBuffering;

          if(!iniciou && (tocando || progressoRealDetectado || carregouCurto)){
            iniciou = true;
            console.log("CUSTOM INICIOU");

            if(duration > 0){
              const restanteMs = Math.max(500, Math.min(20000, duration - currentTime + 350));
              try{ if(timeoutFimAudio) clearTimeout(timeoutFimAudio); }catch{}
              timeoutFimAudio = setTimeout(() => {
                finalizar();
              }, restanteMs);
            }
          }

          const terminou =
            !!status?.didJustFinish ||
            status?.playbackState === "ended" ||
            (iniciou && duration > 0 && currentTime >= Math.max(0, duration - 120));

          const progressoEstagnado =
            iniciou &&
            duration > 0 &&
            currentTime > 0 &&
            (Date.now() - ultimoAvancoEmMs) > 1800 &&
            currentTime >= Math.max(0, duration - 220);

          if(iniciou && (terminou || progressoEstagnado)){
            finalizar();
          }
        }
      );

      player.play();
    }catch(error){
      finalizar(error);
    }
  });
}
const VOICE_ENGINE_ENV = String(
  (globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_ENGINE || ""
).trim().toLowerCase();

const USAR_TTS_SISTEMA_PRIMARIO = VOICE_ENGINE_ENV === "system";

// em modo custom, nunca usar Speech.speak
const DESATIVAR_FALLBACK_SISTEMA_EM_CUSTOM = true;

const VOICE_CUSTOM_TIMEOUT_PADRAO_MS = Math.max(
  25000,
  Math.min(
    60000,
    Number((globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_TIMEOUT_MS || 25000) || 25000
  )
);

const VOICE_CUSTOM_TIMEOUT_MODO_COMICO_MS = 45000;
const VOICE_CUSTOM_TIMEOUT_ERRO_ROTA_MS = Math.max(
  18000,
  Math.min(
    60000,
    Number((globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_TIMEOUT_ERRO_ROTA_MS || 18000) || 18000
  )
);
const VOICE_CUSTOM_MAX_TENTATIVAS_PADRAO = 2;
// único servidor permitido
const VOICE_SERVER_URL_REMOTO_PADRAO = "https://insanegps.com/speak";

// se vier do .env e estiver preenchido, usa ele;
// senão, usa o remoto padrão
const VOICE_SERVER_URL_ENV = String(
  (globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_SERVER_URL || ""
).trim() === "https://gpsinsane.onrender.com/speak"
  ? "https://insanegps.com/speak"
  : String((globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_SERVER_URL || "").trim();

const VOICE_SERVER_URLS_ENV = String(
  (globalThis as any)?.process?.env?.EXPO_PUBLIC_VOICE_SERVER_URLS || ""
)
  .split(",")
  .map((item) => {
    const url = String(item || "").trim();
    return url === "https://gpsinsane.onrender.com/speak"
      ? "https://insanegps.com/speak"
      : url;
  })
  .filter(Boolean);

const VOICE_SERVER_URL = VOICE_SERVER_URL_ENV || VOICE_SERVER_URL_REMOTO_PADRAO;

// lista final: prioriza URL configurada e aceita redundância via EXPO_PUBLIC_VOICE_SERVER_URLS
const VOICE_SERVER_URLS = Array.from(new Set([
  VOICE_SERVER_URL,
  ...VOICE_SERVER_URLS_ENV,
  VOICE_SERVER_URL_REMOTO_PADRAO,
].filter(Boolean)));

function extrairAudioBase64Resposta(txt:string){
  const bruto = String(txt || "").trim();
  if(!bruto) return null;
  if(bruto.startsWith("<")) return null;

  const normalizarBase64Audio = (valor:any) => {
    const texto = String(valor || "").trim();
    if(!texto) return "";
    const semPrefixo = texto.replace(/^data:[^;]+;base64,/i, "");
    return semPrefixo.replace(/\s+/g, "").trim();
  };

  if(bruto.startsWith("{")){
    try{
      const json = JSON.parse(bruto);
      const audio = normalizarBase64Audio(json?.audioBase64 || json?.audio || json?.base64 || "");
      if(audio) {
        console.log(`AUDIO BASE64 EXTRAÍDO - TAMANHO: ${audio.length}, INÍCIO: ${audio.slice(0, 50)}`);
        
        // VALIDAÇÃO: Log warning se áudio for grande, mas deixa tentar
        if(audio.length > 800000){
          console.warn(`⚠️ AVISO: AUDIO GRANDE (${audio.length} bytes) - pode falhar na decodificação`);
        }
        
        return audio;
      }
      console.log(`NENHUM CAMPO DE AUDIO NA RESPOSTA - CHAVES: ${Object.keys(json).join(", ")}`);
      return null;
    }catch(e){
      console.log(`ERRO PARSE JSON:`, e);
      return null;
    }
  }

  console.log(`RESPOSTA NÃO JSON - TIPO: ${bruto.slice(0, 50)}`);
  const brutoNormalizado = normalizarBase64Audio(bruto);
  return brutoNormalizado || null;
}

function extrairMetaRespostaVoz(txt:string){
  const bruto = String(txt || "").trim();
  if(!bruto.startsWith("{")) return null;

  try{
    const json:any = JSON.parse(bruto);
    return {
      source: String(json?.source || "").trim().toLowerCase(),
      textReceived: String(json?.textReceived || "").trim(),
      mimeType: String(json?.mimeType || json?.mime || "").trim().toLowerCase(),
    };
  }catch{
    return null;
  }
}

function fingerprintAudioBase64(audioBase64:string){
  const s = String(audioBase64 || "");
  if(!s) return "";
  const ini = s.slice(0, 80);
  const fim = s.slice(-80);
  return `${s.length}|${ini}|${fim}`;
}

function limparTextoFilaAudio(valor:any){
  return String(normalizarTextoFalado(valor) || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[(){}\[\]"]/g, " ")
    .replace(/[_*#^~`|<>]/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\./g, " ")
    .replace(/[;:]/g, ", ")
    .replace(/[!?]{2,}/g, "!")
    .replace(/\.{2,}/g, ".")
    .replace(/,\s*,+/g, ", ")
    .replace(/(^|\s)[,.;:!?](?=\s|$)/g, " ")
    .replace(/[,.;:!?…]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function falar(texto:string, opts?:{ _drain?:boolean; contexto?:VoiceContext; motivo?:VoiceContext; ehXingamento?: boolean }){
  const contextoPadrao: VoiceContext = opts?.contexto || opts?.motivo || "instrucao";
  const motivoPadrao: VoiceContext = opts?.motivo || contextoPadrao;
  const contextoPrioritario =
  contextoPadrao === "rota_critica" ||
  contextoPadrao === "erro_rota";

  if(!opts?._drain){
    const textoOriginal = String(texto || "").trim();
    if(!textoOriginal) return;

    const textoLimpo = limparTextoFilaAudio(textoOriginal);
    if(!textoLimpo) return;

    const MAX_CHARS_POR_CHUNK = 120;
    const frases = textoLimpo
      .split(/(?<=[.!?,])\s+/)
      .reduce<string[]>((acc, frase) => {
        const f = String(frase || "").trim();
        if(!f) return acc;

        const ultimo = acc[acc.length - 1];
        if(
          ultimo !== undefined &&
          (ultimo.length + 1 + f.length) <= MAX_CHARS_POR_CHUNK
        ){
          acc[acc.length - 1] = ultimo + " " + f;
        }else{
          acc.push(f);
        }
        return acc;
      }, []);

    const novosItens: AudioQueueItem[] = [];

    for(const chunk of frases){
      const c = String(chunk || "").trim();
      if(c && /[A-Za-zÀ-ÿ0-9]/.test(c)){
        console.log("VOICE:", c);
        novosItens.push({
          texto: c,
          contexto: contextoPadrao,
          motivo: motivoPadrao,
          criadoEm: Date.now(),
          ehXingamento: !!opts?.ehXingamento,
        });
      }
    }

        if(contextoPrioritario){
      // Só erro_rota pode cortar piada. Instrução comum não corta,
      // porque isso fazia a piada parar sem final e sem risada.
      if(contextoPadrao === "erro_rota" || contextoPadrao === "rota_critica"){
        filaAudioRef.current = filaAudioRef.current.filter((item) => {
          if(typeof item !== "string") return item.contexto !== "modo_comico";
          if(/^__PAUSE_(\d+)__$/.test(item)) return false;
          if(isRisadaToken(item)) return false;
          return true;
        });
      }

      for(let i = novosItens.length - 1; i >= 0; i--){
        filaAudioRef.current.unshift(novosItens[i]);
      }
    }else{
      filaAudioRef.current.push(...novosItens);
    }
  }

  if(reproduzindoRef.current){
    console.log("FALAR: fila aguardando, já existe reprodução em andamento");
    return;
  }

  if(filaAudioRef.current.length === 0){
    reproduzindoRef.current = false;
    falandoAgoraRef.current = false;
    falandoRef.current = false;
    return;
  }

  reproduzindoRef.current = true;
  falandoAgoraRef.current = true;
  falandoRef.current = true;

  try{
    while(filaAudioRef.current.length > 0){
      const item = filaAudioRef.current.shift();
      if(!item) continue;

      const contexto: VoiceContext =
        typeof item === "string"
          ? "instrucao"
          : (item.contexto || "instrucao");
      const motivoAtual: VoiceContext =
        typeof item === "string"
          ? "instrucao"
          : (item.motivo || item.contexto || "instrucao");
      const ehXingamentoAtual = typeof item !== "string" && !!item?.ehXingamento;
      const tentativasItemAtual = typeof item !== "string"
        ? Number(item?.tentativasCustom || 0)
        : 0;
      contextoAudioAtualRef.current = contexto;

      const bruto = typeof item === "string"
        ? String(item || "").trim()
        : String(item?.texto || "").trim();

      const criadoEm =
        typeof item === "string"
          ? 0
          : Number(item?.criadoEm || 0);
      const idadeMs = criadoEm > 0 ? (Date.now() - criadoEm) : 0;

      if(!bruto) continue;

      const pausaMatch = bruto.match(/^__PAUSE_(\d+)__$/);
      if(pausaMatch){
        const ms = Math.max(200, Math.min(5000, parseInt(pausaMatch[1], 10)));
        await new Promise<void>((resolve) => setTimeout(resolve, ms));
        continue;
      }

      if(isRisadaToken(bruto)){
        try{
          await tocarRisadaComFallback(bruto);
        }catch(error){
          console.log("RISADA ERROR:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 80));
        continue;
      }

      const proximo = limparTextoFilaAudio(bruto);
      if(!proximo || !/[A-Za-zÀ-ÿ0-9]/.test(proximo)) continue;

      if(contexto === "instrucao" && idadeMs > 15000){
        console.log(`VOICE: descartando instrução atrasada (${idadeMs}ms)`);
        continue;
      }

            if(contexto === "modo_comico"){
  const existeErroOuCriticoPendente = filaAudioRef.current.some((filaItem) => (
    typeof filaItem !== "string" &&
    (
      filaItem.contexto === "erro_rota" ||
      filaItem.contexto === "rota_critica"
    )
  ));

  if(existeErroOuCriticoPendente){
    console.log("VOICE: modo cômico cedeu prioridade só para erro de rota/crítico");
    filaAudioRef.current.push({
      texto: proximo,
      contexto: "modo_comico",
      motivo: "modo_comico",
      criadoEm: Date.now(),
    });
    continue;
  }
}

      const xingamentoCritico = contexto === "erro_rota" && ehXingamentoAtual;
      const timeoutMs = contexto === "modo_comico"
        ? VOICE_CUSTOM_TIMEOUT_MODO_COMICO_MS
        : contexto === "erro_rota"
          ? VOICE_CUSTOM_TIMEOUT_ERRO_ROTA_MS
          : VOICE_CUSTOM_TIMEOUT_PADRAO_MS;
      const tentativasMax = contexto === "modo_comico"
        ? 1
        : contexto === "erro_rota"
          ? 1
          : VOICE_CUSTOM_MAX_TENTATIVAS_PADRAO;
      const contextoCritico =
        contexto === "instrucao" ||
        contexto === "rota_critica" ||
        contexto === "erro_rota";
      const endpoints = contexto === "modo_comico"
        ? [VOICE_SERVER_URLS[0] || VOICE_SERVER_URL]
        : (xingamentoCritico
          ? VOICE_SERVER_URLS
          : contextoCritico
          ? [VOICE_SERVER_URLS[0] || VOICE_SERVER_URL]
          : VOICE_SERVER_URLS);

      const textoSintese = xingamentoCritico
        ? String(proximo || "").slice(0, 160)
        : proximo;

      console.log("VOICE ENGINE:", "custom");
      console.log(`VOICE CONTEXTO: ${contexto}`);
      console.log("VOICE TEXTO:", textoSintese);
      console.log(`VOICE CUSTOM TIMEOUT: ${timeoutMs}ms`);

      let tocouCustom = false;
      let ultimoErroCustom:any = null;

      for(let tentativa = 1; tentativa <= tentativasMax && !tocouCustom; tentativa++){
        for(const endpoint of endpoints){
          try{
            const response = await new Promise<Response>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error(`VOICE TIMEOUT: servidor demorando (${timeoutMs}ms)`));
              }, timeoutMs);

              fetch(endpoint, {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({
                  text: textoSintese,
                  texto: textoSintese,
                  speed: modoComico ? 0.94 : 0.92,
                  mode: "insana"
                })
              })
                .then((res) => {
                  clearTimeout(timeoutId);
                  resolve(res);
                })
                .catch((err) => {
                  clearTimeout(timeoutId);
                  reject(err);
                });
            });

            const responseText = await response.text();
            console.log("VOICE STATUS:", response.status, endpoint);
            if(!response.ok){
              console.log("VOICE ERROR BODY:", responseText);
            }

            const meta = extrairMetaRespostaVoz(responseText);
            const audioBase64 = String(extrairAudioBase64Resposta(responseText) || "").trim();

            if(!response.ok || !audioBase64){
              throw new Error(`Falha voz custom: HTTP ${response.status} (${endpoint})`);
            }

            const fingerprint = fingerprintAudioBase64(audioBase64);
            ultimoAudioFingerprintRef.current = fingerprint;
            ultimoAudioTextoRef.current = textoSintese;

            await reproduzirAudioBase64(audioBase64);

            console.log("VOICE_ENGINE_USADO:", "custom");

            falhasCustomConsecutivasRef.current = 0;
            bloquearFallbackPorCustomRef.current = false;
            tocouCustom = true;

            if(meta?.source){
              console.log("VOICE SOURCE:", meta.source);
            }

            const pausaEntreBlocosMs = /[.!?]\s*$/.test(proximo)
              ? 120
              : /[,;:]\s*$/.test(proximo)
                ? 80
                : 40;

            await new Promise((resolve) => setTimeout(resolve, pausaEntreBlocosMs));
            break;
          }catch(error){
            ultimoErroCustom = error;
            console.log("VOICE CUSTOM TENTATIVA FALHOU:", {
              contexto,
              tentativa,
              endpoint,
              erro: String((error as any)?.message || error || "").slice(0, 220),
            });
          }
        }
      }

      if(!tocouCustom){
        console.log("VOICE ERROR:", ultimoErroCustom);
        falhasCustomConsecutivasRef.current += 1;
        bloquearFallbackPorCustomRef.current = false;

        const msgErro = String((ultimoErroCustom as any)?.message || ultimoErroCustom || "").toLowerCase();
        const falhaDeTimeoutRedeOuAbort =
          msgErro.includes("timeout") ||
          msgErro.includes("network") ||
          msgErro.includes("abort") ||
          msgErro.includes("fetch") ||
          msgErro.includes("failed to fetch");

        if(ehXingamentoAtual){
          console.log(`VOICE XINGAMENTO CUSTOM FALHOU: contexto=${contexto}; sem fallback para preservar voz insana`);
          console.log("VOICE XINGAMENTO: sem retry custom para erro_rota (maximo 1 tentativa)");
          try{
            await falarFallbackSistema(proximo, {
              forcar: true,
              estiloInsano: true,
              permitirErroRota: true,
            });
          }catch(errorFallbackXingamento){
            console.log("VOICE XINGAMENTO FALLBACK SISTEMA ERRO:", errorFallbackXingamento);
          }
          continue;
        }

        if(String(motivoAtual || "") === "modo_comico"){
          // evita cenário "só risada" quando falha TTS de uma piada
          filaAudioRef.current = filaAudioRef.current.filter((filaItem) => {
            if(typeof filaItem !== "string") return filaItem.contexto !== "modo_comico";
            const token = String(filaItem || "").trim();
            if(/^__PAUSE_(\d+)__$/.test(token)) return false;
            if(isRisadaToken(token)) return false;
            return true;
          });

          if(falhaDeTimeoutRedeOuAbort){
            console.log("VOICE MODO COMICO TIMEOUT: fala abandonada sem retry");
          }else{
            console.log("VOICE MODO COMICO FALHOU: fala abandonada sem retry");
          }
          continue;
        }

        const contextoAtualTexto = String(contexto || "");
        const motivoAtualTexto = String(motivoAtual || "");
        const podeFallbackSistema =
          !ehXingamentoAtual &&
          contextoAtualTexto !== "modo_comico" &&
          motivoAtualTexto !== "modo_comico" &&
          falhasCustomConsecutivasRef.current >= 1;

        if(podeFallbackSistema){
          console.log(`VOICE FALLBACK SISTEMA: contexto=${contexto}`);
          try{
            console.log("VOICE_ENGINE_USADO:", "system_fallback");
            await falarFallbackSistema(proximo, { forcar: true });
          }catch(errorFallback){
            console.log("VOICE FALLBACK SISTEMA ERRO:", errorFallback);
          }
        }else{
          console.log(`VOICE FALLBACK SISTEMA: bloqueado contexto=${contexto}`);
        }
      }
    }
  }finally{
    reproduzindoRef.current = false;
    contextoAudioAtualRef.current = null;
    falandoAgoraRef.current = false;
    falandoRef.current = false;
    bloquearFallbackPorCustomRef.current = false;

    console.log("VOICE LIBERADA");
    console.log("FILA RESTANTE:", [...filaAudioRef.current]);

    if(filaAudioRef.current.length > 0){
      setTimeout(() => {
        drenaFilaAudio();
      }, 60);
    }
  }
}
function bloqueaFallbackPorCustomRefSafeReset(){
  bloquearFallbackPorCustomRef.current = false;
}

// Drena a fila de áudio sem adicionar novo texto — usada quando itens chegam via setTimeout
// durante execução de falar() (ex: modo cômico pergunta → pausa → resposta)
function drenaFilaAudio() {
  if (reproduzindoRef.current) {
    console.log("FILA AUDIO: já está reproduzindo, não vai drenar agora");
    return;
  }

  const proximo = filaAudioRef.current.shift();

  if (!proximo) {
    console.log("FILA AUDIO: vazia");
    return;
  }

  // encaminha para o pipeline principal preservando contexto e tokens
  filaAudioRef.current.unshift(proximo);
  falar("", { _drain: true }).catch((e) => {
    console.log("FILA AUDIO: erro ao encaminhar para falar", e);
  });
}
function falarComico(){

  // A fila de `falar()` já serializa reprodução; não travar aqui evita silêncio em modo cômico.

  const agora = Date.now();
  if(agora - ultimoComico.current < 120000) return;

  ultimoComico.current = agora;

  const listaPiadas = PIADAS_COMICAS_CURTAS_POR_IDIOMA[idiomaAtual] || PIADAS_COMICAS_CURTAS_POR_IDIOMA.pt;
  if(!Array.isArray(listaPiadas) || listaPiadas.length === 0) return;

  const base = listaPiadas;

  // banco fictício: só piadas ainda não contadas; ao esgotar, reinicia o ciclo
  const vistas = piadasJaContadasRef.current;
  const todasChaves = base.map((j:any) => `${String(j?.pergunta || "")}|${String(j?.resposta || "")}`);
  let pool = base.filter((_:any, i:number) => !vistas.has(todasChaves[i]));
  if(pool.length === 0){
    vistas.clear();
    pool = base;
  }

  const piada = pool[Math.floor(Math.random() * pool.length)];
  const chave = `${String(piada?.pergunta || "")}|${String(piada?.resposta || "")}`;
  vistas.add(chave);
  ultimaPiada.current = chave;

  const bloco = montarBlocoPiadaComica(piada);
const textoFinal = String(bloco?.textoFinal || "").trim();

if(!textoFinal) return;

falar(textoFinal, { contexto: "modo_comico" });
}
function gerarRisada(intensidadePreferida?:"leve"|"media"|"forte"|"insana"){
  const tipo = Math.random();
  const intensidade = intensidadePreferida || (tipo < 0.25 ? "leve" : tipo < 0.65 ? "media" : tipo < 0.9 ? "forte" : "insana");

  if(intensidade === "forte") return "__RISADA_FORTE__";
  if(intensidade === "media") return "__RISADA_MEDIA__";
  if(intensidade === "leve") return "__RISADA_LEVE__";
  return "__RISADA_SARCASTICA__";
}
async function buscarPoisProximos(lat:number, lng:number){

  try{

    const raio = 1500; // metros

    const query = `
      [out:json];
      (
        node["amenity"="police"](around:${raio},${lat},${lng});
        node["amenity"="hospital"](around:${raio},${lat},${lng});
        node["amenity"="school"](around:${raio},${lat},${lng});
        node["amenity"="restaurant"](around:${raio},${lat},${lng});
        node["amenity"="fuel"](around:${raio},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query
      }
    );

    const data = await response.json();

    if(!data.elements){
      setPoisProximos([]);
      return;
    }

    const resultados = data.elements.map((el:any)=>({

      tipo:
        el.tags?.amenity === "fuel" ? "gas" :
        el.tags?.amenity || "outro",

      lat: el.lat,
      lng: el.lon

    }));

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

function escolherNivelFalado(
  banco: Record<number, string[]> | any,
  nivelMaximoPermitido: 0|1|2|3|4
): 0|1|2|3|4 {
  const niveisDisponiveis = [4,3,2,1,0]
    .filter((n)=> n <= nivelMaximoPermitido && Array.isArray(banco?.[n]) && banco[n].length > 0);

  if(niveisDisponiveis.length === 0){
    return 0;
  }

  // preferência: usar exatamente o nível escolhido
  if(Array.isArray(banco?.[nivelMaximoPermitido]) && banco[nivelMaximoPermitido].length > 0){
    return nivelMaximoPermitido;
  }

  // fallback: desce até encontrar um banco válido
  return niveisDisponiveis[0] as 0|1|2|3|4;
}

function escolherNivelDisponivelAteLimite(
  bancoPorNivel:any,
  limite:number
): 0|1|2|3|4{
  for(let nivel = limite; nivel >= 0; nivel--){
    if(Array.isArray(bancoPorNivel?.[nivel]) && bancoPorNivel[nivel].length > 0){
      return nivel as 0|1|2|3|4;
    }
  }

  return 0;
}


function falarPoi(tipo:string){

  const bancoTipo = POI_LINES?.[tipo];
  if(!bancoTipo) return;

  const nivelMaximo = nivelPermitido();
  const nivelEscolhido = escolherNivelDisponivelAteLimite(bancoTipo, nivelMaximo);
  const banco = bancoTipo?.[nivelEscolhido];

  if(!Array.isArray(banco) || banco.length === 0) return;

const fraseBase = evitarRepeticao(banco);

// aqui você pode colocar instrução ou deixar vazio
const fraseFinal = montarFraseFinal(fraseBase);

falar(fraseFinal);
}
function stepEhFalavel(step:any){
  if(!step) return false;

  const tipo = String(step?.maneuver?.type || "").toLowerCase();
  const modifier = String(step?.maneuver?.modifier || "").toLowerCase();
  const nomeRua = String(step?.name || step?.ref || step?.destinations || "").trim();
  const instrucaoBase = String(step?.instruction || "").trim();

  if(instrucaoBase) return true;
  if(nomeRua) return true;

  if(tipo === "arrive") return true;
  if(tipo === "roundabout" || tipo === "rotary") return true;

  if(
    tipo === "turn" ||
    tipo === "continue" ||
    tipo === "new name" ||
    tipo === "depart" ||
    tipo === "merge" ||
    tipo === "fork" ||
    tipo === "end of road" ||
    tipo === "on ramp" ||
    tipo === "off ramp"
  ){
    return true;
  }

  if(
    modifier.includes("left") ||
    modifier.includes("right") ||
    modifier.includes("straight") ||
    modifier.includes("esquerda") ||
    modifier.includes("direita")
  ){
    return true;
  }

  return false;
}
function falarInstrucao(step:any, distancia:number){

  if(!step) return;
  if(!stepEhFalavel(step)) return;

  const tipo = String(step?.maneuver?.type || "").toLowerCase();
  let lado = String(step?.maneuver?.modifier || "").toLowerCase();

  const momento = distancia > 40 ? "pre" : "agora";

  const chaveUnica =
    `${tipo}|${lado}|${String(step?.name || step?.ref || "")}|${momento}`;

  if(ultimaInstrucaoRef.current === chaveUnica){
    return;
  }

  let nomeRua = "";
  const instrucaoOriginal = String(step?.instruction || "").trim();

  if(step?.name && String(step.name).trim()){
    nomeRua = String(step.name).trim();
  }else if(step?.ref && String(step.ref).trim()){
    nomeRua = String(step.ref).trim();
  }else if(step?.destinations && String(step.destinations).trim()){
    nomeRua = String(step.destinations).split(",")[0].trim();
  }

  if(nomeRua){
    nomeRua = nomeRua
      .replace(/\s+/g, " ")
      .replace("Unnamed Road", "")
      .replace("null", "")
      .trim();
  }

  if(lado.includes("slight left")) lado = "left";
  else if(lado.includes("sharp left")) lado = "left";
  else if(lado.includes("slight right")) lado = "right";
  else if(lado.includes("sharp right")) lado = "right";
  else if(lado.includes("left")) lado = "left";
  else if(lado.includes("right")) lado = "right";
  else if(lado.includes("esquerda")) lado = "left";
  else if(lado.includes("direita")) lado = "right";
  else if(lado.includes("straight")) lado = "straight";
  else lado = "";

  let frase = "";

  if(distancia > 40){

    const passoReto =
      lado === "straight" ||
      tipo === "continue" ||
      tipo === "depart" ||
      tipo === "new name";

    let metros = 0;

    if(passoReto){
      metros = Math.round(Math.max(80, Math.min(distancia, 2200)));
    }else if(distancia > 400) metros = 300;
    else if(distancia > 220) metros = 200;
    else if(distancia > 120) metros = 120;
    else metros = 60;

    if(tipo === "roundabout" || tipo === "rotary"){
      frase = montarInstrucaoNavegacao(step, "pre", metros);
    }
    else if(tipo === "arrive"){
      frase = montarInstrucaoNavegacao(step, "pre", metros);
    }
    else if(lado === "left"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "pre", metros);
    }
    else if(lado === "right"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "pre", metros);
    }
    else if(lado === "straight" || tipo === "continue" || tipo === "depart" || tipo === "new name"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "pre", metros);
    }
    else{
      frase = montarInstrucaoNavegacao(step, "pre", metros);
    }
  }else{

    if(tipo === "roundabout" || tipo === "rotary"){
      frase = montarInstrucaoNavegacao(step, "agora");
    }
    else if(tipo === "arrive"){
      frase = montarInstrucaoNavegacao(step, "agora");
    }
    else if(lado === "left"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "agora");
    }
    else if(lado === "right"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "agora");
    }
    else if(lado === "straight" || tipo === "continue" || tipo === "depart" || tipo === "new name"){
      frase = montarInstrucaoNavegacao({ ...step, name: nomeRua }, "agora");
    }
    else{
      frase = montarInstrucaoNavegacao(step, "agora");
    }
  }

  if(!frase && instrucaoOriginal){
    if(distancia > 40){
      const metros = Math.max(60, Math.round(Number(distancia) || 0));
      frase = idiomaAtual === "pt"
        ? `Em ${metros} metros ${instrucaoOriginal}`
        : instrucaoOriginal;
    }else{
      frase = instrucaoOriginal;
    }
  }

  frase = normalizarTextoFalado(frase);
if(!frase) return;

if(tipo === "arrive" && distancia <= 40){
  if(chegadaDestinoFaladaRef.current){
    return;
  }

  chegadaDestinoFaladaRef.current = true;
  ultimaInstrucaoRef.current = chaveUnica;

  const fraseChegada = normalizarTextoFalado(escolherFraseChegadaDestino()) ||
    normalizarTextoFalado(fallbackChegadaDestinoPorIdioma(idiomaAtual));

  if(fraseChegada){
    falar(fraseChegada, { contexto: "rota_critica" });
    return;
  }
}

ultimaInstrucaoRef.current = chaveUnica;

const deveFalarInstrucao =
  tipo === "arrive" ||
  tipo === "roundabout" ||
  tipo === "rotary" ||
  lado === "left" ||
  lado === "right";

if(!deveFalarInstrucao){
  return;
}

const fraseCurta =
  lado === "left"
    ? "Vire à esquerda"
    : lado === "right"
      ? "Vire à direita"
      : tipo === "arrive"
        ? "Chegando ao destino"
        : "Atenção à rotatória";

falar(fraseCurta, { contexto: "instrucao" });
}
 // ==========================================
 // �x� SALVAR REPORT LOCAL
 // ==========================================
async function salvarReportFirebase(tipo:string){

  const lat =
    Number(coordsReportTemp?.latitude) ||
    Number(carroPos?.latitude);

  const lng =
    Number(coordsReportTemp?.longitude) ||
    Number(carroPos?.longitude);

  if(!Number.isFinite(lat) || !Number.isFinite(lng)){
    Alert.alert(t("erro"), t("semCoordenadaValida"));
    return;
  }

  const agora = Date.now();

  try{
    await addDoc(collection(db, "reports_trajeto"), {
      tipo,
      lat,
      lng,
      userId: String(usuarioId || "anon"),
      userNome: String(perfilAtualMini?.nome || "Usuário"),
      criadoEm: agora,
      expiraEm: agora + (1000 * 60 * 60),
      ativo: true
    });

    setMenuReportRapido(false);
    setCoordsReportTemp(null);

    try{
      falar("Report salvo");
    }catch{}

  }catch(e){
    console.log("Erro ao salvar report:", e);
  }
}
 
 // ==========================================
// �a� REPORT RÁPIDO TESLA (SEGURAR BOTÒO)
// ==========================================
function reportRapido(segundos:number){

 if(!carroPos) return;

 let tipo = "polícia";

 if(segundos >= 2) tipo = "objeto na pista";
 if(segundos >= 3) tipo = "acidente";

 salvarReportFirebase(tipo);

 // vibração leve feedback
 Vibration.vibrate(80);

 // confirmação discreta (não bloqueia navegação)
 console.log("�a� REPORT RÁPIDO:", tipo);
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

  falar(tComFallback("amigoSalvoFala", "Amigo salvo. Que escolha duvidosa."));

 }catch(e){
  alert(t("erroSalvarAmigo"));
 }

}
function alterarNivelPaciencia(n:number){
  const numero = Math.max(0, Math.min(4, Number(n) || 0));
  const limiteConta = limiteNivelUsuario();

  if(numero > limiteConta){
    setTelaProVisivel(true);
    mostrarBarraNivelTemporariamente();
    return;
  }

  setNivelBloqueado(numero);
  setNivelAtual(numero);

  // ao escolher, deixa visível só mais 3s e some
  esconderBarraNivelComDelay(3000);
}
function niveisXingamentoProgressivo(nivelMaximo: 0|1|2|3|4, contagemErros:number): number[] {
  if(nivelMaximo <= 0) return [0];

  if(nivelMaximo >= 4){
    const ciclo: number[][] = [
      [2, 3, 4],
      [3, 4, 2],
      [4, 3, 2],
      [4, 2, 3],
      [3, 2, 4],
      [4, 3, 2],
    ];
    return ciclo[Math.max(0, (contagemErros - 1) % ciclo.length)];
  }

  if(nivelMaximo === 3){
    const ciclo3: number[][] = [
      [2, 3],
      [3, 2],
      [3, 2],
      [2, 3],
    ];
    return ciclo3[Math.max(0, (contagemErros - 1) % ciclo3.length)];
  }

  if(nivelMaximo === 2){
    return [2, 1, 0];
  }

  return [1, 0];
}

function bancoWrongLinesPorIdiomaSeguro(idioma: IdiomaId): Record<number, string[]>{
  return WRONG_LINES_POR_IDIOMA[idioma] || WRONG_LINES_POR_IDIOMA.pt;
}

function listaWrongLinesPorNivelComFallback(nivel:number, idioma: IdiomaId): string[]{
  const nivelSeguro = Math.max(0, Math.min(4, Number(nivel) || 0));
  if(nivelSeguro <= 0) return [];
  const bancoIdioma = bancoWrongLinesPorIdiomaSeguro(idioma);

  const listaIdioma = bancoIdioma?.[nivelSeguro];
  if(Array.isArray(listaIdioma) && listaIdioma.length > 0){
    return listaIdioma;
  }

  const listaPtMesmoNivel = WRONG_LINES_POR_IDIOMA.pt?.[nivelSeguro];
  if(Array.isArray(listaPtMesmoNivel) && listaPtMesmoNivel.length > 0){
    return listaPtMesmoNivel;
  }

  return [];
}

function fallbackChegadaDestinoPorIdioma(idioma: IdiomaId): string {
  const fallback: Record<IdiomaId, string> = {
    pt: "Você chegou ao destino.",
    en: "You have arrived at your destination.",
    es: "Has llegado al destino.",
    fr: "Vous etes arrive a destination.",
    de: "Du hast dein Ziel erreicht.",
  };

  return fallback[idioma] || fallback.pt;
}

function escolherFraseChegadaDestino(): string {
  const bancoIdioma = LINHAS_CHEGADA_DESTINO_POR_IDIOMA[idiomaAtual] || LINHAS_CHEGADA_DESTINO_POR_IDIOMA.pt;
  const ehPro = usuarioEhPro();

  let base = ehPro
    ? [...(bancoIdioma.free || []), ...(bancoIdioma.pro || [])]
    : [...(bancoIdioma.free || [])];

  const nomeFalavel =
    obterNomeFalavelUsuario(perfilAtualMini?.nome) ||
    obterNomeFalavelUsuario(nomePassageiro) ||
    obterNomeFalavelUsuario(usuarioId);

  if(ehPro && idiomaAtual === "pt" && nomeFalavel){
    const comNome = LINHAS_CHEGADA_DESTINO_PT_COM_NOME
      .map((linha) => String(linha || "").replace(/\{nome\}/gi, nomeFalavel).trim())
      .filter(Boolean);
    base = [...base, ...comNome];
  }

  base = base.map((item) => String(item || "").trim()).filter(Boolean);
  if(base.length === 0){
    return fallbackChegadaDestinoPorIdioma(idiomaAtual);
  }

  const historico = historicoChegadaDestinoRef.current;
  const ultimo = historico[historico.length - 1] || "";
  const recentes = new Set(historico.slice(-Math.min(4, historico.length)));

  let candidatos = base.filter((frase) => !recentes.has(frase));
  if(candidatos.length === 0){
    candidatos = base.filter((frase) => frase !== ultimo);
  }
  if(candidatos.length === 0){
    candidatos = base;
  }

  const escolhida = evitarRepeticao(candidatos) || fallbackChegadaDestinoPorIdioma(idiomaAtual);
  if(escolhida){
    historico.push(escolhida);
    if(historico.length > 30){
      historico.shift();
    }
  }

  return escolhida || fallbackChegadaDestinoPorIdioma(idiomaAtual);
}

function resetarControleChegadaDestino(){
  chegadaDestinoFaladaRef.current = false;
}

function linhasComicasDoNivel(nivel:number): LinhaComica[]{
  const nivelSeguro = Math.max(0, Math.min(4, Number(nivel) || 0)) as 0|1|2|3|4;
  if(nivelSeguro <= 0) return [];

  if(idiomaAtual === "pt"){
    const estruturadasPt = LINHAS_COMICAS_PT_POR_NIVEL[nivelSeguro];
    if(Array.isArray(estruturadasPt) && estruturadasPt.length > 0){
      return estruturadasPt;
    }
  }

  const listaTexto = listaWrongLinesPorNivelComFallback(nivelSeguro, idiomaAtual);
  return listaTexto.map((texto)=>({ texto: String(texto || "") }));
}

function sortearNivelPorPesos(pesos:Array<{ nivel:number; peso:number }>): number {
  const pesosValidos = pesos
    .map((item)=>({
      nivel: Math.max(0, Math.min(4, Number(item?.nivel) || 0)),
      peso: Math.max(0, Number(item?.peso) || 0),
    }))
    .filter((item)=>item.peso > 0);

  if(pesosValidos.length === 0) return 0;

  const total = pesosValidos.reduce((acc, item)=>acc + item.peso, 0);
  if(total <= 0) return pesosValidos[0].nivel;

  let alvo = Math.random() * total;
  for(const item of pesosValidos){
    alvo -= item.peso;
    if(alvo <= 0) return item.nivel;
  }

  return pesosValidos[pesosValidos.length - 1].nivel;
}

function niveisFallbackPorPreferencia(principal:number, nivelSelecionado:number): number[] {
  const p = Math.max(0, Math.min(4, Number(principal) || 0));
  const selecionado = Math.max(0, Math.min(4, Number(nivelSelecionado) || 0));

  let permitidos:number[] = [];
  if(selecionado === 1){
    permitidos = [1];
  }else if(selecionado === 2){
    permitidos = [2, 1];
  }else if(selecionado === 3){
    permitidos = [3, 2, 1];
  }else if(selecionado >= 4){
    // Nível 4: 70% nível 4, 20% nível 3, 10% nível 2, 0% nível 1.
    permitidos = [4, 3, 2];
  }

  const base = [p, selecionado, ...permitidos];
  return Array.from(new Set(base.filter((n)=>permitidos.includes(n))));
}

function escolherNivelPonderadoXingamento(nivelSelecionado: 0|1|2|3|4): 0|1|2|3|4 {
  if(nivelSelecionado <= 0) return 0;
  if(nivelSelecionado === 1) return 1;

  if(nivelSelecionado === 2){
    return sortearNivelPorPesos([
      { nivel: 2, peso: 80 },
      { nivel: 1, peso: 20 },
    ]) as 0|1|2|3|4;
  }

  if(nivelSelecionado === 3){
    return sortearNivelPorPesos([
      { nivel: 3, peso: 75 },
      { nivel: 2, peso: 20 },
      { nivel: 1, peso: 5 },
    ]) as 0|1|2|3|4;
  }

  if(forcarProximosNivel4Ref.current > 0){
    return 4;
  }

  return sortearNivelPorPesos([
    { nivel: 4, peso: 70 },
    { nivel: 3, peso: 20 },
    { nivel: 2, peso: 10 },
    ]) as 0|1|2|3|4;
  }

function pegarWrongLine(): { frase: string; nivelSelecionado: 0|1|2|3|4; nivelUsado: 0|1|2|3|4 } | null {
  const nivelSelecionado = Math.max(0, Math.min(4, nivelPermitido())) as 0|1|2|3|4;
  if(nivelSelecionado <= 0) return null;
  const nivelPreferido = escolherNivelPonderadoXingamento(nivelSelecionado);
  const niveisTentativa = niveisFallbackPorPreferencia(nivelPreferido, nivelSelecionado);

  let nivelUsado: 0|1|2|3|4 = 0;
  let banco: LinhaComica[] = [];

  for(const nivel of niveisTentativa){
    const lista = linhasComicasDoNivel(nivel)
      .filter((item)=>!!String(item?.texto || "").trim());
    if(lista.length > 0){
      banco = lista;
      nivelUsado = nivel as 0|1|2|3|4;
      break;
    }
  }

  if(!banco.length) return null;

  const historico = historicoWrongLinesRef.current;
  const ultimo = historico[historico.length - 1] || "";
  const recentes = new Set(historico.slice(-Math.min(4, historico.length)));

  let candidatos = banco.filter((linha)=>!recentes.has(String(linha?.texto || "").trim()));
  if(candidatos.length === 0){
    candidatos = banco.filter((linha)=>String(linha?.texto || "").trim() !== ultimo);
  }
  if(candidatos.length === 0){
    candidatos = banco;
  }

  let menorUso = Infinity;
  for(const linha of candidatos){
    const chave = String(linha?.texto || "").trim();
    const uso = Number(memoriaErros.current[chave] || 0);
    if(uso < menorUso) menorUso = uso;
  }

  const menosUsadas = candidatos.filter((linha)=>Number(memoriaErros.current[String(linha?.texto || "").trim()] || 0) === menorUso);
  const linhaEscolhida = menosUsadas[Math.floor(Math.random() * menosUsadas.length)] || candidatos[0] || null;
  if(!linhaEscolhida) return null;

  const chaveHistorico = String(linhaEscolhida?.texto || "").trim();
const nomeFalavel =
  obterNomeFalavelUsuario(perfilAtualMini?.nome) ||
  obterNomeFalavelUsuario(nomePassageiro) ||
  obterNomeFalavelUsuario(usuarioId);
const fraseEscolhida = materializarLinhaComica(linhaEscolhida, nomeFalavel);

memoriaErros.current[chaveHistorico] = Number(memoriaErros.current[chaveHistorico] || 0) + 1;

historico.push(chaveHistorico);
if(historico.length > 50){
  historico.shift();
}

const fraseFinal = montarFraseFinal(fraseEscolhida);

if(nivelSelecionado === 4 && forcarProximosNivel4Ref.current > 0){
  if(nivelUsado === 4){
    forcarProximosNivel4Ref.current = Math.max(0, forcarProximosNivel4Ref.current - 1);
  }
}

if(nivelSelecionado === 4 && (nivelUsado === 2 || nivelUsado === 3)){
  // Regra: após sair nível 2/3 com usuário no nível 4, força duas próximas no nível 4.
  forcarProximosNivel4Ref.current = 2;
}

return {
  frase: fraseFinal,
  nivelSelecionado,
  nivelUsado,
};
}
function falarErroRota(){

  const agora = Date.now();

  // evita excesso de repeticao em eventos longos de fora de rota
  if(agora - ultimoAviso.current < 1200){
    return;
  }

  ultimoAviso.current = agora;
  contadorErros.current++;
  const xingamentosAlvoPorErro = 1;
  const falasErro:string[] = [];

  for(let i = 0; i < xingamentosAlvoPorErro; i++){
    const selecao = pegarWrongLine();
    const frase = String(selecao?.frase || "").trim();

    if(selecao){
      console.log("XINGAMENTO_NIVEL_ESCOLHIDO:", selecao.nivelSelecionado);
      console.log("XINGAMENTO_NIVEL_USADO:", selecao.nivelUsado);
    }

    const textoErro = limparTextoFilaAudio(frase);
    if(!textoErro) continue;
    if(falasErro.includes(textoErro)) continue;
    falasErro.push(textoErro);
  }

  if(falasErro.length === 0){
    const fallbackErro = limparTextoFilaAudio(
      idiomaAtual === "pt"
        ? "Voce errou a rota de novo."
        : "You missed the route again."
    );

    if(fallbackErro){
      falasErro.push(fallbackErro);
      console.log("XINGAMENTO FALLBACK: frase de emergencia aplicada");
    }else{
      console.log("VOICE_ENGINE_USADO:", "silenciado_sem_frase_nivel_1_4");
      return;
    }
  }

  contadorXingamentosRef.current += falasErro.length;

  const itensErro = falasErro.map((textoErro) => ({
    texto: textoErro,
    contexto: "erro_rota" as VoiceContext,
    motivo: "erro_rota" as VoiceContext,
    ehXingamento: true,
    criadoEm: Date.now(),
    tentativasCustom: 0,
  }));

  const restanteSemPausa = filaAudioRef.current.filter((item)=>{
    const bruto = typeof item === "string" ? item : item?.texto;
    return !/^__PAUSE_(\d+)__$/.test(String(bruto || "").trim());
  });

  filaAudioRef.current = [...itensErro, ...restanteSemPausa];
  setTimeout(() => {
    drenaFilaAudio();
  }, 30);
}
const centerPreviewAndroid =
  !navegando &&
  rotaPronta &&
  Number.isFinite(Number(destinoLat)) &&
  Number.isFinite(Number(destinoLng))
    ? {
        latitude: Number(destinoLat),
        longitude: Number(destinoLng),
        latitudeDelta: 0.12,
        longitudeDelta: 0.12
      }
    : regiaoInicial
      ? {
          latitude: Number(regiaoInicial.latitude),
          longitude: Number(regiaoInicial.longitude),
          latitudeDelta: Number(regiaoInicial.latitudeDelta || 0.04),
          longitudeDelta: Number(regiaoInicial.longitudeDelta || 0.04)
        }
      : null;
const androidMapPayloadJson = JSON.stringify({
  center: centerPreviewAndroid,
  carroPos: carroPos
    ? {
        latitude: Number(carroPos.latitude),
        longitude: Number(carroPos.longitude),
        heading: Number(carroPos.heading || 0) + Number(getVeiculoPorId(veiculoGpsId)?.headingOffset || 0)
      }
    : null,
  velocidadeKmh: Number(velocidade || 0),
  ofertas: (ofertas || [])
   .filter((o:any) =>
  o?.origem &&
  Number.isFinite(Number(o?.origem?.lat)) &&
  Number.isFinite(Number(o?.origem?.lng)) &&
  o.status === "ativa" &&
  ofertaVisivelParaUsuario(o, usuarioId) &&
  podeExibirOfertaNoMapa(o)
)
    .map((o:any) => ({
  id: o.id,
  tipo: o.tipo,
  origem: { lat: Number(o.origem.lat), lng: Number(o.origem.lng) },
  destino: {
    lat: Number(o?.destino?.lat || 0),
    lng: Number(o?.destino?.lng || 0)
  }
})),
  routeCoords: (routeCoords || []).map((p:any) => ({
    latitude: Number(p.latitude),
    longitude: Number(p.longitude)
  })),
  altRouteCoords: (altRouteCoords || []).map((p:any) => ({
    latitude: Number(p.latitude),
    longitude: Number(p.longitude)
  })),
  navegando: !!navegando,
  mapMovido: !!mapMovido,
  veiculoIconUri: veiculoIconDataUri || ""
}).replace(/</g, "\\u003c");

const androidMainMapHtml = useMemo(() => {
  if (!regiaoInicial) return "";

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
    <style>
  html, body, #map-stage {
    margin:0;
    padding:0;
    width:100%;
    height:100%;
  }

  #map-stage {
    position: relative;
    overflow: hidden;
    background:${modoNoturno ? "#0b1220" : "#d7dde5"};
  }

  #map-rotator {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 180vmax;
    height: 180vmax;
    transform: translate(-50%, -50%) rotate(0deg);
    transform-origin: 50% 50%;
    will-change: transform;
  }

  #map {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  body {
    background:${modoNoturno ? "#0b1220" : "#d7dde5"};
    overflow:hidden;
  }

  .leaflet-container {
    background:${modoNoturno ? "#0b1220" : "#d7dde5"};
    font-family: Arial, sans-serif;
  }

  .leaflet-control-zoom {
    border:none !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.18) !important;
    border-radius: 14px !important;
    overflow: hidden;
  }

  .leaflet-control-zoom a {
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 20px !important;
    color: #111827 !important;
    background: #ffffff !important;
    border: none !important;
  }

  .oferta-marker {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    background: radial-gradient(circle at 30% 30%, #1f2937 0%, #0f172a 70%);
    border: 1px solid #38bdf8;
    box-shadow: 0 0 10px rgba(56,189,248,0.55), 0 2px 10px rgba(0,0,0,0.35);
  }

  .oferta-marker i {
    color: #67e8f9;
    font-size: 18px;
    line-height: 1;
  }

  .oferta-marker.entrega {
    border-color: #22d3ee;
  }

  .oferta-marker.carona {
    border-color: #38bdf8;
  }

  .oferta-marker.destino {
    background: radial-gradient(circle at 30% 30%, #14532d 0%, #052e16 70%);
    border-color: #22c55e;
  }

  .oferta-marker.destino i {
    color: #dcfce7;
  }

  .car-marker-wrap {
    width: 140px;
    height: 140px;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .car-marker-rotor {
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    transform-origin:center center;
  }

  .car-marker-arrow {
    width: 0;
    height: 0;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    border-bottom: 48px solid #1a73e8;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.22));
    margin-bottom: -16px;
    z-index: 1;
  }

  .car-marker-shell {
    width: 54px;
    height: 54px;
    border-radius: 999px;
    background: rgba(37,99,235,0.14);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index: 2;
    margin-bottom: 6px;
  }

  .car-marker-icon {
    width: 46px;
    height: 46px;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .car-marker-icon img {
    width: 46px;
    height: 46px;
    object-fit: contain;
  }

  .car-marker-fallback {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: #2563eb;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 10px rgba(37,99,235,0.35);
  }

  .car-marker-spacer {
    height: 4px;
  }
    .leaflet-tile {
  filter: saturate(1.05) contrast(1.02);
}

.leaflet-pane.leaflet-overlay-pane path {
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.18));
}

.leaflet-control-attribution {
  font-size: 9px !important;
  opacity: 0.72;
}

.leaflet-marker-icon,
.leaflet-marker-shadow {
  transition: transform 0.12s ease;
}
</style>
  </head>
  <body>
    <div id="map-stage">
      <div id="map-rotator">
        <div id="map"></div>
      </div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const post = (data) => {
        try {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(data));
        } catch (e) {}
      };

      const map = L.map('map', { zoomControl: true, zoomSnap: 0.1, zoomDelta: 0.5 }).setView([
        ${Number(regiaoInicial.latitude)},
        ${Number(regiaoInicial.longitude)}
      ], 15.5);

      const ofertaLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);
      const carLayer = L.layerGroup().addTo(map);
      let ultimaChaveBounds = '';
      let ultimoCentroFollow = null;

      const projectAhead = (lat, lng, headingDeg, meters) => {
        const heading = Number.isFinite(headingDeg) ? headingDeg : 0;
        const rad = (heading * Math.PI) / 180;
        const metersPerDegLat = 111111;
        const metersPerDegLng = metersPerDegLat * Math.max(0.15, Math.cos((lat * Math.PI) / 180));
        const dLat = (Math.cos(rad) * meters) / metersPerDegLat;
        const dLng = (Math.sin(rad) * meters) / metersPerDegLng;
        return [lat + dLat, lng + dLng];
      };

      const distanciaMetros = (lat1, lng1, lat2, lng2) => {
        const dLat = (lat2 - lat1) * 111111;
        const dLng = (lng2 - lng1) * 111111 * Math.max(0.15, Math.cos((lat1 * Math.PI) / 180));
        return Math.sqrt((dLat * dLat) + (dLng * dLng));
      };

      const normalizarAngulo = (angulo) => {
        let valor = Number(angulo || 0) % 360;
        if(valor < 0) valor += 360;
        return valor;
      };

      const suavizarAngulo = (atual, alvo, fator) => {
        const origem = normalizarAngulo(atual);
        const destino = normalizarAngulo(alvo);
        let diff = destino - origem;

        while(diff > 180) diff -= 360;
        while(diff < -180) diff += 360;

        return normalizarAngulo(origem + diff * fator);
      };

      const bearingEntrePontos = (lat1, lng1, lat2, lng2) => {
        const toRad = (valor) => (valor * Math.PI) / 180;
        const toDeg = (valor) => (valor * 180) / Math.PI;
        const p1 = toRad(lat1);
        const p2 = toRad(lat2);
        const dLng = toRad(lng2 - lng1);
        const y = Math.sin(dLng) * Math.cos(p2);
        const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLng);
        return normalizarAngulo(toDeg(Math.atan2(y, x)));
      };

      const mapRotatorEl = document.getElementById('map-rotator');

      const aplicarRotacaoMapa = (heading) => {
        if(!mapRotatorEl) return;

        const valor = Number.isFinite(Number(heading)) ? Number(heading) : 0;
        const rotacao = -normalizarAngulo(valor);
        mapRotatorEl.style.transform = 'translate(-50%, -50%) rotate(' + rotacao.toFixed(2) + 'deg)';
      };

      let ultimoHeadingSuave = 0;

      const calcularIndiceMaisProximo = (pontos, lat, lng) => {
        if(!Array.isArray(pontos) || pontos.length === 0) return 0;

        let melhorIdx = 0;
        let menorDist = Infinity;

        for(let i = 0; i < pontos.length; i++){
          const ponto = pontos[i];
          const dist = distanciaMetros(lat, lng, Number(ponto[0]), Number(ponto[1]));
          if(dist < menorDist){
            menorDist = dist;
            melhorIdx = i;
          }
        }

        return melhorIdx;
      };

      const criarIconeOferta = (tipo, destino) => {
        const ehEntrega = String(tipo || '').includes('entrega');
        const iconClass = destino
          ? (ehEntrega ? 'mdi-package-variant-check' : 'mdi-map-marker-check')
          : (ehEntrega ? 'mdi-package-variant-closed' : 'mdi-seat-passenger');
        const classes = 'oferta-marker ' + (ehEntrega ? 'entrega' : 'carona') + (destino ? ' destino' : '');
        return L.divIcon({
          className: '',
          html: '<div class="' + classes + '"><i class="mdi ' + iconClass + '"></i></div>',
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
      };

      const desenharOferta = (lat, lng, tipo, destino, id) => {
        if(!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const marker = L.marker([lat, lng], { icon: criarIconeOferta(tipo, destino) }).addTo(ofertaLayer);
        marker.on('click', function(){
          post({ type:'oferta', id:String(id || '') });
        });
      };

      const modoNoturnoAtivo = ${modoNoturno ? "true" : "false"};
      const TILE_PROVIDERS = modoNoturnoAtivo
        ? [
            {
              url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
              options: {
                subdomains: 'abcd',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
              }
            },
            {
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              options: {
                subdomains: 'abc',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors'
              }
            },
            {
              url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
              options: {
                subdomains: 'abc',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors, HOT'
              }
            }
          ]
        : [
            {
              url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
              options: {
                subdomains: 'abcd',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
              }
            },
            {
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              options: {
                subdomains: 'abc',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors'
              }
            },
            {
              url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
              options: {
                subdomains: 'abc',
                maxZoom: 19,
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors, HOT'
              }
            }
          ];

      let tileLayer = null;
      let tileProviderIndex = 0;
      let tileErrorCount = 0;
      let tileLoadCount = 0;

      const aplicarTileProvider = (index) => {
        const idxSeguro = Math.max(0, Math.min(TILE_PROVIDERS.length - 1, Number(index) || 0));
        const provider = TILE_PROVIDERS[idxSeguro];

        if(tileLayer){
          try { map.removeLayer(tileLayer); } catch (e) {}
        }

        tileProviderIndex = idxSeguro;
        tileErrorCount = 0;
        tileLoadCount = 0;

        tileLayer = L.tileLayer(provider.url, provider.options).addTo(map);

        tileLayer.on('tileload', function(){
          tileLoadCount += 1;
        });

        tileLayer.on('tileerror', function(){
          tileErrorCount += 1;
          if(tileErrorCount >= 8 && tileProviderIndex < TILE_PROVIDERS.length - 1){
            aplicarTileProvider(tileProviderIndex + 1);
          }
        });

        setTimeout(function(){
          if(tileLoadCount === 0 && tileProviderIndex < TILE_PROVIDERS.length - 1){
            aplicarTileProvider(tileProviderIndex + 1);
          }
        }, 2200);
      };

      aplicarTileProvider(0);

      map.on('click', function(e){
        post({ type:'tap', latitude:e.latlng.lat, longitude:e.latlng.lng });
      });

      map.on('contextmenu', function(e){
        post({ type:'longpress', latitude:e.latlng.lat, longitude:e.latlng.lng });
      });

      map.on('dragstart', function(){
        post({ type:'pan' });
      });

      setTimeout(function(){
        try { map.invalidateSize(); } catch (e) {}
      }, 120);

      window.addEventListener('resize', function(){
        try { map.invalidateSize(); } catch (e) {}
      });

      window.__GPSCLEAN_SYNC = function(payload){
        if(!payload) return;

        ofertaLayer.clearLayers();
        routeLayer.clearLayers();
        carLayer.clearLayers();

        (payload.ofertas || []).forEach((o) => {
          if(!o) return;
          desenharOferta(Number(o?.origem?.lat), Number(o?.origem?.lng), o.tipo, false, o.id);
          desenharOferta(Number(o?.destino?.lat), Number(o?.destino?.lng), o.tipo, true, o.id);
        });

        const pontosAlt = Array.isArray(payload.altRouteCoords)
          ? payload.altRouteCoords.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)).map((p) => [p.latitude, p.longitude])
          : [];
        const pontos = Array.isArray(payload.routeCoords)
          ? payload.routeCoords.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)).map((p) => [p.latitude, p.longitude])
          : [];
        const temCarro = !!payload.carroPos && Number.isFinite(payload.carroPos.latitude) && Number.isFinite(payload.carroPos.longitude);

        let pontosPercorridos = [];
        let pontosFuturos = pontos;

        if(!!payload.navegando && temCarro && pontos.length > 1){
          const idxMaisProximo = calcularIndiceMaisProximo(
            pontos,
            Number(payload.carroPos.latitude),
            Number(payload.carroPos.longitude)
          );

          pontosPercorridos = pontos.slice(0, Math.max(2, idxMaisProximo + 1));
          pontosFuturos = pontos.slice(Math.max(0, idxMaisProximo));

          if(pontosFuturos.length < 2){
            pontosFuturos = pontos.slice(Math.max(0, pontos.length - 2));
          }
        }

        if (pontosAlt.length > 1) {
  L.polyline(pontosAlt, {
    color:'#9ca3af',
    weight:6,
    opacity:0.82,
    dashArray:'10 8',
    lineCap:'round',
    lineJoin:'round'
  }).addTo(routeLayer);
}

if (pontos.length > 1) {
  if(pontosPercorridos.length > 1){
    L.polyline(pontosPercorridos, {
      color:'rgba(15,23,42,0.12)',
      weight:18,
      opacity:1,
      lineCap:'round',
      lineJoin:'round'
    }).addTo(routeLayer);

    L.polyline(pontosPercorridos, {
      color:'#d1d5db',
      weight:12,
      opacity:1,
      lineCap:'round',
      lineJoin:'round'
    }).addTo(routeLayer);
  }

  const pontosAzuis = pontosFuturos.length > 1 ? pontosFuturos : pontos;

  L.polyline(pontosAzuis, {
    color:'rgba(15,23,42,0.20)',
    weight:22,
    opacity:1,
    lineCap:'round',
    lineJoin:'round'
  }).addTo(routeLayer);

  L.polyline(pontosAzuis, {
    color:'#ffffff',
    weight:15,
    opacity:1,
    lineCap:'round',
    lineJoin:'round'
  }).addTo(routeLayer);

  L.polyline(pontosAzuis, {
    color:'#1a73e8',
    weight:10,
    opacity:1,
    lineCap:'round',
    lineJoin:'round'
  }).addTo(routeLayer);
}

        const seguirNavegacao =
          !!payload.navegando &&
          !!payload.carroPos &&
          Number.isFinite(payload.carroPos.latitude) &&
          Number.isFinite(payload.carroPos.longitude) &&
          !payload.mapMovido;

        if (!seguirNavegacao && !payload.navegando && pontos.length > 1) {
          const chaveBounds = String(pontos.length) + ':' + String(pontos[0]) + ':' + String(pontos[pontos.length - 1]);
          if (ultimaChaveBounds !== chaveBounds) {
            ultimaChaveBounds = chaveBounds;
            map.fitBounds(L.latLngBounds(pontos), { padding:[40,40] });
          }
          aplicarRotacaoMapa(0);
        }

        if (payload.carroPos && Number.isFinite(payload.carroPos.latitude) && Number.isFinite(payload.carroPos.longitude)) {
          const lat = Number(payload.carroPos.latitude);
          const lng = Number(payload.carroPos.longitude);

          if (seguirNavegacao) {
            const headingBruto = Number(payload.carroPos.heading);
            const velocidadeKmh = Number(payload.velocidadeKmh || 0);
            const headingValido = Number.isFinite(headingBruto) && headingBruto >= 0 && headingBruto < 360;
            let headingNavegacao = ultimoHeadingSuave;

            if(pontos.length > 1){
              const idxMaisProximo = calcularIndiceMaisProximo(pontos, lat, lng);
              const idxAlvo = Math.min(pontos.length - 1, idxMaisProximo + 5);
              const alvoRota = pontos[idxAlvo];

              if(alvoRota){
                headingNavegacao = bearingEntrePontos(lat, lng, Number(alvoRota[0]), Number(alvoRota[1]));
              }
            }

            if(!Number.isFinite(Number(headingNavegacao))){
              headingNavegacao = headingValido ? headingBruto : 0;
            }

            if(!Number.isFinite(ultimoHeadingSuave)){
              ultimoHeadingSuave = headingNavegacao;
            }else{
              ultimoHeadingSuave = suavizarAngulo(ultimoHeadingSuave, headingNavegacao, velocidadeKmh < 8 ? 0.12 : 0.2);
            }

            const centerAhead = projectAhead(
              lat,
              lng,
              ultimoHeadingSuave,
              velocidadeKmh < 20 ? 40 : velocidadeKmh < 60 ? 62 : 86
            );
            const centroAtual = map.getCenter();
            const delta = distanciaMetros(centroAtual.lat, centroAtual.lng, centerAhead[0], centerAhead[1]);
            const zoomDesejado = velocidadeKmh < 20 ? 17.95 : velocidadeKmh < 60 ? 17.65 : 17.35;

            if (Math.abs(Number(map.getZoom()) - zoomDesejado) > 0.05 || !ultimoCentroFollow || delta > 1.5) {
              map.setView(centerAhead, zoomDesejado, { animate:false });
              ultimoCentroFollow = { lat:centerAhead[0], lng:centerAhead[1] };
            }

            aplicarRotacaoMapa(ultimoHeadingSuave);
          } else if (pontos.length === 0) {
            const centroAtual = map.getCenter();
            const delta = distanciaMetros(centroAtual.lat, centroAtual.lng, lat, lng);
            if (delta > 8) {
              map.panTo([lat, lng], { animate:true, duration:0.25 });
            }
            ultimoCentroFollow = null;
            aplicarRotacaoMapa(0);
          }

          const heading = Number.isFinite(ultimoHeadingSuave)
            ? Number(ultimoHeadingSuave)
            : Number(payload.carroPos.heading || 0);
          const mostrarSeta = !!payload.navegando;
          const iconHtml = '' +
            '<div class="car-marker-wrap">' +
              '<div class="car-marker-rotor" style="transform:rotate(' + heading + 'deg)">' +
                (mostrarSeta ? '<div class="car-marker-arrow"></div>' : '<div class="car-marker-spacer"></div>') +
                '<div class="car-marker-shell">' +
                  '<div class="car-marker-icon">' +
                    (payload.veiculoIconUri
                      ? '<img src="' + payload.veiculoIconUri + '" />'
                      : '<div class="car-marker-fallback"></div>') +
                  '</div>' +
                '</div>' +
                '<div class="car-marker-spacer"></div>' +
              '</div>' +
            '</div>';

          const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [140, 140], iconAnchor: [70, 70] });
          L.marker([lat, lng], { icon }).addTo(carLayer);
        }
      };
    </script>
  </body>
</html>`;
}, [regiaoInicial, modoNoturno]);
useEffect(() => {

  const q = query(
    collection(db, "reports_trajeto"),
    where("ativo", "==", true)
  );

  const unsubscribe = onSnapshot(q, (snap) => {

    const lista:any[] = [];

    snap.forEach(doc => {
      const d = doc.data();

      // remove expirados
      if(d.expiraEm && d.expiraEm < Date.now()) return;

      lista.push({
        id: doc.id,
        ...d
      });
    });

    setReportsTrajeto(lista);
  });

  return () => unsubscribe();

}, []);
useEffect(() => {
  if (Platform.OS !== "android") return;
  if (!androidMapReady || !androidMapWebRef.current) return;

  androidMapWebRef.current.injectJavaScript(
    `window.__GPSCLEAN_SYNC && window.__GPSCLEAN_SYNC(${androidMapPayloadJson}); true;`
  );
}, [androidMapReady, androidMapPayloadJson]);

useEffect(() => {
  if (Platform.OS === "android") {
    setAndroidMapReady(false);
  }
}, [androidMainMapHtml]);

// ================================
// �x~ TELA DE TERMO OBRIGAT�RIO
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
        {tComFallback("termoTitulo", "INSANE GPS")}
      </Text>

      <Text style={{
        color:"#ccc",
        fontSize:16,
        textAlign:"center",
        marginBottom:40
      }}>
        {tComRegiao("termoTextoLongo", "Este aplicativo utiliza linguagem ofensiva, humor ácido e interações verbais potencialmente agressivas durante a navegação.\n\nAo prosseguir, você declara estar ciente e de acordo em utilizar o aplicativo por livre e espontânea vontade, compreendendo que todas as falas possuem caráter exclusivamente humorístico e fictício.\n\nO desenvolvedor não se responsabiliza por qualquer interpretação emocional, reação pessoal, desconforto ou dano subjetivo decorrente do uso na região {{regiao}}.\n\nCaso não concorde, encerre o aplicativo agora.\n\nAo pressionar ACEITAR, você confirma ciência e concordância integral com estes termos.")}

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
  versao:TERMO_VERSAO_ATUAL,
 };

 await AsyncStorage.setItem("aceitou_termo","sim");
 await AsyncStorage.setItem("aceitou_termo_versao", TERMO_VERSAO_ATUAL);
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
          {tComFallback("aceitarEntrar", "ACEITAR E ENTRAR")}
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
          {tComFallback("recusar", "RECUSAR")}
        </Text>
      </TouchableOpacity>


    </View>
  )
}

return (
<GestureHandlerRootView style={{ flex: 1 }}>
<BottomSheetModalProvider>

<KeyboardAvoidingView
  style={{flex:1}}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>

<View style={{flex:1}}>

{regiaoInicial && Platform.OS !== "android" && (
<MapView
  initialRegion={regiaoInicial}
onLongPress={(e)=>{

const {latitude,longitude} = e.nativeEvent.coordinate;

if(modoSelecionar === "origem"){
setOrigemTemp({lat:latitude,lng:longitude});
setModoSelecionar(null);
setOfertasVisivel(true);
return;
}

if(modoSelecionar === "destino"){
setDestinoTemp({lat:latitude,lng:longitude});
setModoSelecionar(null);
setOfertasVisivel(true);
return;
}

}}
ref={mapRef}
  style={StyleSheet.absoluteFillObject}
  mapType="standard"
  provider={forcarProviderPadrao ? undefined : "google"}
  showsBuildings={true}
  showsIndoors={false}
  showsTraffic={false}
  toolbarEnabled={false}
  customMapStyle={modoNoturno ? mapaNoturnoStyle : []}
  showsUserLocation={true}
  followsUserLocation={false}
  moveOnMarkerPress={false}
  scrollEnabled={true}
  zoomEnabled={true}
  pitchEnabled={true}
  rotateEnabled={true}
  onMapReady={() => {
    mapaBaseCarregadoRef.current = false;
    if (fallbackProviderTimerRef.current) {
      clearTimeout(fallbackProviderTimerRef.current);
    }
    fallbackProviderTimerRef.current = setTimeout(() => {
      if (!mapaBaseCarregadoRef.current) {
        setForcarProviderPadrao(true);
      }
    }, 4200);
  }}
  onMapLoaded={() => {
    mapaBaseCarregadoRef.current = true;
    if (fallbackProviderTimerRef.current) {
      clearTimeout(fallbackProviderTimerRef.current);
    }
  }}
  onPanDrag={()=>{
  if(navegando){
    console.log("MAPA MOVIDO USUARIO");
   setMapMovido(true);
mapMovidoRef.current = true;
mostrarBarraNivelTemporariamente();
  }
}}

  onPress={()=>{

 // se não navegando �  deixa mapa normal
 if(!navegando) return;

 const agora = Date.now();
 const diff = agora - ultimoToque.current;
 ultimoToque.current = agora;

 // =========================
 // �xa� TOQUE DUPLO REAL
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
>      
         {/* CARRO + SETA FIXA EMBAIXO */}
{carroPos && (
  <Marker
    coordinate={{
      latitude: Number(carroPos.latitude),
      longitude: Number(carroPos.longitude)
    }}
    anchor={{x:0.5,y:0.58}}
    flat
    zIndex={3000}
  >
    <View
      style={{
        width:76,
        alignItems:"center",
        justifyContent:"center"
      }}
    >
      <View
        style={{
          transform:[{ rotate: `${headingMapaAtual()}deg` }],
          alignItems:"center",
          justifyContent:"center"
        }}
      >
        <View
          style={{
            width:58,
            height:58,
            alignItems:"center",
            justifyContent:"center"
          }}
        >
          <View
            style={{
              position:"absolute",
              width:34,
              height:34,
              borderRadius:17,
              backgroundColor:"rgba(37,99,235,0.18)",
              transform:[{ scale: 1.65 }]
            }}
          />

          <Image
            source={
              getVeiculoPorId(veiculoGpsId)?.source ||
              { uri:"https://cdn-icons-png.flaticon.com/512/744/744465.png" }
            }
            style={{
              width:46,
              height:46
            }}
            resizeMode="contain"
          />
        </View>

        {/* SETA FIXA EMBAIXO APONTANDO PRA FRENTE */}
        <View
          style={{
            marginTop:-2,
            width:0,
            height:0,
            borderLeftWidth:10,
            borderRightWidth:10,
            borderBottomWidth:0,
            borderTopWidth:18,
            borderLeftColor:"transparent",
            borderRightColor:"transparent",
            borderTopColor:"#ffffff"
          }}
        />
      </View>
    </View>
  </Marker>
)}
      {/* =========================
   �xa� REPORTS DO FIREBASE
========================= */}
{reportsTrajeto.map((r:any) => (

  <Marker
    key={r.id}
    coordinate={{
      latitude: r.lat,
      longitude: r.lng
    }}
    zIndex={998}
  >
    <View style={{
      backgroundColor:"#111",
      padding:6,
      borderRadius:20,
      borderWidth:1,
      borderColor:"#22d3ee"
    }}>
      <MaterialCommunityIcons
        name={(() => {
          const tipoNormalizado = String(r?.tipo || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          if(tipoNormalizado.includes("pol")) return "police-badge";
          if(tipoNormalizado.includes("radar")) return "radar";
          if(tipoNormalizado.includes("obra")) return "cone";
          if(tipoNormalizado.includes("lentidao")) return "car-brake-alert";
          if(tipoNormalizado.includes("trans")) return "traffic-light";
          return "alert";
        })() as any}
        size={16}
        color="#22d3ee"
      />
    </View>
  </Marker>

))} 
      {/* =========================
   MARKERS DAS OFERTAS
========================= */}
{(() => {
  const ativos = ofertas.filter((o:any) => o?.origem && o?.destino && o.status === "ativa" && ofertaVisivelParaUsuario(o, usuarioId) && podeExibirOfertaNoMapa(o));
  const bucketPorCoord = new Map<string, number>();

  return ativos.map((o:any)=>{
    const latBase = Number(o?.origem?.lat);
    const lngBase = Number(o?.origem?.lng);
    const key = `${latBase.toFixed(5)},${lngBase.toFixed(5)}`;
    const idx = bucketPorCoord.get(key) || 0;
    bucketPorCoord.set(key, idx + 1);

    const passo = 0.00008;
    const offset = idx * passo;
    const latMarcador = latBase;
    const lngMarcador = lngBase + offset;

    const icone = String(o?.tipo || "").includes("entrega")
      ? "package-variant"
      : "seat-passenger";

    return (
      <Marker
        key={o.id}
        coordinate={{
          latitude: latMarcador,
          longitude: lngMarcador
        }}
        zIndex={999}
        onPress={(e)=>{

  console.log("CLICOU NA OFERTA:", o.id);

  e.stopPropagation();

  const isPremiumAtual = usuarioEhPremiumAtual();
  const ofertaParaUsuario = isPremiumAtual ? o : dadosOfertaParaUsuario(o);
  setOfertaSelecionada(ofertaParaUsuario);

  if(!isPremiumAtual && String(o?.tipo || "") !== "carona_oferecida"){
    setMenuOfertasVisivel(false);
    setAbaAtiva(null);
    abrirTelaProSeNecessario();
    return;
  }

  // Premium ou FREE em carona_oferecida abre opcoes da oferta.
  setMenuOfertasVisivel(true);
  setAbaOfertas("procurar");
  setAbaAtiva(null);

  // mostra rota da oferta no mapa
  if(isPremiumAtual || String(o?.tipo || "") === "carona_oferecida"){
    buscarRotaORS(
      {
        lat: o.origem.lat,
        lng: o.origem.lng
      },
      {
        lat: o.destino.lat,
        lng: o.destino.lng
      }
    );
  }

}}
      >

        <View style={{
          backgroundColor: "#0f172a",
          width:34,
          height:34,
          borderRadius:17,
          alignItems:"center",
          justifyContent:"center",
          borderWidth:1,
          borderColor:"#22d3ee",
          elevation:10
        }}>
          <MaterialCommunityIcons name={icone as any} size={18} color="#22d3ee" />
        </View>

      </Marker>
    );
  })
})()}

    {/* ROTA ATUAL */}
{(routeCoordsAhead.length > 0 || routeCoords.length > 0) && (
  <>
    {/* TRECHO JÁ CONCLUÍDO */}
    {routeCoordsDone.length > 1 && (
      <>
        <Polyline
          coordinates={routeCoordsDone}
          strokeWidth={18}
          strokeColor="rgba(0,0,0,0.16)"
          lineCap="round"
          lineJoin="round"
          zIndex={18}
        />
        <Polyline
          coordinates={routeCoordsDone}
          strokeWidth={12}
          strokeColor="#d1d5db"
          lineCap="round"
          lineJoin="round"
          zIndex={19}
        />
      </>
    )}

    {/* TRECHO ì FRENTE */}
    <Polyline
      coordinates={routeCoordsAhead.length > 0 ? routeCoordsAhead : routeCoords}
      strokeWidth={22}
      strokeColor="rgba(15,23,42,0.26)"
      lineCap="round"
      lineJoin="round"
      zIndex={20}
    />
    <Polyline
      coordinates={routeCoordsAhead.length > 0 ? routeCoordsAhead : routeCoords}
      strokeWidth={15}
      strokeColor="#ffffff"
      lineCap="round"
      lineJoin="round"
      zIndex={21}
    />
    <Polyline
      coordinates={routeCoordsAhead.length > 0 ? routeCoordsAhead : routeCoords}
      strokeWidth={10}
      strokeColor="#2f80ff"
      lineCap="round"
      lineJoin="round"
      zIndex={22}
    />
  </>
)}

{altRouteCoords.length > 0 && (
  <Polyline
    coordinates={altRouteCoords}
    strokeWidth={8}
    strokeColor="rgba(107,114,128,0.50)"
    lineCap="round"
    lineJoin="round"
    zIndex={15}
    lineDashPattern={[10,8]}
  />
)}

{altRouteCoords.length > 0 && (
  <Polyline
    coordinates={altRouteCoords}
    strokeWidth={6}
    strokeColor="rgba(107,114,128,0.42)"
    lineCap="round"
    lineJoin="round"
    zIndex={15}
  />
)}
{altRouteCoords.length > 0 && (
  <Polyline
    coordinates={altRouteCoords}
    strokeWidth={6}
    strokeColor="rgba(107,114,128,0.42)"
    lineCap="round"
    lineJoin="round"
    zIndex={15}
  />
)}
{/* ================================
   �x� OFERTAS NO MAPA
================================ */}
{ofertasVisivel && ofertas
  .filter(o => o.status === "ativa" && ofertaVisivelParaUsuario(o, usuarioId) && podeExibirOfertaNoMapa(o))
  .map(o => (
    <React.Fragment key={o.id}>
      <Polyline
        coordinates={[
          {
            latitude: o.origem.lat,
            longitude: o.origem.lng
          },
          {
            latitude: o.destino.lat,
            longitude: o.destino.lng
          }
        ]}
        strokeWidth={4}
        strokeColor="#22c55e"
      />
    </React.Fragment>
))}

</MapView>
)}    
{navegando && (
  <View
    pointerEvents="none"
    style={{
      position:"absolute",
      top:54,
      left:10,
      right:10,
      zIndex:5000
    }}
  >
    <View
      style={{
        backgroundColor:"#0b7a5a",
        borderRadius:16,
        paddingHorizontal:12,
        paddingVertical:10,
        shadowColor:"#000",
        shadowOpacity:0.22,
        shadowRadius:8,
        shadowOffset:{ width:0, height:4 },
        elevation:10,
        flexDirection:"row",
        alignItems:"center"
      }}
    >
      <View
        style={{
          width:28,
          height:28,
          borderRadius:8,
          backgroundColor:"rgba(255,255,255,0.14)",
          alignItems:"center",
          justifyContent:"center",
          marginRight:10
        }}
      >
        <MaterialCommunityIcons
          name={
            String(stepAtualVisual?.maneuver?.modifier || "").toLowerCase().includes("left")
              ? "arrow-left-bold"
              : String(stepAtualVisual?.maneuver?.modifier || "").toLowerCase().includes("right")
                ? "arrow-right-bold"
                : String(stepAtualVisual?.maneuver?.type || "").toLowerCase() === "roundabout"
                  ? "rotate-right"
                  : "arrow-up"
          }
          size={18}
          color="#fff"
        />
      </View>

      <View style={{ flex:1 }}>
        {!!instrucaoTopoDistancia && (
          <Text
            style={{
              color:"rgba(255,255,255,0.88)",
              fontSize:10,
              fontWeight:"700",
              marginBottom:1
            }}
          >
            {instrucaoTopoDistancia}
          </Text>
        )}

        <Text
          numberOfLines={2}
          style={{
            color:"#fff",
            fontSize:18,
            fontWeight:"900",
            lineHeight:21
          }}
        >
          {instrucaoTopoTitulo}
        </Text>
      </View>
    </View>
  </View>
)}
{regiaoInicial && Platform.OS === "android" && (
  <WebView
    key={`android-map-${modoNoturno ? "night" : "day"}`}
    ref={androidMapWebRef}
    style={StyleSheet.absoluteFillObject}
    originWhitelist={["*"]}
    source={{ html: androidMainMapHtml }}
    javaScriptEnabled
    domStorageEnabled
    onLoadEnd={() => setAndroidMapReady(true)}
    onMessage={(event) => {
      let data:any = null;
      try {
        data = JSON.parse(event.nativeEvent.data || "{}");
      } catch {
        return;
      }

      if (data?.type === "longpress") {
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        if (modoSelecionar === "origem") {
          setOrigemTemp({ lat: latitude, lng: longitude });
          setModoSelecionar(null);
          setOfertasVisivel(true);
          return;
        }

        if (modoSelecionar === "destino") {
          setDestinoTemp({ lat: latitude, lng: longitude });
          setModoSelecionar(null);
          setOfertasVisivel(true);
          return;
        }
      }

      if (data?.type === "oferta") {
        const oferta = ofertas.find((o:any) => String(o.id) === String(data.id));
        if (!oferta) return;

        const isPremiumAtual = usuarioEhPremiumAtual();
        const ofertaParaUsuario = isPremiumAtual ? oferta : dadosOfertaParaUsuario(oferta);
        setOfertaSelecionada(ofertaParaUsuario);

        if(!isPremiumAtual && String(oferta?.tipo || "") !== "carona_oferecida"){
          setMenuOfertasVisivel(false);
          setAbaAtiva(null);
          abrirTelaProSeNecessario();
          return;
        }

        // Premium ou FREE em carona_oferecida abre a tela/overlay de ofertas.
        setMenuOfertasVisivel(true);
        setAbaOfertas("procurar");
        setAbaAtiva(null);

        // mostra a rota da oferta no mapa
        buscarRotaORS(
          { lat: oferta.origem.lat, lng: oferta.origem.lng },
          { lat: oferta.destino.lat, lng: oferta.destino.lng }
        );

        return;
      }

      if (data?.type === "pan" || data?.type === "tap") {
        mostrarBotao();

        if (!navegando) {
          return;
        }

        setMapMovido(true);
        mapMovidoRef.current = true;

        setBarraVisivel(true);

        if (barraTimer.current) {
          clearTimeout(barraTimer.current);
        }

        barraTimer.current = setTimeout(() => {
          setBarraVisivel(false);
        }, 3000);
      }

      if (data?.type === "tap") {
        const agora = Date.now();
        const diff = agora - ultimoToque.current;
        ultimoToque.current = agora;

        if (toqueDuploAtivo && diff < 260) {
          if (timeoutToque.current) {
            clearTimeout(timeoutToque.current);
          }

          setMenuReportVisivel(true);
          return;
        }

        if (timeoutToque.current) {
          clearTimeout(timeoutToque.current);
        }

        timeoutToque.current = setTimeout(() => {
          setBarraVisivel(true);

          if (!assinaturaAtiva) {
            setMostrarBotaoPro(true);

            if (barraTimer.current) {
              clearTimeout(barraTimer.current);
            }

            barraTimer.current = setTimeout(() => {
              setMostrarBotaoPro(false);
            }, 4000);
          }

          if (barraTimer.current) {
            clearTimeout(barraTimer.current);
          }

          barraTimer.current = setTimeout(() => {
            setBarraVisivel(false);
          }, 4000);
        }, 280);
      }
    }}
  />
)}




{/* ===============================
   CHAT ENTRE USUÁRIOS
================================ */}
<ChatModal
  chatVisivel={chatVisivel}
  setChatVisivel={setChatVisivel}
  chatMensagens={chatMensagens}
  chatTexto={chatTexto}
  setChatTexto={setChatTexto}
  chatOferta={chatOferta}
  chatBloqueado={chatBloqueado}
  usuarioId={usuarioId}
  enviarMensagem={enviarMensagemChat}
  excluirMensagem={excluirMensagem}
  solicitarAceiteOferta={() => solicitarAceite(chatOferta)}
  aceitarSolicitacaoChat={aceitarSolicitacaoChat}
  recusarSolicitacaoChat={recusarSolicitacaoChat}
  openProfile={openProfile}
  onReportMessage={denunciarNoChat}
  onBlockUser={bloquearUsuarioChat}
  onUnblockUser={desbloquearUsuarioChat}
  onModerateMessage={moderarMensagemChat}
  chatBlockMeta={chatBloqueioManual}
/>

{/* ===============================
   VISUALIZAR ROTA (ESTILO UBER)
================================ */}
{/* ===============================
   VISUALIZAR ROTA (ESTILO UBER)
================================ */}
{rotaVisivel &&
 !!ofertaSelecionada?.origem &&
 !!ofertaSelecionada?.destino &&
 Array.isArray(rotaSelecionada) &&
 rotaSelecionada.length > 1 && (
  <RouteViewModal
    visivel={rotaVisivel}
    fechar={() => {
      setRotaVisivel(false);
      setOfertaSelecionada(null);
    }}
    origem={ofertaSelecionada?.origem}
    destino={ofertaSelecionada?.destino}
    rota={rotaSelecionada}
  />
)}
 {ofertaSelecionada && !rotaVisivel && !chatVisivel && (
<View style={{
  position:"absolute",
  bottom:Math.max((insets.bottom || 0) - 25, 0),
  left:0,
  right:0,

  backgroundColor:"#111",
  padding:20,

  borderTopLeftRadius:20,
  borderTopRightRadius:20,

  zIndex:999999,
  elevation:999999
}}

pointerEvents="auto"
>
         {!!(ofertaSelecionada as any)?.bloqueadaNoFree && (
  <>
    <Text style={{
      color:"#fff",
      fontSize:17,
      fontWeight:"bold",
      marginBottom:5
    }}>
      Oferta Exclusiva Pro
    </Text>

    <Text style={{
      color:"#22c55e",
      fontSize:22,
      fontWeight:"bold",
      marginBottom:10
    }}>
      R$ {ofertaSelecionada.valor}
    </Text>

    <Text style={{
      color:"#e2e8f0",
      fontSize:16,
      lineHeight:22,
      marginBottom:14
    }}>
      Você vê o valor. Premium transforma em dinheiro. Premium é completo.
    </Text>

    <TouchableOpacity
      onPress={abrirTelaProSeNecessario}
      style={{
        backgroundColor:"#16a34a",
        padding:14,
        borderRadius:12,
        marginBottom:16
      }}
    >
      <Text style={{
        color:"#052e16",
        textAlign:"center",
        fontWeight:"800",
        fontSize:14
      }}>
        Tornar Premium
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={()=>setOfertaSelecionada(null)}
      style={{ marginTop:1, marginBottom:18 }}
    >
      <Text style={{
        color:"#777",
        textAlign:"center",
        fontSize:14
      }}>
        Fechar
      </Text>
    </TouchableOpacity>

    <View style={{ height: 60 }} />
  </>
)}

          {!(ofertaSelecionada as any)?.bloqueadaNoFree && (
            <>
          <Text style={{
            color:"#fff",
            fontSize:16,
            fontWeight:"bold",
            marginBottom:5
          }}>


            {ofertaSelecionada.nomeOuDescricao}
          </Text>

          {ofertaSelecionada.tipo === "carona_solicitada" && (
            <Text style={{color:"#aaa",marginBottom:5}}>
              {ofertaSelecionada.quantidadePessoas} pessoa(s)
            </Text>
          )}

          <Text style={{color:"#aaa"}}>
            {ofertaSelecionada.origem.endereco}
          </Text>

          <Text style={{color:"#aaa",marginBottom:10}}>
            {ofertaSelecionada.destino.endereco}
          </Text>

          <Text style={{
            color:"#16a34a",
            fontWeight:"bold",
            marginBottom:15
          }}>
            R$ {ofertaSelecionada.valor}
          </Text>
          <TouchableOpacity
          
onPress={()=>{

if(!ofertaSelecionada) return;

buscarRotaORS(
{
lat: ofertaSelecionada.origem.lat,
lng: ofertaSelecionada.origem.lng
},
{
lat: ofertaSelecionada.destino.lat,
lng: ofertaSelecionada.destino.lng
}
);

setRotaSelecionada([
{
latitude:ofertaSelecionada.origem.lat,
longitude:ofertaSelecionada.origem.lng
},
{
latitude:ofertaSelecionada.destino.lat,
longitude:ofertaSelecionada.destino.lng
}
]);

setRotaVisivel(true);

}}
style={{
backgroundColor:"#2563eb",
padding:14,
borderRadius:12,
marginBottom:10
}}
>
<Text style={{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}}>
{tComFallback("verRota", "Ver rota")}
</Text>
</TouchableOpacity>
{ofertaSelecionada?.criadorId && usuarioTemVinculoComCriadorDaOferta(ofertaSelecionada, usuarioId) && (
  <TouchableOpacity
    onPress={()=>{
      if(!ofertaSelecionada?.criadorId) return;
      setDenunciaOfertaAtual({
        alvoId: String(ofertaSelecionada.criadorId),
        ofertaId: String(ofertaSelecionada.id || ""),
        ofertaTipo: String(ofertaSelecionada.tipo || "")
      });
      setOfertaSelecionada(null);
    }}
    style={{
      backgroundColor:"#ff4444",
      padding:12,
      borderRadius:8,
      marginTop:10,
      marginBottom:10
    }}
  >
    <Text style={{color:"#fff",fontWeight:"bold"}}>
      {tComFallback("denunciarUsuario", "Denunciar usuario")}
    </Text>
  </TouchableOpacity>
)}
{/* BOTÒO CONVERSAR */}
<TouchableOpacity
onPress={()=>{

if(!ofertaSelecionada) return;

setChatOferta(ofertaSelecionada);
setChatVisivel(true);

setOfertaSelecionada(null);

}}
style={{
backgroundColor:"#2563eb",
padding:14,
borderRadius:12,
marginBottom:10
}}
>
<Text style={{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}}>
{tComFallback("conversarAntes", "Conversar antes")}
</Text>
</TouchableOpacity>

{/* BOTÒO EDITAR (S� PARA QUEM CRIOU) */}
{ofertaSelecionada?.criadorId === usuarioId && (

<TouchableOpacity
onPress={()=>{

setOfertaEditandoId(ofertaSelecionada.id);
setMenuOfertasVisivel(true);

}}
style={{
backgroundColor:"#444",
padding:14,
borderRadius:12,
marginBottom:10
}}
>
<Text style={{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}}>
{tComFallback("editarOferta", "Editar oferta")}
</Text>
</TouchableOpacity>

)}

         {/* SE FOR DONO DA OFERTA */}
{ofertaSelecionada.criadorId === usuarioId && (

<>
<TouchableOpacity
onPress={()=>{

setTipoSelecionado(ofertaSelecionada.tipo);

if(ofertaSelecionada.tipo === "carona_solicitada"){
  setNomePassageiro(ofertaSelecionada.nomeOuDescricao);
  setQuantidadePessoas(ofertaSelecionada.quantidadePessoas);
}else{
  setDescricaoObjeto(ofertaSelecionada.nomeOuDescricao);
}

setValorOferta(String(ofertaSelecionada.valor));

setOfertaEditandoId(ofertaSelecionada.id);

setOfertaSelecionada(null);
setMenuOfertasVisivel(true);

}}
style={{
backgroundColor:"#2563eb",
padding:12,
borderRadius:10,
marginBottom:10
}}
>
<Text style={{color:"#fff",textAlign:"center"}}>
{tComFallback("editar", "Editar")}
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>{

setOfertas(prev =>
prev.filter(o => o.id !== ofertaSelecionada.id)
);

setOfertaSelecionada(null);

}}
style={{
backgroundColor:"#dc2626",
padding:12,
borderRadius:10
}}
>
<Text style={{color:"#fff",textAlign:"center"}}>
{tComFallback("excluir", "Remover")}
</Text>
</TouchableOpacity>

</>

)}

{/* SE NÒO FOR DONO �  ACEITAR */}
{ofertaSelecionada.criadorId !== usuarioId && (

<TouchableOpacity
onPress={()=>{

if(!ofertaSelecionada) return;

setOfertas(prev =>
prev.map(o=>{
if(o.id === ofertaSelecionada.id){
return {...o,status:"aceita"};
}
return o;
})
);

setChatOferta(ofertaSelecionada);
setChatVisivel(true);
setOfertaSelecionada(null);

}}
style={{
backgroundColor:"#22c55e",
padding:14,
borderRadius:12,
marginBottom:10
}}
>
<Text style={{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}}>
{tComFallback("aceitarOferta", "Aceitar oferta")}
</Text>
</TouchableOpacity>

)}

          <TouchableOpacity
            onPress={()=>setOfertaSelecionada(null)}
            style={{marginTop:12, marginBottom: Math.max(16, (insets?.bottom || 0) + 8)}}
          >
            <Text style={{color:"#777",textAlign:"center"}}>
              {tComFallback("fechar", "Fechar")}
            </Text>
          </TouchableOpacity>

            </>
          )}

        </View>
      )}
      
     
{/* ======================================
   �x� SISTEMA OFERTAS LIMPO DO ZERO
====================================== */}

{/* BOTÒO */}
{!menuOfertasVisivel && (
<TouchableOpacity
onPress={()=>{
  if(!exigirLoginParaAcao("Faca login para acessar caronas, entregas e reservas.")) return;
  setMenuOfertasVisivel(true);
}}
style={{
position:"absolute",
left:50,
top:28,
zIndex:1001
}}
>

<View
style={{
width:60,
height:60,
borderRadius:30,
backgroundColor:"#1a1a1a",

justifyContent:"center",
alignItems:"center",

borderWidth:2,
borderColor:"#FFD700",

shadowColor:"#FFD700",
shadowOpacity:0.9,
shadowRadius:10,
shadowOffset:{width:0,height:0},

elevation:12
}}
>

<MaterialCommunityIcons
name="star-circle-outline"
size={32}
color="#FFD700"
/>

{naoLidasTotal > 0 && (
  <View style={{
    position:"absolute",
    right:-2,
    top:-2,
    minWidth:20,
    height:20,
    borderRadius:10,
    backgroundColor:"#ff3b3b",
    justifyContent:"center",
    alignItems:"center",
    paddingHorizontal:4,
    borderWidth:1,
    borderColor:"#1a1a1a"
  }}>
    <Text style={{color:"#fff",fontSize:10,fontWeight:"bold"}}>
      {naoLidasTotal > 99 ? "99+" : naoLidasTotal}
    </Text>
  </View>
)}

</View>

<Text style={{
marginTop:4,
fontSize:16,
fontWeight:"900",
color:"#111",
textAlign:"center"
}}>
Ofertas
</Text>

</TouchableOpacity>
)}
{/* ===============================
   TELA COMPLETA DE OFERTA
================================ */}
{usuarioAutenticado && menuOfertasVisivel && (

<View
style={{
position:"absolute",
top:0,
left:0,
right:0,
bottom:0,
backgroundColor:"#000",
zIndex:50,
elevation:50
}}
>

<OfertasScreen
  menuOfertasVisivel={menuOfertasVisivel}
  ofertas={ofertasVisiveisUsuario}
  usuarioId={usuarioId}
  setOfertaSelecionada={setOfertaSelecionada}
  setMenuOfertasVisivel={setMenuOfertasVisivel}
  setAbaOfertas={setAbaOfertas}
  abaOfertas={abaOfertas}
  buscarCoordenadas={buscarCoordenadas}
  criarOfertaNova={criarOfertaNova}
  atualizarOfertaExistente={atualizarOfertaExistente}
  ofertaEditandoId={ofertaEditandoId}
  setOfertas={setOfertas}
  setOfertaEditandoId={setOfertaEditandoId}
  conversas={conversas}
  buscarRotaORS={buscarRotaORS}
  openChat={openChat}
  openRoute={openRoute}
  solicitarAceite={solicitarAceite}
  desistirSolicitacao={desistirSolicitacao}
  excluirConversa={excluirConversa}
  reservarVaga={reservarVaga}
  cancelarMinhaReserva={cancelarMinhaReserva}
  responderReserva={responderReserva}
  iniciarViagem={iniciarViagem}
  confirmarFinalizacaoViagem={confirmarFinalizacaoViagem}
  desistirOferta={desistirOferta}
  editarOferta={editarOferta}
  excluirOferta={excluirOferta}
  openProfile={openProfile}
  perfilVisualizadoId={usuarioPerfilAbertoId}
  onRequestPro={abrirTelaProSeNecessario}
  isPro={usuarioEhPremiumAtual()}
  textos={textos}
 lidas={new Set<string>()}
  naoLidasTotal={naoLidasTotal}
/>

</View>

)}



{!navegando && routeCoords.length === 0 && (

<Animated.View style={{
 position:"absolute",
 bottom:0,
 left:0,
 right:0,
 height:painelAtalhosAltura,
 backgroundColor:"#f5f6fa",
 borderTopLeftRadius:25,
 borderTopRightRadius:25,
 zIndex:10,
  elevation:10
}}>

  <View
    {...panResponderPainelAtalhos.panHandlers}
    style={{
      alignItems:"center",
      justifyContent:"center",
      paddingTop:8,
      paddingBottom:6
    }}
  >
    <View
      style={{
        width:58,
        height:6,
        borderRadius:999,
        backgroundColor:painelAtalhosExpandido ? "#0ea5e9" : "#64748b"
      }}
    />
  </View>

  <ScrollView
    ref={painelAtalhosRef}
    style={{flex:1}}
    contentContainerStyle={{paddingHorizontal:16,paddingTop:14,paddingBottom:70}}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    onScroll={(event)=>{
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const chegouNoFim = contentOffset.y + layoutMeasurement.height >= contentSize.height - 24;
      setPainelAtalhosNoFim(chegouNoFim);
    }}
    scrollEventThrottle={16}
  >

<Text style={{
 color:"#fff",
 fontSize:18,
 fontWeight:"bold",
 marginBottom:15
}}>
{t("paraOnde")}
</Text>

<TouchableOpacity

onPress={()=>{
  // se não tem casa salva �  abrir cadastro
  if(!casaSalva?.lat){
    setEditorCasaVisivel(true);
    return;
  }
  prepararDestinoParaViagem({
    texto: casaSalva.endereco,
    lat: Number(casaSalva.lat),
    lng: Number(casaSalva.lng)
  });
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
 backgroundColor:"#0b1220",
 padding:15,
 borderRadius:14,
 marginBottom:10,
 borderWidth:1,
 borderColor:"#1e293b"
}}
>

<View style={{flexDirection:"row", alignItems:"center"}}>
  <View style={{
    width:30,
    height:30,
    borderRadius:15,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"#082f49",
    borderWidth:1,
    borderColor:"#22d3ee",
    marginRight:10
  }}>
    <MaterialCommunityIcons name="home-city-outline" size={16} color="#22d3ee" />
  </View>
  <Text style={{color:"#e2e8f0",fontSize:16,fontWeight:"700"}}>
    {casaSalva?.nome || t("casa")}
  </Text>
</View>

</TouchableOpacity>

{/* TRABALHO */}
<TouchableOpacity

onPress={()=>{

 if(!trabalhoSalvo?.lat){
   setEditorTrabalhoVisivel(true);
   return;
 }

 prepararDestinoParaViagem({
   texto: trabalhoSalvo.endereco,
   lat: Number(trabalhoSalvo.lat),
   lng: Number(trabalhoSalvo.lng)
 });

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
 backgroundColor:"#0b1220",
 padding:14,
 borderRadius:14,
 marginBottom:15,
 borderWidth:1,
 borderColor:"#1e293b"
}}>
<View style={{flexDirection:"row", alignItems:"center"}}>
  <View style={{
    width:30,
    height:30,
    borderRadius:15,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"#1e1b4b",
    borderWidth:1,
    borderColor:"#a78bfa",
    marginRight:10
  }}>
    <MaterialCommunityIcons name="briefcase-account-outline" size={16} color="#c4b5fd" />
  </View>
  <Text style={{color:"#e2e8f0",fontSize:16,fontWeight:"700"}}>
    {trabalhoSalvo?.nome || t("definirTrabalho")}
  </Text>
</View>
</TouchableOpacity>

{/* AMIGOS */}
<TouchableOpacity
onPress={()=>{
 if(amigosLista.length === 0){
   setEditorAmigoVisivel(true);
   return;
 }

 setListaAmigosVisivel(true);

}}


style={{
 backgroundColor:"#0b1220",
 padding:14,
 borderRadius:14,
 marginBottom:15,
 borderWidth:1,
 borderColor: usuarioEhPro() ? "#1e293b" : "#7c2d12"
}}>
<View style={{flexDirection:"row", alignItems:"center"}}>
  <View style={{
    width:30,
    height:30,
    borderRadius:15,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"#052e16",
    borderWidth:1,
    borderColor:"#4ade80",
    marginRight:10
  }}>
    <MaterialCommunityIcons name="account-group-outline" size={16} color="#4ade80" />
  </View>
  <Text style={{color:"#e2e8f0",fontSize:16,fontWeight:"700"}}>
    {t("amigos")} ({amigosLista.length})
  </Text>
</View>
</TouchableOpacity>

{/* FAVORITOS */}
<Text style={{color:"#aaa",marginBottom:6}}>{t("favoritos")}</Text>

{favoritos.length===0 && (
<Text style={{color:"#666",marginBottom:12}}>
{t("nenhumFavoritoSalvoAinda")}
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
{t("recentes")}
</Text>

{recentes.length===0 && (
<Text style={{color:"#666"}}>
{t("nenhumRecenteAinda")}
</Text>
)}

</ScrollView>

<TouchableOpacity
  onPress={()=>{
    if(painelAtalhosNoFim){
      painelAtalhosRef.current?.scrollTo({ y:0, animated:true });
      return;
    }
    painelAtalhosRef.current?.scrollToEnd({ animated:true });
  }}
  style={{
    position:"absolute",
    right:12,
    bottom:14,
    width:40,
    height:40,
    borderRadius:20,
    backgroundColor:"#0f172a",
    borderWidth:1,
    borderColor:"#22d3ee",
    alignItems:"center",
    justifyContent:"center"
  }}
>
  <MaterialCommunityIcons
    name={painelAtalhosNoFim ? "chevron-up" : "chevron-down"}
    size={20}
    color="#22d3ee"
  />
</TouchableOpacity>

</Animated.View>
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
�x�� ESCOLHER NOME
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
{tComFallback("escolhaNomeCasa", "Escolha o nome da casa")}
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
{n}
</Text>
</TouchableOpacity>

))}

</View>
</>
)}

{/* =========================
�S�️ EDITAR ENDERE�!O
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
placeholder={tComFallback("rua", "Rua")}
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
placeholder={tComFallback("numero", "Numero")}
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
placeholder={tComFallback("bairro", "Bairro")}
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
placeholder={tComFallback("cidade", "Cidade")}
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
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputEnderecoCasa)}&limit=1`,
  {
    headers:{
      "User-Agent":"gps-clean-app"
    }
  }
);

  const data = await resp.json();
  console.log("[GEOCODE_QUERY]", String(inputEnderecoCasa || "").trim());
  console.log("[GEOCODE_URL]", `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputEnderecoCasa)}&limit=1`);
  console.log("[GEOCODE_RESULT]", Array.isArray(data) ? data[0] : null);

if(!data.length){
  alert(t("enderecoNaoEncontrado"));
  return;
}

const loc = {
  lat: parseFloat(data[0].lat),
  lng: parseFloat(data[0].lon)
};

  const novaCasa = {
    apelido: apelidoCasaTemp,
  endereco: `${rua}, ${numero} - ${bairro}, ${cidade}`,
    lat: loc.lat,
    lng: loc.lng
  };

  await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
  setCasaSalva(novaCasa);

  setModalEnderecoCasa(false);
  setApelidoCasaTemp("");
  setInputEnderecoCasa("");

 }catch(e){
  alert(t("erroSalvar"));
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
{tComFallback("salvarCasa", "SALVAR CASA")}
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>{
 setApelidoCasaTemp("");
 setModalEnderecoCasa(false);
}}
style={{marginTop:15}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
{tComFallback("cancelar", "Cancelar")}
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
{tComFallback("editarCasa", "Editar casa")}
</Text>


<TextInput
placeholder={tComFallback("rua", "Rua")}
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
placeholder={tComFallback("numero", "Numero")}
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
placeholder={tComFallback("bairro", "Bairro")}
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
placeholder={tComFallback("cidade", "Cidade")}
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
  alert(t("preenchaEndereco"));
   return;
 }

 const enderecoFinal = `${rua}, ${numero}, ${bairro}, ${cidade}`;


 try{

 const resp = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`,
  {
    headers:{
      "User-Agent":"gps-clean-app"
    }
  }
);

const data = await resp.json();
console.log("[GEOCODE_QUERY]", String(enderecoFinal || "").trim());
console.log("[GEOCODE_URL]", `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`);
console.log("[GEOCODE_RESULT]", Array.isArray(data) ? data[0] : null);

if(!Array.isArray(data) || !data.length){
  alert(t("enderecoNaoEncontrado"));
  return;
}

const loc = {
  lat: parseFloat(data[0].lat),
  lng: parseFloat(data[0].lon)
};

  const novaCasa = {
    apelido: nomeCasaEscolhido || "Casa",

    endereco: enderecoFinal,
    lat: Number(loc.lat),
    lng: Number(loc.lng)
  };

  await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
  setCasaSalva(novaCasa);

  setEditorCasaVisivel(false);
  alert(t("casaSalva"));

 }catch(e){
  alert(t("erroSalvar"));
 }

}}
style={{
 backgroundColor:"#00c853",
 padding:15,
 borderRadius:14,
 marginBottom:10
}}>
<Text style={{color:"#fff",fontWeight:"bold",textAlign:"center"}}>
{tComFallback("salvarCasa", "SALVAR CASA")}
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setEditorCasaVisivel(false)}
style={{padding:10}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
{tComFallback("cancelar", "Cancelar")}
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
�x�� EDITOR CASA DEFINITIVO
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
{tComFallback("escolhaNomeBase", "Escolha o nome da base")}
</Text>

{/* LISTA NOMES ZOEIRA */}
{!nomeCasaEscolhido && (
  <View style={{ maxHeight: 260, marginBottom: 15 }}>
    <ScrollView showsVerticalScrollIndicator={true}>
      {nomesCasaZoeira
        .slice(0, usuarioEhPro() ? nomesCasaZoeira.length : FREE_LIMITE_NOMES)
        .map((n, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setNomeCasaEscolhido(n)}
            style={{
              backgroundColor: nomeCasaEscolhido === n ? "#00c853" : "#1c1c1c",
              padding: 14,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>{n}</Text>
          </TouchableOpacity>
        ))}

      {!usuarioEhPro() && nomesCasaZoeira.length > FREE_LIMITE_NOMES && (
        <TouchableOpacity
          onPress={() => setTelaProVisivel(true)}
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            padding: 14,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            {tComFallback("maisComPro", "Mais com PRO")}
          </Text>
          
        </TouchableOpacity>
      )}
    </ScrollView>
  </View>
)}

{/* MOSTRA ENDERE�!O S� AP�S ESCOLHER NOME */}
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
placeholder={tComFallback("rua", "Rua")}
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
placeholder={tComFallback("numero", "Numero")}
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
placeholder={tComFallback("bairro", "Bairro")}
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
placeholder={tComFallback("cidade", "Cidade")}
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
  alert(tComFallback("preenchaEndereco", "Preencha o endereço"));
   return;
 }

 const enderecoFinal =
 `${rua}, ${numero} - ${bairro}, ${cidade}`;

 try{

 const resp = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`,
  {
    headers:{
      "User-Agent":"gps-clean-app"
    }
  }
);

 const data = await resp.json();
 console.log("[GEOCODE_QUERY]", String(enderecoFinal || "").trim());
 console.log("[GEOCODE_URL]", `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`);
 console.log("[GEOCODE_RESULT]", Array.isArray(data) ? data[0] : null);

if(!Array.isArray(data) || !data.length){
  alert(tComFallback("enderecoNaoEncontrado", "Endereço não encontrado"));
  return;
}

const loc = {
  lat: parseFloat(data[0].lat),
  lng: parseFloat(data[0].lon)
};

 const novaCasa = {
   nome: nomeCasaEscolhido,
   endereco: enderecoFinal,
   lat: Number(loc.lat),
   lng: Number(loc.lng)
 };

 await AsyncStorage.setItem("casa_salva", JSON.stringify(novaCasa));
 setCasaSalva(novaCasa);

 setEditorCasaVisivel(false);

 setNomeCasaEscolhido("");
 setRua("");
 setNumero("");
 setBairro("");
 setCidade("");

 falar(tComFallback("baseDefinida", "Base definida"));

 }catch(e){
   alert(tComFallback("erroSalvar", "Erro ao salvar"));
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
{tComFallback("salvarBase", "SALVAR BASE")}
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
{tComFallback("cancelar", "Cancelar")}
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
�x� EDITOR AMIGO PROFISSIONAL
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
{tComFallback("nomeDoAmigo", "Nome do amigo")}
</Text>

{!nomeAmigoEscolhido && (
<>
<ScrollView style={{maxHeight:260}} showsVerticalScrollIndicator={true}>

{nomesAmigoZoeira
  .slice(0, usuarioEhPro() ? nomesAmigoZoeira.length : FREE_LIMITE_NOMES)
  .map((n,i)=>(
    <TouchableOpacity
      key={i}
      onPress={()=>setNomeAmigoEscolhido(n)}
      style={{
        backgroundColor:"#1c1c1c",
        padding:14,
        borderRadius:12,
        marginBottom:8
      }}
    >
      <Text style={{color:"#fff",fontSize:16}}>
        {n}
      </Text>
    </TouchableOpacity>
))}

{!usuarioEhPro() && nomesAmigoZoeira.length > FREE_LIMITE_NOMES && (
  <TouchableOpacity
    onPress={()=>setTelaProVisivel(true)}
    style={{
      backgroundColor:"rgba(255,255,255,0.06)",
      padding:14,
      borderRadius:12,
      marginBottom:8,
      borderWidth:1,
      borderColor:"rgba(255,255,255,0.12)"
    }}
  >
    <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>
      {tComFallback("maisComPro", "Mais com PRO")}
    </Text>

    
  </TouchableOpacity>
)}

</ScrollView>
</>
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
placeholder={tComFallback("rua", "Rua")}
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
placeholder={tComFallback("numero", "Numero")}
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
placeholder={tComFallback("bairro", "Bairro")}
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
placeholder={tComFallback("cidade", "Cidade")}
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
    alert(tComFallback("preenchaEndereco", "Preencha o endereço"));
    return;
  }

  const enderecoFinal = `${rua}, ${numero} - ${bairro}, ${cidade}`;

  try{
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`,
      {
        headers:{
          "User-Agent":"gps-clean-app"
        }
      }
    );

    const data = await resp.json();
  console.log("[GEOCODE_QUERY]", String(enderecoFinal || "").trim());
  console.log("[GEOCODE_URL]", `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`);
  console.log("[GEOCODE_RESULT]", Array.isArray(data) ? data[0] : null);

    if(!Array.isArray(data) || !data.length){
      alert(tComFallback("enderecoNaoEncontrado", "Endereço não encontrado"));
      return;
    }

    const loc = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

    const novoAmigo = {
      nome: nomeAmigoEscolhido,
      endereco: enderecoFinal,
      lat: loc.lat,
      lng: loc.lng
    };

    salvarAmigo(novoAmigo);
  }catch(e){
    alert(tComFallback("erroSalvarAmigo", "Erro ao salvar amigo"));
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
{tComFallback("salvarAmigo", "SALVAR AMIGO")}
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
{tComFallback("cancelar", "Cancelar")}
</Text>
</TouchableOpacity>

</View>
</View>
)}
{/* =========================================
�x� EDITOR TRABALHO
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
{tComFallback("nomeDoTrabalho", "Nome do trabalho")}
</Text>

{!nomeTrabalhoEscolhido && (
<>
<ScrollView style={{maxHeight:260}} showsVerticalScrollIndicator={true}>

{nomesTrabalhoZoeira
  .slice(0, usuarioEhPro() ? nomesTrabalhoZoeira.length : FREE_LIMITE_NOMES)
  .map((n,i)=>(
    <TouchableOpacity
      key={i}
      onPress={()=>setNomeTrabalhoEscolhido(n)}
      style={{
        backgroundColor:"#1c1c1c",
        padding:14,
        borderRadius:12,
        marginBottom:8
      }}
    >
      <Text style={{color:"#fff",fontSize:16}}>
        {n}
      </Text>
    </TouchableOpacity>
))}

{!usuarioEhPro() && nomesTrabalhoZoeira.length > FREE_LIMITE_NOMES && (
  <TouchableOpacity
    onPress={()=>setTelaProVisivel(true)}
    style={{
      backgroundColor:"rgba(255,255,255,0.06)",
      padding:14,
      borderRadius:12,
      marginBottom:8,
      borderWidth:1,
      borderColor:"rgba(255,255,255,0.12)"
    }}
  >
    <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>
      {tComFallback("maisComPro", "Mais com PRO")}
    </Text>
    
  </TouchableOpacity>
)}

</ScrollView>
</>
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
placeholder={tComFallback("rua", "Rua")}
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
placeholder={tComFallback("numero", "Numero")}
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
placeholder={tComFallback("bairro", "Bairro")}
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
placeholder={tComFallback("cidade", "Cidade")}
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
    alert(tComFallback("preenchaEndereco", "Preencha o endereço"));
    return;
  }

  const enderecoFinal = `${rua}, ${numero} - ${bairro}, ${cidade}`;

  try{
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`,
      {
        headers:{
          "User-Agent":"gps-clean-app"
        }
      }
    );

    const data = await resp.json();
  console.log("[GEOCODE_QUERY]", String(enderecoFinal || "").trim());
  console.log("[GEOCODE_URL]", `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFinal)}&limit=1`);
  console.log("[GEOCODE_RESULT]", Array.isArray(data) ? data[0] : null);

    if(!Array.isArray(data) || !data.length){
      alert(tComFallback("enderecoNaoEncontrado", "Endereço não encontrado"));
      return;
    }

    const loc = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

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
    setRua("");
    setNumero("");
    setBairro("");
    setCidade("");

    falar(tComFallback("trabalhoSalvoFala", "Destino de sofrimento salvo"));
  }catch(e){
    alert(tComFallback("erroSalvarTrabalho", "Erro ao salvar trabalho"));
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
{tComFallback("salvarTrabalho", "SALVAR TRABALHO")}
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
{tComFallback("cancelar", "Cancelar")}
</Text>
</TouchableOpacity>

</View>
</View>
)}

{/* =========================================
�x� LISTA DE AMIGOS SALVOS
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
{tComFallback("seusContatosDuvidosos", "Seus contatos duvidosos")}
</Text>

<ScrollView style={{maxHeight:350}} showsVerticalScrollIndicator={true}>

{amigosLista
  .slice(0, usuarioEhPro() ? amigosLista.length : FREE_LIMITE_NOMES)
  .map((amg,i)=>(
    <TouchableOpacity
      key={i}
      onPress={()=>{
        setListaAmigosVisivel(false);
        prepararDestinoParaViagem({
          texto: amg.endereco,
          lat: Number(amg.lat),
          lng: Number(amg.lng)
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
      }}
    >
      <Text style={{color:"#fff",fontSize:16}}>
        {amg.nome}
      </Text>

      <Text style={{color:"#777",fontSize:12, marginTop:3}}>
        {amg.endereco}
      </Text>
    </TouchableOpacity>
))}

{!usuarioEhPro() && amigosLista.length > FREE_LIMITE_NOMES && (
  <TouchableOpacity
    onPress={()=>{
      setTelaProVisivel(true);
    }}
    style={{
      backgroundColor:"rgba(255,255,255,0.06)",
      padding:16,
      borderRadius:14,
      marginBottom:10,
      borderWidth:1,
      borderColor:"rgba(255,255,255,0.12)"
    }}
  >
    <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>
      +{amigosLista.length - FREE_LIMITE_NOMES} {tComFallback("contatosNoPro", "contatos no PRO")}
    </Text>

    <Text style={{color:"#aaa",fontSize:12, marginTop:4}}>
      {tComFallback("planoFreeContatos", "O plano free mostra so os 3 primeiros contatos salvos.")}
    </Text>
  </TouchableOpacity>
)}

</ScrollView>

<TouchableOpacity
onPress={()=>{
  if(!usuarioEhPro() && amigosLista.length >= FREE_LIMITE_NOMES){
    setTelaProVisivel(true);
    return;
  }

  setListaAmigosVisivel(false);
  setAmigoEditandoIndex(null);
  setNomeAmigoEscolhido("");
  setRua("");
  setNumero("");
  setBairro("");
  setCidade("");
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
+ {tComFallback("adicionarNovoAmigo", "Adicionar novo amigo")}
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setListaAmigosVisivel(false)}
style={{marginTop:12}}>
<Text style={{color:"#aaa",textAlign:"center"}}>
{tComFallback("fechar", "Fechar")}
</Text>
</TouchableOpacity>

</View>
</View>
)}
     {/* BOTÒO RECENTRALIZAR */}
{mapMovido && navegando && (

  <TouchableOpacity
    style={{
      position:"absolute",
      bottom: (insets.bottom || 0) + 238,
      left:16,
      backgroundColor:"#ffffff",
      paddingVertical:10,
      paddingHorizontal:14,
      borderRadius:22,
      zIndex:9999,
      elevation:18,
      shadowColor:"#000",
      shadowOpacity:0.18,
      shadowRadius:8,
      shadowOffset:{ width:0, height:3 },
      flexDirection:"row",
      alignItems:"center",
      borderWidth:1,
      borderColor:"rgba(15,23,42,0.08)",
    }}

    onPress={()=>{

      setMapMovido(false);
      mapMovidoRef.current = false;

      if(carroPos){
        mapRef.current?.animateCamera({
          center:{
            latitude: carroPos.latitude,
            longitude: carroPos.longitude
          },
          heading: carroPos.heading || 0,
          pitch: 65,
          zoom: 18.5
        },{ duration: 400 });
      }

    }}
  >
    <MaterialCommunityIcons
      name="crosshairs-gps"
      size={18}
      color="#0f172a"
      style={{ marginRight:8 }}
    />
    <Text style={{
      color:"#0f172a",
      fontWeight:"700",
      fontSize:13
    }}>
      Recentralizar
    </Text>
  </TouchableOpacity>

)}
{/* =========================================
�xa� BOTÒO REPORT VOZ AUTOMÁTICO
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

  if(!carroPos) return;

  const dados = {
    latitude: carroPos.latitude,
    longitude: carroPos.longitude,
    data: new Date().toISOString()
  };

  setCoordsReportTemp(dados);

  // limpa pendente
  setReportPendente(false);

  // abre menu
  setMenuReportRapido(true);

  Vibration.vibrate(60);

  // se não escolher nada em 5s �  vira pendente
  if(reportTimeoutRef.current) clearTimeout(reportTimeoutRef.current);
  reportTimeoutRef.current = setTimeout(()=>{
    reportTimeoutRef.current = null;
    setMenuReportRapido(false);
    setReportPendente(true);
  },5000);

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
<View style={{alignItems:"center", justifyContent:"center"}}>
<MaterialCommunityIcons name="bullhorn" size={26} color="#fff" />
{reportPendente && (
  <View style={{
    position:"absolute",
    top:-2,
    right:-2,
    width:18,
    height:18,
    borderRadius:9,
    backgroundColor:"#ff0000",
    alignItems:"center",
    justifyContent:"center",
    zIndex:999
  }}>
    <Text style={{
      color:"#fff",
      fontSize:12,
      fontWeight:"bold"
    }}>
      ?
    </Text>
  </View>
)}
</View>
</TouchableOpacity>

</Animated.View>
)}
{/* �xa� MENU REPORT RÁPIDO WAZE */}
{renderMenuReportTrajeto(150, "rapido")}
{/* BOTAO VIRAR PREMIUM (APENAS FREE) */}
{!assinaturaAtiva && (!navegando || mostrarBotaoPro) && (
  <TouchableOpacity
    style={{
      position:"absolute",
      top:40,
      right:74,
      backgroundColor:"#d4a017",
      minHeight:30,
      paddingVertical:5,
      paddingHorizontal:10,
      borderRadius:10,
      alignItems:"center",
      justifyContent:"center",
      elevation:16,
      zIndex:999
    }}
    onPress={()=>setTelaProVisivel(true)}
  >
    <Text style={{color:"#111", fontWeight:"900", fontSize:10}}>
      {t("virarPro")}
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
 placeholder={t("paraOnde")}
 value={destinoTxt}
 onChangeText={buscarSugestoesDestinoDebounced}
 placeholderTextColor="#666"
 style={{
   flex:1,
   fontSize:16,
   color:"#111"
 }}
/>

<TouchableOpacity
  disabled={rotaCarregando}
  onPress={async ()=>{
    if(rotaCarregando) return;

    Keyboard.dismiss();

    const primeiraSugestao =
      Array.isArray(sugestoes) && sugestoes.length > 0
        ? sugestoes[0]
        : null;

    const textoFinal = String(
      primeiraSugestao?.enderecoCompleto ||
      primeiraSugestao?.description ||
      destinoTxt ||
      ""
    ).trim();

    const latSugestao = Number(primeiraSugestao?.lat);
    const lngSugestao = Number(primeiraSugestao?.lng);

    let latFinal = Number.isFinite(latSugestao) ? latSugestao : Number(destinoLat);
    let lngFinal = Number.isFinite(lngSugestao) ? lngSugestao : Number(destinoLng);

    if(!textoFinal){
      Alert.alert(tComFallback("erro", "Erro"), tComFallback("digiteDestino", "Digite um destino."));
      return;
    }

    if(!Number.isFinite(latFinal) || !Number.isFinite(lngFinal)){
      const coordsBusca = await buscarCoordenadas(textoFinal);
      latFinal = Number(coordsBusca?.lat);
      lngFinal = Number(coordsBusca?.lng);
    }

    if(!Number.isFinite(latFinal) || !Number.isFinite(lngFinal)){
      Alert.alert(tComFallback("erro", "Erro"), tComFallback("enderecoNaoEncontrado", "Endereço não encontrado."));
      return;
    }

    setDestinoTxt(textoFinal);
    setDestinoLat(latFinal);
    setDestinoLng(lngFinal);
    setSugestoes([]);
    setSugestoesDestino([]);

    await prepararDestinoParaViagem({
      texto: textoFinal,
      lat: latFinal,
      lng: lngFinal
    });
  }}
  style={{
    width:42,
    height:42,
    borderRadius:12,
    backgroundColor: rotaCarregando ? "#6b7280" : "#007AFF",
    justifyContent:"center",
    alignItems:"center",
    opacity: rotaCarregando ? 0.7 : 1
  }}
>
  <MaterialCommunityIcons
    name={rotaCarregando ? "progress-clock" : "magnify"}
    size={20}
    color="#fff"
  />
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
   onPress={async ()=>{
  const textoBusca = String(
    item.enderecoCompleto ||
    item.description ||
    ""
  ).trim();

  const latBusca = Number(item.lat);
  const lngBusca = Number(item.lng);

  setDestinoTxt(textoBusca);

  if(Number.isFinite(latBusca) && Number.isFinite(lngBusca)){
    setDestinoLat(latBusca);
    setDestinoLng(lngBusca);
  }

  setSugestoes([]);
  setSugestoesDestino([]);

  await prepararDestinoParaViagem({
    texto: textoBusca,
    lat: Number.isFinite(latBusca) ? latBusca : null,
    lng: Number.isFinite(lngBusca) ? lngBusca : null,
  });
}}
  >
    <Text>{item.description}</Text>
  </TouchableOpacity>
))}

        
      </View>
    )}

   
{/* VELOCÍMETRO */}
{/* ====== BANNER DE INSTRU�!ÒO � ESTILO GOOGLE MAPS ====== */}
{navegando && (
  <View style={{
    position:"absolute",
    top: Math.max(insets.top + 8, 16),
    left:16,
    right:16,
    backgroundColor:"#046c4e",
    borderRadius:16,
    paddingVertical:14,
    paddingHorizontal:16,
    zIndex:9999,
    elevation:20,
    flexDirection:"row",
    alignItems:"center",
    shadowColor:"#000",
    shadowOpacity:0.25,
    shadowRadius:6,
    shadowOffset:{width:0,height:3}
  }}>
    {/* seta direcional */}
    <View style={{
      width:52,
      height:52,
      borderRadius:10,
      backgroundColor:"rgba(255,255,255,0.15)",
      justifyContent:"center",
      alignItems:"center",
      marginRight:14
    }}>
      <MaterialCommunityIcons
        name={(() => {
          if(!stepAtualVisual) return "arrow-up-bold";
          const tipo = String(stepAtualVisual?.maneuver?.type || "");
          const lado = String(stepAtualVisual?.maneuver?.modifier || "").toLowerCase();
          if(tipo === "arrive") return "flag-checkered";
          if(tipo === "roundabout") return "rotate-right";
          if(lado.includes("left") || lado.includes("esquerda")) return "arrow-left-bold";
          if(lado.includes("right") || lado.includes("direita")) return "arrow-right-bold";
          if(lado.includes("slight left")) return "arrow-left";
          if(lado.includes("slight right")) return "arrow-right";
          return "arrow-up-bold";
        })() as any}
        size={30}
        color="#fff"
      />
    </View>

    {/* textos */}
    <View style={{flex:1}}>
      {!!instrucaoTopoDistancia && (
        <View style={{
          flexDirection:"row",
          alignItems:"center",
          marginBottom:3
        }}>
          <View style={{
            backgroundColor:"rgba(255,255,255,0.2)",
            borderRadius:8,
            paddingVertical:2,
            paddingHorizontal:8,
          }}>
            <Text style={{color:"#d1fae5", fontSize:12, fontWeight:"800", letterSpacing:0.4}}>
              {instrucaoTopoDistancia}
            </Text>
          </View>
        </View>
      )}
      <Text style={{color:"#fff", fontSize:18, fontWeight:"bold", lineHeight:22}} numberOfLines={2}>
        {instrucaoTopoTitulo}
      </Text>
    </View>
  </View>
)}

{/* ====== RODAP�0 INFO � ESTILO GOOGLE MAPS ====== */}
{navegando && (
  <View style={{
    position:"absolute",
    bottom: insets.bottom + 12,
    left:16,
    right:16,
    backgroundColor:"#fff",
    borderRadius:20,
    paddingVertical:14,
    paddingHorizontal:20,
    zIndex:9999,
    elevation:20,
    flexDirection:"row",
    alignItems:"center",
    shadowColor:"#000",
    shadowOpacity:0.15,
    shadowRadius:8,
    shadowOffset:{width:0,height:2}
  }}>
    {/* tempo */}
    <View style={{flex:1}}>
      <Text style={{fontSize:30, fontWeight:"900", color:"#111", letterSpacing:-0.5}}>
        {tempo ? `${tempo} min` : "--"}
      </Text>
      <Text style={{fontSize:13, color:"#555", marginTop:1}}>
        {distancia ? `${distancia} km` : "-- km"}
        {tempo ? ` · ${(() => {
          const agora = new Date();
          agora.setMinutes(agora.getMinutes() + Number(tempo));
          return agora.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"});
        })()}` : ""}
      </Text>
    </View>

    {/* velocímetro compacto */}
    <View style={{
      width:54,
      height:54,
      borderRadius:27,
      borderWidth:3,
      borderColor: velocidade > 0 && Number(velocidade) > 80 ? "#ef4444" : "#d1d5db",
      justifyContent:"center",
      alignItems:"center",
      marginRight:12
    }}>
      <Text style={{fontSize:16, fontWeight:"bold", color:"#111"}}>{velocidade}</Text>
      <Text style={{fontSize:8, color:"#888", marginTop:-2}}>km/h</Text>
    </View>

    {/* botão X */}
    <TouchableOpacity
      onPress={()=>{
        setMapMovido(false);
        mapMovidoRef.current = false;
        setNavegando(false);
        setBarraVisivel(false);

if(barraTimer.current){
  clearTimeout(barraTimer.current);
}
      }}
      style={{
        width:48,
        height:48,
        borderRadius:24,
        backgroundColor:"#f1f5f9",
        justifyContent:"center",
        alignItems:"center"
      }}
    >
      <MaterialCommunityIcons name="close" size={22} color="#374151" />
    </TouchableOpacity>
  </View>
)}

{/* �x� BARRA DE NÍVEL INSANO */}
{barraVisivel && navegando && (

  <View style={{
    position:"absolute",
    bottom:170,
    left:20,
    right:20,
    backgroundColor:"#111",
    padding:4,
    borderRadius:8,
    borderWidth:1,
    borderColor:"#ff0033",
    elevation:12
  }}>

    <Text style={{
      color:"#fff",
      fontWeight:"bold",
      marginBottom:6,
      textAlign:"center",
      fontSize:10
    }}>
      NÍVEL DE PACI�`NCIA
    </Text>

    <View style={{
      flexDirection:"row",
      justifyContent:"space-between",
      alignItems:"center",
      height:34
    }}>

      {[0,1,2,3,4].map(n=>{

        const limiteConta = limiteNivelUsuario();
        const limiteVisual = Math.min(limiteConta, Number(nivelBloqueado));
        const bloqueado = n > limiteVisual;
        const selecionado = n === nivelBloqueado;

        const cores = [
          "#00E676",
          "#AEEA00",
          "#FFD600",
          "#FF6D00",
          "#FF0033"
        ];

        return(
          <TouchableOpacity
            key={n}
            activeOpacity={0.85}
            onPress={()=>{
              if(n > limiteConta){
                setTelaProVisivel(true);
                mostrarBarraNivelTemporariamente();
                return;
              }

              if(n === 4){
                Alert.alert(
                  "Linguagem explícita",
                  "O nível 4 contém palavrões e conteúdo adulto.\n\nDeseja realmente ativar?",
                  [
                    {
                      text:"Não",
                      style:"cancel",
                      onPress:()=>{
                        esconderBarraNivelComDelay(3000);
                      }
                    },
                    {
                      text:"Sim",
                      onPress:()=>{
                        alterarNivelPaciencia(4);
                      }
                    }
                  ]
                );
                return;
              }

              alterarNivelPaciencia(n);
            }}
            style={{
              flex:1,
              marginHorizontal:2,
              paddingVertical:3,
              borderRadius:6,
              backgroundColor: bloqueado ? "#4b5563" : cores[n],
              opacity: bloqueado ? 0.45 : 1,
              alignItems:"center",
              justifyContent:"center",
              borderWidth: selecionado ? 2 : 1,
              borderColor: selecionado ? "#ffffff" : (bloqueado ? "#6b7280" : "transparent")
            }}
          >
            <MaterialCommunityIcons
              name={
                bloqueado
                  ? "lock"
                  : n === 0
                    ? "emoticon-happy-outline"
                    : n === 1
                      ? "emoticon-neutral-outline"
                      : n === 2
                        ? "emoticon-confused-outline"
                        : n === 3
                          ? "emoticon-angry-outline"
                          : "emoticon-devil-outline"
              }
              size={16}
              color={bloqueado ? "#d1d5db" : "#ffffff"}
            />

            <Text style={{
              color: bloqueado ? "#d1d5db" : "#fff",
              fontWeight:"bold",
              fontSize:7,
              marginTop:1
            }}>
              {n}
            </Text>
          </TouchableOpacity>
        );
      })}

    </View>

    {!modoPro && !assinaturaAtiva && (
      <Text style={{
        color:"#9ca3af",
        fontSize:10,
        textAlign:"center",
        marginTop:6
      }}>
        Free desbloqueia apenas até o nível 1
      </Text>
    )}
  </View>
)}
{/* TELA PRO / PREMIUM */}
{telaProVisivel && (
<View style={{
    position:"absolute",
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor:"#000",
    zIndex:9999,
    elevation:9999,
    pointerEvents:"auto",
  }}
>
{/* Botão Fechar */}
<TouchableOpacity
  onPress={()=>setTelaProVisivel(false)}
  style={{
    position:"absolute",
    top:Math.max((insets.top || 0) + 4, 40),
    right:20,
    zIndex:10,
  }}
>
  <Text style={{ color:"#fff", fontSize:24 }}>✕</Text>
</TouchableOpacity>

<ScrollView 
  style={{
    flex:1,
    paddingTop:Math.max((insets.top || 0) + 8, 40),
    paddingHorizontal:20
  }}
  contentContainerStyle={{
    paddingBottom: Math.max((insets.bottom || 0) + 56, 72)
  }}
  nestedScrollEnabled={true}
  scrollEnabled={true}
  bounces={true}
  alwaysBounceVertical={true}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={true}
>

<Text style={{
  color:"#fff",
  fontSize:32,
  fontWeight:"bold",
  textAlign:"center",
  marginBottom:8
}}>
{tComFallback("tituloPlanosUpsell", "Escolha seu plano")}
</Text>

<Text style={{
  color:"#ff0033",
  fontSize:16,
  textAlign:"center",
  marginBottom:32
}}>
{tComFallback("subtituloPlanosUpsell", "Navegação sem paciência. Sem limites. Sem perdão.")}
</Text>

{/* Fase atual */}
<Text style={{
  color:"#666",
  fontSize:12,
  textAlign:"center",
  marginBottom:16,
  fontStyle:"italic"
}}>
{obterFasePlanoAtual() === "lancamento" && tComFallback("faseLancamentoLabel", "Fase de lançamento")}
{obterFasePlanoAtual() === "transicao" && tComFallback("faseTransicaoLabel", "Fase de transição")}
{obterFasePlanoAtual() === "normal" && tComFallback("faseNormalLabel", "Preço normal")}
</Text>

{/* Planos */}
{(() => {
  const precos = obterPrecosAtuaisNovosAssinantes(regiaoDoDispositivo());
  const simbolo = obterSimboloMoeda(precos.moeda);
  const premiumFreeAtivo = planoEhPremiumFree(planoAtual);
  const premiumFreeDisp = premiumFreeDisponivel();
  const diasRestantesPremiumFree = Math.max(0, Math.ceil((DATA_FIM_PREMIUM_FREE - Date.now()) / (1000 * 60 * 60 * 24)));
  return (
    <View style={{ gap: 16, marginBottom: 24 }}>

      {/* PREMIUM FREE — somente para motoristas, válido nos primeiros 75 dias de lançamento */}
      {(premiumFreeDisp || premiumFreeAtivo) && (
        <View
          style={{
            backgroundColor:"#0a1a0f",
            borderColor:"#00cc66",
            borderWidth:2,
            borderRadius:12,
            padding:20,
          }}
        >
          <View style={{ flexDirection:"row", alignItems:"center", marginBottom:4 }}>
            <Text style={{
              color:"#00cc66",
              fontSize:24,
              fontWeight:"bold",
            }}>
              {tComFallback("nomePlanoPremiumFree", "PREMIUM FREE")}
            </Text>
            <View style={{
              backgroundColor:"#00cc66",
              borderRadius:6,
              paddingHorizontal:8,
              paddingVertical:2,
              marginLeft:10,
            }}>
              <Text style={{ color:"#000", fontSize:10, fontWeight:"bold" }}>
                {tComFallback("premiumFreeMotoristaTag", "MOTORISTA")}
              </Text>
            </View>
          </View>
          <Text style={{
            color:"#00cc66",
            fontSize:12,
            marginBottom:12,
            fontStyle:"italic"
          }}>
            🚗 {tComFallback("premiumFreeSubtitulo", "Grátis nos primeiros 75 dias de lançamento")}
          </Text>

          <Text style={{
            color:"#fff",
            fontSize:28,
            fontWeight:"bold",
            marginBottom:4
          }}>
            {tComFallback("premiumFreeGratis", "GRÁTIS")}
          </Text>
          <Text style={{
            color:"#999",
            fontSize:12,
            marginBottom:16
          }}>
            {premiumFreeAtivo
              ? tComFallback("premiumFreeAtivoLabel", "Plano ativo")
              : diasRestantesPremiumFree === 1
                ? tComFallback("premiumFreeRestam1Dia", "Resta 1 dia para ativar")
                : `${diasRestantesPremiumFree} ${tComFallback("premiumFreeDiasRestantes", "dias restantes para ativar")}`
            }
          </Text>

          {/* Benefícios PREMIUM FREE */}
          <Text style={{ color:"#aaffcc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumFreeCarona", "Pode dar carona")}</Text>
          <Text style={{ color:"#aaffcc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumFreeEntrega", "Pode fazer entregas")}</Text>
          <Text style={{ color:"#aaffcc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumFreeOfertas", "Aceita ofertas e ganha dinheiro")}</Text>
          <Text style={{ color:"#666", fontSize:11, marginBottom:8 }}>✗ {tComFallback("beneficioPremiumFreeXingBloq", "Xingamentos bloqueados")}</Text>
          <Text style={{ color:"#666", fontSize:11, marginBottom:16 }}>✗ {tComFallback("beneficioPremiumFreeModoComicoBloq", "Modo cômico bloqueado")}</Text>

          {premiumFreeAtivo ? (
            <View style={{
              backgroundColor:"#005533",
              padding:12,
              borderRadius:8,
              alignItems:"center"
            }}>
              <Text style={{ color:"#00cc66", fontWeight:"bold", fontSize:14 }}>
                ✓ {tComFallback("premiumFreeJaAtivo", "JÁ ATIVO")}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor:"#00cc66",
                padding:12,
                borderRadius:8,
                alignItems:"center"
              }}
              onPress={async () => {
                try {
                  const novaAssinatura: AssinaturaUsuario = {
                    plano: "premium_free",
                    ativo: true,
                    dataInicio: Date.now(),
                    dataFim: DATA_FIM_PREMIUM_FREE,
                    precoTravadoMensal: 0,
                    moeda: "BRL",
                    origem: "manual",
                    faseNaEntrada: obterFasePlanoAtual(),
                    regiaoNaEntrada: regiaoDoDispositivo() ?? null,
                  };
                  await salvarAssinaturaLocal(novaAssinatura);
                  setAssinatura(novaAssinatura);
                  setPlanoAtual("premium_free");
                  setAssinaturaAtiva(true);
                  setModoPro(true);
                  setTelaProVisivel(false);
                  Alert.alert(
                    tComFallback("premiumFreeAtivadoTitulo", "Premium Free ativado!"),
                    tComFallback("premiumFreeAtivadoMsg", "Você pode dar caronas e fazer entregas gratuitamente até o fim dos primeiros 75 dias de lançamento.")
                  );
                } catch (e) {
                  console.log("[premium_free] Erro ao ativar:", e);
                }
              }}
            >
              <Text style={{ color:"#000", fontWeight:"bold", fontSize:14 }}>
                {tComFallback("ativarPremiumFree", "ATIVAR GRÁTIS")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* PRO */}
      <View
        style={{
          backgroundColor:"#111",
          borderColor:"#ff3366",
          borderWidth:2,
          borderRadius:12,
          padding:20,
        }}
      >
        <Text style={{
          color:"#ff3366",
          fontSize:24,
          fontWeight:"bold",
          marginBottom:12
        }}>
          {tComFallback("nomePlanoPro", "PRO")}
        </Text>
        <Text style={{
          color:"#fff",
          fontSize:24,
          fontWeight:"bold",
          marginBottom:4
        }}>
          {simbolo}{precos.pro.toFixed(2)}
        </Text>
        <Text style={{
          color:"#999",
          fontSize:12,
          marginBottom:16
        }}>
          {tComFallback("pormesLabel", "por mês")}
        </Text>

        {/* Benefícios PRO */}
        <Text style={{ color:"#999", fontSize:11, marginBottom:8 }}>{tComFallback("beneficioProComico", "Modo cômico")}</Text>
        <Text style={{ color:"#999", fontSize:11, marginBottom:8 }}>{tComFallback("beneficioProXingamento", "Xingamentos até nível 4")}</Text>
        <Text style={{ color:"#999", fontSize:11, marginBottom:16 }}>{tComFallback("beneficioProSemGanhar", "Não pode dar carona nem fazer entrega")}</Text>

        <TouchableOpacity
          style={{
            backgroundColor:"#ff3366",
            padding:12,
            borderRadius:8,
            alignItems:"center"
          }}
          onPress={async ()=>{
            Keyboard.dismiss();
            const assinaturaPro = await ativarPlano({
              plano: "pro",
              regiao: regiaoDoDispositivo(),
              origem: "teste",
            });

            setAssinatura(assinaturaPro);
            setPlanoAtual("pro");
            setModoPro(true);
            setAssinaturaAtiva(true);
            setTelaProVisivel(false);
            falar("Modo pro ativado");
          }}
        >
          <Text style={{
            color:"#000",
            fontWeight:"bold",
            fontSize:14
          }}>
            {tComFallback("assinarPro", "ASSINAR PRO")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PREMIUM */}
      <View
        style={{
          backgroundColor:"#1a0f0f",
          borderColor:"#ffaa00",
          borderWidth:2,
          borderRadius:12,
          padding:20,
        }}
      >
        <View style={{ marginBottom:12 }}>
          <Text style={{
            color:"#ffaa00",
            fontSize:24,
            fontWeight:"bold",
          }}>
            {tComFallback("nomePlanoPremium", "PREMIUM")}
          </Text>
          <Text style={{
            color:"#ffaa00",
            fontSize:12,
            marginTop:4,
            fontStyle:"italic"
          }}>
            ⭐ {tComFallback("upsellPremiumFrase", "Libere tudo")}
          </Text>
        </View>
        
        <Text style={{
          color:"#fff",
          fontSize:24,
          fontWeight:"bold",
          marginBottom:4
        }}>
          {simbolo}{precos.premium.toFixed(2)}
        </Text>
        <Text style={{
          color:"#999",
          fontSize:12,
          marginBottom:16
        }}>
          {tComFallback("pormesLabel", "por mês")}
        </Text>

        {/* Benefícios PREMIUM */}
        <Text style={{ color:"#ccc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumTudo", "Tudo do PRO liberado")}</Text>
        <Text style={{ color:"#ccc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumCarona", "Pode dar carona")}</Text>
        <Text style={{ color:"#ccc", fontSize:11, marginBottom:8 }}>✓ {tComFallback("beneficioPremiumEntrega", "Pode fazer entregas")}</Text>
        <Text style={{ color:"#ccc", fontSize:11, marginBottom:16 }}>✓ {tComFallback("beneficioPremiumOfertas", "Aceita ofertas e ganha dinheiro")}</Text>

        <TouchableOpacity
          style={{
            backgroundColor:"#ffaa00",
            padding:12,
            borderRadius:8,
            alignItems:"center"
          }}
          onPress={async ()=>{
            Keyboard.dismiss();
            const assinaturaPremium = await ativarPlano({
              plano: "premium",
              regiao: regiaoDoDispositivo(),
              origem: "teste",
            });

            setAssinatura(assinaturaPremium);
            setPlanoAtual("premium");
            setModoPro(true);
            setAssinaturaAtiva(true);
            setNivelAtual(4);
            setTelaProVisivel(false);
            falar("Modo premium ativado");
          }}
        >
          <Text style={{
            color:"#000",
            fontWeight:"bold",
            fontSize:14
          }}>
            {tComFallback("assinarPremium", "ASSINAR PREMIUM")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
})()}

{/* Info preço travado */}
<Text style={{
  color:"#666",
  fontSize:11,
  textAlign:"center",
  marginTop:20,
  fontStyle:"italic"
}}>
{tComFallback("precoTravadoPromessa", "Você mantém este valor enquanto sua assinatura permanecer ativa")}
</Text>

</ScrollView>
</View>
)}
{/* �xa� MENU REPORT WAZE STYLE */}
{renderMenuReportTrajeto(132, "normal")}

<BottomSheet
  ref={sheetRef}
index={-1}
  snapPoints={snapPoints}
  enablePanDownToClose={false}
  backgroundStyle={{ backgroundColor:"#fff" }}
  handleIndicatorStyle={{ backgroundColor:"#999" }}
  keyboardBehavior="interactive"
keyboardBlurBehavior="restore"
>

<BottomSheetScrollView contentContainerStyle={{ padding:20 }}>

{rotaPronta && !navegando && (
<View>

<Text style={{
 fontSize:20,
 fontWeight:"bold",
 textAlign:"center",
 marginBottom:18
}}>
Escolha como quer se arrepender
</Text>

<View style={{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center",
 marginBottom:15
}}>

<Text style={{
 color:"#000",
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
  onPress={()=>{
  if(!Array.isArray(routeCoordsFull) || routeCoordsFull.length < 2){
    Alert.alert(tComFallback("erro", "Erro"), tComFallback("rotaNaoPronta", "A rota ainda não está pronta."));
    return;
  }

  setRouteCoords(routeCoordsFull);
  setRotaCoords(routeCoordsFull);

  if(Array.isArray(altRouteCoordsFull) && altRouteCoordsFull.length > 1){
    setAltRouteCoords(altRouteCoordsFull);
  }else{
    setAltRouteCoords([]);
  }

  setRotaPronta(false);
  resetarControleChegadaDestino();
  setNavegando(true);
  mostrarBarraNivelTemporariamente();

  const primeiroPontoUtil = routeCoordsFull[Math.min(8, routeCoordsFull.length - 1)] || routeCoordsFull[0];

  if(primeiroPontoUtil && mapRef.current){
    mapRef.current.animateCamera(
      {
        center:{
          latitude:Number(primeiroPontoUtil.latitude),
          longitude:Number(primeiroPontoUtil.longitude)
        },
        heading:Number(carroPos?.heading || 0),
        pitch:64,
        zoom:19.1
      },
      { duration: 500 }
    );
  }
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

{opcoesTransporte.map((item,i)=>(

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

<MaterialCommunityIcons
  name={item.iconName as any}
  size={26}
  color="#111"
  style={{marginRight:14}}
/>

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
⏱ {item.tempo} min
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

{/* ===== BOTÒO MENU HAMB�aRGUER (CANTO SUPERIOR DIREITO) ===== */}
{!menuAberto && (
  <TouchableOpacity
    onPress={() => setMenuAberto(true)}
    style={{
      position: "absolute",
      top: 50,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <MaterialCommunityIcons name="menu" size={24} color="#fff" />
  </TouchableOpacity>
)}
{!usuarioAutenticado && !menuAberto && (
  <TouchableOpacity
    onPress={() => {
      setAuthModoCadastro(true);
      abrirTelaLogin("Crie sua conta para usar caronas, entregas, chat e reservas.");
    }}
    style={{
      position: "absolute",
      top: 96,
      right: 20,
      backgroundColor: "rgba(22,163,74,0.94)",
      borderWidth: 1,
      borderColor: "#86efac",
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: 10,
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Text style={{ color: "#f0fdf4", fontWeight: "800", fontSize: 12 }}>Entrar / Criar</Text>
  </TouchableOpacity>
)}
<SettingsPanel
  visivel={menuAberto}
  fechar={() => setMenuAberto(false)}
  idiomaAtual={idiomaAtual}
  trocarIdioma={trocarIdiomaManual}
  modoComico={modoComico}
  setModoComico={setModoComico}
  modoPro={usuarioEhPro()}
  planoAtual={planoAtual}
  abrirTelaPro={abrirTelaProSeNecessario}
  somPolicia={somPolicia}
  setSomPolicia={setSomPolicia}
  somRadar={somRadar}
  setSomRadar={setSomRadar}
  usuarioId={usuarioId}
  textos={textos}
  veiculoGpsId={veiculoGpsId}
  trocarVeiculoGps={trocarVeiculoGps}
  raioNotificacaoKm={raioNotificacaoKm}
  trocarRaioNotificacao={trocarRaioNotificacao}
  mostrarBotaoPremiumTopo={true}
  textoBotaoPremiumTopo={
    planoAtual === "free" || planoAtual === "premium_free"
      ? "ATIVAR PRO"
      : planoAtual === "pro"
        ? "ATIVAR PREMIUM"
        : "ATIVAR FREE"
  }
  onPressBotaoPremiumTopo={async ()=>{
    Keyboard.dismiss();
    if(planoAtual === "free" || planoAtual === "premium_free"){
      const assinaturaPro = await ativarPlano({
        plano: "pro",
        regiao: regiaoDoDispositivo(),
        origem: "teste",
      });

      setAssinatura(assinaturaPro);
      setPlanoAtual("pro");
      setModoPro(true); // compat legado
      setAssinaturaAtiva(true); // compat legado
      falar("Modo pro ativado");
      return;
    }

    if(planoAtual === "pro"){
      const assinaturaPremium = await ativarPlano({
        plano: "premium",
        regiao: regiaoDoDispositivo(),
        origem: "teste",
      });

      setAssinatura(assinaturaPremium);
      setPlanoAtual("premium");
      // compat legado
      setModoPro(true);
      // sobe automaticamente pro máximo
      setNivelAtual(4);
      console.log("🔥 PRO ATIVO - nível máximo liberado");
      setAssinaturaAtiva(true); // compat legado
      falar("Modo premium ativado");
      return;
    }

    const assinaturaFree: AssinaturaUsuario = {
      plano: "free",
      ativo: false,
      dataInicio: null,
    };

    await salvarAssinaturaLocal(assinaturaFree);
    setAssinatura(assinaturaFree);
    setPlanoAtual("free");
    setModoPro(false); // compat legado
    setAssinaturaAtiva(false); // compat legado
    falar("Modo free ativado");
  }}
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
<MaterialCommunityIcons name="microphone" size={40} color="#fff" />
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
Descrever ocorrencia
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

 console.log("�xa� ALERTA SALVO:", alertaFinal);

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

{/* ================= MODAL DESIST�`NCIA ================= */}
{modalDesistenciaVisivel && (
<View style={{
 position:"absolute",
 top:0,
 left:0,
 right:0,
 bottom:0,
 backgroundColor:"rgba(0,0,0,0.92)",
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
 marginBottom:12,
 textAlign:"center"
}}>
Desistir da viagem/entrega
</Text>

<Text style={{
 color:"#cbd5e1",
 fontSize:13,
 marginBottom:10,
 textAlign:"center"
}}>
{desistenciaObrigatoria
  ? "Desistência com 2 horas ou menos para início. Informe o motivo (obrigatório)."
  : "Se quiser, informe o motivo da desistência."}
</Text>

<TextInput
 placeholder="Motivo da desistência"
 placeholderTextColor="#888"
 multiline
 value={motivoDesistencia}
 onChangeText={setMotivoDesistencia}
 style={{
  backgroundColor:"#1c1c1c",
  color:"#fff",
  padding:14,
  borderRadius:12,
  minHeight:100,
  textAlignVertical:"top"
 }}
/>

<TouchableOpacity
onPress={async()=>{
  if(!ofertaDesistenciaPendente) return;

  if(desistenciaObrigatoria && !motivoDesistencia.trim()){
    Alert.alert(tComFallback("motivoObrigatorio", "Motivo obrigatório"), tComFallback("informeMotivoDesistencia", "Informe o motivo da desistência."));
    return;
  }

  await efetivarDesistenciaOferta(ofertaDesistenciaPendente, motivoDesistencia);
  setModalDesistenciaVisivel(false);
  setOfertaDesistenciaPendente(null);
  setMotivoDesistencia("");
}}
style={{
 backgroundColor:"#dc2626",
 padding:14,
 borderRadius:12,
 marginTop:12
}}
>
<Text style={{color:"#fff",fontWeight:"bold",textAlign:"center"}}>
Confirmar desistência
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>{
  setModalDesistenciaVisivel(false);
  setOfertaDesistenciaPendente(null);
  setMotivoDesistencia("");
}}
style={{marginTop:10}}
>
<Text style={{color:"#aaa",textAlign:"center"}}>
Cancelar
</Text>
</TouchableOpacity>

</View>
</View>
)}

{authModalVisivel && (
  <View style={{
    position:"absolute",
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor:"rgba(0,0,0,0.9)",
    justifyContent:"center",
    alignItems:"center",
    zIndex:13000,
    paddingHorizontal:16
  }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ width:"100%", flex:1, justifyContent:"center", alignItems:"center" }}
    >
    <View style={{
      width:"100%",
      maxWidth:420,
      maxHeight:"88%",
      backgroundColor:"#0f172a",
      borderRadius:18,
      borderWidth:1,
      borderColor:"#334155",
      padding:16
    }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
      <Text style={{ color:"#fff", fontSize:20, fontWeight:"800", marginBottom:8, textAlign:"center" }}>
        {authModoCadastro ? "Criar conta" : "Entrar"}
      </Text>

      {!!authMotivoBloqueio && (
        <Text style={{ color:"#cbd5e1", fontSize:13, textAlign:"center", marginBottom:12 }}>
          {authMotivoBloqueio}
        </Text>
      )}

      {authCarregando ? (
        <Text style={{ color:"#93c5fd", textAlign:"center", marginBottom:10 }}>
          Verificando sessao...
        </Text>
      ) : (
        <>
          {authModoCadastro && (
            <TextInput
              value={authNome}
              onChangeText={setAuthNome}
              placeholder="Nome"
              placeholderTextColor="#94a3b8"
              style={{
                backgroundColor:"#111827",
                color:"#fff",
                borderRadius:10,
                borderWidth:1,
                borderColor:"#334155",
                paddingHorizontal:12,
                paddingVertical:10,
                marginBottom:10
              }}
            />
          )}

          <TextInput
            value={authEmail}
            onChangeText={setAuthEmail}
            placeholder="E-mail"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor:"#111827",
              color:"#fff",
              borderRadius:10,
              borderWidth:1,
              borderColor:"#334155",
              paddingHorizontal:12,
              paddingVertical:10,
              marginBottom:10
            }}
          />

          {authModoCadastro && (
            <TextInput
              value={authEmailConfirmacao}
              onChangeText={setAuthEmailConfirmacao}
              placeholder="Confirmar e-mail"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor:"#111827",
                color:"#fff",
                borderRadius:10,
                borderWidth:1,
                borderColor:"#334155",
                paddingHorizontal:12,
                paddingVertical:10,
                marginBottom:10
              }}
            />
          )}

          <View
            style={{
              backgroundColor:"#111827",
              borderRadius:10,
              borderWidth:1,
              borderColor:"#334155",
              paddingHorizontal:10,
              paddingVertical:2,
              marginBottom:10
            }}
          >
            <View style={{ flexDirection:"row", alignItems:"center" }}>
              <TextInput
                value={authSenha}
                onChangeText={setAuthSenha}
                placeholder="Senha"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!authSenhaVisivel}
                style={{
                  flex:1,
                  color:"#fff",
                  paddingHorizontal:2,
                  paddingVertical:8
                }}
              />
              <TouchableOpacity
                onPress={()=>setAuthSenhaVisivel((prev)=>!prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ paddingHorizontal:4, paddingVertical:6 }}
              >
                <MaterialCommunityIcons name={authSenhaVisivel ? "eye-off" : "eye"} size={19} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>

          {authModoCadastro && (
            <View
              style={{
                backgroundColor:"#111827",
                borderRadius:10,
                borderWidth:1,
                borderColor:"#334155",
                paddingHorizontal:10,
                paddingVertical:2,
                marginBottom:10
              }}
            >
              <View style={{ flexDirection:"row", alignItems:"center" }}>
                <TextInput
                  value={authSenhaConfirmacao}
                  onChangeText={setAuthSenhaConfirmacao}
                  placeholder="Confirmar senha"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!authSenhaConfirmacaoVisivel}
                  style={{
                    flex:1,
                    color:"#fff",
                    paddingHorizontal:2,
                    paddingVertical:8
                  }}
                />
                <TouchableOpacity
                  onPress={()=>setAuthSenhaConfirmacaoVisivel((prev)=>!prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ paddingHorizontal:4, paddingVertical:6 }}
                >
                  <MaterialCommunityIcons name={authSenhaConfirmacaoVisivel ? "eye-off" : "eye"} size={19} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!authErro && (
            <Text style={{ color:"#fda4af", marginBottom:10, textAlign:"center" }}>{authErro}</Text>
          )}

          <TouchableOpacity
            onPress={authModoCadastro ? cadastrarComEmailSenha : entrarComEmailSenha}
            disabled={authProcessando}
            style={{
              backgroundColor:"#22c55e",
              borderRadius:10,
              paddingVertical:12,
              alignItems:"center",
              marginBottom:8,
              opacity: authProcessando ? 0.7 : 1
            }}
          >
            <Text style={{ color:"#022c22", fontWeight:"800" }}>
              {authProcessando ? "Aguarde..." : (authModoCadastro ? "CRIAR CONTA" : "ENTRAR")}
            </Text>
          </TouchableOpacity>

          {googleLoginDisponivel && (
            <TouchableOpacity
              onPress={entrarComGoogle}
              style={{
                backgroundColor:"#fff",
                borderRadius:10,
                paddingVertical:11,
                alignItems:"center",
                marginBottom:8
              }}
            >
              <Text style={{ color:"#111", fontWeight:"700" }}>ENTRAR COM GOOGLE</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={()=>{
              setAuthModoCadastro((prev)=>!prev);
              setAuthErro("");
              setAuthSenhaVisivel(false);
              setAuthSenhaConfirmacaoVisivel(false);
            }}
            style={{ marginBottom:8 }}
          >
            <Text style={{ color:"#7dd3fc", textAlign:"center", fontWeight:"600" }}>
              {authModoCadastro ? "Ja tenho conta" : "Criar conta nova"}
            </Text>
          </TouchableOpacity>

          {usuarioAutenticado && (
            <TouchableOpacity onPress={sairContaAuth} style={{ marginBottom:8 }}>
              <Text style={{ color:"#fca5a5", textAlign:"center", fontWeight:"600" }}>Sair da conta atual</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={()=>setAuthModalVisivel(false)}>
            <Text style={{ color:"#94a3b8", textAlign:"center" }}>Fechar</Text>
          </TouchableOpacity>
        </>
      )}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  </View>
)}

{denunciaOfertaAtual && (
  <View style={{
    position:"absolute",
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor:"rgba(0,0,0,0.78)",
    zIndex:12000,
    justifyContent:"center",
    paddingHorizontal:16,
    paddingTop:(insets.top || 0) + 12,
    paddingBottom:(insets.bottom || 0) + 12
  }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex:1, justifyContent:"center" }}
    >
      <View style={{
        maxHeight:"92%",
        backgroundColor:"#0b0b0c",
        borderRadius:22,
        borderWidth:1,
        borderColor:"#20242b",
        overflow:"hidden"
      }}>
        <View style={{
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"space-between",
          paddingHorizontal:18,
          paddingTop:16,
          paddingBottom:12,
          borderBottomWidth:1,
          borderBottomColor:"#1f2937"
        }}>
          <View style={{ flex:1, paddingRight:12 }}>
            <Text style={{ color:"#fff", fontSize:18, fontWeight:"800", marginBottom:4 }}>
              {tComFallback("denunciaOfertaTitulo", "Denunciar usuário")}
            </Text>
            <Text style={{ color:"#94a3b8", fontSize:12, lineHeight:18 }}>
              {tComFallback("denunciaOfertaDescricao", "Descreva o que aconteceu nessa entrega ou carona e, se precisar, anexe imagens para comprovar a ocorrência.")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={()=>setDenunciaOfertaAtual(null)}
            style={{
              width:34,
              height:34,
              borderRadius:17,
              backgroundColor:"#111827",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            <MaterialCommunityIcons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal:18, paddingBottom:18 }}
        >
          <FaleConoscoSection
            usuarioId={usuarioId}
            textos={textos}
            initialTipo="denuncia"
            onlyTipo="denuncia"
            initialAlvoId={denunciaOfertaAtual.alvoId}
            lockAlvoId
            ocultarIntroducao
            feedbackOrigem="oferta_vinculada"
            feedbackContexto={{
              ofertaId: denunciaOfertaAtual.ofertaId,
              ofertaTipo: denunciaOfertaAtual.ofertaTipo,
            }}
            onSubmitted={()=>setDenunciaOfertaAtual(null)}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </View>
)}

{/* TELAS DAS ABAS */}
{usuarioAutenticado && abaAtiva === 'procurar' && (
  <View style={{
    flex: 1,
    backgroundColor: '#000'
  }}>
   <ProcurarScreen
ofertas={ofertasVisiveisUsuario}
usuarioId={usuarioId}
isPro={usuarioEhPremiumAtual()}
setOfertaSelecionada={setOfertaSelecionada}
setChatOferta={setChatOferta}
setChatVisivel={setChatVisivel}
buscarRotaORS={buscarRotaORS}
setRotaVisivel={setRotaVisivel}
setRotaSelecionada={setRotaSelecionada}
editarOferta={editarOferta}
excluirOferta={excluirOferta}
onRequestPro={abrirTelaProSeNecessario}
/>
  </View>
)}
{usuarioAutenticado && abaAtiva === 'oferecer' && (
  <View style={{
    flex: 1,
    backgroundColor: '#000'
  }}>
    {menuOfertasVisivel && (
    <OfertasScreen
    menuOfertasVisivel={menuOfertasVisivel}
      setOfertaSelecionada={setOfertaSelecionada}
      setMenuOfertasVisivel={() => setAbaAtiva(null)}
      setAbaOfertas={setAbaOfertas}
      abaOfertas={abaOfertas}
      ofertas={ofertasVisiveisUsuario}
      buscarCoordenadas={buscarCoordenadas}
      criarOfertaNova={criarOfertaNova}
      atualizarOfertaExistente={atualizarOfertaExistente}
      ofertaEditandoId={ofertaEditandoId}
      usuarioId={usuarioId}
      isPro={usuarioEhPremiumAtual()}
      lidas={new Set<string>()}
      naoLidasTotal={naoLidasTotal}
      setOfertas={setOfertas}
      setOfertaEditandoId={setOfertaEditandoId}
      conversas={conversas}
      buscarRotaORS={buscarRotaORS}
      setChatOferta={setChatOferta}
      setChatVisivel={setChatVisivel}
      setRotaVisivel={setRotaVisivel}
      setRotaSelecionada={setRotaSelecionada}
      editarOferta={editarOferta}
      excluirOferta={excluirOferta}
      onRequestPro={abrirTelaProSeNecessario}
      textos={textos}
    />
)}
  </View>
)}
{usuarioAutenticado && abaAtiva === 'viagens' && (
  <View style={{
    flex: 1,
    backgroundColor: '#000'
  }}>
    <ViagensScreen
      ofertas={ofertasVisiveisUsuario}
      usuarioId={usuarioId}
      textos={textos}
    />
  </View>
)}
{usuarioAutenticado && abaAtiva === 'mensagens' && (
  <View style={{
    flex: 1,
    backgroundColor: '#000'
  }}>
    <MensagensScreen
      usuarioId={usuarioId}
      ofertas={ofertasVisiveisUsuario}
      conversas={conversas as any[]}
      textos={textos}
      setChatOferta={setChatOferta}
      setChatVisivel={setChatVisivel}
      openChat={openChat}
      excluirConversa={excluirConversa}
    />
  </View>
)}
{usuarioAutenticado && abaAtiva === 'perfil' && (
  <View style={{
    flex: 1,
    backgroundColor: '#000'
  }}>
    <PerfilPainel
      usuarioId={usuarioPerfilAbertoId || usuarioId}
      currentUserId={usuarioId}
      somenteLeitura={!!usuarioPerfilAbertoId && String(usuarioPerfilAbertoId) !== String(usuarioId)}
    />
  </View>
)}



</KeyboardAvoidingView>
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
  width:"40%",        // �x� menor
  alignSelf:"flex-end" // �x� direita
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
menuBotao: {
  backgroundColor:"#16a34a",
  padding:12,
  borderRadius:8,
  marginBottom:10,
  alignItems:"center"
},

menuTexto: {
  color:"#fff",
  fontWeight:"bold"
},

inputStyle: {
  backgroundColor:"#222",
  color:"#fff",
  padding:12,
  borderRadius:8,
  marginBottom:10
},
});
