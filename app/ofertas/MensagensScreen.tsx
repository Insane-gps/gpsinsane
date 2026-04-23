import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  usuarioId: string;
  ofertas: any[];
  conversas: any[]; // passed from root
  lidas?: Set<string>;
  textos?: any;
  setChatOferta: (v: any) => void;
  setChatVisivel: (v: boolean) => void;
  openChat?: (oferta:any)=>void;
  excluirConversa?: (oferta:any)=>void;
};

export default function MensagensScreen({
  usuarioId,
  ofertas,
  conversas,
  lidas,
  textos,
  setChatOferta,
  setChatVisivel,
  openChat,
  excluirConversa,
}: Props){
  // conversas is derived in root and passed down; it already contains
  // { oferta, lastMessage } objects filtered by current user.
const ignorarProximoPressRef = React.useRef(false);

function textoDataOferta(oferta:any){
  const data = String(oferta?.dataSaida || "").trim();
  const hora = String(oferta?.horarioSaida || "").trim();
  if(!data && !hora) return "";
  return [data, hora].filter(Boolean).join(" • ");
}


function obterResumoMensagem(msg:any){
  const tipo = String(msg?.tipo || "texto");
  const textoBruto = msg?.texto;
  const texto =
    typeof textoBruto === "string"
      ? textoBruto.trim()
      : (textoBruto && typeof textoBruto === "object"
          ? String(textoBruto?.texto || textoBruto?.mensagem || "").trim()
          : String(textoBruto || "").trim());

  if (tipo === "imagem") {
    return {
      icon: "image",
      texto: texto || (textos?.imagemEnviada || "Imagem enviada")
    };
  }

  if (tipo === "audio") {
    return {
      icon: "microphone",
      texto: texto || (textos?.audioEnviado || "Áudio enviado")
    };
  }

  if (tipo === "localizacao") {
    return {
      icon: "map-marker-radius",
      texto: texto || (textos?.localizacaoCompartilhada || "Localização compartilhada")
    };
  }

  return {
    icon: "message-text-outline",
    texto: texto || (textos?.mensagem || "Mensagem")
  };
}

function confirmarExclusaoConversa(oferta:any){
  if(!excluirConversa) return;

  Alert.alert(
    textos?.excluirConversaTitulo || "Excluir conversa",
    textos?.excluirConversaPergunta || "Deseja excluir esta conversa da sua lista?",
    [
      { text: textos?.cancelar || "Cancelar", style: "cancel" },
      {
        text: textos?.excluir || "Excluir",
        style: "destructive",
        onPress: ()=>excluirConversa(oferta)
      }
    ]
  );
}

return(

<View style={{
flex:1,
backgroundColor:"transparent",
padding:20
}}>

<Text style={{
color:"#f8fbff",
fontSize:32,
fontWeight:"bold",
marginBottom:20,
textShadowColor:"rgba(255,255,255,0.25)",
textShadowRadius:10
}}>
{textos?.conversas || "Conversas"} ({conversas.length})
</Text>

<View
  style={{
    flex:1,
    backgroundColor:"rgba(6,12,24,0.42)",
    borderWidth:1,
    borderColor:"rgba(108,197,255,0.2)",
    borderRadius:18,
    padding:12,
    shadowColor:"#38bdf8",
    shadowOpacity:0.08,
    shadowRadius:6,
    elevation:2
  }}
>

<View style={{
  position:"absolute",
  top:8,
  left:14,
  right:14,
  height:1,
  backgroundColor:"rgba(147,197,253,0.22)"
}}/>

<ScrollView
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled={true}
  keyboardDismissMode="on-drag"
  contentContainerStyle={{paddingBottom:24}}
  showsVerticalScrollIndicator={true}
>

{conversas.length === 0 && (
  <Text style={{color:"#777"}}>
    {textos?.nenhumaConversaAinda || "Nenhuma conversa ainda"}
  </Text>
)}

{conversas.map((c,index)=>{
  const oferta = c.oferta;
  const podeExcluirConversa = String(oferta?.status || "") === "finalizada";
  const msg = c.lastMessage;
  const resumo = obterResumoMensagem(msg);
  const ofertaId = oferta?.id;
  const unreadCount = Number(c?.unreadCount || 0);
  const lidoPorNormalizado = Array.isArray(msg?.lidoPor)
    ? msg.lidoPor.map((id:any)=>String(id))
    : [];
  const lastMessageUnread =
    !!msg &&
    String(msg?.autor || "") !== String(usuarioId) &&
    !lidoPorNormalizado.includes(String(usuarioId));
  const isUnread =
    !!ofertaId && (unreadCount > 0 || lastMessageUnread);
  const badgeToShow = unreadCount > 0 ? unreadCount : (lastMessageUnread ? 1 : 0);
  return (
    <TouchableOpacity
      key={oferta?.id || index}
      onPress={()=>{
        if(ignorarProximoPressRef.current){
          ignorarProximoPressRef.current = false;
          return;
        }

        if(openChat){
          openChat(oferta);
        } else {
          setChatOferta(oferta);
          setChatVisivel(true);
        }
      }}
      onLongPress={()=>{
        ignorarProximoPressRef.current = true;
        confirmarExclusaoConversa(oferta);
      }}
      delayLongPress={380}
      style={{
        backgroundColor: "rgba(14,22,38,0.34)",
        padding: 15,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(147, 197, 253, 0.14)",
        shadowColor: "#60a5fa",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
        opacity: isUnread ? 1 : 0.8
      }}
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{color: isUnread ? "#67e8f9" : "#d5def0", fontWeight: "bold", flex:1, fontSize: 18}}>
          {oferta?.nomeOuDescricao || (textos?.oferta || "Oferta")}
        </Text>
        {podeExcluirConversa && (
          <TouchableOpacity
            onPress={()=>confirmarExclusaoConversa(oferta)}
            style={{
              width:30,
              height:30,
              borderRadius:9,
              alignItems:"center",
              justifyContent:"center",
              marginLeft:8,
              borderWidth:1,
              borderColor:"rgba(248,113,113,0.35)",
              backgroundColor:"rgba(127,29,29,0.22)"
            }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fda4af" />
          </TouchableOpacity>
        )}
        {badgeToShow > 0 && (
          <View
            style={{
              backgroundColor: '#ff3b3b',
              borderRadius: 999,
              minWidth: 22,
              height: 22,
              marginLeft: 8,
              alignItems:"center",
              justifyContent:"center",
              paddingHorizontal:6,
              borderWidth:1,
              borderColor:"#ffd7d7"
            }}
          >
            <Text style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>
              {badgeToShow > 99 ? "99+" : badgeToShow}
            </Text>
          </View>
        )}
      </View>
      <View style={{flexDirection:'row', alignItems:'center', marginTop: 2}}>
        <MaterialCommunityIcons
          name={resumo.icon as any}
          size={14}
          color={isUnread ? "#67e8f9" : "#9da8bd"}
          style={{marginRight: 6}}
        />
        <Text style={{color: isUnread ? '#f6fbff' : "#9da8bd", fontSize: 15, flex:1}} numberOfLines={1}>
          {resumo.texto}
        </Text>
      </View>
      {!!textoDataOferta(oferta) && (
        <Text style={{color:'#93c5fd', fontSize:12, marginTop:6}} numberOfLines={1}>
          {textos?.dataCombinada || "Data combinada"}: {textoDataOferta(oferta)}
        </Text>
      )}
    </TouchableOpacity>
  );
})}

</ScrollView>

</View>

</View>

)

}