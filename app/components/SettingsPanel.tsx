import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";


type Props = {
  visivel:boolean;
  fechar:()=>void;
  trocarIdioma:(id:"pt"|"en")=>void;
  modoInsano:boolean;
  setModoInsano:(v:boolean)=>void;
  modoPro:boolean;
  somPolicia:boolean;
setSomPolicia:(v:boolean)=>void;

somRadar:boolean;
setSomRadar:(v:boolean)=>void;
  textos:any;   // ← ADICIONE ESTA LINHA
};
export default function SettingsPanel({
  visivel,
  fechar,
  trocarIdioma,
  modoInsano,
  setModoInsano,
  modoPro,
  somPolicia,
  setSomPolicia,
  somRadar,
  setSomRadar,
  textos
}:Props){
if(!visivel) return null;

return(
<View style={{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  bottom:0,
  backgroundColor:"#111",
  zIndex:99999,
}}>

<ScrollView style={{flex:1, paddingTop:70, paddingHorizontal:20}}>

{/* FECHAR */}
<TouchableOpacity
onPress={fechar}
style={{
  position:"absolute",
  top:35,
  right:20,
  zIndex:10
}}>
<Text style={{color:"#fff",fontSize:26}}>✕</Text>
</TouchableOpacity>

<Text style={{
  color:"#fff",
  fontSize:26,
  fontWeight:"bold",
  marginBottom:30
}}>
⚙️ {textos.configuracoes}

</Text>

{/* ================= CONTA ================= */}

<Text style={{color:"#888", marginBottom:10}}>
Plano
</Text>

<View style={{
  backgroundColor:"#1c1c1c",
  padding:18,
  borderRadius:12,
  marginBottom:25
}}>
<Text style={{color:"#fff"}}>
Status: {modoPro ? "PRO Ativo" : "Free"}
</Text>
</View>

{/* ================= MODO INSANO ================= */}

<Text style={{color:"#888", marginBottom:10}}>
Modo Insano
</Text>

<TouchableOpacity
onPress={()=>setModoInsano(!modoInsano)}
style={{
  backgroundColor: modoInsano ? "#8B0000" : "#1c1c1c",
  padding:18,
  borderRadius:12,
  marginBottom:25
}}>
<Text style={{color:"#fff"}}>
{modoInsano ? "Desativar Insano 😈" : "Ativar Insano 😎"}
</Text>
</TouchableOpacity>

{/* ================= IDIOMA ================= */}

<Text style={{color:"#888", marginBottom:10}}>
{textos.idioma}

</Text>

<TouchableOpacity
onPress={()=>trocarIdioma("pt")}
style={{
  backgroundColor:"#1c1c1c",
  padding:18,
  borderRadius:12,
  marginBottom:12
}}>
<Text style={{color:"#fff"}}>
🇧🇷 Português
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>trocarIdioma("en")}
style={{
  backgroundColor:"#1c1c1c",
  padding:18,
  borderRadius:12,
  marginBottom:25
}}>
<Text style={{color:"#fff"}}>
🇺🇸 English
</Text>
</TouchableOpacity>
{/* ================= NAVEGAÇÃO ================= */}

<Text style={{color:"#888", marginTop:30, marginBottom:10}}>
Navegação
</Text>

<View style={{backgroundColor:"#1c1c1c", padding:18, borderRadius:12}}>

<TouchableOpacity
  onPress={()=>setModoInsano(!modoInsano)}
  style={{marginBottom:15}}
>
<Text style={{color:"#fff"}}>
{modoInsano ? "🔥 Modo Insano: ON" : "Modo Insano: OFF"}
</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setSomPolicia(!somPolicia)}
  style={{marginBottom:15}}
>
<Text style={{color:"#fff"}}>
{somPolicia ? "🚔 Som Polícia: ON" : "Som Polícia: OFF"}
</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={()=>setSomRadar(!somRadar)}
>
<Text style={{color:"#fff"}}>
{somRadar ? "📷 Som Radar: ON" : "Som Radar: OFF"}
</Text>
</TouchableOpacity>

</View>
{/* ================= SISTEMA ================= */}

<Text style={{color:"#888", marginBottom:10}}>
Sistema
</Text>

<View style={{
  backgroundColor:"#1c1c1c",
  padding:18,
  borderRadius:12,
  marginBottom:25
}}>
<Text style={{color:"#666"}}>
Versão 1.0.0
</Text>
</View>

<View style={{height:120}}/>

</ScrollView>
</View>
);
}
