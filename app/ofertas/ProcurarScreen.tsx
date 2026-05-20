import { MaterialCommunityIcons } from "@expo/vector-icons"
import { collection } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { db } from "../../firebase"
import { getDocsWithLog as getDocs } from "../../utils/firestoreDebug"

type Props={
  ofertas:any[]
  usuarioId:string
  isPro:boolean
  carroPos?:any
  setOfertaSelecionada:(v:any)=>void
  setChatOferta:(v:any)=>void
  setChatVisivel:(v:boolean)=>void
  buscarRotaORS:any
  setRotaVisivel:(v:boolean)=>void
  setRotaSelecionada:(v:any)=>void
  openChat?:(oferta:any)=>void
  openRoute?:(oferta:any)=>void
  solicitarAceite?:(oferta:any)=>void
  desistirSolicitacao?:(oferta:any)=>void
  reservarVaga?:(oferta:any,quantidade:number,embarcaIdx:number,embarcaLabel:string,desembarcaIdx:number,desembarcaLabel:string)=>void
  cancelarMinhaReserva?:(oferta:any,reservaId:string)=>void
  responderReserva?:(oferta:any,reservaId:string,novoStatus:'confirmada'|'cancelada')=>void
  iniciarViagem?:(oferta:any)=>void
  confirmarFinalizacaoViagem?:(oferta:any)=>void
  desistirOferta?:(oferta:any)=>void
  editarOferta?:(oferta:any)=>void
  excluirOferta?:(oferta:any)=>void
  openProfile?:(usuarioPerfilId:any, ofertaParaAceite?:any)=>void
  onRequestPro?:()=>void
  textos?: any
}

function iniciaisNome(valor:any){
  const texto = String(valor || "").trim();
  if(!texto) return "?";
  const partes = texto.split(/\s+/).filter(Boolean);
  if(partes.length === 1) return partes[0].slice(0,2).toUpperCase();
  return `${partes[0][0] || ""}${partes[partes.length-1][0] || ""}`.toUpperCase();
}

function getRotaParadasLocal(item:any):{idx:number;label:string}[]{
  const list:{idx:number;label:string}[]=[];
  list.push({idx:0,label:String(item?.origem?.endereco||'Origem')});
  (item?.paradas||[]).forEach((p:any,i:number)=>{
    list.push({idx:i+1,label:String(p?.endereco||`Parada ${i+1}`)});
  });
  const lastIdx=1+(item?.paradas?.length||0);
  list.push({idx:lastIdx,label:String(item?.destino?.endereco||'Destino')});
  return list;
}

function toRad(value:number){
  return (value * Math.PI) / 180;
}

function distanceMeters(a:{lat:number;lng:number}, b:{lat:number;lng:number}){
  const R = 6371000;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function getRotaPontosLocal(item:any):Array<{lat:number;lng:number}>{
  const pontos:Array<{lat:number;lng:number}> = [];
  if(item?.origem?.lat && item?.origem?.lng){
    pontos.push({lat:Number(item.origem.lat),lng:Number(item.origem.lng)});
  }
  (item?.paradas||[]).forEach((p:any)=>{
    if(p?.lat && p?.lng){
      pontos.push({lat:Number(p.lat),lng:Number(p.lng)});
    }
  });
  if(item?.destino?.lat && item?.destino?.lng){
    pontos.push({lat:Number(item.destino.lat),lng:Number(item.destino.lng)});
  }
  return pontos;
}

function valorTrechoSugeridoLocal(item:any, embarcaIdx:number, desembarcaIdx:number){
  const precoTotal = Number(item?.valor || 0);
  if(precoTotal <= 0 || desembarcaIdx <= embarcaIdx) return 0;

  const pontos = getRotaPontosLocal(item);
  if(pontos.length >= 2 && embarcaIdx < pontos.length && desembarcaIdx < pontos.length){
    let distanciaTotal = 0;
    let distanciaTrecho = 0;
    for(let i=0;i<pontos.length-1;i++){
      const seg = distanceMeters(pontos[i], pontos[i+1]);
      distanciaTotal += seg;
      if(i >= embarcaIdx && i < desembarcaIdx){
        distanciaTrecho += seg;
      }
    }
    if(distanciaTotal > 0 && distanciaTrecho > 0){
      return Number(((precoTotal * distanciaTrecho) / distanciaTotal).toFixed(2));
    }
  }

  const totalSegmentos = Math.max(1, getRotaParadasLocal(item).length - 1);
  const trechoSegmentos = Math.max(1, desembarcaIdx - embarcaIdx);
  return Number(((precoTotal * trechoSegmentos) / totalSegmentos).toFixed(2));
}

function vagasSegmentoLocal(item:any,embarcaIdx:number,desembarcaIdx:number):number{
  const total=Number(item?.quantidadePessoas||0);
  const reservasAtivas=(item?.reservas||[]).filter((r:any)=>r.status!=='cancelada');
  let min=total;
  for(let i=embarcaIdx;i<desembarcaIdx;i++){
    const ocupadas=reservasAtivas
      .filter((r:any)=>r.embarcaIdx<=i&&r.desembarcaIdx>i)
      .reduce((sum:number,r:any)=>sum+Math.max(0, Number(r?.quantidade || 0)),0);
    min=Math.min(min,total-ocupadas);
  }
  if(!Number.isFinite(min)) return Math.max(0,total);
  return Math.max(0,min);
}

function textoDataOferta(item:any):string{
  const data = String(item?.dataSaida || "").trim();
  const hora = String(item?.horarioSaida || "").trim();
  if(!data && !hora) return "";
  return [data, hora].filter(Boolean).join(" às ");
}

function minVagasDisponiveisLocal(item:any):number{
  if(!item.quantidadePessoas) return 0;
  const paradas=getRotaParadasLocal(item);
  let min=item.quantidadePessoas;
  for(let i=0;i<paradas.length-1;i++){
    min=Math.min(min,vagasSegmentoLocal(item,paradas[i].idx,paradas[i+1].idx));
  }
  return min;
}

export default function ProcurarScreen({
  ofertas,
  usuarioId,
  isPro,
  carroPos,
  setOfertaSelecionada,
  setChatOferta,
  setChatVisivel,
  buscarRotaORS,
  setRotaVisivel,
  setRotaSelecionada,
  openChat,
  openRoute,
  solicitarAceite,
  desistirSolicitacao,
  reservarVaga,
  cancelarMinhaReserva,
  responderReserva,
  iniciarViagem,
  confirmarFinalizacaoViagem,
  desistirOferta,
  editarOferta,
  excluirOferta,
  openProfile,
  onRequestPro = () => {},
  textos
}:Props){

  const tt = (chave:string, fallback:string)=> String(textos?.[chave] || fallback);

  const [abaInterna, setAbaInterna] = useState<"outras" | "minhas">("outras")
  const [reservandoId, setReservandoId] = useState<string|null>(null)
  const [reservaEmbarcaIdx, setReservaEmbarcaIdx] = useState<number|null>(null)
  const [reservaDesembarcaIdx, setReservaDesembarcaIdx] = useState<number|null>(null)
  const [reservaQtd, setReservaQtd] = useState(1)
  const [avaliacoesResumo, setAvaliacoesResumo] = useState<Record<string,{media:number,total:number}>>({})
  const [notaMinimaFiltro, setNotaMinimaFiltro] = useState(0)
  // filtro de raio de visualização — 0 = "mostrar tudo"
  const [raioVisualizacaoKm, setRaioVisualizacaoKm] = useState<number>(0)

  // Função para decidir se mostra endereço
  function podeVerEndereco(item:any): boolean {
    if (isPro || String(item?.tipo || "") === "carona_oferecida") return true;
    if (item?.criadorId === usuarioId) return true;
    // Se o usuário está entre os solicitantes aceitos
    if (Array.isArray(item?.solicitacoes) && item.solicitacoes.map((s:any)=>String(s)).includes(String(usuarioId))) return true;
    if (Array.isArray(item?.solicitantes) && item.solicitantes.map((s:any)=>String(s)).includes(String(usuarioId))) return true;
    // Se a oferta foi aceita por este usuário
    if (String(item?.aceitaPor || "") === String(usuarioId)) return true;
    return false;
  }

  function distanciaParaOferta(item:any): number|null {
    if(!carroPos) return null;
    const lat = Number(carroPos.latitude); const lng = Number(carroPos.longitude);
    const oLat = Number(item?.origem?.lat); const oLng = Number(item?.origem?.lng);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||!Number.isFinite(oLat)||!Number.isFinite(oLng)) return null;
    return distanceMeters({lat,lng},{lat:oLat,lng:oLng});
  }

  function formatarDistancia(m:number|null):string{
    if(m===null) return '';
    if(m >= 1000) return `${(m/1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  }

  const ofertasOutrasTodas = ofertas.filter((o:any)=>{
    if(o.criadorId===usuarioId) return false

    if(!isPro && String(o?.tipo || "") !== "carona_oferecida") return false

    const statusValido =
      String(o?.status || "ativa") === "ativa" ||
      (String(o?.status || "") === "aceita" && String(o?.aceitaPor || "") === String(usuarioId))

    if(!statusValido) return false

    const solicitacoesAtuais = Array.isArray(o?.solicitacoes)
      ? o.solicitacoes.map((s:any)=>String(s))
      : (Array.isArray(o?.solicitantes)
        ? o.solicitantes.map((s:any)=>String(s))
        : [])

    if(solicitacoesAtuais.length === 0) return true

    return solicitacoesAtuais.includes(String(usuarioId))
  })
  const ofertasOutras = ofertasOutrasTodas
    .map(o=>({...o, _distanciaM: distanciaParaOferta(o)}))
    .filter(o => raioVisualizacaoKm === 0 || o._distanciaM === null || o._distanciaM <= raioVisualizacaoKm * 1000)
    .sort((a:any,b:any)=>{
      const dA = a._distanciaM; const dB = b._distanciaM;
      if(dA===null && dB===null) return 0;
      if(dA===null) return 1; if(dB===null) return -1;
      return dA - dB;
    })
  const ofertasOutrasFiltradas = ofertasOutras.filter((item:any)=>{
    if(item?.tipo !== "carona_oferecida") return true
    if(notaMinimaFiltro <= 0) return true

    const resumo = avaliacoesResumo[String(item?.criadorId || "")] || null
    if(!resumo || !Number.isFinite(Number(resumo.media))) return false

    return Number(resumo.media) >= notaMinimaFiltro
  })

  useEffect(()=>{
    let ativo = true

    async function carregarResumoAvaliacoes(){
      const ids = Array.from(new Set(
        ofertas
          .flatMap((item:any)=>[
            item?.criadorId,
            ...((item?.reservas || []).map((r:any)=>r?.passageiroId))
          ])
          .map((id:any)=>String(id || "").trim())
          .filter(Boolean)
      ))

      if(ids.length === 0){
        if(ativo) setAvaliacoesResumo({})
        return
      }

      try{
        const snapshot = await getDocs(collection(db,"avaliacoesUsuarios"))
        const agregado:Record<string,{soma:number,total:number}> = {}

        snapshot.docs.forEach((docAtual:any)=>{
          const item:any = docAtual.data?.() || {}
          const avaliadoId = String(item?.avaliadoId || "").trim()
          const nota = Number(item?.nota || 0)
          if(!avaliadoId || !ids.includes(avaliadoId) || !Number.isFinite(nota) || nota <= 0) return

          if(!agregado[avaliadoId]){
            agregado[avaliadoId] = { soma: 0, total: 0 }
          }

          agregado[avaliadoId].soma += nota
          agregado[avaliadoId].total += 1
        })

        if(!ativo) return

        const resumo:Record<string,{media:number,total:number}> = {}
        Object.entries(agregado).forEach(([id, valor])=>{
          resumo[id] = {
            media: Number((valor.soma / Math.max(1, valor.total)).toFixed(1)),
            total: valor.total
          }
        })
        setAvaliacoesResumo(resumo)
      }catch(e){
        console.log("Erro ao carregar resumo de avaliações:", e)
      }
    }

    carregarResumoAvaliacoes()

    return ()=>{
      ativo = false
    }
  }, [ofertas])

  return(
    <View style={{flex:1,backgroundColor:"#000"}}>
      <View style={{padding:20,paddingBottom:0}}>
        <Text style={{color:"#fff",fontSize:20,fontWeight:"bold",marginBottom:15}}>
          {tt("ofertasTitulo", "Ofertas")}
        </Text>

        <View style={{flexDirection:"row",marginBottom:20}}>
          <TouchableOpacity
            onPress={()=>setAbaInterna("outras")}
            style={{
              flex:1,
              backgroundColor:abaInterna==="outras"?"#16a34a":"#1a1a2e",
              padding:10,
              marginRight:10,
              borderRadius:8,
              alignItems:"center",
              flexDirection:"row",
              justifyContent:"center",
              borderWidth:1,
              borderColor:abaInterna==="outras"?"#16a34a":"#333"
            }}
          >
            <MaterialCommunityIcons name="magnify" size={16} color="#fff" style={{marginRight:6}}/>
            <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("outras", "Outras")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={()=>{
              if(!isPro){
                onRequestPro();
                return;
              }
              setAbaInterna("minhas");
            }}
            style={{
              flex:1,
              backgroundColor:abaInterna==="minhas"?"#16a34a":"#1a1a2e",
              padding:10,
              borderRadius:8,
              alignItems:"center",
              flexDirection:"row",
              justifyContent:"center",
              borderWidth:1,
              borderColor:abaInterna==="minhas"?"#16a34a":"#333"
            }}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#fff" style={{marginRight:6}}/>
            <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("minhas", "Minhas")}</Text>
          </TouchableOpacity>
        </View>

        {abaInterna === "outras" && (
          <View style={{marginBottom:18}}>
            <Text style={{color:"#8fb8d8",fontSize:12,marginBottom:8}}>
              {tt("filtrarNotaMotorista", "Filtrar caronas por nota do motorista")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[0, 3, 4, 4.5].map((nota)=>{
                const ativo = notaMinimaFiltro === nota
                return (
                  <TouchableOpacity
                    key={String(nota)}
                    onPress={()=>setNotaMinimaFiltro(nota)}
                    style={{
                      flexDirection:"row",
                      alignItems:"center",
                      backgroundColor:ativo?"#f59e0b":"#171717",
                      borderWidth:1,
                      borderColor:ativo?"#fbbf24":"#333",
                      borderRadius:999,
                      paddingHorizontal:12,
                      paddingVertical:8,
                      marginRight:8
                    }}
                  >
                    <MaterialCommunityIcons name="star" size={14} color={ativo?"#111":"#fbbf24"} style={{marginRight:6}}/>
                    <Text style={{color:ativo?"#111":"#fff",fontWeight:"bold",fontSize:12}}>
                      {nota === 0 ? tt("todas", "Todas") : `${nota.toFixed(nota % 1 === 0 ? 0 : 1)}+`}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        style={{flex:1}}
        contentContainerStyle={{padding:20,paddingBottom:20}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        keyboardDismissMode="on-drag"
      >
        {abaInterna==="outras" && (
          <View>
            <View style={{marginBottom:10}}>
              <Text style={{color:"#94a3b8",fontSize:12,marginBottom:6}}>{tt("raioBuscaRegiao", "Raio de busca na região")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[0,10,25,50,100].map((km:number)=>{
                  const ativo = raioVisualizacaoKm===km
                  return (
                    <TouchableOpacity
                      key={`raio-${km}`}
                      onPress={()=>setRaioVisualizacaoKm(km)}
                      style={{
                        paddingHorizontal:12,
                        paddingVertical:8,
                        borderRadius:999,
                        marginRight:8,
                        borderWidth:1,
                        borderColor:ativo?"#22c55e":"#334155",
                        backgroundColor:ativo?"#166534":"#0f172a"
                      }}
                    >
                      <Text style={{color:ativo?"#dcfce7":"#cbd5e1",fontWeight:"700",fontSize:12}}>
                        {km===0 ? tt("todas", "Todas") : tt("ateKm", "Até {{km}} km").replace("{{km}}", String(km))}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>

            {ofertasOutrasFiltradas.length===0 && (
              <Text style={{color:"#777"}}>
                {notaMinimaFiltro > 0 ? tt("nenhumaCaronaNotaMinima", "Nenhuma carona encontrada com essa nota mínima") : tt("nenhumaOfertaDisponivel", "Nenhuma oferta disponível")}
              </Text>
            )}

            {ofertasOutrasFiltradas.map((item,index)=>{
              const solicitacoesAtuais = Array.isArray(item.solicitacoes)
                ? item.solicitacoes.map((s:any) => String(s))
                : [];
              const distanciaLabel = formatarDistancia(item?._distanciaM ?? null)
              const jaSolicitou = solicitacoesAtuais.some((s:any) => String(s) === String(usuarioId));
              const solicitacaoBloqueadaPorOutro =
                solicitacoesAtuais.length > 0 &&
                !jaSolicitou;
              const aceitaPorMim =
                String(item?.status || "") === "aceita" &&
                String(item?.aceitaPor || "") === String(usuarioId);
              const bloqueadoPorPlanoPro = item.tipo !== "carona_oferecida" && !isPro;
              const podeUsarRecursosOferta = isPro || item.tipo === "carona_oferecida";
              const ofertaBloqueadaParaSolicitacao =
                item.status === "aceita" ||
                item.status === "cancelada" ||
                item.status === "em_andamento" ||
                item.status === "finalizada";
              const minhaReservaAtiva = (item.reservas || []).find((r:any)=>
                String(r.passageiroId) === String(usuarioId) && r.status !== 'cancelada'
              );
              const paradasRota = getRotaParadasLocal(item);
              const vagasMin = item.tipo === "carona_oferecida" ? minVagasDisponiveisLocal(item) : 0;
              const trechoSelecionadoVal =
                reservandoId===item.id && reservaEmbarcaIdx!==null && reservaDesembarcaIdx!==null
                  ? valorTrechoSugeridoLocal(item, reservaEmbarcaIdx, reservaDesembarcaIdx)
                  : 0;
              const vagasTrecho =
                reservandoId===item.id && reservaEmbarcaIdx!==null && reservaDesembarcaIdx!==null
                  ? vagasSegmentoLocal(item, reservaEmbarcaIdx, reservaDesembarcaIdx)
                  : 0;
              const participantes = (()=>{
                const base:any[] = [];
                if(item?.criadorId){
                  base.push({
                    id:String(item.criadorId),
                    nome:String(item.criadorNome || item.criadorId),
                    destaque:true
                  });
                }
                (item?.reservas || [])
                  .filter((r:any)=>r?.status !== "cancelada")
                  .forEach((r:any)=>{
                    const id = String(r?.passageiroId || "").trim();
                    if(!id) return;
                    if(base.some((p:any)=>p.id===id)) return;
                    base.push({
                      id,
                      nome:String(r?.passageiroNome || r?.passageiroId || id),
                      destaque:false
                    });
                  });
                return base;
              })();
              const resumoMotorista = avaliacoesResumo[String(item?.criadorId || "")] || null;

              return(
                <View
                  key={index}
                  style={{
                    backgroundColor:"#111",
                    padding:15,
                    borderRadius:12,
                    marginBottom:15,
                    borderWidth: 1,
                    borderColor: item.status === "cancelada" ? "#7f1d1d" : (item.status === "aceita" || item.status === "em_andamento") ? "#444" : "#1a1a2e"
                  }}
                >
                  {!!distanciaLabel && (
                    <View style={{alignSelf:"flex-start",backgroundColor:"#0f172a",borderWidth:1,borderColor:"#334155",paddingHorizontal:8,paddingVertical:4,borderRadius:999,marginBottom:8}}>
                      <Text style={{color:"#7dd3fc",fontSize:11,fontWeight:"700"}}>📍 {distanciaLabel}</Text>
                    </View>
                  )}

                  {item.status === "cancelada" && (
                    <View style={{marginBottom:8}}>
                      <View style={{
                        alignSelf:"flex-start",
                        backgroundColor:item.cancelamentoEmCimaDaHora ? "#7f1d1d" : "#374151",
                        borderWidth:1,
                        borderColor:item.cancelamentoEmCimaDaHora ? "#ef4444" : "#6b7280",
                        borderRadius:999,
                        paddingHorizontal:10,
                        paddingVertical:4
                      }}>
                        <Text style={{color:item.cancelamentoEmCimaDaHora ? "#fecaca" : "#e5e7eb",fontSize:11,fontWeight:"bold"}}>
                          {item.cancelamentoEmCimaDaHora ? tt("canceladoEmCimaDaHora", "Cancelado em cima da hora") : tt("viagemCancelada", "Viagem cancelada")}
                        </Text>
                      </View>
                      {!!item.motivoCancelamento && (
                        <Text style={{color:"#fca5a5",fontSize:12,marginTop:6}} numberOfLines={2}>
                          {tt("motivo", "Motivo")}: {item.motivoCancelamento}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={{flexDirection:"row", alignItems:"center", marginBottom:4}}>
                    <View style={{
                      width:26,
                      height:26,
                      borderRadius:13,
                      alignItems:"center",
                      justifyContent:"center",
                      marginRight:8,
                      backgroundColor:"#0f172a",
                      borderWidth:1,
                      borderColor:"#22d3ee"
                    }}>
                      <MaterialCommunityIcons
                        name={String(item.tipo).includes("carona") ? "seat-passenger" : "cube-send"}
                        size={15}
                        color="#22d3ee"
                      />
                    </View>
                    <Text style={{color:"#fff",fontSize:16,fontWeight:"bold",flex:1}}>
                      {podeUsarRecursosOferta ? item.nomeOuDescricao : "Oferta protegida"}
                    </Text>
                    {(item.status === "aceita" || item.status === "em_andamento") && (
                      <MaterialCommunityIcons name="lock" size={16} color="#666"/>
                    )}
                  </View>

                  {podeUsarRecursosOferta && (
                    <TouchableOpacity
                      onPress={()=>openProfile && openProfile(item?.criadorId, item)}
                      style={{
                        marginTop:2,
                        marginBottom:6,
                        flexDirection:"row",
                        alignItems:"center",
                        alignSelf:"flex-start"
                      }}
                    >
                      <Text style={{color:"#93c5fd",fontSize:12,fontWeight:"600"}}>
                        {String(item?.criadorNome || item?.criadorId || tt("usuario", "Usuário"))}
                      </Text>
                      {resumoMotorista ? (
                        <View style={{
                          marginLeft:8,
                          flexDirection:"row",
                          alignItems:"center",
                          backgroundColor:"#1c1917",
                          borderWidth:1,
                          borderColor:"#44403c",
                          paddingHorizontal:8,
                          paddingVertical:3,
                          borderRadius:999
                        }}>
                          <MaterialCommunityIcons name="star" size={12} color="#fbbf24" style={{marginRight:4}} />
                          <Text style={{color:"#fde68a",fontSize:11,fontWeight:"bold"}}>
                            {resumoMotorista.media.toFixed(1)}
                          </Text>
                          <Text style={{color:"#a8a29e",fontSize:10,marginLeft:4}}>
                            {resumoMotorista.total}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{color:"#64748b",fontSize:11,marginLeft:8}}>
                          {tt("semAvaliacoes", "sem avaliações")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {item.tipo==="carona_oferecida" ? (
                    <Text style={{color:vagasMin>0?"#86efac":"#f87171",marginTop:2}}>
                      {podeUsarRecursosOferta ? `🪑 ${vagasMin} ${tt("de", "de")} ${item.quantidadePessoas} ${tt("vagasLivres", "vaga(s) livre(s)")}` : tt("detalhesApenasPro", "Detalhes visíveis apenas para PREMIUM")}
                    </Text>
                  ) : (
                    <Text style={{color:"#aaa",marginTop:2}}>
                      {podeUsarRecursosOferta ? (item.tipo==="carona_solicitada" ? item.quantidadePessoas+" "+tt("pessoas", "pessoas") : tt("solicitarEntrega", "Solicitar entrega")) : tt("detalhesApenasPro", "Detalhes visíveis apenas para PREMIUM")}
                    </Text>
                  )}

                  {podeUsarRecursosOferta && item.tipo === "carona_oferecida" && participantes.length > 0 && (
                    <View style={{marginTop:8}}>
                      <View style={{flexDirection:"row",alignItems:"center"}}>
                        {participantes.slice(0,4).map((p:any, i:number)=>(
                          <TouchableOpacity
                            key={`${p.id}-${i}`}
                            onPress={()=>openProfile && openProfile(p.id, item)}
                            style={{
                              width:30,
                              height:30,
                              borderRadius:15,
                              marginRight:-6,
                              borderWidth:2,
                              borderColor:p.destaque?"#22d3ee":"#60a5fa",
                              backgroundColor:p.destaque?"#0c4a6e":"#1e3a8a",
                              alignItems:"center",
                              justifyContent:"center"
                            }}
                          >
                            <Text style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>
                              {iniciaisNome(p.nome)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {participantes.length > 4 && (
                          <View style={{
                            marginLeft:8,
                            backgroundColor:"#1e293b",
                            borderWidth:1,
                            borderColor:"#334155",
                            paddingHorizontal:8,
                            paddingVertical:4,
                            borderRadius:999
                          }}>
                            <Text style={{color:"#94a3b8",fontSize:11}}>+{participantes.length - 4}</Text>
                          </View>
                        )}

                      </View>

                      <TouchableOpacity onPress={()=>openProfile && openProfile(item?.criadorId, item)}>
                        <Text style={{color:"#94a3b8",fontSize:11,marginTop:6,textDecorationLine:"underline"}}>
                          {tt("verPerfilCarona", "Ver perfil de quem está na carona")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!!textoDataOferta(item) && (
                    <Text style={{color:"#93c5fd",marginTop:2}}>
                      {tt("dataCombinada", "Data combinada")}: {textoDataOferta(item)}
                    </Text>
                  )}

                  {podeUsarRecursosOferta && !!item.observacao && (
                    <Text style={{color:"#cbd5e1",marginTop:4}} numberOfLines={2}>
                      {tt("obs", "Obs")}: {item.observacao}
                    </Text>
                  )}

                  <Text style={{color:"#16a34a",marginTop:4,fontWeight:"bold"}}>
                    R$ {item.valor}
                  </Text>

                  {podeVerEndereco(item) ? (
                    <>
                      <View style={{flexDirection:"row", alignItems:"center", marginTop:4}}>
                        <MaterialCommunityIcons
                          name={String(item?.tipo || "").includes("entrega") ? "cube-send" : "seat-passenger"}
                          size={14}
                          color="#22d3ee"
                          style={{marginRight:4}}
                        />
                        <MaterialCommunityIcons name="map-marker" size={14} color="#aaa" style={{marginRight:4}}/>
                        <Text style={{color:"#aaa", flex:1}} numberOfLines={1}>{item.origem?.endereco}</Text>
                      </View>
                      <View style={{flexDirection:"row", alignItems:"center", marginTop:2}}>
                        <MaterialCommunityIcons
                          name={String(item?.tipo || "").includes("entrega") ? "cube-send" : "seat-passenger"}
                          size={14}
                          color="#22d3ee"
                          style={{marginRight:4}}
                        />
                        <MaterialCommunityIcons name="map-marker-check" size={14} color="#aaa" style={{marginRight:4}}/>
                        <Text style={{color:"#aaa", flex:1}} numberOfLines={1}>{item.destino?.endereco}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={{marginTop:8,backgroundColor:"#0f172a",borderWidth:1,borderColor:"#334155",borderRadius:8,padding:10}}>
                      <Text style={{color:"#cbd5e1",fontSize:12,textAlign:"center"}}>
                        {tt("enderecoVisivelApenas", "Endereço visível apenas para o criador, solicitante ou PRO.")}
                      </Text>
                    </View>
                  )}

                  {podeUsarRecursosOferta && Array.isArray(item.paradas) && item.paradas.length > 0 && (
                    <Text style={{color:"#7dd3fc", marginTop:6}}>{item.paradas.length} parada(s) intermediária(s)</Text>
                  )}

                  {podeUsarRecursosOferta && !!minhaReservaAtiva && (
                    <View style={{backgroundColor:"#0a1a2e",padding:10,borderRadius:8,marginTop:10}}>
                      <Text style={{color:"#93c5fd",fontWeight:"bold",marginBottom:4}}>🎫 {tt("minhaReserva", "Minha reserva")}</Text>
                      <Text style={{color:"#94a3b8",fontSize:12}}>
                        {minhaReservaAtiva.embarcaLabel?.split(",")[0]} → {minhaReservaAtiva.desembarcaLabel?.split(",")[0]}
                      </Text>
                      <Text style={{color:"#94a3b8",fontSize:12,marginTop:2}}>
                        {minhaReservaAtiva.quantidade} vaga(s)
                      </Text>
                      {!!minhaReservaAtiva.valorTrechoTotal && (
                        <Text style={{color:"#86efac",fontSize:12,marginTop:2}}>
                          Valor sugerido: R$ {Number(minhaReservaAtiva.valorTrechoTotal).toFixed(2)}
                        </Text>
                      )}
                      <Text style={{
                        color: minhaReservaAtiva.status === 'confirmada' ? "#86efac" : "#fde68a",
                        marginTop:6,
                        fontWeight:"bold"
                      }}>
                        {minhaReservaAtiva.status === 'confirmada' ? `✓ ${tt("confirmada", "Confirmada")}` : `⏳ ${tt("pendente", "Pendente")}`}
                      </Text>
                      <TouchableOpacity
                        onPress={()=>cancelarMinhaReserva && cancelarMinhaReserva(item, minhaReservaAtiva.id)}
                        style={{backgroundColor:"#7f1d1d",marginTop:8,padding:8,borderRadius:8,alignItems:"center"}}
                      >
                        <Text style={{color:"#fca5a5",fontWeight:"bold"}}>{tt("cancelarReserva", "Cancelar reserva")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {podeUsarRecursosOferta && item.tipo === "carona_oferecida" && reservandoId===item.id && !minhaReservaAtiva && (
                    <View style={{backgroundColor:"#0a1a2e",borderRadius:10,padding:10,marginTop:10}}>
                      <Text style={{color:"#93c5fd",fontWeight:"bold",marginBottom:8}}>{tt("selecionarTrecho", "Selecionar trecho")}</Text>
                      <Text style={{color:"#64748b",fontSize:12,marginBottom:8}}>
                        {tt("dicaSelecionarTrecho", "Você já pode escolher a quantidade de vagas abaixo. Se quiser, toque nos pontos para mudar embarque/desembarque.")}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:8}}>
                        {paradasRota.map((p, idx)=>(
                          <TouchableOpacity
                            key={`${item.id}-${idx}`}
                            onPress={()=>{
                              if(reservaEmbarcaIdx===null || (reservaEmbarcaIdx!==null && reservaDesembarcaIdx!==null)){
                                setReservaEmbarcaIdx(p.idx);
                                setReservaDesembarcaIdx(null);
                                setReservaQtd(1);
                              }else if(p.idx > reservaEmbarcaIdx){
                                setReservaDesembarcaIdx(p.idx);
                              }else{
                                setReservaEmbarcaIdx(p.idx);
                                setReservaDesembarcaIdx(null);
                                setReservaQtd(1);
                              }
                            }}
                            style={{
                              backgroundColor: reservaEmbarcaIdx===p.idx?"#166534":reservaDesembarcaIdx===p.idx?"#1d4ed8":"#1e293b",
                              borderWidth:1,
                              borderColor: reservaEmbarcaIdx===p.idx?"#22c55e":reservaDesembarcaIdx===p.idx?"#3b82f6":"#334155",
                              borderRadius:8,
                              paddingHorizontal:10,
                              paddingVertical:8,
                              marginRight:6
                            }}
                          >
                            <Text style={{color:"#fff",fontSize:11}} numberOfLines={1}>
                              {p.idx===0?"🟢":p.idx===paradasRota.length-1?"🏁":"📍"} {p.label.split(",")[0]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {reservaEmbarcaIdx!==null && reservaDesembarcaIdx===null && (
                        <Text style={{color:"#94a3b8",fontSize:12,marginBottom:8}}>{tt("selecioneDesembarque", "Selecione agora o desembarque.")}</Text>
                      )}

                      {reservaEmbarcaIdx!==null && reservaDesembarcaIdx!==null && (
                        <>
                          <Text style={{color:vagasTrecho>0?"#86efac":"#f87171",marginBottom:6}}>
                            {vagasTrecho} vaga(s) disponível(eis) no trecho
                          </Text>
                          <Text style={{color:"#93c5fd",marginBottom:8}}>
                            {tt("valorSugeridoPorVaga", "Valor sugerido por vaga")}: R$ {trechoSelecionadoVal.toFixed(2)}
                          </Text>
                          <View style={{flexDirection:"row",alignItems:"center",marginBottom:10}}>
                            <Text style={{color:"#94a3b8",marginRight:10}}>{tt("vagas", "Vagas")}:</Text>
                            {[1,2,3,4].map((q)=>{
                              const disponivel = q <= vagasTrecho;
                              const selecionada = reservaQtd===q;
                              return (
                                <TouchableOpacity
                                  key={q}
                                  disabled={!disponivel}
                                  onPress={()=>setReservaQtd(q)}
                                  style={{
                                    width:34,
                                    height:34,
                                    borderRadius:17,
                                    backgroundColor:selecionada?"#16a34a":"#1e293b",
                                    borderWidth:1,
                                    borderColor:selecionada?"#22c55e":"#334155",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    marginRight:6,
                                    opacity: disponivel ? 1 : 0.35
                                  }}
                                >
                                  <Text style={{color:"#fff",fontWeight:"bold"}}>{q}</Text>
                                </TouchableOpacity>
                              )
                            })}
                          </View>

                          <TouchableOpacity
                            disabled={vagasTrecho <= 0 || reservaQtd > vagasTrecho}
                            onPress={()=>{
                              const embL = paradasRota.find((p)=>p.idx===reservaEmbarcaIdx)?.label || "";
                              const desL = paradasRota.find((p)=>p.idx===reservaDesembarcaIdx)?.label || "";
                              reservarVaga && reservarVaga(item, reservaQtd, reservaEmbarcaIdx, embL, reservaDesembarcaIdx, desL);
                              setReservandoId(null);
                              setReservaEmbarcaIdx(null);
                              setReservaDesembarcaIdx(null);
                              setReservaQtd(1);
                            }}
                            style={{
                              backgroundColor:"#16a34a",
                              padding:11,
                              borderRadius:8,
                              alignItems:"center",
                              opacity: vagasTrecho > 0 && reservaQtd <= vagasTrecho ? 1 : 0.45
                            }}
                          >
                            <Text style={{color:"#fff",fontWeight:"bold"}}>
                              {tt("confirmarReserva", "Confirmar reserva")} • R$ {(trechoSelecionadoVal * reservaQtd).toFixed(2)}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}

                  {podeUsarRecursosOferta && (
                  <View style={{flexDirection:"row",marginTop:10}}>
                    <TouchableOpacity
                      onPress={async () => {
                        if(openRoute){
                          openRoute(item)
                          return
                        }
                        if(!item?.origem?.lat){
                          Alert.alert(tt("erro", "Erro"), tt("origemInvalidaRota", "Origem inválida para calcular rota"));
                          return
                        }
                        setOfertaSelecionada(item)
                        const coords = await buscarRotaORS(
                          {lat:item.origem.lat,lng:item.origem.lng},
                          {lat:item.destino.lat,lng:item.destino.lng}
                        )
                        if(coords && coords.length > 0){
                          setRotaSelecionada(coords)
                          setRotaVisivel(true)
                        } else {
                          Alert.alert(tt("erro", "Erro"), tt("naoFoiPossivelCalcularRota", "Não foi possível calcular a rota"))
                        }
                      }}
                      style={{
                        backgroundColor:"#2563eb",
                        padding:12,
                        borderRadius:10,
                        marginRight:10,
                        flex:1,
                        flexDirection:"row",
                        justifyContent:"center",
                        alignItems:"center"
                      }}
                    >
                      <MaterialCommunityIcons name="map-marker-path" size={18} color="#fff" style={{marginRight:8}}/>
                      <Text style={{color:"#fff",textAlign:"center",fontWeight:"bold"}}>{tt("verRota", "Ver Rota")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={()=>{
                        if(openChat){
                          openChat(item)
                          return
                        }
                        setOfertaSelecionada(item)
                        setChatOferta(item)
                        setChatVisivel(true)
                      }}
                      style={{
                        backgroundColor:"#16a34a",
                        padding:12,
                        borderRadius:10,
                        marginRight:10,
                        flex:1,
                        flexDirection:"row",
                        justifyContent:"center",
                        alignItems:"center"
                      }}
                    >
                      <MaterialCommunityIcons name="message-text" size={18} color="#fff" style={{marginRight:8}}/>
                      <Text style={{color:"#fff",textAlign:"center",fontWeight:"bold"}}>{tt("mensagem", "Mensagem")}</Text>
                    </TouchableOpacity>

                    {item.tipo === "carona_oferecida" ? (
                      <TouchableOpacity
                        disabled={ofertaBloqueadaParaSolicitacao || !usuarioId || !!minhaReservaAtiva}
                        onPress={()=>{
                          if(ofertaBloqueadaParaSolicitacao) return;
                          if(!usuarioId){
                            Alert.alert(tt("aguarde", "Aguarde"), tt("aguardeId", "Aguarde enquanto seu ID é carregado"))
                            return
                          }
                          setReservandoId((prev)=>{
                            const fechando = prev===item.id;
                            if(fechando){
                              setReservaEmbarcaIdx(null)
                              setReservaDesembarcaIdx(null)
                              setReservaQtd(1)
                              return null;
                            }

                            const paradas = getRotaParadasLocal(item)
                            const origemIdx = paradas[0]?.idx ?? 0
                            const destinoIdx = paradas[paradas.length-1]?.idx ?? 1
                            setReservaEmbarcaIdx(origemIdx)
                            setReservaDesembarcaIdx(destinoIdx)
                            setReservaQtd(1)
                            return item.id
                          })
                        }}
                        style={{
                          backgroundColor: ofertaBloqueadaParaSolicitacao ? "#666" : !!minhaReservaAtiva ? "#334155" : (reservandoId===item.id ? "#0ea5e9" : "#22c55e"),
                          padding:12,
                          borderRadius:10,
                          flex:1,
                          opacity: ofertaBloqueadaParaSolicitacao ? 0.5 : 1,
                          flexDirection:"row",
                          justifyContent:"center",
                          alignItems:"center"
                        }}
                      >
                        <MaterialCommunityIcons
                          name={ofertaBloqueadaParaSolicitacao ? "lock" : (!!minhaReservaAtiva ? "ticket-confirmation" : (reservandoId===item.id ? "close-circle" : "seat-passenger"))}
                          size={18}
                          color="#fff"
                          style={{marginRight:8}}
                        />
                        <Text style={{color:"#fff",textAlign:"center",fontWeight:"bold"}}>
                          {ofertaBloqueadaParaSolicitacao ? tt("bloqueado", "Bloqueado") : (!!minhaReservaAtiva ? tt("reservado", "Reservado") : (reservandoId===item.id ? tt("fechar", "Fechar") : (String(item?.tipo || "") === "carona_solicitada" ? tt("oferecerCarona", "Oferecer carona") : String(item?.tipo || "") === "entrega" ? tt("fazerEntrega", "Fazer entrega") : tt("solicitar", "Solicitar"))))}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        disabled={((ofertaBloqueadaParaSolicitacao && !aceitaPorMim) || solicitacaoBloqueadaPorOutro || bloqueadoPorPlanoPro || !usuarioId)}
                        onPress={()=>{
                          if(item.criadorId===usuarioId){
                            Alert.alert(tt("aviso", "Aviso"), tt("naoPodeAceitarPropriaOferta", "Você não pode aceitar sua própria oferta"))
                            return
                          }
                          if(!usuarioId){
                            Alert.alert(tt("aguarde", "Aguarde"), tt("aguardeId", "Aguarde enquanto seu ID é carregado"))
                            return
                          }
                          if(bloqueadoPorPlanoPro){
                            Alert.alert(tt("recursoPro", "Recurso PRO"), tt("proDarCarona", "Para dar carona ou fazer entrega para outra pessoa, ative o plano PRO."))
                            return
                          }
                          if(solicitacaoBloqueadaPorOutro){
                            Alert.alert(tt("solicitacaoBloqueada", "Solicitação bloqueada"), tt("ofertaSolicitacaoAnalise", "Esta oferta já possui uma solicitação em análise."))
                            return
                          }
                          if(aceitaPorMim){
                            desistirOferta && desistirOferta(item)
                            return
                          }
                          if(jaSolicitou){
                            desistirSolicitacao && desistirSolicitacao(item)
                            return
                          }
                          solicitarAceite && solicitarAceite(item)
                        }}
                        style={{
                          backgroundColor: ((ofertaBloqueadaParaSolicitacao && !aceitaPorMim) || solicitacaoBloqueadaPorOutro || bloqueadoPorPlanoPro) ? "#666" : (aceitaPorMim || jaSolicitou ? "#dc2626" : "#22c55e"),
                          padding:12,
                          borderRadius:10,
                          flex:1,
                          opacity: ((ofertaBloqueadaParaSolicitacao && !aceitaPorMim) || solicitacaoBloqueadaPorOutro || bloqueadoPorPlanoPro) ? 0.5 : 1,
                          flexDirection:"row",
                          justifyContent:"center",
                          alignItems:"center"
                        }}
                      >
                        <MaterialCommunityIcons
                          name={((ofertaBloqueadaParaSolicitacao && !aceitaPorMim) || solicitacaoBloqueadaPorOutro || bloqueadoPorPlanoPro) ? "lock" : (aceitaPorMim || jaSolicitou) ? "close-circle" : "check-circle"}
                          size={18}
                          color="#fff"
                          style={{marginRight:8}}
                        />
                        <Text style={{color:"#fff",textAlign:"center",fontWeight:"bold"}}>
                          {(ofertaBloqueadaParaSolicitacao && !aceitaPorMim)
                            ? tt("bloqueado", "Bloqueado")
                            : bloqueadoPorPlanoPro
                              ? tt("somentePro", "Somente PRO")
                            : solicitacaoBloqueadaPorOutro
                              ? tt("emAnalise", "Em análise")
                              : (aceitaPorMim || jaSolicitou)
                                ? tt("desistir", "Desistir")
                                : (String(item?.tipo || "") === "carona_solicitada"
                                  ? tt("oferecerCarona", "Oferecer carona")
                                  : String(item?.tipo || "") === "entrega"
                                    ? tt("fazerEntrega", "Fazer entrega")
                                    : tt("solicitar", "Solicitar"))}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  )}

                  {((String(item?.tipo || "") === "carona_oferecida" && String(item?.criadorId || "") === String(usuarioId)) ||
                    (String(item?.tipo || "") !== "carona_oferecida" && String(item?.aceitaPor || "") === String(usuarioId))) &&
                    (item.status === "aceita" || item.status === "em_andamento") && (
                    <View style={{flexDirection:"row",marginTop:10}}>
                      {item.status === "aceita" && (
                        <TouchableOpacity
                          onPress={()=>iniciarViagem && iniciarViagem(item)}
                          style={{
                            backgroundColor:"#0f766e",
                            padding:12,
                            borderRadius:10,
                            flex:1,
                            marginRight:10,
                            alignItems:"center",
                            flexDirection:"row",
                            justifyContent:"center"
                          }}
                        >
                          <MaterialCommunityIcons name="rocket-launch-outline" size={18} color="#99f6e4" style={{marginRight:8}}/>
                          <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("iniciarViagem", "Iniciar viagem")}</Text>
                        </TouchableOpacity>
                      )}

                      {item.status === "em_andamento" && (
                        <TouchableOpacity
                          onPress={()=>confirmarFinalizacaoViagem && confirmarFinalizacaoViagem(item)}
                          style={{
                            backgroundColor:"#b91c1c",
                            padding:12,
                            borderRadius:10,
                            flex:1,
                            alignItems:"center",
                            flexDirection:"row",
                            justifyContent:"center"
                          }}
                        >
                          <MaterialCommunityIcons name="flag-checkered" size={18} color="#fecaca" style={{marginRight:8}}/>
                          <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("encerrarViagem", "Encerrar viagem")}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {abaInterna==="minhas" && !isPro && (
          <View style={{backgroundColor:"#111",borderWidth:1,borderColor:"#1a1a2e",borderRadius:12,padding:16}}>
            <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>{tt("minhasSomentePremium", "A aba Minhas e para Premium")}</Text>
            <Text style={{color:"#cbd5e1",marginTop:8}}>{tt("minhasSomentePremiumDesc", "No plano free/pro voce pode buscar caronas para contratar. Para publicar e gerenciar suas ofertas, ative o Premium.")}</Text>
            <TouchableOpacity
              onPress={onRequestPro}
              style={{marginTop:12,alignSelf:"flex-start",backgroundColor:"#16a34a",paddingHorizontal:14,paddingVertical:9,borderRadius:10}}
            >
              <Text style={{color:"#052e16",fontWeight:"800",fontSize:13}}>{tt("tornarPro", "Tornar Premium")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {abaInterna==="minhas" && isPro && (
          <View>
            {ofertas.filter((o:any)=>
              o.criadorId===usuarioId &&
              (
                String(o?.status || "ativa") === "ativa" ||
                String(o?.status || "") === "aceita"
              )
            ).length===0 && (
              <Text style={{color:"#777"}}>{tt("nenhumaOfertaCriadaVoce", "Nenhuma oferta criada por você")}</Text>
            )}

            {ofertas.filter((o:any)=>
              o.criadorId===usuarioId &&
              (
                String(o?.status || "ativa") === "ativa" ||
                String(o?.status || "") === "aceita"
              )
            ).map((item,index)=>{
              const reservasAtivas = (item.reservas || []).filter((r:any)=>r.status !== 'cancelada');
              const pendentes = reservasAtivas.filter((r:any)=>r.status === 'pendente');
              const solicitacoesAtivas = Array.isArray(item?.solicitacoes)
                ? item.solicitacoes.map((s:any)=>String(s)).filter(Boolean)
                : [];
              const podeExcluirOferta =
                String(item?.status || "") === "ativa" &&
                !String(item?.aceitaPor || "").trim() &&
                solicitacoesAtivas.length === 0 &&
                reservasAtivas.length === 0;
              return(
                <View
                  key={index}
                  style={{
                    backgroundColor:"#111",
                    padding:15,
                    borderRadius:12,
                    marginBottom:15,
                    borderWidth: 1,
                    borderColor: item.status === "cancelada" ? "#7f1d1d" : (item.status === "aceita" || item.status === "em_andamento") ? "#2563eb" : "#222"
                  }}
                >
                  {item.status === "cancelada" && (
                    <View style={{marginBottom:8}}>
                      <View style={{
                        alignSelf:"flex-start",
                        backgroundColor:item.cancelamentoEmCimaDaHora ? "#7f1d1d" : "#374151",
                        borderWidth:1,
                        borderColor:item.cancelamentoEmCimaDaHora ? "#ef4444" : "#6b7280",
                        borderRadius:999,
                        paddingHorizontal:10,
                        paddingVertical:4
                      }}>
                        <Text style={{color:item.cancelamentoEmCimaDaHora ? "#fecaca" : "#e5e7eb",fontSize:11,fontWeight:"bold"}}>
                            {item.cancelamentoEmCimaDaHora ? tt("canceladoEmCimaDaHora", "Cancelado em cima da hora") : tt("viagemCancelada", "Viagem cancelada")}
                        </Text>
                      </View>
                      {!!item.motivoCancelamento && (
                        <Text style={{color:"#fca5a5",fontSize:12,marginTop:6}} numberOfLines={2}>
                            {tt("motivo", "Motivo")}: {item.motivoCancelamento}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={{flexDirection:"row", alignItems:"center", marginBottom:6}}>
                    <View style={{
                      width:26,
                      height:26,
                      borderRadius:13,
                      alignItems:"center",
                      justifyContent:"center",
                      marginRight:8,
                      backgroundColor:"#0f172a",
                      borderWidth:1,
                      borderColor:"#22d3ee"
                    }}>
                      <MaterialCommunityIcons
                        name={String(item.tipo).includes("carona") ? "seat-passenger" : "cube-send"}
                        size={15}
                        color="#22d3ee"
                      />
                    </View>
                    <Text style={{color:"#fff",fontSize:16,fontWeight:"bold"}}>{item.nomeOuDescricao}</Text>
                  </View>

                  <Text style={{color:"#aaa",marginTop:2}}>
                    {item.tipo==="carona_oferecida"
                      ? `🪑 ${minVagasDisponiveisLocal(item)} ${tt("de", "de")} ${item.quantidadePessoas} ${tt("vagasLivres", "vaga(s) livre(s)")}`
                      : item.tipo==="carona_solicitada"
                        ? item.quantidadePessoas+" "+tt("pessoas", "pessoas")
                        : tt("solicitarEntrega", "Solicitar entrega")}
                  </Text>

                  {!!textoDataOferta(item) && (
                    <Text style={{color:"#93c5fd",marginTop:2}}>
                      {tt("dataCombinada", "Data combinada")}: {textoDataOferta(item)}
                    </Text>
                  )}

                  <Text style={{color:"#16a34a",marginTop:4,fontWeight:"bold"}}>R$ {item.valor}</Text>

                  {!!String(item?.aceitaPor || "").trim() && (
                    <TouchableOpacity
                      onPress={()=>openProfile && openProfile(item?.aceitaPor, item)}
                      style={{
                        marginTop:8,
                        alignSelf:"flex-start",
                        backgroundColor:"#14532d",
                        borderWidth:1,
                        borderColor:"#22c55e",
                        borderRadius:999,
                        paddingHorizontal:10,
                        paddingVertical:6,
                        flexDirection:"row",
                        alignItems:"center"
                      }}
                    >
                      <MaterialCommunityIcons name="account-check" size={14} color="#86efac" style={{marginRight:6}}/>
                      <Text style={{color:"#dcfce7",fontSize:12,fontWeight:"700"}}>
                        {String(item?.aceitaPorNome || item?.nomesSolicitantes?.[String(item?.aceitaPor)] || item?.aceitaPor)}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={{flexDirection:"row", alignItems:"center", marginTop:4}}>
                    <MaterialCommunityIcons
                      name={String(item?.tipo || "").includes("entrega") ? "cube-send" : "seat-passenger"}
                      size={14}
                      color="#22d3ee"
                      style={{marginRight:4}}
                    />
                    <MaterialCommunityIcons name="map-marker" size={14} color="#aaa" style={{marginRight:4}}/>
                    <Text style={{color:"#aaa", flex:1}} numberOfLines={1}>{item.origem?.endereco}</Text>
                  </View>
                  <View style={{flexDirection:"row", alignItems:"center", marginTop:2}}>
                    <MaterialCommunityIcons
                      name={String(item?.tipo || "").includes("entrega") ? "cube-send" : "seat-passenger"}
                      size={14}
                      color="#22d3ee"
                      style={{marginRight:4}}
                    />
                    <MaterialCommunityIcons name="map-marker-check" size={14} color="#aaa" style={{marginRight:4}}/>
                    <Text style={{color:"#aaa", flex:1}} numberOfLines={1}>{item.destino?.endereco}</Text>
                  </View>

                  {pendentes.length > 0 && (
                    <View style={{backgroundColor:"#1a1500",padding:8,borderRadius:8,marginTop:8}}>
                      <Text style={{color:"#f59e0b",fontWeight:"bold",marginBottom:6}}>
                        {tt("reservasPendentes", "Reservas pendentes")} ({pendentes.length})
                      </Text>
                      {pendentes.map((r:any)=>(
                        <View key={r.id} style={{backgroundColor:"#181818",padding:8,borderRadius:8,marginBottom:6}}>
                          <Text style={{color:"#cbd5e1",fontSize:12}}>{String(r?.passageiroNome || r?.passageiroId)} • {r.quantidade} vaga(s)</Text>
                          <Text style={{color:"#7dd3fc",fontSize:12}}>{r.embarcaLabel?.split(",")[0]} → {r.desembarcaLabel?.split(",")[0]}</Text>
                          {!!r.valorTrechoTotal && (
                            <Text style={{color:"#86efac",fontSize:12}}>R$ {Number(r.valorTrechoTotal).toFixed(2)}</Text>
                          )}
                          <View style={{flexDirection:"row",marginTop:6}}>
                            <TouchableOpacity
                              onPress={()=>responderReserva && responderReserva(item, r.id, 'confirmada')}
                              style={{flex:1,backgroundColor:"#16a34a",padding:8,borderRadius:6,marginRight:6,alignItems:"center"}}
                            >
                              <Text style={{color:"#fff",fontWeight:"bold",fontSize:12}}>{tt("confirmar", "Confirmar")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={()=>responderReserva && responderReserva(item, r.id, 'cancelada')}
                              style={{flex:1,backgroundColor:"#dc2626",padding:8,borderRadius:6,alignItems:"center"}}
                            >
                              <Text style={{color:"#fff",fontWeight:"bold",fontSize:12}}>{tt("rejeitar", "Rejeitar")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{flexDirection:"row",marginTop:10}}>
                    <TouchableOpacity
                      onPress={async ()=>{
                        if(openRoute){
                          openRoute(item)
                          return
                        }
                        if(!item?.origem?.lat) return
                        setOfertaSelecionada(item)
                        buscarRotaORS(
                          {lat:item.origem.lat,lng:item.origem.lng},
                          {lat:item.destino.lat,lng:item.destino.lng}
                        )
                        setRotaVisivel(true)
                      }}
                      style={{
                        backgroundColor:"#1e3a5f",
                        padding:12,
                        borderRadius:10,
                        marginRight:10,
                        flex:1,
                        flexDirection:"row",
                        alignItems:"center",
                        justifyContent:"center"
                      }}
                    >
                      <MaterialCommunityIcons name="map-marker-path" size={18} color="#00E5FF" style={{marginRight:6}}/>
                      <Text style={{color:"#00E5FF",textAlign:"center",fontWeight:"bold"}}>{tt("verRota", "Ver Rota")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={()=>{
                        if(editarOferta){
                          editarOferta(item)
                          return
                        }
                        setOfertaSelecionada(item)
                      }}
                      style={{
                        backgroundColor:"#2d1a00",
                        padding:12,
                        borderRadius:10,
                        flex:1,
                        flexDirection:"row",
                        alignItems:"center",
                        justifyContent:"center"
                      }}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#f59e0b" style={{marginRight:6}}/>
                      <Text style={{color:"#f59e0b",textAlign:"center",fontWeight:"bold"}}>{tt("editar", "Editar")}</Text>
                    </TouchableOpacity>

                    {podeExcluirOferta && (
                      <TouchableOpacity
                        onPress={()=>excluirOferta && excluirOferta(item)}
                        style={{
                          backgroundColor:"#450a0a",
                          padding:12,
                          borderRadius:10,
                          flex:1,
                          marginLeft:10,
                          flexDirection:"row",
                          alignItems:"center",
                          justifyContent:"center"
                        }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fca5a5" style={{marginRight:6}}/>
                        <Text style={{color:"#fca5a5",textAlign:"center",fontWeight:"bold"}}>{tt("excluir", "Excluir")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {((String(item?.tipo || "") === "carona_oferecida" && String(item?.criadorId || "") === String(usuarioId)) ||
                    (String(item?.tipo || "") !== "carona_oferecida" && String(item?.aceitaPor || "") === String(usuarioId))) &&
                    (item.status === "aceita" || item.status === "em_andamento") && (
                    <View style={{flexDirection:"row",marginTop:10}}>
                      {item.status === "aceita" && (
                        <TouchableOpacity
                          onPress={()=>iniciarViagem && iniciarViagem(item)}
                          style={{
                            backgroundColor:"#0f766e",
                            padding:12,
                            borderRadius:10,
                            flex:1,
                            marginRight:10,
                            alignItems:"center",
                            flexDirection:"row",
                            justifyContent:"center"
                          }}
                        >
                          <MaterialCommunityIcons name="rocket-launch-outline" size={18} color="#99f6e4" style={{marginRight:8}}/>
                          <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("iniciarViagem", "Iniciar viagem")}</Text>
                        </TouchableOpacity>
                      )}

                      {item.status === "em_andamento" && (
                        <TouchableOpacity
                          onPress={()=>confirmarFinalizacaoViagem && confirmarFinalizacaoViagem(item)}
                          style={{
                            backgroundColor:"#b91c1c",
                            padding:12,
                            borderRadius:10,
                            flex:1,
                            alignItems:"center",
                            flexDirection:"row",
                            justifyContent:"center"
                          }}
                        >
                          <MaterialCommunityIcons name="flag-checkered" size={18} color="#fecaca" style={{marginRight:8}}/>
                          <Text style={{color:"#fff",fontWeight:"bold"}}>{tt("encerrarViagem", "Encerrar viagem")}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}