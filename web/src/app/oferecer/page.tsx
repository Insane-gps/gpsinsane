"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import { db } from "@/lib/firebase";
import { carregarPlanoUsuario, premiumPodeCriarOferta } from "@/lib/plan";
import { calcularPrecoInteligente } from "@/lib/pricingEngine";
import type { PlanoUsuario, TipoOferta } from "@/lib/types";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type VeiculoPerfil = {
  marca?: string;
  modelo?: string;
  placa?: string;
};

const MAX_OBSERVACAO_CHARS = 280;

function maskDateInput(value: string) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTimeInput(value: string) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidDateBr(value: string) {
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return false;
  if (year < 2024 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year
    && candidate.getMonth() === (month - 1)
    && candidate.getDate() === day
  );
}

function isValidTime24(value: string) {
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isPastDateBr(value: string) {
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const selected = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return selected.getTime() < todayStart.getTime();
}

function isTodayDateBr(value: string) {
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const today = new Date();
  return (
    day === today.getDate()
    && month === (today.getMonth() + 1)
    && year === today.getFullYear()
  );
}

function isPastTimeToday(value: string) {
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  const now = new Date();
  const nowTotal = now.getHours() * 60 + now.getMinutes();
  const selectedTotal = hours * 60 + minutes;

  return selectedTotal < nowTotal;
}

function labelDataHorario(tipo: TipoOferta) {
  if (tipo === "entrega") {
    return {
      data: "Data da entrega",
      hora: "Horario da entrega (estimado)",
    };
  }

  if (tipo === "carona_solicitada") {
    return {
      data: "Data da carona",
      hora: "Horario desejado",
    };
  }

  return {
    data: "Data de saida",
    hora: "Horario de saida (estimado)",
  };
}

function textoMotoristaVeiculo(nome: string, veiculo?: VeiculoPerfil) {
  const nomeLimpo = String(nome || "").trim();
  const modelo = String(veiculo?.modelo || "").trim();
  const placa = String(veiculo?.placa || "").trim().toUpperCase();

  if (nomeLimpo && modelo && placa) return `${nomeLimpo} - ${modelo} (${placa})`;
  if (nomeLimpo && modelo) return `${nomeLimpo} - ${modelo}`;
  if (nomeLimpo && placa) return `${nomeLimpo} - ${placa}`;
  if (nomeLimpo) return nomeLimpo;
  if (modelo && placa) return `${modelo} (${placa})`;
  return modelo || placa;
}

function montarEndereco(partes: string[]) {
  return partes.map((p) => String(p || "").trim()).filter(Boolean).join(", ");
}
function separarEnderecoWeb(endereco:string) {
  const partes = String(endereco || "")
    .split(",")
    .map((p)=>p.trim())
    .filter(Boolean);

  return {
    rua: partes[0] || "",
    numero: partes[1] || "",
    bairro: partes[2] || "",
    cidade: partes[3] || "",
    estado: partes[4] || ""
  };
}

async function calcularRotaWeb(origem:{lat:number; lng:number}, destino:{lat:number; lng:number}) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=false`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const rota = data?.routes?.[0];

  if (!rota) return null;

  return {
    distanciaMetros: Number(rota.distance || 0),
    duracaoSegundos: Number(rota.duration || 0),
  };
}
async function geocodeAddress(query: string) {
  const q = String(query || "").trim();
  if (!q) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
    console.log("[GEOCODE_QUERY]", q);
    console.log("[GEOCODE_URL]", url);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const first = data?.[0];
    console.log("[GEOCODE_RESULT]", first ?? null);
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

export default function OferecerPage() {
  const router = useRouter();
const searchParams = useSearchParams();
const editarId = searchParams.get("editar");
const { t } = useWebI18n();
  const { user, loading } = useAuth();

  const [plano, setPlano] = useState<PlanoUsuario>("free");
  const [tipo, setTipo] = useState<TipoOferta>("carona_solicitada");
const [opcoesCaronaVisiveis, setOpcoesCaronaVisiveis] = useState(false);
const [modoPreco, setModoPreco] = useState<"compartilhado" | "direto">("compartilhado");
  const [nomePassageiro, setNomePassageiro] = useState("");
  const [descricaoObjeto, setDescricaoObjeto] = useState("");
  const [quantidadePessoas, setQuantidadePessoas] = useState(1);
const [tipoBagagem, setTipoBagagem] = useState<
  "sem_bagagem" |
  "mochila" |
  "mala_pequena" |
  "mala_media" |
  "mala_grande" |
  "caixa_pequena" |
  "caixa_media" |
  "caixa_grande" |
  "volume_grande"
>("sem_bagagem");
const [ruaOrigem, setRuaOrigem] = useState("");
  const [numeroOrigem, setNumeroOrigem] = useState("");
  const [bairroOrigem, setBairroOrigem] = useState("");
  const [cidadeOrigem, setCidadeOrigem] = useState("");
  const [estadoOrigem, setEstadoOrigem] = useState("");
  const [ruaDestino, setRuaDestino] = useState("");
  const [numeroDestino, setNumeroDestino] = useState("");
  const [bairroDestino, setBairroDestino] = useState("");
  const [cidadeDestino, setCidadeDestino] = useState("");
  const [estadoDestino, setEstadoDestino] = useState("");
  const [paradaTexto, setParadaTexto] = useState("");
  const [paradasSelecionadas, setParadasSelecionadas] = useState<string[]>([]);
  const [dataSaida, setDataSaida] = useState("");
  const [horarioSaida, setHorarioSaida] = useState("");
  const [observacaoOpcional, setObservacaoOpcional] = useState("");
  const [valorOferta, setValorOferta] = useState("");
  const [valorSugerido, setValorSugerido] = useState(0);
const [valorMinimo, setValorMinimo] = useState(0);
const [valorMaximo, setValorMaximo] = useState(0);
const [distanciaKm, setDistanciaKm] = useState(0);
const [tempoMin, setTempoMin] = useState(0);
const [fatoresPreco, setFatoresPreco] = useState({
  picoCalculado: 1,
  cidadeCalculada: 1,
  urgenciaCalculada: 1,
  premiumCalculado: 1,
  fatorVagasCalculado: 1,
  fatorPassageirosCalculado: 1,
});
  const [perfilNome, setPerfilNome] = useState("");
  const [perfilVeiculos, setPerfilVeiculos] = useState<VeiculoPerfil[]>([]);
  const [veiculoPerfilSelecionado, setVeiculoPerfilSelecionado] = useState(0);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPlanCards, setShowPlanCards] = useState(false);
  const [assinandoPlano, setAssinandoPlano] = useState<"pro" | "premium" | null>(null);

  useEffect(() => {
    if (!user) return;
    void carregarPlanoUsuario(user.uid).then(setPlano).catch(() => setPlano("free"));
  }, [user]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`perfil_${user.uid}`);
      const perfil = raw ? (JSON.parse(raw) as { nome?: string; veiculos?: VeiculoPerfil[] }) : null;
      const nome = String(perfil?.nome || "").trim();
      const veiculos = Array.isArray(perfil?.veiculos) ? perfil.veiculos : [];
      setPerfilNome(nome);
      setPerfilVeiculos(veiculos);
    } catch {
      setPerfilNome("");
      setPerfilVeiculos([]);
    }
  }, [user]);
  
  useEffect(() => {
  async function carregarOfertaParaEditar() {
    if (!editarId || !user?.uid) return;

    try {
      const snap = await getDoc(doc(db, "ofertas", editarId));

      if (!snap.exists()) {
        setErro("Oferta não encontrada para edição.");
        return;
      }

      const oferta:any = snap.data();

      if (String(oferta?.criadorId || "") !== String(user.uid || "")) {
        setErro("Você só pode editar ofertas criadas por você.");
        return;
      }

      setTipo(oferta?.tipo || "carona_solicitada");
      setModoPreco(oferta?.modoPreco || oferta?.modoCarona || "compartilhado");
      setTipoBagagem(oferta?.tipoBagagem || "sem_bagagem");
      setNomePassageiro(oferta?.tipo === "entrega" ? "" : String(oferta?.nomeOuDescricao || ""));
      setDescricaoObjeto(oferta?.tipo === "entrega" ? String(oferta?.nomeOuDescricao || "") : "");
      setQuantidadePessoas(Number(oferta?.quantidadePessoas || 1));
      setDataSaida(String(oferta?.dataSaida || ""));
      setHorarioSaida(String(oferta?.horarioSaida || ""));
      setObservacaoOpcional(String(oferta?.observacao || ""));
      setValorOferta(String(oferta?.valor || ""));

      const origemSeparada = separarEnderecoWeb(String(oferta?.origem?.endereco || ""));
const destinoSeparado = separarEnderecoWeb(String(oferta?.destino?.endereco || ""));

setRuaOrigem(origemSeparada.rua);
setNumeroOrigem(origemSeparada.numero);
setBairroOrigem(origemSeparada.bairro);
setCidadeOrigem(origemSeparada.cidade);
setEstadoOrigem(origemSeparada.estado);

setRuaDestino(destinoSeparado.rua);
setNumeroDestino(destinoSeparado.numero);
setBairroDestino(destinoSeparado.bairro);
setCidadeDestino(destinoSeparado.cidade);
setEstadoDestino(destinoSeparado.estado);

      setOpcoesCaronaVisiveis(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar oferta para edição.");
    }
  }

  void carregarOfertaParaEditar();
}, [editarId, user?.uid]);
  useEffect(() => {
    if (tipo === "carona_solicitada" && perfilNome && !nomePassageiro.trim()) {
      setNomePassageiro(perfilNome);
      return;
    }

    if (tipo === "carona_oferecida") {
      const veiculo = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0];
      const sugestao = textoMotoristaVeiculo(perfilNome, veiculo);
      if (sugestao && !nomePassageiro.trim()) {
        setNomePassageiro(sugestao);
      }
    }
  }, [tipo, perfilNome, perfilVeiculos, veiculoPerfilSelecionado, nomePassageiro]);

  useEffect(() => {
    if (!showPlanCards) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowPlanCards(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPlanCards]);
async function calcularPrecoAntesDoValorWeb() {
  try {
    const enderecoOrigemCompleto = montarEndereco([
      ruaOrigem,
      numeroOrigem,
      bairroOrigem,
      cidadeOrigem,
      estadoOrigem,
    ]);

    const enderecoDestinoCompleto = montarEndereco([
      ruaDestino,
      numeroDestino,
      bairroDestino,
      cidadeDestino,
      estadoDestino,
    ]);

    if (!ruaOrigem.trim() || !ruaDestino.trim()) return;

    async function geocodeFallback(completo: string, rua: string, numero: string, cidade: string, estado: string) {
      let coord = await geocodeAddress(completo);
      if (coord) return coord;

      coord = await geocodeAddress(montarEndereco([rua, numero, cidade, estado]));
      if (coord) return coord;

      return geocodeAddress(montarEndereco([rua, cidade, estado]));
    }

    const origemCoord = await geocodeFallback(enderecoOrigemCompleto, ruaOrigem, numeroOrigem, cidadeOrigem, estadoOrigem);
    const destinoCoord = await geocodeFallback(enderecoDestinoCompleto, ruaDestino, numeroDestino, cidadeDestino, estadoDestino);

    if (!origemCoord || !destinoCoord) return;

    const rota = await calcularRotaWeb(origemCoord, destinoCoord);

    const kmCalculadoFinal = Number(((rota?.distanciaMetros || 0) / 1000).toFixed(2));
    const minCalculadoFinal = Number(((rota?.duracaoSegundos || 0) / 60).toFixed(0));

    setDistanciaKm(kmCalculadoFinal);
    setTempoMin(minCalculadoFinal);

    const precoCalculado = calcularPrecoInteligente({
  km: kmCalculadoFinal,
  min: minCalculadoFinal,
  tipo,
  estado: estadoOrigem,
  dataSaida,
  horarioSaida,
  isPro: premiumPodeCriarOferta(plano),
  vagas: quantidadePessoas,
  modoPreco,
});
    setValorSugerido(precoCalculado.valorCalculado);
    setValorMinimo(precoCalculado.valorMinimoCalculado);
    setValorMaximo(precoCalculado.valorMaximoCalculado);
    setFatoresPreco({
  picoCalculado: precoCalculado.picoCalculado,
  cidadeCalculada: precoCalculado.cidadeCalculada,
  urgenciaCalculada: precoCalculado.urgenciaCalculada,
  premiumCalculado: precoCalculado.premiumCalculado,
  fatorVagasCalculado: precoCalculado.fatorVagasCalculado,
  fatorPassageirosCalculado: precoCalculado.fatorPassageirosCalculado,
});
  } catch (error) {
    console.log("Erro ao calcular preço web:", error);
  }
}
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setErro("Faca login para criar oferta.");
      setOk("");
      return;
    }

   if (!premiumPodeCriarOferta(plano) && tipo === "carona_oferecida") {
  setErro("Plano free/pro: para oferecer carona e ganhar dinheiro, ative Premium.");
  setShowPlanCards(true);
  return;
}

    const bagagemGrandeSelecionada =
  tipo !== "entrega" &&
  modoPreco !== "direto" &&
  (
    tipoBagagem === "mala_grande" ||
    tipoBagagem === "volume_grande"
  );

if (bagagemGrandeSelecionada) {
  const continuar = window.confirm(
    "Bagagens grandes costumam ser mais confortáveis em uma viagem Exclusiva. Mesmo assim, você pode criar a oferta compartilhada. O motorista decide se aceita ou não."
  );

  if (!continuar) return;
}

setSaving(true);
setErro("");
setOk("");

    try {
      if (!ruaOrigem.trim() || !ruaDestino.trim()) {
        setErro("Informe os enderecos de origem e destino.");
        return;
      }

      if (dataSaida.length !== 10) {
        setErro("Informe a data no formato DD/MM/AAAA.");
        return;
      }
      if (!isValidDateBr(dataSaida)) {
        setErro("Use uma data real no formato DD/MM/AAAA.");
        return;
      }
      if (isPastDateBr(dataSaida)) {
        setErro("A data nao pode ser anterior a hoje.");
        return;
      }
      if (horarioSaida.length !== 5) {
        setErro("Informe o horario no formato HH:MM.");
        return;
      }
      if (!isValidTime24(horarioSaida)) {
        setErro("Use um horario valido no formato 24h (HH:MM).");
        return;
      }
      if (isTodayDateBr(dataSaida) && isPastTimeToday(horarioSaida)) {
        setErro("Para hoje, o horario nao pode ser anterior ao horario atual.");
        return;
      }

      const enderecoOrigemCompleto = montarEndereco([
        ruaOrigem,
        numeroOrigem,
        bairroOrigem,
        cidadeOrigem,
        estadoOrigem,
      ]);

      const enderecoDestinoCompleto = montarEndereco([
        ruaDestino,
        numeroDestino,
        bairroDestino,
        cidadeDestino,
        estadoDestino,
      ]);

      async function geocodeFallback(completo: string, rua: string, numero: string, cidade: string, estado: string) {
        let coord = await geocodeAddress(completo);
        if (coord) return coord;

        coord = await geocodeAddress(montarEndereco([rua, numero, cidade, estado]));
        if (coord) return coord;

        return geocodeAddress(montarEndereco([rua, cidade, estado]));
      }

      const origemCoord = await geocodeFallback(enderecoOrigemCompleto, ruaOrigem, numeroOrigem, cidadeOrigem, estadoOrigem);
      const destinoCoord = await geocodeFallback(enderecoDestinoCompleto, ruaDestino, numeroDestino, cidadeDestino, estadoDestino);

      if (!origemCoord) {
        setErro("Nao foi possivel localizar o endereco de origem.");
        return;
      }
      if (!destinoCoord) {
        setErro("Nao foi possivel localizar o endereco de destino.");
        return;
      }
     const rota = await calcularRotaWeb(origemCoord, destinoCoord);

const kmCalculadoFinal = Number(((rota?.distanciaMetros || 0) / 1000).toFixed(2));
const minCalculadoFinal = Number(((rota?.duracaoSegundos || 0) / 60).toFixed(0));

setDistanciaKm(kmCalculadoFinal);
setTempoMin(minCalculadoFinal);

const precoCalculado = calcularPrecoInteligente({
  km: kmCalculadoFinal,
  min: minCalculadoFinal,
  tipo,
  estado: estadoOrigem,
  dataSaida,
  horarioSaida,
  isPro: premiumPodeCriarOferta(plano),
  vagas: quantidadePessoas,
  modoPreco,
});

setValorSugerido(precoCalculado.valorCalculado);
setValorMinimo(precoCalculado.valorMinimoCalculado);
setValorMaximo(precoCalculado.valorMaximoCalculado);
setFatoresPreco({
  picoCalculado: precoCalculado.picoCalculado,
  cidadeCalculada: precoCalculado.cidadeCalculada,
  urgenciaCalculada: precoCalculado.urgenciaCalculada,
  premiumCalculado: precoCalculado.premiumCalculado,
  fatorVagasCalculado: precoCalculado.fatorVagasCalculado,
  fatorPassageirosCalculado: precoCalculado.fatorPassageirosCalculado,
});
      const paradasConvertidas: Array<{ lat: number; lng: number; endereco: string }> = [];
      if (tipo === "carona_oferecida" && paradasSelecionadas.length > 0) {
        for (const parada of paradasSelecionadas) {
          const coord = await geocodeAddress(parada);
          if (coord) {
            paradasConvertidas.push({ lat: coord.lat, lng: coord.lng, endereco: parada });
          }
        }
      }

      const veiculoSelecionado = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0] || null;

const valorDigitado = Number(String(valorOferta || "").replace(",", "."));

const valorMinimoPermitido =
  modoPreco === "direto"
    ? Math.max(
        10,
        Number((precoCalculado.valorMinimoCalculado * 0.9).toFixed(2))
      )
    : 10;

if (
  Number.isFinite(valorDigitado) &&
  valorDigitado > 0 &&
  valorDigitado < valorMinimoPermitido
) {
  setErro(`O valor mínimo permitido é R$ ${valorMinimoPermitido.toFixed(2)}.`);
  return;
}

const dadosOferta = {
       tipo,
modoPreco,
modoCarona: modoPreco,
prioridadeMotoristasAte:
  modoPreco === "direto"
    ? Date.now() + 120000
    : null,
prioridadeMotoristasDirecao: modoPreco === "direto",
criadorId: user.uid,
        criadorNome: user.displayName || user.email || user.uid,
        criadoEm: Date.now(),
        nomeOuDescricao: tipo === "entrega" ? descricaoObjeto.trim() : nomePassageiro.trim(),
        quantidadePessoas: Number(quantidadePessoas || 0),
        origem: {
          lat: origemCoord.lat,
          lng: origemCoord.lng,
          endereco: enderecoOrigemCompleto,
        },
        destino: {
          lat: destinoCoord.lat,
          lng: destinoCoord.lng,
          endereco: enderecoDestinoCompleto,
        },
        paradas: paradasConvertidas,
        valor: Number.isFinite(valorDigitado) && valorDigitado > 0 ? valorDigitado : precoCalculado.valorCalculado,
valorManual: Number.isFinite(valorDigitado) && valorDigitado > 0 ? valorDigitado : null,
valorSugerido: precoCalculado.valorCalculado,
valorMinimoRecomendado: precoCalculado.valorMinimoCalculado,
valorMaximoRecomendado: precoCalculado.valorMaximoCalculado,
distanciaKm: kmCalculadoFinal,
tempoMin: minCalculadoFinal,
fatorPico: precoCalculado.picoCalculado,
fatorCidade: precoCalculado.cidadeCalculada,
fatorUrgencia: precoCalculado.urgenciaCalculada,
fatorPremium: precoCalculado.premiumCalculado,
fatorVagas: precoCalculado.fatorVagasCalculado,

tipoBagagem,

status: "ativa",
        dataSaida: String(dataSaida || "").trim() || null,
        horarioSaida: String(horarioSaida || "").trim() || null,
        veiculoModelo: tipo === "carona_oferecida" ? String(veiculoSelecionado?.modelo || "").trim() : "",
        veiculoPlaca: tipo === "carona_oferecida" ? String(veiculoSelecionado?.placa || "").trim().toUpperCase() : "",
        observacao: String(observacaoOpcional || "").trim(),
                reservas: [],
      };

      if (editarId) {
        await updateDoc(doc(db, "ofertas", editarId), dadosOferta);
      } else {
        await addDoc(collection(db, "ofertas"), dadosOferta);
      }

      const veiculoDefault = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0];
      setNomePassageiro(
        tipo === "carona_oferecida"
          ? textoMotoristaVeiculo(perfilNome, veiculoDefault)
          : tipo === "carona_solicitada"
            ? perfilNome
            : "",
      );
      setDescricaoObjeto("");
      setQuantidadePessoas(1);
      setRuaOrigem("");
      setNumeroOrigem("");
      setBairroOrigem("");
      setCidadeOrigem("");
      setEstadoOrigem("");
      setRuaDestino("");
      setNumeroDestino("");
      setBairroDestino("");
      setCidadeDestino("");
      setEstadoDestino("");
      setParadaTexto("");
      setParadasSelecionadas([]);
      setDataSaida("");
      setHorarioSaida("");
      setObservacaoOpcional("");
setValorOferta("");
setTipoBagagem("sem_bagagem");

setOk(editarId ? "Alterações salvas com sucesso." : "Oferta criada com sucesso.");
      setTimeout(() => router.push("/procurar"), 900);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao criar oferta");
    } finally {
      setSaving(false);
    }
  }

  async function iniciarCheckout(planoEscolhido: "pro" | "premium") {
    if (!user?.uid) {
      setErro("Faca login para assinar um plano.");
      return;
    }

    setErro("");
    setOk("");
    setAssinandoPlano(planoEscolhido);

    try {
      const idToken = await user.getIdToken();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          plano: planoEscolhido,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { initPoint?: string; error?: string };

      if (!response.ok || !data?.initPoint) {
        throw new Error(String(data?.error || "Falha ao iniciar checkout"));
      }

      window.location.href = data.initPoint;
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao abrir checkout");
    } finally {
      setAssinandoPlano(null);
    }
  }

  if (loading) return <section className="sectionPane">{t.loadingSession}</section>;

  return (
    <section className="sectionPane neoPane offerPage">
      <h1>{t.oferecer}</h1>
      <p className="muted">{t.offerPageSubtitle}</p>

      {!user && (
        <p className="noticeLine">
          Faca login para publicar. O formulario permanece visivel para voce revisar todos os campos da aba ofertar.
        </p>
      )}

      <form
  className="formGrid"
  onSubmit={onSubmit}
  onKeyDown={(event) => {
    if (event.key !== "Enter") return;

    const alvo = event.target as HTMLElement;
    if (alvo.tagName === "TEXTAREA") return;

    event.preventDefault();

    const campos = Array.from(
      event.currentTarget.querySelectorAll("input, textarea, button")
    ) as HTMLElement[];

    const indexAtual = campos.indexOf(alvo);
    const proximo = campos[indexAtual + 1];

    if (proximo) proximo.focus();
  }}
>
        <p className="noticeLine">Aviso legal: esta plataforma conecta usuarios. Transacoes e combinacoes sao responsabilidade das partes.</p>

        <div className="typeSelector">
          <button
  type="button"
  className={`typeBtn ${tipo === "carona_solicitada" ? "active blue" : ""}`}
  onClick={() => {
    setTipo("carona_solicitada");
    setOpcoesCaronaVisiveis(true);
  }}
>
  Solicitar carona
</button>
          <button
            type="button"
            className={`typeBtn ${tipo === "carona_oferecida" ? "active cyan" : ""}`}
            onClick={() => {
              if (!premiumPodeCriarOferta(plano)) {
                setErro("Plano free/pro: para oferecer carona e ganhar dinheiro, ative Premium.");
                setShowPlanCards(true);
                return;
              }
              setTipo("carona_oferecida");
              setShowPlanCards(false);
            }}
          >
            Ofertar carona {!premiumPodeCriarOferta(plano) ? "- PREMIUM" : ""}
          </button>
          <button
  type="button"
  className={`typeBtn ${tipo === "entrega" ? "active orange" : ""}`}
  onClick={() => {
    setTipo("entrega");
    setModoPreco("compartilhado");
    setTipoBagagem("caixa_pequena");
  }}
>
  Solicitar entrega
</button>
        </div>

        {!premiumPodeCriarOferta(plano) && (
  <p className="muted">
    Plano free/pro: pode solicitar carona e entrega. Para oferecer carona e ganhar dinheiro, ative Premium.
  </p>
)}

        <label>
          {tipo === "entrega" ? "Objeto para entrega" : tipo === "carona_oferecida" ? "Motorista / veiculo" : "Nome do passageiro"}
          <input
            value={tipo === "entrega" ? descricaoObjeto : nomePassageiro}
            onChange={(e) => {
              if (tipo === "entrega") setDescricaoObjeto(e.target.value);
              else setNomePassageiro(e.target.value);
            }}
            placeholder={tipo === "entrega" ? "Ex: Caixa media, 10kg" : tipo === "carona_oferecida" ? "Ex: Carlos - Sedan prata" : "Ex: John Smith"}
            required
          />
        </label>

        {tipo === "carona_oferecida" && perfilVeiculos.length > 0 && (
          <div>
            <p className="muted">Veiculos salvos no perfil</p>
            <div className="chipGroup">
              {perfilVeiculos.map((item, index) => {
                const ativo = veiculoPerfilSelecionado === index;
                const modeloLabel = String(item?.modelo || item?.marca || "Veiculo").trim();
                const placaLabel = String(item?.placa || "").trim().toUpperCase();
                return (
                  <button
                    type="button"
                    key={`${modeloLabel}-${placaLabel}-${index}`}
                    className={`chipBtn ${ativo ? "active" : ""}`}
                    onClick={() => {
                      setVeiculoPerfilSelecionado(index);
                      setNomePassageiro(textoMotoristaVeiculo(perfilNome, item));
                    }}
                  >
                    {modeloLabel}{placaLabel ? ` - ${placaLabel}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}
          {tipo !== "entrega" &&
 (tipo === "carona_oferecida" || (tipo === "carona_solicitada" && opcoesCaronaVisiveis)) && (
  <div>
    <p className="muted">Modo da viagem</p>

    <div className="qtyRow">
      <button
  type="button"
  className={`qtyBtn ${modoPreco === "compartilhado" ? "active" : ""}`}
  onClick={() => {
    setTipo("carona_solicitada");
    setModoPreco("compartilhado");
    setQuantidadePessoas(1);
    setTipoBagagem("sem_bagagem");
    setOpcoesCaronaVisiveis(true);
    void calcularPrecoAntesDoValorWeb();
  }}
>
  Compartilhada
</button>

     <button
  type="button"
  className={`qtyBtn ${modoPreco === "direto" ? "active" : ""}`}
  onClick={() => {
    setTipo("carona_solicitada");
    setModoPreco("direto");
    setQuantidadePessoas(1);
    setTipoBagagem("sem_bagagem");
    setOpcoesCaronaVisiveis(true);
    void calcularPrecoAntesDoValorWeb();
  }}
>
  Exclusiva
</button>
    </div>

    <p className="muted">
  {modoPreco === "compartilhado"
    ? "💺 Menor custo, podendo dividir a viagem."
    : "🚗 Viagem só para você."}
</p>
  </div>
)}
        {tipo !== "entrega" && !!perfilNome && (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              if (tipo === "carona_oferecida") {
                const item = perfilVeiculos[veiculoPerfilSelecionado] || perfilVeiculos[0];
                setNomePassageiro(textoMotoristaVeiculo(perfilNome, item));
                return;
              }
              setNomePassageiro(perfilNome);
            }}
          >
            Usar dados salvos do perfil
          </button>
        )}

        {tipo !== "entrega" && modoPreco !== "direto" && (
  <div>
    <p className="muted">{tipo === "carona_oferecida" ? "Vagas disponiveis" : "Quantidade de pessoas"}</p>
    <div className="qtyRow">
              {[1, 2, 3, 4].map((q) => (
                <button type="button" key={q} className={`qtyBtn ${quantidadePessoas === q ? "active" : ""}`} onClick={() => setQuantidadePessoas(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {tipo !== "entrega" && modoPreco !== "direto" && (
  <div>
    <p className="muted">Bagagem</p>

    <div className="qtyRow">
     {([
  ["sem_bagagem","Sem bagagem"],
  ["mochila","Mochila"],
  ["mala_pequena","Mala pequena"],
  ["mala_media","Mala média"],
  ["mala_grande","Mala grande"]
] as const).map(([valor,texto])=>(
  <button
    type="button"
    key={valor}
    className={`qtyBtn ${tipoBagagem===valor ? "active" : ""}`}
    onClick={()=>setTipoBagagem(valor)}
  >
    {texto}
  </button>
))}
    </div>
  </div>
)}
{tipo === "entrega" && (
  <div>
    <p className="muted">Volume da entrega</p>

    <div className="qtyRow">
      {([
        ["caixa_pequena","Caixa pequena"],
        ["caixa_media","Caixa média"],
        ["caixa_grande","Caixa grande"],
        ["volume_grande","Volume grande"]
      ] as const).map(([valor,texto])=>(
        <button
          type="button"
          key={valor}
          className={`qtyBtn ${tipoBagagem===valor ? "active" : ""}`}
          onClick={()=>setTipoBagagem(valor)}
        >
          {texto}
        </button>
      ))}
    </div>
  </div>
)}
        <div className="addrGrid">
          <div>
            <p className="muted">{tipo === "entrega" ? "Endereco de retirada" : tipo === "carona_oferecida" ? "Endereco de saida" : "Endereco de embarque"}</p>
            <input value={ruaOrigem} onChange={(e) => setRuaOrigem(e.target.value)} placeholder="Rua" required />
            <input value={numeroOrigem} onChange={(e) => setNumeroOrigem(e.target.value)} placeholder="Numero" />
            <input value={bairroOrigem} onChange={(e) => setBairroOrigem(e.target.value)} placeholder="Bairro" />
            <div className="miniCols">
              <input value={cidadeOrigem} onChange={(e) => setCidadeOrigem(e.target.value)} placeholder="Cidade" />
              <input value={estadoOrigem} onChange={(e) => setEstadoOrigem(e.target.value)} placeholder="UF" />
            </div>
          </div>

          <div>
            <p className="muted">{tipo === "entrega" ? "Endereco de entrega" : tipo === "carona_solicitada" ? "Endereco de desembarque" : "Endereco de destino"}</p>
            <input value={ruaDestino} onChange={(e) => setRuaDestino(e.target.value)} placeholder="Rua" required />
            <input value={numeroDestino} onChange={(e) => setNumeroDestino(e.target.value)} placeholder="Numero" />
            <input value={bairroDestino} onChange={(e) => setBairroDestino(e.target.value)} placeholder="Bairro" />
            <div className="miniCols">
              <input value={cidadeDestino} onChange={(e) => setCidadeDestino(e.target.value)} placeholder="Cidade" />
              <input value={estadoDestino} onChange={(e) => setEstadoDestino(e.target.value)} placeholder="UF" />
            </div>
          </div>
        </div>

        <div className="miniCols">
          <label>
            {labelDataHorario(tipo).data}
            <input value={dataSaida} onChange={(e) => setDataSaida(maskDateInput(e.target.value))} placeholder="DD/MM/AAAA" maxLength={10} />
          </label>
          <label>
            {labelDataHorario(tipo).hora}
            <input value={horarioSaida} onChange={(e) => setHorarioSaida(maskTimeInput(e.target.value))} placeholder="HH:MM" maxLength={5} />
          </label>
        </div>

        {tipo === "carona_oferecida" && (
          <div>
            <p className="muted">Paradas intermediarias</p>
            <p className="muted">Depois de definir saida e destino, adicione cidades ou bairros para parada.</p>
            <div className="paradaRow">
              <input
                value={paradaTexto}
                onChange={(e) => setParadaTexto(e.target.value)}
                placeholder="Ex: Betim, MG"
                disabled={!ruaOrigem.trim() || !ruaDestino.trim()}
              />
              <button
                type="button"
                className="btnSecondary"
                onClick={() => {
                  if (!ruaOrigem.trim() || !ruaDestino.trim()) return;
                  const parada = paradaTexto.trim();
                  if (!parada) return;
                  setParadasSelecionadas((prev) => [...prev, parada]);
                  setParadaTexto("");
                }}
              >
                Adicionar
              </button>
            </div>
            <div className="paradaList">
              {paradasSelecionadas.map((parada, index) => (
                <div key={`${parada}-${index}`} className="paradaItem">
                  <span>{index + 1}. {parada}</span>
                  <button type="button" className="ghost" onClick={() => setParadasSelecionadas((prev) => prev.filter((_, i) => i !== index))}>Remover</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label>
          {tipo === "entrega" ? "Observacoes da entrega (opcional)" : "Observacoes para passageiro (opcional)"}
          <textarea
            value={observacaoOpcional}
            onChange={(e) => setObservacaoOpcional(String(e.target.value || "").slice(0, MAX_OBSERVACAO_CHARS))}
            placeholder={tipo === "entrega" ? "Ex: Entregar na portaria, interfone apto 23, pacote fragil." : "Ex: Saio no horario, parada apenas em pontos da rota principal."}
            rows={4}
            maxLength={MAX_OBSERVACAO_CHARS}
          />
          <span className="muted">{observacaoOpcional.length}/{MAX_OBSERVACAO_CHARS}</span>
        </label>
{valorSugerido > 0 && (
  <div className="noticeLine">
    <strong>Valor sugerido pelo INSANE GPS: R$ {valorSugerido.toFixed(2)}</strong>
    <br />
    Mínimo recomendado: R$ {valorMinimo.toFixed(2)}
    <br />
    Máximo recomendado: R$ {valorMaximo.toFixed(2)}
    <br />
    Distância: {distanciaKm.toFixed(1)} km • Tempo estimado: {tempoMin} min
  </div>
)}
        <label>
          Valor oferecido (R$)
          <input
  value={valorOferta}
  onFocus={() => {
    void calcularPrecoAntesDoValorWeb();
  }}
  onChange={(e) => setValorOferta(e.target.value)}
  placeholder="Ex: 25"
  inputMode="decimal"
/>
        </label>

        {erro && <p className="errorLine">{erro}</p>}
        {ok && <p className="okLine">{ok}</p>}

        <button disabled={saving || !user} className="btnPrimary" type="submit">
          {saving ? "Aguarde..." : editarId ? "Salvar alterações" : "Criar oferta"}
        </button>
      </form>

      {showPlanCards && !premiumPodeCriarOferta(plano) && (
        <div className="planModalOverlay" onClick={() => setShowPlanCards(false)}>
          <section className="planModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="planModalClose"
              aria-label="Fechar"
              onClick={() => setShowPlanCards(false)}
            >
              x
            </button>

            <header className="planModalHead">
              <h3>Escolha seu plano</h3>
              <p>Navegacao sem paciencia. Sem limites. Sem perda.</p>
              <span>Fase de lancamento</span>
            </header>

            <div className="planModalCards">
              <article className="planModalCard free">
                <strong>PREMIUM FREE</strong>
                <h4>R$0,00</h4>
                <small>fase de lancamento</small>
                <p>Acesso inicial para testar recursos premium por periodo promocional.</p>
                <ul>
                  <li>Teste de funcionalidades premium</li>
                  <li>Acesso limitado por tempo</li>
                  <li>Upgrade para PRO ou PREMIUM a qualquer momento</li>
                </ul>
                <button
                  type="button"
                  className="planCta free"
                  onClick={() => setErro("Simulacao web: selecione o plano no app mobile ou backend de pagamentos para ativar.")}
                >
                  ATIVAR PREMIUM FREE
                </button>
              </article>

              <article className="planModalCard pro">
                <strong>PRO</strong>
                <h4>R$9,90</h4>
                <small>por mes</small>
                <p>Modo insano</p>
                <ul>
                  <li>Xingamentos ate nivel 4</li>
                  <li>Nao pode dar carona nem fazer entrega</li>
                </ul>
                <button
                  type="button"
                  className="planCta pro"
                  disabled={assinandoPlano !== null}
                  onClick={() => {
                    void iniciarCheckout("pro");
                  }}
                >
                  {assinandoPlano === "pro" ? "ABRINDO CHECKOUT..." : "ASSINAR PRO"}
                </button>
              </article>

              <article className="planModalCard premium">
                <strong>PREMIUM</strong>
                <p className="premiumLead">Libere tudo. De carona, faca entregas e ganhe dinheiro.</p>
                <h4>R$49,90</h4>
                <small>por mes</small>
                <ul>
                  <li>Tudo do PRO liberado</li>
                  <li>Pode dar carona</li>
                  <li>Pode fazer entregas</li>
                  <li>Aceita oferta e ganha dinheiro</li>
                </ul>
                <button
                  type="button"
                  className="planCta premium"
                  disabled={assinandoPlano !== null}
                  onClick={() => {
                    void iniciarCheckout("premium");
                  }}
                >
                  {assinandoPlano === "premium" ? "ABRINDO CHECKOUT..." : "ASSINAR PREMIUM"}
                </button>
              </article>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
