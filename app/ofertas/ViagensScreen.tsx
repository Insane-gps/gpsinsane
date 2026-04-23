import React from "react"
import { Text, View } from "react-native"

type Props = {
  ofertas: any[]
  usuarioId: string
  textos?: any
}

export default function ViagensScreen({ ofertas, usuarioId, textos }: Props){

function textoDataOferta(oferta:any){
  const data = String(oferta?.dataSaida || "").trim();
  const hora = String(oferta?.horarioSaida || "").trim();
  if(!data && !hora) return "";
  return [data, hora].filter(Boolean).join(" • ");
}

const minhasOfertas = (ofertas || []).filter(o => o.criadorId === usuarioId || o.aceitoPor === usuarioId);

return(
<View style={{flex:1, backgroundColor:"#000", padding:20}}>
<Text style={{color:"#fff", fontSize:20, fontWeight:"bold", marginBottom:20}}>
{textos?.minhasViagens || "Minhas viagens"}
</Text>

{minhasOfertas.map((item, index) => (
  <View key={index} style={{backgroundColor:"#111", padding:15, borderRadius:10, marginBottom:10}}>
    <Text style={{color:"#fff"}}>{item.nomeOuDescricao}</Text>
    <Text style={{color:"#aaa"}}>{textos?.status || "Status"}: {item.status}</Text>
    {!!textoDataOferta(item) && (
      <Text style={{color:"#93c5fd", marginTop:4}}>{textos?.dataCombinada || "Data combinada"}: {textoDataOferta(item)}</Text>
    )}
  </View>
))}

</View>
)

}