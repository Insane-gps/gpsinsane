import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db, storage } from "../../firebase";
import {
    addDocWithLog as addDoc,
    getDocWithLog as getDoc,
    getDocsWithLog as getDocs,
    setDocWithLog as setDoc,
    updateDocWithLog as updateDoc,
} from "../../utils/firestoreDebug";

type Veiculo = {
  tipo: "carro" | "moto" | "van";
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
};

type PerfilData = {
  nome: string;
  foto: string;
  cidade: string;
  telefone: string;
  veiculos: Veiculo[];
};

type ContatoPerfil = {
  id: string;
  nome: string;
  foto: string;
  adicionadoEm: number;
};

type Props = {
  usuarioId: string;
  somenteLeitura?: boolean;
  onClose?: () => void;
  titulo?: string;
  currentUserId?: string;
  textos?: any;
};

const perfilVazio: PerfilData = {
  nome: "",
  foto: "",
  cidade: "",
  telefone: "",
  veiculos: []
};

const tiposVeiculo: Array<Veiculo["tipo"]> = ["carro", "moto", "van"];
const LIMITE_FOTO_DATA_URL = 450000;

function formatarDataHistorico(valor:any, semDataLabel: string) {
  const bruto = String(valor || "").trim();
  if (!bruto) return semDataLabel;

  const data = new Date(bruto);
  if (Number.isNaN(data.getTime())) return bruto;

  return data.toLocaleString("pt-BR");
}

export default function PerfilPainel({
  usuarioId,
  somenteLeitura = false,
  onClose,
  titulo,
  currentUserId,
  textos
}: Props) {
  const tp = (chave: string, fallback: string) => String(textos?.[chave] || fallback);

  const tipoVeiculoLabel = (tipo: Veiculo["tipo"]) => {
    if (tipo === "carro") return tp("carros", "Cars");
    if (tipo === "moto") return tp("motos", "Motorcycles");
    return tp("vans", "Vans");
  };

  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoTipo, setVeiculoTipo] = useState<Veiculo["tipo"]>("carro");
  const [veiculoMarca, setVeiculoMarca] = useState("");
  const [veiculoModelo, setVeiculoModelo] = useState("");
  const [veiculoAno, setVeiculoAno] = useState("");
  const [veiculoCor, setVeiculoCor] = useState("");
  const [veiculoPlaca, setVeiculoPlaca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [avaliacoesRecentes, setAvaliacoesRecentes] = useState<any[]>([]);
  const [avaliacaoExistenteId, setAvaliacaoExistenteId] = useState<string | null>(null);
  const [mostrarHistoricoCompleto, setMostrarHistoricoCompleto] = useState(false);
  const [contatoJaAdicionado, setContatoJaAdicionado] = useState(false);
  const [perfilDesbloqueado, setPerfilDesbloqueado] = useState(false);
  const [verificandoDesbloqueio, setVerificandoDesbloqueio] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      try {
        const salvo = await AsyncStorage.getItem(`perfil_${usuarioId}`);
        let perfil: PerfilData = salvo ? JSON.parse(salvo) : perfilVazio;

        // fallback/cross-device: tenta Firestore quando não há dados locais
        if(!salvo){
          try{
            const [snapUsuario, snapLegado] = await Promise.all([
              getDoc(doc(db, "usuarios", String(usuarioId))),
              getDoc(doc(db, "perfisUsuarios", String(usuarioId))),
            ]);
            const remoto:any = snapUsuario.exists()
              ? (snapUsuario.data() || {})
              : (snapLegado.exists() ? (snapLegado.data() || {}) : null);
            if(remoto){
              perfil = {
                nome: String(remoto?.nome || ""),
                foto: String(remoto?.foto || ""),
                cidade: String(remoto?.cidade || ""),
                telefone: String(remoto?.telefone || ""),
                veiculos: Array.isArray(remoto?.veiculos) ? remoto.veiculos : []
              };
              await AsyncStorage.setItem(`perfil_${usuarioId}`, JSON.stringify(perfil));
            }
          }catch(errRemoto){
            console.log("Erro ao carregar perfil remoto:", errRemoto);
          }
        }

        if (!ativo) {
          return;
        }

        setNome(perfil.nome || "");
        setFoto(perfil.foto || "");
        setCidade(perfil.cidade || "");
        setTelefone(perfil.telefone || "");
        setVeiculos(Array.isArray(perfil.veiculos) ? perfil.veiculos : []);
      } catch (e) {
        console.log("Erro ao carregar perfil:", e);
        if (ativo) {
          setNome("");
          setFoto("");
          setCidade("");
          setTelefone("");
          setVeiculos([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  useEffect(() => {
    let ativo = true;

    async function verificarContatoJaSalvo() {
      if (!currentUserId || String(currentUserId) === String(usuarioId)) {
        if (ativo) setContatoJaAdicionado(false);
        return;
      }

      try {
        const salvo = await AsyncStorage.getItem(`perfil_contatos_${currentUserId}`);
        const contatos: ContatoPerfil[] = salvo ? JSON.parse(salvo) : [];
        if (!ativo) return;
        setContatoJaAdicionado(
          Array.isArray(contatos) && contatos.some((c:any) => String(c?.id || '') === String(usuarioId))
        );
      } catch (error) {
        console.log('Erro ao verificar contato salvo:', error);
        if (ativo) setContatoJaAdicionado(false);
      }
    }

    verificarContatoJaSalvo();

    return () => {
      ativo = false;
    };
  }, [currentUserId, usuarioId]);

  useEffect(() => {
    let ativo = true;

    async function verificarDesbloqueio() {
      if (!somenteLeitura || !currentUserId || String(currentUserId) === String(usuarioId)) {
        if (ativo) setPerfilDesbloqueado(false);
        return;
      }
      setVerificandoDesbloqueio(true);
      try {
        const snapshot = await getDocs(collection(db, "ofertas"));
        const idA = String(currentUserId);
        const idB = String(usuarioId);
        const desbloqueado = snapshot.docs.some((docOferta) => {
          const o: any = docOferta.data();
          const criador = String(o?.criadorId || "");
          const aceito = String(o?.aceitaPor || "");
          // Oferta aceita diretamente entre os dois usuários
          if (
            (criador === idA && aceito === idB) ||
            (criador === idB && aceito === idA)
          ) return true;
          // Reserva confirmada entre os dois usuários
          if (Array.isArray(o?.reservas)) {
            return o.reservas.some((r: any) => {
              if (String(r?.status || "") !== "confirmada") return false;
              const passageiro = String(r?.passageiroId || "");
              return (
                (criador === idA && passageiro === idB) ||
                (criador === idB && passageiro === idA)
              );
            });
          }
          return false;
        });
        if (ativo) setPerfilDesbloqueado(desbloqueado);
      } catch (e) {
        console.log("Erro ao verificar desbloqueio de perfil:", e);
        if (ativo) setPerfilDesbloqueado(false);
      } finally {
        if (ativo) setVerificandoDesbloqueio(false);
      }
    }

    verificarDesbloqueio();

    return () => {
      ativo = false;
    };
  }, [somenteLeitura, currentUserId, usuarioId]);

  useEffect(() => {
    let ativo = true;

    async function carregarAvaliacoes() {
      try {
        const snapshot = await getDocs(collection(db, "avaliacoesUsuarios"));
        const avaliacoes = snapshot.docs
          .map((docAtual) => ({ id: docAtual.id, ...(docAtual.data() as any || {}) }))
          .filter((item:any) => String(item?.avaliadoId) === String(usuarioId));

        if (!ativo) return;

        const total = avaliacoes.length;
        const soma = avaliacoes.reduce((acc:number, item:any) => acc + Number(item?.nota || 0), 0);
        setTotalAvaliacoes(total);
        setMediaAvaliacoes(total > 0 ? soma / total : 0);
        setAvaliacoesRecentes(
          avaliacoes
            .sort((a:any, b:any) => String(b?.criadoEmCliente || "").localeCompare(String(a?.criadoEmCliente || "")))
        );

        if (currentUserId && currentUserId !== usuarioId) {
          const minhaAvaliacao:any = avaliacoes.find((item:any) => String(item?.avaliadorId) === String(currentUserId));
          setAvaliacaoExistenteId(minhaAvaliacao?.id ? String(minhaAvaliacao.id) : null);
          setNotaSelecionada(Number(minhaAvaliacao?.nota || 0));
          setComentarioAvaliacao(String(minhaAvaliacao?.comentario || ""));
        } else {
          setAvaliacaoExistenteId(null);
        }
      } catch (e) {
        console.log("Erro ao carregar avaliações:", e);
      }
    }

    carregarAvaliacoes();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  async function salvarPerfil() {
    const perfil: PerfilData = {
      nome,
      foto,
      cidade,
      telefone,
      veiculos
    };

    try {
      await AsyncStorage.setItem(`perfil_${usuarioId}`, JSON.stringify(perfil));
      const payload = {
        ...perfil,
        atualizadoEm: serverTimestamp(),
        atualizadoEmCliente: Date.now()
      };

      await Promise.all([
        setDoc(doc(db, "usuarios", String(usuarioId)), payload, { merge: true }),
        setDoc(doc(db, "perfisUsuarios", String(usuarioId)), payload, { merge: true }),
      ]);
      Alert.alert(tp("perfilSalvoTitulo", "Profile saved"), tp("perfilSalvoTexto", "This user's information has been updated."));
    } catch (e) {
      console.log("Erro ao salvar perfil:", e);
      Alert.alert(tp("erro", "Error"), tp("erroSalvarPerfilTexto", "Could not save profile right now."));
    }
  }

  async function persistirFotoPerfil(urlFoto: string) {
    try {
      const perfilAtualRaw = await AsyncStorage.getItem(`perfil_${usuarioId}`);
      const perfilAtual: PerfilData = perfilAtualRaw ? JSON.parse(perfilAtualRaw) : perfilVazio;
      const perfilAtualizado: PerfilData = {
        ...perfilAtual,
        nome,
        cidade,
        telefone,
        veiculos,
        foto: String(urlFoto || "").trim(),
      };

      await AsyncStorage.setItem(`perfil_${usuarioId}`, JSON.stringify(perfilAtualizado));

      const payload = {
        foto: String(urlFoto || "").trim(),
        atualizadoEm: serverTimestamp(),
        atualizadoEmCliente: Date.now(),
      };

      await Promise.all([
        setDoc(doc(db, "usuarios", String(usuarioId)), payload, { merge: true }),
        setDoc(doc(db, "perfisUsuarios", String(usuarioId)), payload, { merge: true }),
      ]);
    } catch (error) {
      console.log("Erro ao persistir foto de perfil:", error);
      throw error;
    }
  }

  async function removerFotoPerfil() {
    if (somenteLeitura) return;

    try {
      setEnviandoFoto(true);
      setFoto("");
      await persistirFotoPerfil("");
      Alert.alert(tp("fotoRemovida", "Foto removida"), tp("fotoRemovidaTexto", "Sua foto de perfil foi removida."));
    } catch (error) {
      console.log("Erro ao remover foto de perfil:", error);
      Alert.alert(tp("erro", "Error"), tp("erroRemoverFotoPerfil", "Nao foi possivel remover a foto de perfil agora."));
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function uploadFotoPerfil(uri: string, mimeType?: string, base64Data?: string | null) {
    const tipoMime = String(mimeType || "image/jpeg");
    const extensao = tipoMime.includes("png") ? "png" : tipoMime.includes("webp") ? "webp" : "jpg";
    const caminho = `perfil_fotos/${String(usuarioId || "anonimo")}/${Date.now()}.${extensao}`;
    const referencia = ref(storage, caminho);

    let base64Limpa = String(base64Data || "").trim();
    if (!base64Limpa) {
      // Em alguns Androids o ImagePicker nao retorna base64; le do arquivo diretamente.
      if (uri.startsWith("data:")) {
        const extraido = String(uri.match(/^data:.*?;base64,(.*)$/)?.[1] || "").trim();
        base64Limpa = extraido;
      }
    }

    if (!base64Limpa) {
      base64Limpa = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Limpa = String(base64Limpa || "").trim();
    }

    if (!base64Limpa) {
      throw new Error("PROFILE_PHOTO_BASE64_EMPTY");
    }

    const dataUrl = `data:${tipoMime};base64,${base64Limpa}`;
    console.log("[perfil-foto] upload via data_url", { caminho, mime: tipoMime, tam: dataUrl.length });
    try {
      await uploadString(referencia, dataUrl, "data_url", { contentType: tipoMime });
      const url = await getDownloadURL(referencia);
      return url;
    } catch (error:any) {
      const mensagem = String(error?.message || error || "");
      const ehFalhaBlobAndroid = mensagem.includes("Creating blobs from 'ArrayBuffer'") || mensagem.includes("ArrayBufferView");

      if (ehFalhaBlobAndroid) {
        console.log("[perfil-foto] fallback para data URL no perfil", { tam: dataUrl.length });
        if (dataUrl.length > LIMITE_FOTO_DATA_URL) {
          throw new Error("PROFILE_PHOTO_DATA_URL_TOO_LARGE");
        }
        return dataUrl;
      }

      throw error;
    }
  }

  async function escolherFotoPerfil(origem: "camera" | "galeria") {
    if (somenteLeitura) return;

    try {
      setEnviandoFoto(true);

      const permissao = origem === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissao.status !== "granted") {
        Alert.alert(
          tp("permissaoNecessaria", "Permissao necessaria"),
          origem === "camera"
            ? tp("permitaAcessoCamera", "Permita acesso a camera para tirar foto de perfil.")
            : tp("permitaAcessoGaleria", "Permita acesso a galeria para escolher foto de perfil.")
        );
        return;
      }

      const resultado = origem === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.32, allowsEditing: true, aspect: [1, 1], base64: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.32, allowsEditing: true, aspect: [1, 1], allowsMultipleSelection: false, base64: true });

      if (resultado.canceled) return;

      const asset = resultado.assets?.[0];
      if (!asset?.uri) {
        Alert.alert(tp("erro", "Error"), tp("erroProcessarFoto", "Nao foi possivel processar a foto selecionada."));
        return;
      }

      const url = await uploadFotoPerfil(
        String(asset.uri),
        String(asset.mimeType || "image/jpeg"),
        String((asset as any)?.base64 || "")
      );
      if (String(url || "").startsWith("data:") && String(url).length > LIMITE_FOTO_DATA_URL) {
        Alert.alert(tp("erro", "Error"), tp("fotoMuitoGrande", "A foto ficou muito grande. Tente outra imagem ou corte mais no centro."));
        return;
      }

      setFoto(url);
      await persistirFotoPerfil(url);

      Alert.alert(tp("fotoAtualizada", "Foto atualizada"), tp("fotoAtualizadaTexto", "Sua foto de perfil foi salva e ja esta visivel para outros usuarios."));
    } catch (error) {
      console.log("Erro ao definir foto de perfil:", error, (error as any)?.code, (error as any)?.message);
      Alert.alert(tp("erro", "Error"), tp("erroSalvarFotoPerfil", "Nao foi possivel atualizar a foto de perfil agora."));
    } finally {
      setEnviandoFoto(false);
    }
  }

  function abrirOpcoesFotoPerfil() {
    if (somenteLeitura) return;

    Alert.alert(
      tp("fotoPerfil", "Foto de perfil"),
      tp("escolhaOrigemFotoPerfil", "Escolha de onde enviar a foto"),
      [
        {
          text: tp("tirarFoto", "Tirar foto"),
          onPress: () => { escolherFotoPerfil("camera"); }
        },
        {
          text: tp("escolherGaleria", "Escolher da galeria"),
          onPress: () => { escolherFotoPerfil("galeria"); }
        },
        ...(
          String(foto || "").trim()
            ? [{ text: tp("removerFoto", "Remover foto"), style: "destructive" as const, onPress: () => { removerFotoPerfil(); } }]
            : []
        ),
        { text: tp("cancelar", "Cancelar"), style: "cancel" }
      ]
    );
  }

  async function enviarAvaliacao() {
    if (!currentUserId || currentUserId === usuarioId) {
      Alert.alert(tp("avaliacaoInvalidaTitulo", "Invalid rating"), tp("avaliacaoInvalidaTexto", "Open another user's profile to rate."));
      return;
    }

    if (notaSelecionada < 1) {
      Alert.alert(tp("escolhaNotaTitulo", "Choose a rating"), tp("escolhaNotaTexto", "Select from 1 to 5 stars."));
      return;
    }

    try {
      if (avaliacaoExistenteId) {
        await updateDoc(doc(db, "avaliacoesUsuarios", avaliacaoExistenteId), {
          nota: notaSelecionada,
          comentario: comentarioAvaliacao.trim(),
          editadoEm: serverTimestamp(),
          editadoEmCliente: new Date().toISOString()
        });
      } else {
        const nova = await addDoc(collection(db, "avaliacoesUsuarios"), {
          avaliadoId: usuarioId,
          avaliadorId: currentUserId,
          nota: notaSelecionada,
          comentario: comentarioAvaliacao.trim(),
          criadoEm: serverTimestamp(),
          criadoEmCliente: new Date().toISOString()
        });
        setAvaliacaoExistenteId(String(nova.id));
      }

      Alert.alert(
        avaliacaoExistenteId ? tp("avaliacaoAtualizada", "Rating updated") : tp("avaliacaoEnviada", "Rating sent"),
        avaliacaoExistenteId
          ? tp("avaliacaoAtualizadaTexto", "Your rating/comment has been updated.")
          : tp("avaliacaoEnviadaTexto", "This user's rating has been recorded.")
      );

      const snapshot = await getDocs(collection(db, "avaliacoesUsuarios"));
      const avaliacoes = snapshot.docs
        .map((docAtual) => ({ id: docAtual.id, ...(docAtual.data() as any || {}) }))
        .filter((item:any) => String(item?.avaliadoId) === String(usuarioId));
      const total = avaliacoes.length;
      const soma = avaliacoes.reduce((acc:number, item:any) => acc + Number(item?.nota || 0), 0);
      setTotalAvaliacoes(total);
      setMediaAvaliacoes(total > 0 ? soma / total : 0);
      setAvaliacoesRecentes(
        avaliacoes
          .sort((a:any, b:any) => String(b?.criadoEmCliente || "").localeCompare(String(a?.criadoEmCliente || "")))
      );
    } catch (e) {
      console.log("Erro ao enviar avaliação:", e);
      Alert.alert(tp("erro", "Error"), tp("erroEnviarAvaliacaoTexto", "Could not send rating right now."));
    }
  }

  async function adicionarContatoNoMeuPerfil() {
    if (!currentUserId || String(currentUserId) === String(usuarioId)) return;

    const novoContato: ContatoPerfil = {
      id: String(usuarioId),
      nome: String(nome || usuarioId || 'Usuário').trim(),
      foto: String(foto || '').trim(),
      adicionadoEm: Date.now()
    };

    try {
      const chaveContatos = `perfil_contatos_${currentUserId}`;
      const salvo = await AsyncStorage.getItem(chaveContatos);
      const contatos: ContatoPerfil[] = salvo ? JSON.parse(salvo) : [];
      const jaExiste = Array.isArray(contatos) && contatos.some((c:any) => String(c?.id || '') === novoContato.id);

      const contatosAtualizados = jaExiste
        ? contatos.map((c:any) => (String(c?.id || '') === novoContato.id ? { ...c, ...novoContato } : c))
        : [...contatos, novoContato];

      await AsyncStorage.setItem(chaveContatos, JSON.stringify(contatosAtualizados));

      const perfilAtualRaw = await AsyncStorage.getItem(`perfil_${currentUserId}`);
      const perfilAtual = perfilAtualRaw ? JSON.parse(perfilAtualRaw) : perfilVazio;
      await AsyncStorage.setItem(
        `perfil_${currentUserId}`,
        JSON.stringify({
          ...perfilAtual,
          contatos: contatosAtualizados
        })
      );

      setContatoJaAdicionado(true);
      Alert.alert(tp("contatoSalvo", "Contact saved"), tp("contatoSalvoTexto", "This user has been added to your profile."));
    } catch (error) {
      console.log('Erro ao adicionar contato no perfil:', error);
      Alert.alert(tp("erro", "Error"), tp("erroAdicionarContatoTexto", "Could not add this contact right now."));
    }
  }

  function adicionarVeiculo() {
    if (!veiculoMarca.trim() || !veiculoModelo.trim()) {
      Alert.alert(tp("dadosIncompletos", "Incomplete data"), tp("dadosIncompletosVeiculo", "Provide at least vehicle make and model."));
      return;
    }

    const novo: Veiculo = {
      tipo: veiculoTipo,
      marca: veiculoMarca.trim(),
      modelo: veiculoModelo.trim(),
      ano: veiculoAno.trim(),
      cor: veiculoCor.trim(),
      placa: veiculoPlaca.trim()
    };

    setVeiculos((prev) => [...prev, novo]);
    setVeiculoMarca("");
    setVeiculoModelo("");
    setVeiculoAno("");
    setVeiculoCor("");
    setVeiculoPlaca("");
  }

  function removerVeiculo(index: number) {
    setVeiculos((prev) => prev.filter((_, i) => i !== index));
  }

  const tituloTela = titulo || (somenteLeitura
    ? tp("perfilDeUsuario", "Profile of {{id}}").replace("{{id}}", String(usuarioId))
    : tp("perfilUsuario", "User profile"));
  const valorOuFallback = (valor: string, fallback: string) => (valor?.trim() ? valor : fallback);
  const avaliacoesExibidas = mostrarHistoricoCompleto ? avaliacoesRecentes : avaliacoesRecentes.slice(0, 5);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{tituloTela}</Text>
          <Text style={styles.subtitle}>{somenteLeitura ? tp("perfilDescricaoLeitura", "Rate who requested the ride or delivery before accepting.") : `ID: ${usuarioId}`}</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={20} color="#9be7ff" />
          </TouchableOpacity>
        )}
      </View>

      {carregando ? (
        <Text style={styles.loadingText}>{tp("carregandoPerfil", "Loading profile...")}</Text>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{tp("dadosPessoais", "Personal data")}</Text>
            <CampoPerfil label={tp("nome", "Name")} placeholder={tp("nomeUsuarioPlaceholder", "User name")} value={nome} onChangeText={setNome} editable={!somenteLeitura} fallback={tp("nomeNaoInformado", "Name not informed")} />
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{tp("foto", "Photo")}</Text>
              {!somenteLeitura && (
                <TouchableOpacity
                  onPress={abrirOpcoesFotoPerfil}
                  style={[styles.input, styles.photoPickerButton, enviandoFoto && { opacity: 0.7 }]}
                  disabled={enviandoFoto}
                >
                  <MaterialCommunityIcons name={enviandoFoto ? "cloud-upload" : "camera-plus-outline"} size={18} color="#9cecff" />
                  <Text style={styles.photoPickerButtonText}>
                    {enviandoFoto ? tp("enviandoFoto", "Enviando foto...") : tp("selecionarFotoPerfil", "Selecionar foto (camera ou galeria)")}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.photoPreviewWrap}>
                {String(foto || "").trim() ? (
                  <Image source={{ uri: String(foto) }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoFallbackAvatar}>
                    <MaterialCommunityIcons name="account" size={32} color="#7dd3fc" />
                  </View>
                )}
              </View>

              {!String(foto || "").trim() && (
                <Text style={styles.emptyText}>{tp("fotoPadraoAtiva", "Sem foto: avatar padrao ativo")}</Text>
              )}
            </View>
            <CampoPerfil label={tp("cidade", "City")} placeholder={tp("cidade", "City")} value={cidade} onChangeText={setCidade} editable={!somenteLeitura} fallback={tp("cidadeNaoInformada", "City not informed")} />
            {somenteLeitura && !perfilDesbloqueado ? (
              <View style={styles.lockedField}>
                <MaterialCommunityIcons name="lock-outline" size={16} color="#f59e0b" />
                <Text style={styles.lockedFieldText}>{tp("telefoneBloqueado", "Telefone visível apenas após aceite mútuo de oferta")}</Text>
              </View>
            ) : (
              <CampoPerfil label={tp("telefone", "Phone")} placeholder={tp("telefone", "Phone")} value={telefone} onChangeText={setTelefone} editable={!somenteLeitura} fallback={tp("telefoneNaoInformado", "Phone not informed")} keyboardType="phone-pad" />
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{tp("veiculos", "Vehicles")}</Text>
            {veiculos.length === 0 && (
              <Text style={styles.emptyText}>
                {somenteLeitura ? tp("veiculoNaoCadastradoLeitura", "This user has not registered a vehicle yet.") : tp("veiculoNaoCadastradoEdicao", "Register your vehicle to convey more trust.")}
              </Text>
            )}

            {veiculos.map((veiculo, index) => (
              <View key={`${veiculo.placa}-${index}`} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleBadge}>
                    <Text style={styles.vehicleBadgeText}>{tipoVeiculoLabel(veiculo.tipo)}</Text>
                  </View>
                  {!somenteLeitura && (
                    <TouchableOpacity onPress={() => removerVeiculo(index)} style={styles.removeVehicleButton}>
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff7b7b" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.vehicleTitle}>{valorOuFallback(`${veiculo.marca} ${veiculo.modelo}`.trim(), tp("veiculoSemModelo", "Vehicle without model"))}</Text>
                <Text style={styles.vehicleMeta}>{tp("anoLabel", "Year")}: {valorOuFallback(veiculo.ano, tp("naoInformado", "not informed"))}</Text>
                <Text style={styles.vehicleMeta}>{tp("corLabel", "Color")}: {valorOuFallback(veiculo.cor, tp("naoInformada", "not informed"))}</Text>
                {somenteLeitura && !perfilDesbloqueado ? (
                  <View style={[styles.lockedField, {marginTop: 4}]}>
                    <MaterialCommunityIcons name="lock-outline" size={14} color="#f59e0b" />
                    <Text style={styles.lockedFieldText}>{tp("placaBloqueada", "Placa visível apenas após aceite mútuo de oferta")}</Text>
                  </View>
                ) : (
                  <Text style={styles.vehicleMeta}>{tp("placaLabel", "Plate")}: {valorOuFallback(veiculo.placa, tp("naoInformada", "not informed"))}</Text>
                )}
              </View>
            ))}

            {!somenteLeitura && (
              <>
                <Text style={styles.sectionSubtitle}>{tp("adicionarVeiculo", "Add vehicle")}</Text>
                <View style={styles.typeRow}>
                  {tiposVeiculo.map((tipo) => {
                    const ativo = veiculoTipo === tipo;
                    return (
                      <TouchableOpacity key={tipo} onPress={() => setVeiculoTipo(tipo)} style={[styles.typeChip, ativo && styles.typeChipActive]}>
                        <Text style={[styles.typeChipText, ativo && styles.typeChipTextActive]}>{tipoVeiculoLabel(tipo)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <CampoPerfil label={tp("marca", "Make")} placeholder={tp("marca", "Make")} value={veiculoMarca} onChangeText={setVeiculoMarca} editable />
                <CampoPerfil label={tp("modelo", "Model")} placeholder={tp("modelo", "Model")} value={veiculoModelo} onChangeText={setVeiculoModelo} editable />
                <CampoPerfil label={tp("ano", "Year")} placeholder={tp("ano", "Year")} value={veiculoAno} onChangeText={setVeiculoAno} editable keyboardType="numeric" />
                <CampoPerfil label={tp("cor", "Color")} placeholder={tp("cor", "Color")} value={veiculoCor} onChangeText={setVeiculoCor} editable />
                <CampoPerfil label={tp("placa", "Plate")} placeholder={tp("placa", "Plate")} value={veiculoPlaca} onChangeText={setVeiculoPlaca} editable autoCapitalize="characters" />

                <TouchableOpacity onPress={adicionarVeiculo} style={styles.primaryButton}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#001018" />
                  <Text style={styles.primaryButtonText}>{tp("adicionarVeiculo", "Add vehicle")}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{tp("avaliacoes", "Ratings")}</Text>
            <View style={styles.ratingHero}>
              <View style={styles.ratingBadgeBox}>
                <MaterialCommunityIcons name="star" size={18} color="#fbbf24" />
                <Text style={styles.ratingBadgeText}>
                  {totalAvaliacoes > 0 ? mediaAvaliacoes.toFixed(1) : "--"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ratingSummary}>
                  {totalAvaliacoes > 0 ? `${mediaAvaliacoes.toFixed(1)} / 5,0` : tp("semAvaliacoesAinda", "No ratings yet")}
                </Text>
                <Text style={styles.ratingMeta}>
                  {`${totalAvaliacoes} ${tp("avaliacoesRegistradas", "rating(s) recorded")}`}
                </Text>
              </View>
            </View>

            {somenteLeitura && currentUserId && currentUserId !== usuarioId && (
              <>
                <TouchableOpacity
                  onPress={adicionarContatoNoMeuPerfil}
                  disabled={contatoJaAdicionado}
                  style={[styles.primaryButton, contatoJaAdicionado && { opacity: 0.6 }]}
                >
                  <MaterialCommunityIcons
                    name={contatoJaAdicionado ? 'account-check-outline' : 'account-plus-outline'}
                    size={18}
                    color="#001018"
                  />
                  <Text style={styles.primaryButtonText}>
                    {contatoJaAdicionado ? tp("adicionadoAoMeuPerfil", "Added to my profile") : tp("adicionarAoMeuPerfil", "Add to my profile")}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.sectionSubtitle}>{tp("avaliarEsteUsuario", "Rate this user")}</Text>
                <View style={styles.starRow}>
                  {[1,2,3,4,5].map((nota) => (
                    <TouchableOpacity key={nota} onPress={() => setNotaSelecionada(nota)}>
                      <MaterialCommunityIcons
                        name={notaSelecionada >= nota ? "star" : "star-outline"}
                        size={28}
                        color={notaSelecionada >= nota ? "#fbbf24" : "#94a3b8"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <CampoPerfil
                  label={tp("comentario", "Comment")}
                  placeholder={tp("exemploComentarioAvaliacao", "Ex: punctual, polite, drove well")}
                  value={comentarioAvaliacao}
                  onChangeText={setComentarioAvaliacao}
                  editable
                  fallback=""
                />

                <TouchableOpacity onPress={enviarAvaliacao} style={styles.primaryButton}>
                  <MaterialCommunityIcons name="star-circle-outline" size={18} color="#001018" />
                  <Text style={styles.primaryButtonText}>
                    {avaliacaoExistenteId ? tp("atualizarAvaliacao", "Update rating") : tp("enviarAvaliacao", "Send rating")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {avaliacoesRecentes.length > 0 && (
              <View style={styles.historyHeader}>
                <Text style={styles.sectionSubtitle}>{tp("historicoAvaliacoes", "Rating history")}</Text>
                {avaliacoesRecentes.length > 5 && (
                  <TouchableOpacity onPress={() => setMostrarHistoricoCompleto((prev) => !prev)}>
                    <Text style={styles.historyToggleText}>
                      {mostrarHistoricoCompleto ? tp("mostrarMenos", "Show less") : `${tp("verTodas", "See all")} (${avaliacoesRecentes.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {avaliacoesExibidas.map((avaliacao:any) => (
              <View key={avaliacao.id} style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>{avaliacao.avaliadorId} {tp("avaliouCom", "rated with")} {avaliacao.nota}/5</Text>
                <Text style={styles.reviewMeta}>{formatarDataHistorico(avaliacao.criadoEmCliente, tp("dataNaoInformada", "Date not informed"))}</Text>
                {!!avaliacao.ofertaId && (
                  <Text style={styles.reviewMeta}>{tp("viagem", "Trip")}: {String(avaliacao.ofertaId)}</Text>
                )}
                <Text style={styles.reviewText}>{avaliacao.comentario || tp("semComentario", "No comment.")}</Text>
              </View>
            ))}
          </View>

          {!somenteLeitura && (
            <TouchableOpacity onPress={salvarPerfil} style={styles.saveButton}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color="#001018" />
              <Text style={styles.saveButtonText}>{tp("salvarPerfil", "Save profile")}</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

type CampoPerfilProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (texto: string) => void;
  editable?: boolean;
  fallback?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function CampoPerfil({ label, placeholder, value, onChangeText, editable = true, fallback, keyboardType = "default", autoCapitalize = "sentences" }: CampoPerfilProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#4ba7c9"
        value={editable ? value : (value?.trim() ? value : fallback || "")}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, !editable && styles.inputReadOnly]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712"
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20
  },
  title: {
    color: "#eefcff",
    fontSize: 24,
    fontWeight: "bold"
  },
  subtitle: {
    color: "#70d8ff",
    marginTop: 4
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1dd6ff",
    backgroundColor: "rgba(6, 20, 32, 0.85)"
  },
  loadingText: {
    color: "#9bb7c6"
  },
  sectionCard: {
    backgroundColor: "rgba(8, 15, 28, 0.95)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(29, 214, 255, 0.28)",
    padding: 16,
    marginBottom: 18,
    shadowColor: "#10d7ff",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6
  },
  sectionTitle: {
    color: "#eefcff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  sectionSubtitle: {
    color: "#9cecff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8
  },
  fieldBlock: {
    marginBottom: 12
  },
  fieldLabel: {
    color: "#77dfff",
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  input: {
    backgroundColor: "rgba(5, 18, 30, 0.98)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#11d8ff",
    color: "#eefcff",
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: "#10d7ff",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4
  },
  inputReadOnly: {
    borderColor: "rgba(144, 205, 224, 0.35)",
    color: "#d7f7ff"
  },
  photoPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoPickerButtonText: {
    color: "#c9f4ff",
    fontWeight: "600",
    flex: 1,
  },
  photoPreviewWrap: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  photoPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: "#11d8ff",
    backgroundColor: "rgba(5, 18, 30, 0.9)",
  },
  photoFallbackAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: "rgba(17, 216, 255, 0.6)",
    backgroundColor: "rgba(5, 18, 30, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  lockedFieldText: {
    color: "#f59e0b",
    fontSize: 13,
    flex: 1
  },
  emptyText: {
    color: "#8da8b7",
    marginBottom: 10
  },
  ratingSummary: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "bold"
  },
  ratingHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 25, 41, 0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.16)",
    padding: 14,
    marginBottom: 14
  },
  ratingBadgeBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  ratingBadgeText: {
    color: "#fde68a",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2
  },
  ratingMeta: {
    color: "#7dd3fc",
    marginTop: 4,
    marginBottom: 0
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4
  },
  historyToggleText: {
    color: "#9cecff",
    fontSize: 13,
    fontWeight: "600"
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  reviewCard: {
    backgroundColor: "rgba(13, 25, 41, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.2)",
    padding: 12,
    marginTop: 10
  },
  reviewTitle: {
    color: "#e0f2fe",
    fontWeight: "bold",
    marginBottom: 6
  },
  reviewMeta: {
    color: "#7dd3fc",
    fontSize: 12,
    marginBottom: 4
  },
  reviewText: {
    color: "#cbd5e1",
    lineHeight: 18
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  typeChip: {
    flex: 1,
    backgroundColor: "rgba(18, 29, 44, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 214, 255, 0.24)",
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8
  },
  typeChipActive: {
    backgroundColor: "#9b5cff",
    borderColor: "#dbb9ff"
  },
  typeChipText: {
    color: "#bfefff",
    fontWeight: "600"
  },
  typeChipTextActive: {
    color: "#ffffff"
  },
  vehicleCard: {
    backgroundColor: "rgba(8, 20, 33, 0.96)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 214, 255, 0.2)",
    padding: 12,
    marginBottom: 10
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  vehicleBadge: {
    backgroundColor: "rgba(29, 214, 255, 0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(29, 214, 255, 0.3)"
  },
  vehicleBadgeText: {
    color: "#93efff",
    fontSize: 11,
    fontWeight: "bold"
  },
  removeVehicleButton: {
    padding: 6
  },
  vehicleTitle: {
    color: "#eefcff",
    fontSize: 16,
    fontWeight: "600"
  },
  vehicleMeta: {
    color: "#95aabd",
    marginTop: 3
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#11d8ff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  primaryButtonText: {
    color: "#001018",
    fontWeight: "bold",
    fontSize: 15
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20
  },
  saveButtonText: {
    color: "#00180a",
    fontSize: 16,
    fontWeight: "bold"
  }
});