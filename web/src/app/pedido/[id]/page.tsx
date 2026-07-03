"use client";
export const dynamic = "force-dynamic";
import { useWebI18n } from "@/components/WebI18nProvider";
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
  const { t } = useWebI18n();
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
const [voltariaComprar,setVoltariaComprar] = useState<"sim" | "nao" | "">("");
const [enviando,setEnviando] = useState(false);
const [enviado,setEnviado] = useState(false);

  useEffect(()=>{
    let ativo = true;

    async function carregar(){
      setCarregando(true);
      setErro("");

      try{
        if(!id || !token){
          setErro(t.linkInvalid);
          return;
        }

        const snap = await getDoc(doc(db,"ofertas",id));

        if(!snap.exists()){
          setErro(t.orderNotFound);
          return;
        }

        const dados:any = snap.data() || {};
        const tokenCorreto = String(dados?.clienteFinalLinkToken || "");

        if(!tokenCorreto || tokenCorreto !== token){
          setErro(t.linkInvalidOrExpired);
          return;
        }

        if(ativo){
          setOferta({ id:snap.id, ...(dados as any) });
        }
      }catch(e){
        console.log("Erro ao carregar pedido:", e);
        if(ativo) setErro(t.loadOrderError);
      }finally{
        if(ativo) setCarregando(false);
      }
    }

    carregar();

    return ()=>{ ativo = false; };
  }, [id, token, t]);

  const entregue =
    String(oferta?.status || "") === "finalizada" ||
    !!(oferta as any)?.codigoEntregaConfirmado;

  const aceito =
    String((oferta as any)?.aceitoPor || (oferta as any)?.aceitaPor || "").trim().length > 0;

  const emAndamento =
    String(oferta?.status || "").toLowerCase() === "em_andamento" ||
    aceito;

  const titulo = useMemo(()=>{
    if(!oferta) return t.orderSummary;
    return String((oferta as any).nomeEstabelecimento || "INSANE GPS");
  }, [oferta, t.orderSummary]);

  async function enviarAvaliacao(){
    if(!oferta) return;

    if(notaEntregador <= 0 || notaEstabelecimento <= 0){
      alert(t.rateDriverAndStore);
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
voltariaComprar,
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
clienteFinalAvaliouEm:Date.now(),
clienteFinalVoltariaComprar:voltariaComprar
        },
        { merge:true }
      );

      setEnviado(true);
    }catch(e){
      console.log("Erro ao enviar avaliação:", e);
      alert(t.sendReviewError);
    }finally{
      setEnviando(false);
    }
  }

  if(carregando){
    return (
      <section className="pedidoPage">
        <div className="pedidoBox">
          <h1>{t.loadingOrder}</h1>
        </div>
      </section>
    );
  }

  if(erro){
    return (
      <section className="pedidoPage">
        <div className="pedidoBox">
          <h1>{t.orderUnavailable}</h1>
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
          <p>{t.orderTrackedDescription}</p>
        </div>

        <div className={entregue ? "pedidoBadge entregue" : "pedidoBadge"}>
          {entregue ? t.deliveredStatus : t.inDeliveryStatus}
        </div>
      </div>

      <div className="pedidoGrid">
        <div className="pedidoBox">
          <h2>{t.orderSummary}</h2>

          <div className="pedidoResumo">
            <strong>{oferta.nomeOuDescricao || t.orderSummary}</strong>
            <span>{(oferta as any).tipoEstabelecimento || t.deliveryRestaurant}</span>
          </div>

          <p><b>{t.customer}:</b> {(oferta as any).nomeCliente || t.customer}</p>
          <p><b>{t.restaurantPhone}:</b> {(oferta as any).telefoneCliente || t.notInformed}</p>
          <p><b>{t.offerDestination}:</b> {oferta.destino?.endereco || t.addressNotProvided}</p>
          <p><b>{t.valueLabel}:</b> {Number(oferta.valor || 0) > 0 ? `R$ ${Number(oferta.valor).toFixed(2)}` : t.toBeArranged}</p>
        </div>

        <div className="pedidoBox">
          <h2>{t.statusLabel}</h2>

          <div className="pedidoStatusLista">
            {statusLinha(true,t.orderCreatedStatus,"✅")}
            {statusLinha(aceito || emAndamento || entregue,t.driverAcceptedStatus,"🏍️")}
            {statusLinha(emAndamento || entregue,t.outForDeliveryStatus,"🚗")}
            {statusLinha(entregue,t.orderDeliveredStatus,"🎉")}
          </div>
        </div>
      </div>
        <div className="pedidoBox">
  <h2>{t.yourDriver}</h2>

  <div className="pedidoEntregador">
    <img
      src={String((oferta as any).entregadorFoto || "").trim() || "/avatar.png"}
      className="pedidoAvatar"
      alt={t.driver}
    />

    <div>
      <strong>{(oferta as any).entregadorNome || t.driver}</strong>
      <p>{(oferta as any).entregadorVeiculo || t.vehicleNotProvided}</p>
      <p>⭐ {Number((oferta as any).entregadorNotaMedia || 0).toFixed(1)}</p>
    </div>
  </div>
</div>
      {!entregue && (
        <div className="pedidoCodigoBox">
          <h2>{t.deliveryCode}</h2>

          <div className="pedidoCodigo">
            {String((oferta as any).codigoEntrega || "----")}
          </div>

          <p>
            {t.receiveCodeInstruction}
          </p>
        </div>
      )}

      {entregue && !enviado && (
        <div className="pedidoBox">
          <h2>{t.rateDriverAndStore}</h2>

          <label>{t.driverRating}</label>
          {estrelas(notaEntregador,setNotaEntregador)}

          <label>{t.restaurantRating}</label>
          {estrelas(notaEstabelecimento,setNotaEstabelecimento)}

          <div style={{marginTop:14,marginBottom:10}}>
  <label>{t.reviewWouldBuyAgain}</label>

  <div style={{display:"flex",gap:10,marginTop:8}}>
    <button
      type="button"
      onClick={()=>setVoltariaComprar("sim")}
      className={voltariaComprar === "sim" ? "pedidoBtnOpcao ativo" : "pedidoBtnOpcao"}
    >
      {t.answerYes}
    </button>

    <button
      type="button"
      onClick={()=>setVoltariaComprar("nao")}
      className={voltariaComprar === "nao" ? "pedidoBtnOpcao ativo" : "pedidoBtnOpcao"}
    >
      {t.answerNo}
    </button>
  </div>
</div>

<textarea
  value={comentario}
  onChange={(e)=>setComentario(e.target.value)}
  placeholder={t.optionalCommentLabel}
  className="pedidoTextarea"
/>

<button
            className="pedidoBtn"
            disabled={enviando}
            onClick={enviarAvaliacao}
          >
            {enviando ? `${t.wait}...` : t.sendReview}
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