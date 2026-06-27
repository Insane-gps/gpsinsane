"use client";
export const dynamic = "force-dynamic";
import { db } from "@/lib/firebase";
import type { Oferta } from "@/lib/types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function estrelas(nota:number,setNota:(n:number)=>void){
  return (
    <div className="pedidoStars">
      {[1,2,3,4,5].map((n)=>(
        <button
          key={n}
          type="button"
          onClick={()=>setNota(n)}
          className={n <= nota ? "active" : ""}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function statusLinha(ativo:boolean, texto:string, icone:string){
  return (
    <div className={ativo ? "pedidoStatusItem ativo" : "pedidoStatusItem"}>
      <span>{icone}</span>
      <strong>{texto}</strong>
    </div>
  );
}

export default function PedidoClientePage(){
  const params = useParams();
  const searchParams = useSearchParams();

  const id = String((params as any)?.id || "");
const token = String(searchParams?.get("token") || "");

  const [carregando,setCarregando] = useState(true);
  const [erro,setErro] = useState("");
  const [oferta,setOferta] = useState<Oferta | null>(null);

  const [notaEntregador,setNotaEntregador] = useState(0);
  const [notaEstabelecimento,setNotaEstabelecimento] = useState(0);
  const [comentario,setComentario] = useState("");
  const [enviando,setEnviando] = useState(false);
  const [enviado,setEnviado] = useState(false);

  useEffect(()=>{
    let ativo = true;

    async function carregar(){
      setCarregando(true);
      setErro("");

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
        const tokenCorreto = String(dados?.clienteFinalLinkToken || "");

        if(!tokenCorreto || tokenCorreto !== token){
          setErro("Link inválido ou expirado.");
          return;
        }

        if(ativo){
          setOferta({ id:snap.id, ...(dados as any) });
        }
      }catch(e){
        console.log("Erro ao carregar pedido:", e);
        if(ativo) setErro("Não foi possível carregar o pedido.");
      }finally{
        if(ativo) setCarregando(false);
      }
    }

    carregar();

    return ()=>{ ativo = false; };
  }, [id, token]);

  const entregue =
    String(oferta?.status || "") === "finalizada" ||
    !!(oferta as any)?.codigoEntregaConfirmado;

  const aceito =
    String((oferta as any)?.aceitoPor || (oferta as any)?.aceitaPor || "").trim().length > 0;

  const emAndamento =
    String(oferta?.status || "").toLowerCase() === "em_andamento" ||
    aceito;

  const titulo = useMemo(()=>{
    if(!oferta) return "Pedido";
    return String((oferta as any).nomeEstabelecimento || "INSANE GPS");
  }, [oferta]);

  async function enviarAvaliacao(){
    if(!oferta) return;

    if(notaEntregador <= 0 || notaEstabelecimento <= 0){
      alert("Dê uma nota para o entregador e para o estabelecimento.");
      return;
    }

    setEnviando(true);

    try{
      const base = {
        ofertaId:oferta.id,
        pedido:String(oferta.nomeOuDescricao || ""),
        criadoEm:Date.now(),
        origem:"cliente_final_link",
        comentario:String(comentario || "").trim(),
        tokenUsado:token
      };

      await setDoc(
        doc(db,"avaliacoesUsuarios",`${oferta.id}_cliente_final_entregador`),
        {
          ...base,
          tipo:"entregador",
          avaliadoId:String((oferta as any).aceitoPor || (oferta as any).aceitaPor || ""),
          nota:notaEntregador
        },
        { merge:true }
      );

      await setDoc(
        doc(db,"avaliacoesUsuarios",`${oferta.id}_cliente_final_estabelecimento`),
        {
          ...base,
          tipo:"estabelecimento",
          avaliadoId:String(oferta.criadorId || ""),
          nota:notaEstabelecimento
        },
        { merge:true }
      );

      await setDoc(
        doc(db,"ofertas",oferta.id),
        {
          clienteFinalAvaliouEntregador:true,
          clienteFinalAvaliouEstabelecimento:true,
          clienteFinalAvaliouEm:Date.now()
        },
        { merge:true }
      );

      setEnviado(true);
    }catch(e){
      console.log("Erro ao enviar avaliação:", e);
      alert("Não foi possível enviar sua avaliação agora.");
    }finally{
      setEnviando(false);
    }
  }

  if(carregando){
    return (
      <section className="pedidoPage">
        <div className="pedidoBox">
          <h1>Carregando pedido...</h1>
        </div>
      </section>
    );
  }

  if(erro){
    return (
      <section className="pedidoPage">
        <div className="pedidoBox">
          <h1>Pedido indisponível</h1>
          <p>{erro}</p>
        </div>
      </section>
    );
  }

  if(!oferta) return null;

  return (
    <section className="pedidoPage">
      <div className="pedidoHero">
        <div>
          <span className="pedidoKicker">INSANE GPS DELIVERY</span>
          <h1>🍽 {titulo}</h1>
          <p>Seu pedido está sendo acompanhado pelo INSANE GPS.</p>
        </div>

        <div className={entregue ? "pedidoBadge entregue" : "pedidoBadge"}>
          {entregue ? "Entregue" : "Em entrega"}
        </div>
      </div>

      <div className="pedidoGrid">
        <div className="pedidoBox">
          <h2>Pedido</h2>

          <div className="pedidoResumo">
            <strong>{oferta.nomeOuDescricao || "Pedido"}</strong>
            <span>{(oferta as any).tipoEstabelecimento || "Restaurante"}</span>
          </div>

          <p><b>Cliente:</b> {(oferta as any).nomeCliente || "Cliente"}</p>
          <p><b>Telefone:</b> {(oferta as any).telefoneCliente || "Não informado"}</p>
          <p><b>Destino:</b> {oferta.destino?.endereco || "Endereço não informado"}</p>
          <p><b>Valor:</b> {Number(oferta.valor || 0) > 0 ? `R$ ${Number(oferta.valor).toFixed(2)}` : "A combinar"}</p>
        </div>

        <div className="pedidoBox">
          <h2>Status</h2>

          <div className="pedidoStatusLista">
            {statusLinha(true,"Pedido criado","✅")}
            {statusLinha(aceito || emAndamento || entregue,"Entregador aceitou","🏍️")}
            {statusLinha(emAndamento || entregue,"Saiu para entrega","🚗")}
            {statusLinha(entregue,"Pedido entregue","🎉")}
          </div>
        </div>
      </div>
        <div className="pedidoBox">
  <h2>Seu entregador</h2>

  <div className="pedidoEntregador">
    <img
      src={String((oferta as any).entregadorFoto || "").trim() || "/avatar.png"}
      className="pedidoAvatar"
      alt="Entregador"
    />

    <div>
      <strong>{(oferta as any).entregadorNome || "Entregador"}</strong>
      <p>{(oferta as any).entregadorVeiculo || "Veículo não informado"}</p>
      <p>⭐ {Number((oferta as any).entregadorNotaMedia || 0).toFixed(1)}</p>
    </div>
  </div>
</div>
      {!entregue && (
        <div className="pedidoCodigoBox">
          <h2>Código da entrega</h2>

          <div className="pedidoCodigo">
            {String((oferta as any).codigoEntrega || "----")}
          </div>

          <p>
            Informe este código somente quando receber o pedido.
          </p>
        </div>
      )}

      {entregue && !enviado && (
        <div className="pedidoBox">
          <h2>Avalie sua entrega</h2>

          <label>Como foi o entregador?</label>
          {estrelas(notaEntregador,setNotaEntregador)}

          <label>Como foi o estabelecimento?</label>
          {estrelas(notaEstabelecimento,setNotaEstabelecimento)}

          <textarea
            value={comentario}
            onChange={(e)=>setComentario(e.target.value)}
            placeholder="Comentário opcional"
            className="pedidoTextarea"
          />

          <button
            className="pedidoBtn"
            disabled={enviando}
            onClick={enviarAvaliacao}
          >
            {enviando ? "Enviando..." : "Enviar avaliação"}
          </button>
        </div>
      )}

      {enviado && (
        <div className="pedidoBox pedidoObrigado">
          <h2>Obrigado pela avaliação!</h2>
          <p>Sua opinião ajuda a melhorar as próximas entregas.</p>
        </div>
      )}

      <div className="pedidoBox pedidoDownload">
        <h2>Gostou da experiência?</h2>
        <p>Baixe o INSANE GPS para pedir entregas, caronas e acompanhar oportunidades.</p>
        <a href="https://insane-gps-web.onrender.com">Conhecer o app</a>
      </div>
    </section>
  );
}