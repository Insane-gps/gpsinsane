import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BlurView } from "expo-blur"
import * as Localization from "expo-localization"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Alert, ImageBackground, ImageSourcePropType, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import MensagensScreen from "./MensagensScreen"
import PerfilScreen from "./PerfilPainel"
import ProcurarScreen from "./ProcurarScreen"
import ViagensScreen from "./ViagensScreen"
type Props = {
  setMenuOfertasVisivel:(v:boolean)=>void
  menuOfertasVisivel:boolean
  setAbaOfertas:(v:string)=>void
  abaOfertas:string
  ofertas:any[]
  setOfertaSelecionada:(v:any)=>void
  buscarCoordenadas:(endereco:string)=>Promise<any>
  criarOfertaNova:(oferta:any)=>void
  atualizarOfertaExistente?:(ofertaId:string, oferta:any)=>Promise<void>
  ofertaEditandoId:any
  usuarioId:string
  isPro:boolean
  carroPos?:any
  setOfertas:any
  setOfertaEditandoId:(v:any)=>void
  buscarRotaORS:any
  openChat?:(oferta:any)=>void
  openRoute?:(oferta:any)=>void
  conversas:any[]
  lidas:Set<string>
  naoLidasTotal:number
  setChatOferta?:(v:any)=>void
  setChatVisivel?:(v:boolean)=>void
  setRotaVisivel?:(v:boolean)=>void
  setRotaSelecionada?:(v:any)=>void
  solicitarAceite?:(oferta:any)=>void
  desistirSolicitacao?:(oferta:any)=>void
  excluirConversa?:(oferta:any)=>void
  reservarVaga?:(oferta:any,quantidade:number,embarcaIdx:number,embarcaLabel:string,desembarcaIdx:number,desembarcaLabel:string)=>void
  cancelarMinhaReserva?:(oferta:any,reservaId:string)=>void
  responderReserva?:(oferta:any,reservaId:string,novoStatus:'confirmada'|'cancelada')=>void
  iniciarViagem?:(oferta:any)=>void
  confirmarFinalizacaoViagem?:(oferta:any)=>void
  desistirOferta?:(oferta:any)=>void
  editarOferta?:(oferta:any)=>void
  excluirOferta?:(oferta:any)=>void
  openProfile?:(usuarioPerfilId:any, ofertaParaAceite?:any)=>void
  perfilVisualizadoId?:string | null
  onRequestPro?:()=>void
  textos?: any
}
export default function OfertasScreen({
  setOfertaSelecionada,
  setMenuOfertasVisivel,
  menuOfertasVisivel,
  setAbaOfertas,
  abaOfertas,
  ofertas,
  buscarCoordenadas,
  criarOfertaNova,
  atualizarOfertaExistente = async () => {},
  ofertaEditandoId,
  usuarioId,
  isPro,
  carroPos,
  setOfertas,
  setOfertaEditandoId,
  buscarRotaORS,
  openChat = () => {},
  openRoute = () => {},
  conversas,
  lidas,
  setChatOferta = () => {},
  setChatVisivel = () => {},
  setRotaVisivel = () => {},
  setRotaSelecionada = () => {},
  solicitarAceite = () => {},
  desistirSolicitacao = () => {},
  excluirConversa = () => {},
  reservarVaga = () => {},
  cancelarMinhaReserva = () => {},
  responderReserva = () => {},
  iniciarViagem = () => {},
  confirmarFinalizacaoViagem = () => {},
  desistirOferta = () => {},
  editarOferta = () => {},
  excluirOferta = () => {},
  openProfile = () => {},
  perfilVisualizadoId = null,
  onRequestPro = () => {},
  textos
}:Props){

const tt = (chave:string, fallback:string)=> String(textos?.[chave] || fallback);
const ttComRegiao = (chave:string, fallback:string)=>{
  const localeAtual = Localization.getLocales()?.[0];
  const regionCode = String(localeAtual?.regionCode || "").trim().toUpperCase();
  const languageTag = String(localeAtual?.languageTag || "").trim();
  const match = languageTag.match(/-([A-Za-z]{2}|\d{3})$/);
  const regiao = regionCode || (match?.[1] ? String(match[1]).toUpperCase() : "GLOBAL");
  return tt(chave, fallback).replace(/\{\{regiao\}\}/g, String(regiao).toUpperCase());
}

const avisoLegalOfertaTexto = ttComRegiao(
  "avisoLegalOferta",
  "Aviso legal: esta plataforma fornece apenas um ambiente digital para conexão entre usuários, não atuando como prestadora direta de serviços, empregadora, transportadora ou intermediadora financeira. A plataforma não realiza, processa, garante ou se responsabiliza por quaisquer pagamentos entre usuários. Todas as transações, acordos e interações são de responsabilidade exclusiva dos usuários, que devem cumprir integralmente as leis, regulamentos e normas aplicáveis na região {{regiao}}. A plataforma não se responsabiliza por quaisquer danos, perdas, condutas ilegais, fraudes ou disputas decorrentes do uso do serviço."
)

  const insets = useSafeAreaInsets();
const [tipoSelecionado,setTipoSelecionado]=React.useState<"carona_solicitada"|"carona_oferecida"|"entrega">("carona_solicitada")
const [nomePassageiro,setNomePassageiro]=React.useState("")
const [descricaoObjeto,setDescricaoObjeto]=React.useState("")
const [quantidadePessoas,setQuantidadePessoas]=React.useState(1)

// NÃO abrir chat automaticamente - deixar usuário clicar
// React.useEffect(() => {
//   if (abaOfertas !== "mensagens") return;
//   if (!conversas || conversas.length === 0) return;
//   const unread = conversas.find(c => {
//     const id = c.oferta?.id;
//     if (!id) return false;
//     return c.lastMessage?.autor !== usuarioId && !lidas.has(id);
//   });
//   if (unread) {
//     openChat(unread.oferta);
//   }
// }, [abaOfertas, conversas, usuarioId, lidas, openChat]);

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
const [paradaTexto,setParadaTexto] = useState("")
const [paradasSelecionadas,setParadasSelecionadas] = useState<string[]>([])
const [dataSaida,setDataSaida] = useState("")
const [horarioSaida,setHorarioSaida] = useState("")
const [observacaoOpcional,setObservacaoOpcional] = useState("")
const [perfilNome,setPerfilNome] = useState("")
const [perfilVeiculos,setPerfilVeiculos] = useState<Array<{marca?:string,modelo?:string,placa?:string,tipo?:string}>>([])
const [veiculoPerfilSelecionado,setVeiculoPerfilSelecionado] = useState(0)
const [valorOferta,setValorOferta]=React.useState("")
const [mensagemSucesso, setMensagemSucesso] = useState("")
const [criandoOferta, setCriandoOferta] = useState(false)
const ofertaEditadaRef = useRef<string | null>(null)
const tipoRequerPro = true

const MAX_OBSERVACAO_CHARS = 280

function maskDateInput(value:string){
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if(digits.length <= 2) return digits;
  if(digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTimeInput(value:string){
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if(digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidDateBr(value:string){
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if(!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return false;
  if(year < 2024 || year > 2100) return false;
  if(month < 1 || month > 12) return false;
  if(day < 1 || day > 31) return false;

  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === (month - 1) &&
    candidate.getDate() === day
  );
}

function isValidTime24(value:string){
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})$/);
  if(!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if(!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isPastDateBr(value:string){
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const selected = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return selected.getTime() < todayStart.getTime();
}

function isTodayDateBr(value:string){
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const today = new Date();
  return (
    day === today.getDate() &&
    month === (today.getMonth() + 1) &&
    year === today.getFullYear()
  );
}

function isPastTimeToday(value:string){
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})$/);
  if(!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  const now = new Date();
  const nowTotal = now.getHours() * 60 + now.getMinutes();
  const selectedTotal = hours * 60 + minutes;

  return selectedTotal < nowTotal;
}

function labelDataHorario(tipo:string){
  if(tipo === "entrega"){
    return {
      data: tt("dataEntrega", "Data da entrega"),
      hora: tt("horarioEntregaEstimado", "Horário da entrega (estimado)")
    }
  }

  if(tipo === "carona_solicitada"){
    return {
      data: tt("dataCarona", "Data da carona"),
      hora: tt("horarioDesejado", "Horário desejado")
    }
  }

  return {
    data: tt("dataSaida", "Data de saída"),
    hora: tt("horarioSaidaEstimado", "Horário de saída (estimado)")
  }
}

useEffect(()=>{
  if(!ofertaEditandoId){
    ofertaEditadaRef.current = null;
    return;
  }

  const idAtual = String(ofertaEditandoId);
  if(ofertaEditadaRef.current === idAtual) return;

  const oferta = ofertas.find((item:any) => String(item?.id) === idAtual);
  if(!oferta) return;

  setTipoSelecionado(oferta?.tipo || "carona_solicitada");
  setNomePassageiro(String(oferta?.nomeOuDescricao || ""));
  setDescricaoObjeto(String(oferta?.nomeOuDescricao || ""));
  setQuantidadePessoas(Number(oferta?.quantidadePessoas || 1));
  setValorOferta(String(oferta?.valor ?? ""));

  const enderecoOrigemDesm = desmontarEndereco(oferta?.origem?.endereco || "");
  setRuaOrigem(enderecoOrigemDesm.rua);
  setNumeroOrigem(enderecoOrigemDesm.numero);
  setBairroOrigem(enderecoOrigemDesm.bairro);
  setCidadeOrigem(enderecoOrigemDesm.cidade);
  setEstadoOrigem(enderecoOrigemDesm.estado);

  const enderecoDestinoDesm = desmontarEndereco(oferta?.destino?.endereco || "");
  setRuaDestino(enderecoDestinoDesm.rua);
  setNumeroDestino(enderecoDestinoDesm.numero);
  setBairroDestino(enderecoDestinoDesm.bairro);
  setCidadeDestino(enderecoDestinoDesm.cidade);
  setEstadoDestino(enderecoDestinoDesm.estado);

  setParadasSelecionadas(
    Array.isArray(oferta?.paradas)
      ? oferta.paradas.map((parada:any)=>String(parada?.endereco || "")).filter(Boolean)
      : []
  );
  setParadaTexto("");
  setDataSaida(maskDateInput(String(oferta?.dataSaida || "")));
  setHorarioSaida(maskTimeInput(String(oferta?.horarioSaida || "")));
  setObservacaoOpcional(String(oferta?.observacao || "").slice(0, MAX_OBSERVACAO_CHARS));

  ofertaEditadaRef.current = idAtual;
}, [ofertaEditandoId, ofertas]);

function textoMotoristaVeiculo(nome:string, veiculo?:{marca?:string,modelo?:string,placa?:string}){
  const nomeLimpo = String(nome || "").trim();
  const modelo = String(veiculo?.modelo || "").trim();
  const placa = String(veiculo?.placa || "").trim().toUpperCase();

  if(nomeLimpo && modelo && placa) return `${nomeLimpo} - ${modelo} (${placa})`;
  if(nomeLimpo && modelo) return `${nomeLimpo} - ${modelo}`;
  if(nomeLimpo && placa) return `${nomeLimpo} - ${placa}`;
  if(nomeLimpo) return nomeLimpo;
  if(modelo && placa) return `${modelo} (${placa})`;
  if(modelo) return modelo;
  return placa;
}

useEffect(()=>{
  let ativo = true;

  async function carregarPerfilUsuario(){
    try{
      const salvo = await AsyncStorage.getItem(`perfil_${usuarioId}`);
      const perfil = salvo ? JSON.parse(salvo) : null;
      if(!ativo) return;

      const nome = String(perfil?.nome || "").trim();
      const veiculos = Array.isArray(perfil?.veiculos) ? perfil.veiculos : [];
      setPerfilNome(nome);
      setPerfilVeiculos(veiculos);
      setVeiculoPerfilSelecionado(0);
    }catch(e){
      if(!ativo) return;
      setPerfilNome("");
      setPerfilVeiculos([]);
      setVeiculoPerfilSelecionado(0);
      console.log("Erro ao carregar perfil no formulário de oferta:", e);
    }
  }

  carregarPerfilUsuario();

  return ()=>{
    ativo = false;
  }
}, [usuarioId]);

useEffect(()=>{
  if(ofertaEditandoId) return;

  if(tipoSelecionado === "carona_solicitada"){
    if(perfilNome){
      setNomePassageiro((prev)=>String(prev || "").trim() ? prev : perfilNome);
    }
    return;
  }

  if(tipoSelecionado === "carona_oferecida"){
    const veiculo = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0];
    const sugestao = textoMotoristaVeiculo(perfilNome, veiculo);
    if(sugestao){
      setNomePassageiro((prev)=>String(prev || "").trim() ? prev : sugestao);
    }
  }
}, [tipoSelecionado, perfilNome, perfilVeiculos, veiculoPerfilSelecionado, ofertaEditandoId]);

useEffect(()=>{
  if(!mensagemSucesso) return;
  const timer = setTimeout(()=>setMensagemSucesso(""), 2600);
  return ()=>clearTimeout(timer);
}, [mensagemSucesso]);

function montarEndereco(partes:string[]){
  return partes.map((parte)=>String(parte || "").trim()).filter(Boolean).join(", ")
}

function desmontarEndereco(enderecoCompleto:string){
  const partes = String(enderecoCompleto || "").split(",").map(p => p.trim()).filter(Boolean);
  return {
    rua: partes[0] || "",
    numero: partes[1] || "",
    bairro: partes[2] || "",
    cidade: partes[3] || "",
    estado: partes[4] || ""
  };
}

const FUNDO_PADRAO_URI = require("../../assets/images/fundos/prédios.jpeg")
const FUNDO_ENTREGA_URI = require("../../assets/images/fundos/entrega.jpeg")
const FUNDO_CARONA_URI = require("../../assets/images/fundos/carona.jpeg")
const FUNDO_MENSAGENS_URI = require("../../assets/images/fundos/minhasviagens.jpeg")
const FUNDO_PROCURAR_URI = require("../../assets/images/fundos/procurar.jpeg")
const FUNDO_PERFIL_URI = require("../../assets/images/fundos/perfil.jpeg")
const FUNDO_PREDIOS_URI = require("../../assets/images/fundos/prédios.jpeg")

const FUNDO_FUTURISTA_URI: ImageSourcePropType = useMemo(() => {
  if (abaOfertas === "procurar") return FUNDO_PROCURAR_URI || FUNDO_PADRAO_URI;
  if (abaOfertas === "mensagens") return FUNDO_PREDIOS_URI || FUNDO_PADRAO_URI;
  if (abaOfertas === "perfil") return FUNDO_PREDIOS_URI || FUNDO_PADRAO_URI;
  if (abaOfertas === "viagens") return FUNDO_MENSAGENS_URI || FUNDO_PADRAO_URI;
  if (abaOfertas === "oferecer") {
    return tipoSelecionado === "entrega"
      ? (FUNDO_ENTREGA_URI || FUNDO_PADRAO_URI)
      : (FUNDO_CARONA_URI || FUNDO_PADRAO_URI);
  }
  return FUNDO_PADRAO_URI;
}, [abaOfertas, tipoSelecionado]);

const intensidadeEscuro = useMemo(() => {
  if (abaOfertas === "perfil") return "rgba(0,0,0,0.56)";
  if (abaOfertas === "procurar") return "rgba(0,0,0,0.52)";
  if (abaOfertas === "mensagens") return "rgba(0,0,0,0.58)";
  if (abaOfertas === "oferecer") return "rgba(0,0,0,0.54)";
  return "rgba(0,0,0,0.6)";
}, [abaOfertas]);

const inputStyle={
backgroundColor:"rgba(5, 18, 30, 0.98)",
color:"#eefcff",
padding:15,
borderRadius:12,
marginBottom:15,
borderWidth:1,
borderColor:"#11d8ff",
shadowColor:"#10d7ff",
shadowOpacity:0.2,
shadowRadius:10,
elevation:4
}

const ofertaEditandoAtual = ofertaEditandoId
  ? ofertas.find((item:any) => String(item?.id) === String(ofertaEditandoId)) || null
  : null

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

function fecharEditorOferta(){
  setOfertaEditandoId(null)
  setMenuOfertasVisivel(false)
}

async function excluirOfertaEmEdicao(){
  if(!ofertaEditandoId) return

  if(ofertaComSolicitacaoOuReservaAtiva(ofertaEditandoAtual)){
    Alert.alert(
        tt("ofertaBloqueada", "Oferta bloqueada"),
        tt("ofertaBloqueadaExclusao", "Esta oferta já possui solicitação ou reserva ativa e não pode ser excluída.")
    );
    return;
  }

  if(ofertaEditandoAtual && excluirOferta){
    excluirOferta(ofertaEditandoAtual)
    return
  }

  setOfertas((prev:any[]) =>
    prev.filter((o:any) => String(o?.id) !== String(ofertaEditandoId))
  )
  fecharEditorOferta()
}

async function salvarOfertaFormulario(){
  if(criandoOferta) return;
  setCriandoOferta(true);
  try{
  const estavaEditando = !!ofertaEditandoId;

  if(estavaEditando && ofertaComSolicitacaoOuReservaAtiva(ofertaEditandoAtual)){
    Alert.alert(
        tt("ofertaBloqueada", "Oferta bloqueada"),
        tt("ofertaBloqueadaEdicao", "Esta oferta já possui solicitação ou reserva ativa e não pode mais ser editada.")
    );
    return;
  }

  const tipoRequerPro = true
  if(tipoRequerPro && !isPro){
    onRequestPro();
    return;
  }
  
  if(!ruaOrigem || !ruaDestino){
    console.log("Endereço não informado");
    return;
  }

  if(tipoSelecionado === "carona_oferecida" || tipoSelecionado === "carona_solicitada" || tipoSelecionado === "entrega"){
    if(dataSaida.length !== 10){
      Alert.alert(tt("dataObrigatoria", "Data obrigatória"), tt("informeDataSaidaFormato", "Informe a data de saída no formato DD/MM/AAAA."));
      return;
    }
    if(!isValidDateBr(dataSaida)){
      Alert.alert(tt("dataInvalida", "Invalid date"), tt("useDataRealFormato", "Use a real date in DD/MM/YYYY format."));
      return;
    }
    if(isPastDateBr(dataSaida)){
      Alert.alert(tt("dataInvalida", "Data inválida"), tt("dataSaidaNaoPodeSerAnterior", "A data de saída não pode ser anterior a hoje."));
      return;
    }
    if(horarioSaida.length !== 5){
      Alert.alert(tt("horarioObrigatorio", "Horário obrigatório"), tt("informeHorarioFormato", "Informe o horário de saída no formato HH:MM."));
      return;
    }
    if(!isValidTime24(horarioSaida)){
      Alert.alert(tt("horarioInvalido", "Horário inválido"), tt("useHorario24h", "Use um horário válido no formato 24h (HH:MM)."));
      return;
    }
    if(isTodayDateBr(dataSaida) && isPastTimeToday(horarioSaida)){
      Alert.alert(tt("horarioInvalido", "Horário inválido"), tt("horarioHojeNaoPodeSerAnterior", "Para hoje, o horário de saída não pode ser anterior ao horário atual."));
      return;
    }
  }

  const enderecoOrigemCompleto = montarEndereco([
    ruaOrigem,
    numeroOrigem,
    bairroOrigem,
    cidadeOrigem,
    estadoOrigem
  ]);

  const enderecoDestinoCompleto = montarEndereco([
    ruaDestino,
    numeroDestino,
    bairroDestino,
    cidadeDestino,
    estadoDestino
  ]);

  async function geocomFallback(
    completo: string,
    rua: string,
    numero: string,
    cidade: string,
    estado: string
  ) {
    let coord = await buscarCoordenadas(completo);
    if (coord) return coord;
    await new Promise(r => setTimeout(r, 1100));
    // tenta sem bairro
    coord = await buscarCoordenadas(montarEndereco([rua, numero, cidade, estado]));
    if (coord) return coord;
    await new Promise(r => setTimeout(r, 1100));
    // tenta só rua + cidade + estado
    coord = await buscarCoordenadas(montarEndereco([rua, cidade, estado]));
    return coord;
  }

  const origemCoord = await geocomFallback(enderecoOrigemCompleto, ruaOrigem, numeroOrigem, cidadeOrigem, estadoOrigem);
  await new Promise(r => setTimeout(r, 1100));
  const destinoCoord = await geocomFallback(enderecoDestinoCompleto, ruaDestino, numeroDestino, cidadeDestino, estadoDestino);

  const paradasConvertidas = [];

  if(tipoSelecionado === "carona_oferecida" && paradasSelecionadas.length > 0){
    for (const parada of paradasSelecionadas) {
      const paradaCoord = await buscarCoordenadas(parada);
      if(paradaCoord){
        paradasConvertidas.push({
          lat: paradaCoord.lat,
          lng: paradaCoord.lng,
          endereco: parada
        });
      }
    }
  }
  
  if(!origemCoord){
    Alert.alert(
      tt("enderecoNaoLocalizado", "Address not found"),
      tt("erroEnderecoOrigemNaoLocalizado", "Could not locate origin address. Review street, number, city and state.")
    );
    return;
  }
  
  if(!destinoCoord){
    Alert.alert(
      tt("enderecoNaoLocalizado", "Address not found"),
      tt("erroEnderecoDestinoNaoLocalizado", "Could not locate destination address. Review street, number, city and state.")
    );
    return;
  }

  const veiculoSelecionado = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0] || null;
  
  const novaOferta = {
    tipo: tipoSelecionado,
    nomeOuDescricao:
      tipoSelecionado === "entrega"
        ? descricaoObjeto
        : nomePassageiro,
    quantidadePessoas,
    valor: Number(valorOferta),
    origem:{
      lat: origemCoord.lat,
      lng: origemCoord.lng,
      endereco: enderecoOrigemCompleto
    },
    destino:{
      lat: destinoCoord.lat,
      lng: destinoCoord.lng,
      endereco: enderecoDestinoCompleto
    },
    paradas: paradasConvertidas,
    dataSaida: String(dataSaida || "").trim(),
    horarioSaida: String(horarioSaida || "").trim(),
    veiculoModelo: tipoSelecionado === "carona_oferecida" ? String(veiculoSelecionado?.modelo || "").trim() : "",
    veiculoPlaca: tipoSelecionado === "carona_oferecida" ? String(veiculoSelecionado?.placa || "").trim().toUpperCase() : "",
    observacao: String(observacaoOpcional || "").trim()
  };

  if(ofertaEditandoId){
    await atualizarOfertaExistente(String(ofertaEditandoId), novaOferta);
    setOfertaEditandoId(null);
  }else{
    await criarOfertaNova(novaOferta);
  }

  setNomePassageiro(
    tipoSelecionado === "carona_oferecida"
      ? textoMotoristaVeiculo(perfilNome, veiculoSelecionado || undefined)
      : tipoSelecionado === "carona_solicitada"
        ? perfilNome
        : ""
  )
  setDescricaoObjeto("")
  setQuantidadePessoas(1)
  setRuaOrigem("")
  setNumeroOrigem("")
  setBairroOrigem("")
  setCidadeOrigem("")
  setEstadoOrigem("")
  setRuaDestino("")
  setNumeroDestino("")
  setBairroDestino("")
  setCidadeDestino("")
  setEstadoDestino("")
  setParadaTexto("")
  setParadasSelecionadas([])
  setDataSaida("")
  setHorarioSaida("")
  setObservacaoOpcional("")
  setValorOferta("")

  setOfertaEditandoId(null)
  setAbaOfertas("procurar")
  setMensagemSucesso(estavaEditando ? tt("ofertaAtualizadaSucesso", "Oferta atualizada com sucesso") : tt("ofertaCriadaSucesso", "Oferta criada com sucesso"))
  }finally{
    setCriandoOferta(false);
  }
}

return (

<KeyboardAvoidingView
 style={{flex:1}}
 behavior={Platform.OS === "ios" ? "padding" : undefined}
>

<ImageBackground
  source={FUNDO_FUTURISTA_URI}
  style={{flex:1}}
  resizeMode="cover"
>
<View style={{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  bottom:0,
  backgroundColor:intensidadeEscuro
}}/>

<View style={{
  position:"absolute",
  top:80,
  left:-30,
  width:"130%",
  height:3,
  backgroundColor:"rgba(252,74,137,0.30)",
  transform:[{rotate:"12deg"}],
  shadowColor:"#fb7185",
  shadowOpacity:0.48,
  shadowRadius:12,
  elevation:4
}}/>

<View style={{
  position:"absolute",
  top:180,
  left:-20,
  width:"128%",
  height:3,
  backgroundColor:"rgba(56,189,248,0.28)",
  transform:[{rotate:"-8deg"}],
  shadowColor:"#22d3ee",
  shadowOpacity:0.5,
  shadowRadius:12,
  elevation:4
}}/>

<View style={{
  position:"absolute",
  top:290,
  left:-40,
  width:"140%",
  height:2,
  backgroundColor:"rgba(132,204,22,0.20)",
  transform:[{rotate:"6deg"}],
  shadowColor:"#84cc16",
  shadowOpacity:0.44,
  shadowRadius:10,
  elevation:4
}}/>

<ScrollView
 style={{flex:1}}
 contentContainerStyle={{paddingBottom:250, flexGrow:1}}
 keyboardShouldPersistTaps="always"
 nestedScrollEnabled={true}
 scrollEnabled={true}
keyboardDismissMode="on-drag"
alwaysBounceVertical={true}
>

<View style={{flex:1,padding:20}}>

{/* CONTROLE DAS ABAS */}

{abaOfertas === "procurar" && (
 <>
  {!!mensagemSucesso && (
    <View
      style={{
        backgroundColor:"rgba(22, 163, 74, 0.92)",
        borderColor:"#14532d",
        borderWidth:1,
        borderRadius:12,
        paddingVertical:10,
        paddingHorizontal:14,
        marginBottom:12
      }}
    >
      <Text style={{color:"#fff",fontWeight:"700",textAlign:"center"}}>{mensagemSucesso}</Text>
    </View>
  )}

  <View
    style={{
      backgroundColor:"rgba(2, 6, 23, 0.55)",
      borderWidth:1,
      borderColor:"rgba(148, 163, 184, 0.35)",
      borderRadius:12,
      padding:12,
      marginBottom:12
    }}
  >
    <Text style={{color:"#cbd5e1",fontSize:12,lineHeight:18}}>
      {avisoLegalOfertaTexto}
    </Text>
  </View>

  <ProcurarScreen
    ofertas={ofertas}
    usuarioId={usuarioId}
    isPro={isPro}
    textos={textos}
    carroPos={carroPos}
    setOfertaSelecionada={setOfertaSelecionada}
    setChatOferta={setChatOferta}
    setChatVisivel={setChatVisivel}
    buscarRotaORS={buscarRotaORS}
    setRotaVisivel={setRotaVisivel}
    setRotaSelecionada={setRotaSelecionada}
    openChat={openChat}
    openRoute={openRoute}
    solicitarAceite={solicitarAceite}
    desistirSolicitacao={desistirSolicitacao}
    reservarVaga={reservarVaga}
    cancelarMinhaReserva={cancelarMinhaReserva}
    responderReserva={responderReserva}
    iniciarViagem={iniciarViagem}
    confirmarFinalizacaoViagem={confirmarFinalizacaoViagem}
    desistirOferta={desistirOferta}
    editarOferta={editarOferta}
    excluirOferta={excluirOferta}
    openProfile={openProfile}
    onRequestPro={onRequestPro}
  />
 </>
)}

{abaOfertas === "viagens" && (
  <ViagensScreen
    ofertas={ofertas}
    usuarioId={usuarioId}
  textos={textos}
  />
)}



{/* MENSAGENS DENTRO DO MENU */}
{abaOfertas === "mensagens" && (
  <MensagensScreen
    usuarioId={usuarioId}
    ofertas={ofertas}
    conversas={conversas}
  textos={textos}
    lidas={lidas}
    setChatOferta={setChatOferta}
    setChatVisivel={setChatVisivel}
    openChat={openChat}
    excluirConversa={excluirConversa}
  />
)}

{abaOfertas === "perfil" && (
  <View style={{flex:1, minHeight:620}}>
    <PerfilScreen
      usuarioId={perfilVisualizadoId || usuarioId}
      currentUserId={usuarioId}
      somenteLeitura={!!perfilVisualizadoId && String(perfilVisualizadoId) !== String(usuarioId)}
      textos={textos}
    />
  </View>
)}

{abaOfertas === "oferecer" && (

<>

<View
style={{
padding:20,
paddingBottom:220
}}
>

{/* HEADER */}
<View style={{
  paddingTop:50,
  paddingBottom:20,
  paddingHorizontal:20,
  borderBottomWidth:1,
  borderBottomColor:"#222"
}}>

      <Text style={{
        color:"#fff",
        fontSize:22,
        fontWeight:"bold"
      }}>
        {ofertaEditandoId ? tt("editarOferta", "Editar Oferta") : tt("novaOferta", "Nova Oferta")}
      </Text>

      <Text style={{
        color:"#94a3b8",
        marginTop:10,
        lineHeight:18
      }}>
        {avisoLegalOfertaTexto}
      </Text>
    </View>
{/* TIPO */}
      <Text style={{color:"#aaa",marginBottom:8}}>
        {tt("tipo", "Tipo")}
      </Text>

      <View style={{
        flexDirection:"row",
        marginBottom:20
      }}>
        <TouchableOpacity
         onPress={()=>{
  if(!isPro){
    onRequestPro();
    return;
  }
  setTipoSelecionado("carona_solicitada")
}}
         style={{
  flex:1,
  backgroundColor: tipoSelecionado === "carona_solicitada" ? "#2563eb" : "#222",
  padding:15,
  borderRadius:10,
  marginRight:10
}}
>
          <View style={{alignItems:"center",justifyContent:"center"}}>
            <MaterialCommunityIcons name="seat-passenger" size={18} color="#67e8f9" style={{marginBottom:4}}/>
            <Text style={{color:"#fff",textAlign:"center",fontSize:12,fontWeight:"bold"}}>
              {tt("solicitarCarona", "Solicitar carona")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>{
            if(!isPro){
              onRequestPro();
              return;
            }
            setTipoSelecionado("carona_oferecida")
          }}
          style={{
            flex:1,
            backgroundColor: tipoSelecionado === "carona_oferecida" ? "#0ea5e9" : "#222",
            padding:15,
            borderRadius:10,
            marginRight:10,
            opacity: !isPro ? 0.7 : 1
          }}
        >
          <View style={{alignItems:"center",justifyContent:"center"}}>
            <MaterialCommunityIcons name="seat-recline-normal" size={18} color="#67e8f9" style={{marginBottom:4}}/>
            <Text style={{color:"#fff",textAlign:"center",fontSize:12,fontWeight:"bold"}}>
              {tt("oferecerCarona", "Oferecer carona")} {isPro ? "" : "• PREMIUM"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>{
  if(!isPro){
    onRequestPro();
    return;
  }
  setTipoSelecionado("entrega")
}}
          style={{
            flex:1,
            backgroundColor: tipoSelecionado === "entrega" ? "#f97316" : "#222",
            padding:15,
            borderRadius:10
          }}
        >
          <View style={{alignItems:"center",justifyContent:"center"}}>
            <MaterialCommunityIcons name="cube-send" size={18} color="#67e8f9" style={{marginBottom:4}}/>
            <Text style={{color:"#fff",textAlign:"center",fontSize:12,fontWeight:"bold"}}>
              {tt("solicitarEntrega", "Solicitar entrega")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {!isPro && (
        <View style={{marginTop:-8,marginBottom:12}}>
          <Text style={{color:"#f59e0b",marginBottom:8}}>
            {tt("planoFreeDescricao", "Plano free/pro: visualiza caronas para contratar. Para publicar ofertas, ative o PREMIUM.")}
          </Text>
          <TouchableOpacity
            onPress={onRequestPro}
            style={{
              alignSelf:"flex-start",
              backgroundColor:"#f59e0b",
              paddingHorizontal:12,
              paddingVertical:8,
              borderRadius:8
            }}
          >
            <Text style={{color:"#111",fontWeight:"700"}}>{tt("virarPro", "Virar Premium")}</Text>
          </TouchableOpacity>
        </View>
      )}
 {/* PASSAGEIRO OU OBJETO */}
      <Text style={{color:"#aaa",marginBottom:8}}>
        {tipoSelecionado === "entrega"
          ? tt("objetoEntrega", "Objeto para entrega")
          : tipoSelecionado === "carona_oferecida"
            ? tt("motoristaVeiculo", "Motorista / veículo")
            : tt("nomePassageiro", "Nome do passageiro")}
      </Text>

      <TextInput
        value={tipoSelecionado === "entrega" ? descricaoObjeto : nomePassageiro}
        onChangeText={(txt)=>{
          if(tipoSelecionado === "entrega"){
            setDescricaoObjeto(txt);
          } else {
            setNomePassageiro(txt);
          }
        }}
        placeholder={
          tipoSelecionado === "entrega"
            ? tt("exemploObjetoEntrega", "Ex: Medium box, 10kg")
            : tipoSelecionado === "carona_oferecida"
              ? tt("exemploMotoristaVeiculo", "Ex: Carlos - Silver sedan")
              : tt("exemploNomePassageiro", "Ex: John Smith")
        }
        placeholderTextColor="#555"
        style={inputStyle}
      />

      {tipoSelecionado === "carona_oferecida" && perfilVeiculos.length > 0 && (
        <>
          <Text style={{color:"#7dd3fc",marginBottom:8}}>
            {tt("veiculosSalvosPerfil", "Veículos salvos no perfil")}
          </Text>

          <View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:12}}>
            {perfilVeiculos.map((item, index)=>{
              const ativo = veiculoPerfilSelecionado === index;
              const modeloLabel = String(item?.modelo || item?.marca || "Veículo").trim();
              const placaLabel = String(item?.placa || "").trim().toUpperCase();

              return (
                <TouchableOpacity
                  key={`${modeloLabel}-${placaLabel}-${index}`}
                  onPress={()=>{
                    setVeiculoPerfilSelecionado(index);
                    setNomePassageiro(textoMotoristaVeiculo(perfilNome, item));
                  }}
                  style={{
                    borderWidth:1,
                    borderColor: ativo ? "#38bdf8" : "#334155",
                    backgroundColor: ativo ? "rgba(14, 165, 233, 0.2)" : "#111827",
                    borderRadius:999,
                    paddingHorizontal:12,
                    paddingVertical:8,
                    marginRight:8,
                    marginBottom:8
                  }}
                >
                  <Text style={{color: ativo ? "#e0f2fe" : "#cbd5e1"}}>
                    {modeloLabel}{placaLabel ? ` • ${placaLabel}` : ""}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </>
      )}

      {tipoSelecionado !== "entrega" && !!perfilNome && (
        <TouchableOpacity
          onPress={()=>{
            if(tipoSelecionado === "carona_oferecida"){
              const item = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0];
              setNomePassageiro(textoMotoristaVeiculo(perfilNome, item));
              return;
            }
            setNomePassageiro(perfilNome);
          }}
          style={{
            alignSelf:"flex-start",
            borderWidth:1,
            borderColor:"#0ea5e9",
            borderRadius:10,
            paddingHorizontal:12,
            paddingVertical:8,
            marginBottom:12
          }}
        >
          <Text style={{color:"#7dd3fc"}}>
            {tt("usarDadosPerfil", "Usar dados salvos do perfil")}
          </Text>
        </TouchableOpacity>
      )}

      {tipoSelecionado !== "entrega" && (
        <>
          <Text style={{color:"#aaa",marginBottom:8,marginTop:10}}>
            {tipoSelecionado === "carona_oferecida" ? tt("vagasDisponiveis", "Vagas disponíveis") : tt("quantidadePessoas", "Quantidade de pessoas")}
          </Text>

          <View style={{flexDirection:"row",marginBottom:20}}>
            {[1,2,3,4].map((q)=>(
              <TouchableOpacity
                key={q}
                onPress={()=>setQuantidadePessoas(q)}
                style={{
                  flex:1,
                  backgroundColor: quantidadePessoas === q ? "#2563eb" : "#222",
                  padding:12,
                  borderRadius:10,
                  marginRight:5
                }}
              >
                <Text style={{color:"#fff",textAlign:"center"}}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

{/* ENDEREÇO DE RETIRADA / EMBARQUE */}
     <Text style={{color:"#aaa",marginBottom:8}}>
       {tipoSelecionado === "entrega" ? tt("enderecoRetirada", "Endereço de retirada") : tipoSelecionado === "carona_oferecida" ? tt("enderecoSaida", "Endereço de saída") : tt("enderecoEmbarque", "Endereço de embarque")}
     </Text>
     
     <TextInput
       value={ruaOrigem}
       onChangeText={setRuaOrigem}
       placeholder={tt("rua", "Rua")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <TextInput
       value={numeroOrigem}
       onChangeText={setNumeroOrigem}
       placeholder={tt("numero", "Número")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <TextInput
       value={bairroOrigem}
       onChangeText={setBairroOrigem}
       placeholder={tt("bairro", "Bairro")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <View style={{
flexDirection:"row",
width:"100%",
alignItems:"center"
}}>
       <TextInput
         value={cidadeOrigem}
         onChangeText={setCidadeOrigem}
         placeholder={tt("cidade", "Cidade")}
         placeholderTextColor="#555"
         style={[
inputStyle,
{
flex:3,
marginRight:10
}
]}
       />
       <TextInput
         value={estadoOrigem}
         onChangeText={setEstadoOrigem}
         placeholder={tt("estadoSigla", "UF")}
         placeholderTextColor="#555"
         style={[
inputStyle,
{
flex:1
}
]}
       />
     </View>
     
           {/* ENDEREÇO DE DESTINO */}
     <Text style={{color:"#aaa",marginBottom:8,marginTop:25}}>
       {tipoSelecionado === "entrega" ? tt("enderecoEntrega", "Endereço de entrega") : tipoSelecionado === "carona_solicitada" ? tt("enderecoDesembarque", "Endereço de desembarque") : tt("enderecoDestino", "Endereço de destino")}
     </Text>
     
     <TextInput
       value={ruaDestino}
       onChangeText={setRuaDestino}
       placeholder={tt("rua", "Rua")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <TextInput
       value={numeroDestino}
       onChangeText={setNumeroDestino}
       placeholder={tt("numero", "Número")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <TextInput
       value={bairroDestino}
       onChangeText={setBairroDestino}
       placeholder={tt("bairro", "Bairro")}
       placeholderTextColor="#555"
       style={inputStyle}
     />
     
     <View style={{
flexDirection:"row",
alignItems:"center"
}}>

<TextInput
value={cidadeDestino}
onChangeText={setCidadeDestino}
placeholder={tt("cidade", "Cidade")}
placeholderTextColor="#555"
style={[
inputStyle,
{
flex:4,
marginRight:10
}
]}
/>

<TextInput
value={estadoDestino}
onChangeText={setEstadoDestino}
placeholder={tt("estadoSigla", "UF")}
placeholderTextColor="#555"
style={[
inputStyle,
{
flex:1
}
]}
/>

</View>

      {(tipoSelecionado === "carona_oferecida" || tipoSelecionado === "carona_solicitada" || tipoSelecionado === "entrega") && (
        <>
          <Text style={{color:"#aaa",marginBottom:8,marginTop:6}}>
            {labelDataHorario(tipoSelecionado).data}
          </Text>

          <TextInput
            value={dataSaida}
            onChangeText={(txt)=>setDataSaida(maskDateInput(txt))}
            placeholder={tt("formatoData", "DD/MM/YYYY")}
            placeholderTextColor="#555"
            style={inputStyle}
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={{color:"#aaa",marginBottom:8,marginTop:6}}>
            {labelDataHorario(tipoSelecionado).hora}
          </Text>

          <TextInput
            value={horarioSaida}
            onChangeText={(txt)=>setHorarioSaida(maskTimeInput(txt))}
            placeholder={tt("formatoHorario", "HH:MM")}
            placeholderTextColor="#555"
            style={inputStyle}
            keyboardType="number-pad"
            maxLength={5}
          />

          {tipoSelecionado === "carona_oferecida" && (
            <>
              <Text style={{color:"#aaa",marginBottom:8}}>
                {tt("paradasIntermediarias", "Paradas intermediárias")}
              </Text>

              <Text style={{color:"#64748b",marginBottom:10,lineHeight:18}}>
                {tt("dicaParadas", "Depois de definir saída e destino, adicione cidades ou bairros onde você aceita parar. Essas paradas aparecerão no mapa da rota.")}
              </Text>

              {(!ruaOrigem.trim() || !ruaDestino.trim()) && (
                <Text style={{color:"#f59e0b",marginBottom:10}}>
                  {tt("preenchaSaidaDestinoParadas", "Preencha os endereços de saída e destino para configurar as paradas.")}
                </Text>
              )}

              <View style={{flexDirection:"row",alignItems:"center",marginBottom:12}}>
                <TextInput
                  value={paradaTexto}
                  onChangeText={setParadaTexto}
                  placeholder={tt("exemploParada", "Ex: Betim, MG")}
                  placeholderTextColor="#555"
                  style={[inputStyle,{flex:1,marginBottom:0,marginRight:10}]}
                  editable={!!ruaOrigem.trim() && !!ruaDestino.trim()}
                />

                <TouchableOpacity
                  onPress={()=>{
                    if(!ruaOrigem.trim() || !ruaDestino.trim()) return;
                    const paradaLimpa = paradaTexto.trim();
                    if(!paradaLimpa) return;
                    setParadasSelecionadas((prev)=>[...prev, paradaLimpa]);
                    setParadaTexto("");
                  }}
                  style={{
                    backgroundColor:"#0ea5e9",
                    paddingHorizontal:14,
                    paddingVertical:14,
                    borderRadius:12,
                    opacity: !!ruaOrigem.trim() && !!ruaDestino.trim() ? 1 : 0.5
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {paradasSelecionadas.map((parada, index)=>(
                <View
                  key={`${parada}-${index}`}
                  style={{
                    flexDirection:"row",
                    alignItems:"center",
                    justifyContent:"space-between",
                    backgroundColor:"rgba(8, 24, 40, 0.95)",
                    borderWidth:1,
                    borderColor:"#0ea5e9",
                    borderRadius:12,
                    paddingHorizontal:14,
                    paddingVertical:12,
                    marginBottom:10
                  }}
                >
                  <Text style={{color:"#e0f2fe",flex:1,marginRight:10}}>
                    {index + 1}. {parada}
                  </Text>

                  <TouchableOpacity
                    onPress={()=>setParadasSelecionadas((prev)=>prev.filter((_, i)=>i !== index))}
                  >
                    <MaterialCommunityIcons name="close-circle" size={20} color="#f87171" />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <Text style={{color:"#aaa",marginBottom:8,marginTop:8}}>
            {tipoSelecionado === "entrega" ? tt("observacoesEntregaOpcional", "Observações da entrega (opcional)") : tt("observacoesPassageiroOpcional", "Observações para passageiro (opcional)")}
          </Text>

          <TextInput
            value={observacaoOpcional}
            onChangeText={(txt)=>setObservacaoOpcional(String(txt || "").slice(0, MAX_OBSERVACAO_CHARS))}
            placeholder={tipoSelecionado === "entrega"
              ? tt("exemploObservacaoEntrega", "Ex: Deliver at gate, call apartment intercom 23, fragile package.")
              : tipoSelecionado === "carona_oferecida" 
              ? tt("exemploObservacaoCaronaOferecida", "Ex: I will leave on time or up to 5 minutes earlier. In cities along the way, I do not enter downtown; I stop at gas stations by the highway.")
              : tt("exemploObservacaoPassageiro", "Ex: I need a car with luggage space. I am allergic to pets.")}
            placeholderTextColor="#555"
            style={[inputStyle,{minHeight:92,textAlignVertical:"top"}]}
            multiline
            maxLength={MAX_OBSERVACAO_CHARS}
          />

          <Text style={{color:"#94a3b8",marginTop:-8,marginBottom:12,textAlign:"right"}}>
            {observacaoOpcional.length}/{MAX_OBSERVACAO_CHARS}
          </Text>
        </>
      )}

      {/* VALOR */}
      <Text style={{color:"#aaa",marginBottom:8,marginTop:20}}>
        {tt("valorOferecido", "Valor oferecido (R$)")}
      </Text>
      
      <TextInput
        value={valorOferta}
        onChangeText={setValorOferta}
        keyboardType="numeric"
        placeholder={tt("exemploValorOferta", "Ex: 25")}
        placeholderTextColor="#555"
        style={inputStyle}
      />

      <TouchableOpacity
        onPress={salvarOfertaFormulario}
        disabled={criandoOferta}
        style={{
          backgroundColor: criandoOferta ? "#166534" : "#16a34a",
          padding:18,
          borderRadius:12,
          marginTop:10,
          opacity: criandoOferta ? 0.7 : 1
        }}
      >
        <Text style={{
          color:"#fff",
          textAlign:"center",
          fontSize:16,
          fontWeight:"bold"
        }}>
          {criandoOferta
            ? tt("aguarde", "Aguarde...")
            : ofertaEditandoId
              ? tt("salvarAlteracoes", "Salvar Alterações")
              : tt("criarOferta", "Criar Oferta")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={fecharEditorOferta}
        style={{
          marginTop:15,
          padding:15
        }}
      >
        <Text style={{color:"#777",textAlign:"center"}}>
          {tt("cancelar", "Cancelar")}
        </Text>
      </TouchableOpacity>

      {ofertaEditandoId && (
        <TouchableOpacity
          onPress={excluirOfertaEmEdicao}
          style={{
            backgroundColor:"#dc2626",
            padding:15,
            borderRadius:12,
            marginTop:10
          }}
        >
          <Text style={{
            color:"#fff",
            textAlign:"center",
            fontWeight:"bold"
          }}>
            {tt("excluirOferta", "Excluir oferta")}
          </Text>
        </TouchableOpacity>
      )}
      
 </View>

</>

)}

</View>

</ScrollView>

{menuOfertasVisivel && (
  
<BlurView

style={{
position:"absolute",
left:0,
right:0,
bottom: 0,
paddingBottom: Math.max(insets.bottom, 8),
backgroundColor:"#000",
borderTopWidth:1,
borderColor:"#222"
}}
>
<View
style={{
flexDirection:"row",
justifyContent:"space-around",
alignItems:"center",
paddingVertical:10
}}
>

<TouchableOpacity
  onPress={()=>setAbaOfertas("procurar")}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>
<MaterialCommunityIcons name="magnify" size={26} color="#00eaff"/>
<Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("buscar", "Procurar")}</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>{
    if(!isPro){
      onRequestPro();
      return;
    }
    setAbaOfertas("oferecer")
  }}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>
<MaterialCommunityIcons name="trophy-award" size={24} color="#FFD700" />
<Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("oferecer", "Oferecer")}</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setAbaOfertas("viagens")}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>
<MaterialCommunityIcons name="car-electric" size={24} color="#00eaff" />
<Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("viagens", "Viagens")}</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setAbaOfertas("mensagens")}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>

  <View style={{alignItems:"center",justifyContent:"center"}}>

    <MaterialCommunityIcons
      name="chat-processing"
      size={24}
      color="#00eaff"
    />

    {(() => {
      const badgeCount = conversas.reduce((acc:number, c:any) => {
        return acc + Number(c?.unreadCount || 0);
      }, 0);
      return badgeCount > 0 ? (
        <View style={{
          position:"absolute",
          right:-6,
          top:-4,
          backgroundColor:"#ff3b3b",
          borderRadius:10,
          paddingHorizontal:5
        }}>
          <Text style={{color:"#fff",fontSize:10}}>
            {badgeCount}
          </Text>
        </View>
      ) : null;
    })()}

  </View>

  <Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("mensagens", "Mensagens")}</Text>

</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setAbaOfertas("perfil")}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>
<MaterialCommunityIcons name="account-circle" size={24} color="#00eaff" />
<Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("perfil", "Perfil")}</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setMenuOfertasVisivel(false)}
  style={{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:2}}
>
<MaterialCommunityIcons name="close-circle" size={24} color="#ff3b3b" />
<Text numberOfLines={1} style={{color:"#fff",fontSize:11,marginTop:2,textAlign:"center"}}>{tt("fechar", "Fechar")}</Text>
</TouchableOpacity>

</View>
</BlurView>
)}
</ImageBackground>
</KeyboardAvoidingView>

)

}