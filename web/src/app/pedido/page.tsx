"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PedidoClientePage(){
  const params = useParams();
  const searchParams = useSearchParams();

  const id = String(params?.id || "");
  const token = String(searchParams.get("token") || "");

  const [carregando,setCarregando] = useState(true);
  const [erro,setErro] = useState("");
  const [pedido,setPedido] = useState<any>(null);

  useEffect(()=>{
    async function carregar(){
      try{
        if(!id || !token){
          setErro("Link inválido.");
          return;
        }

        const snap = await getDoc(doc(db,"ofertas",id));

        if(!snap.exists()){
          setErro("Pedido não encontrado.");
          return;
        }

        const dados:any = snap.data() || {};

        if(String(dados?.clienteFinalLinkToken || "") !== token){
          setErro("Token inválido.");
          return;
        }

        setPedido({id:snap.id,...dados});
      }catch(e){
        console.log("Erro ao carregar pedido:",e);
        setErro("Não foi possível carregar o pedido.");
      }finally{
        setCarregando(false);
      }
    }

    carregar();
  },[id,token]);

  if(carregando){
    return (
      <main style={{padding:30}}>
        <h1>Carregando pedido...</h1>
      </main>
    );
  }

  if(erro){
    return (
      <main style={{padding:30}}>
        <h1>Pedido indisponível</h1>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main style={{padding:24,maxWidth:720,margin:"0 auto"}}>
      <h1>🍕 {pedido?.nomeEstabelecimento || "INSANE GPS"}</h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        borderRadius:16,
        padding:18,
        marginTop:16
      }}>
        <h2>{pedido?.nomeOuDescricao || "Pedido"}</h2>

        <p><b>Cliente:</b> {pedido?.nomeCliente || "Cliente"}</p>
        <p><b>Destino:</b> {pedido?.destino?.endereco || "Não informado"}</p>
        <p><b>Status:</b> {pedido?.codigoEntregaConfirmado ? "Entregue" : "Em entrega"}</p>

        {!pedido?.codigoEntregaConfirmado && (
          <>
            <h2>Código da entrega</h2>
            <div style={{
              fontSize:42,
              fontWeight:900,
              letterSpacing:8,
              color:"#facc15",
              textAlign:"center"
            }}>
              {pedido?.codigoEntrega || "----"}
            </div>

            <p style={{textAlign:"center"}}>
              Informe este código somente quando receber o pedido.
            </p>
          </>
        )}
      </div>

      <div style={{
        background:"#111827",
        color:"#fff",
        borderRadius:16,
        padding:18,
        marginTop:16
      }}>
        <h2>Baixe o INSANE GPS</h2>
        <p>Peça entregas, caronas e acompanhe oportunidades pelo app.</p>
        <a
          href="https://insane-gps-web.onrender.com"
          style={{
            display:"inline-block",
            background:"#2563eb",
            color:"#fff",
            padding:"10px 14px",
            borderRadius:10,
            textDecoration:"none",
            fontWeight:700
          }}
        >
          Conhecer o app
        </a>
      </div>
    </main>
  );
}