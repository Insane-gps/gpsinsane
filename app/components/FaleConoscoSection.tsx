import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db, storage } from "../../firebase";

type Props = {
  usuarioId?: string | null;
  textos?: any;
  initialTipo?: "sugestao" | "denuncia";
  onlyTipo?: "sugestao" | "denuncia";
  initialAlvoId?: string;
  lockAlvoId?: boolean;
  ocultarIntroducao?: boolean;
  feedbackOrigem?: string;
  feedbackContexto?: Record<string, any>;
  onSubmitted?: () => void;
};

type ImagemSelecionada = {
  uri: string;
  base64: string;
  fileName: string;
  mimeType: string;
};

const LIMITE_IMAGENS = 3;
const FEEDBACK_API_URLS = [
  "https://us-central1-gpsclean-91dec.cloudfunctions.net/sendFeedbackEmail",
  "http://62.171.144.109:3001/feedback"
];

export default function FaleConoscoSection({
  usuarioId,
  textos,
  initialTipo = "sugestao",
  onlyTipo,
  initialAlvoId = "",
  lockAlvoId = false,
  ocultarIntroducao = false,
  feedbackOrigem = "settings_panel",
  feedbackContexto,
  onSubmitted,
}: Props) {
  const tf = (chave: string, fallback: string) => String(textos?.[chave] || fallback);
  const [feedbackTipo, setFeedbackTipo] = useState<"sugestao" | "denuncia">(onlyTipo || initialTipo);
  const [feedbackMensagem, setFeedbackMensagem] = useState("");
  const [feedbackContatoEmail, setFeedbackContatoEmail] = useState("");
  const [feedbackAlvoId, setFeedbackAlvoId] = useState(String(initialAlvoId || ""));
  const [imagensSelecionadas, setImagensSelecionadas] = useState<ImagemSelecionada[]>([]);
  const [enviandoFeedback, setEnviandoFeedback] = useState(false);
  const tipoEfetivo = onlyTipo || feedbackTipo;

  useEffect(() => {
    setFeedbackTipo(onlyTipo || initialTipo);
  }, [initialTipo, onlyTipo]);

  useEffect(() => {
    setFeedbackAlvoId(String(initialAlvoId || ""));
  }, [initialAlvoId]);

  function adicionarImagensSelecionadas(novas: ImagemSelecionada[]) {
    if (novas.length === 0) {
      Alert.alert(tf("erro", "Erro"), tf("erroProcessarImagensSelecionadas", "Nao foi possivel processar as imagens selecionadas."));
      return;
    }

    setImagensSelecionadas((prev) => [...prev, ...novas].slice(0, LIMITE_IMAGENS));
  }

  async function selecionarImagens() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissao.status !== "granted") {
        Alert.alert(tf("permissaoNecessaria", "Permissao necessaria"), tf("permitaAcessoGaleria", "Permita acesso a galeria para anexar imagens."));
        return;
      }

      const restante = Math.max(0, LIMITE_IMAGENS - imagensSelecionadas.length);
      if (restante <= 0) {
        Alert.alert(tf("limiteAtingido", "Limite atingido"), tf("limiteImagensFeedback", "Voce pode anexar ate {{limite}} imagens.").replace("{{limite}}", String(LIMITE_IMAGENS)));
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.45,
        base64: true,
        allowsMultipleSelection: true,
        selectionLimit: restante,
      });

      if (resultado.canceled) return;

      const novas = (resultado.assets || [])
        .filter((asset) => !!asset?.uri && !!asset?.base64)
        .slice(0, restante)
        .map((asset, index) => ({
          uri: String(asset.uri),
          base64: String(asset.base64),
          fileName: String(asset.fileName || `imagem_${Date.now()}_${index + 1}.jpg`),
          mimeType: String(asset.mimeType || "image/jpeg")
        }));

      adicionarImagensSelecionadas(novas);
    } catch (error) {
      console.log("Erro ao selecionar imagens de feedback:", error);
      Alert.alert(tf("erro", "Erro"), tf("erroSelecionarImagens", "Nao foi possivel selecionar as imagens."));
    }
  }
  async function capturarImagem() {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (permissao.status !== "granted") {
        Alert.alert(tf("permissaoNecessaria", "Permissao necessaria"), tf("permitaAcessoCamera", "Permita acesso a camera para anexar imagens."));
        return;
      }

      const restante = Math.max(0, LIMITE_IMAGENS - imagensSelecionadas.length);
      if (restante <= 0) {
        Alert.alert(tf("limiteAtingido", "Limite atingido"), tf("limiteImagensFeedback", "Voce pode anexar ate {{limite}} imagens.").replace("{{limite}}", String(LIMITE_IMAGENS)));
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.45,
        base64: true,
      });

      if (resultado.canceled) return;

      const asset = resultado.assets?.[0];
      if (!asset?.uri || !asset?.base64) {
        Alert.alert(tf("erro", "Erro"), tf("erroCapturarImagem", "Nao foi possivel capturar a imagem."));
        return;
      }

      adicionarImagensSelecionadas([
        {
          uri: String(asset.uri),
          base64: String(asset.base64),
          fileName: String(asset.fileName || `foto_${Date.now()}.jpg`),
          mimeType: String(asset.mimeType || "image/jpeg")
        }
      ]);
    } catch (error) {
      console.log("Erro ao capturar imagem de feedback:", error);
      Alert.alert(tf("erro", "Erro"), tf("erroAbrirCamera", "Nao foi possivel abrir a camera."));
    }
  }

  function removerImagem(index: number) {
    setImagensSelecionadas((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function subirImagensParaStorage() {
    const uploads: Array<{ fileName: string; mimeType: string; storagePath: string; url: string }> = [];
    const falhas: string[] = [];

    for (let index = 0; index < imagensSelecionadas.length; index += 1) {
      const imagem = imagensSelecionadas[index];

      try {
        const mimeType = String(imagem.mimeType || "image/jpeg");
        const extensao = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
        const path = `feedback/${String(usuarioId || "anonimo")}/${Date.now()}_${index}.${extensao}`;
        const storageRef = ref(storage, path);

        const respostaArquivo = await fetch(imagem.uri);
        const blob = await respostaArquivo.blob();

        await uploadBytes(storageRef, blob, {
          contentType: mimeType
        });

        const url = await getDownloadURL(storageRef);

        uploads.push({
          fileName: imagem.fileName,
          mimeType,
          storagePath: path,
          url
        });
      } catch (error: any) {
        console.log("Erro no upload de imagem de feedback:", error);
        falhas.push(String(error?.code || error?.message || "upload_failed"));
      }
    }

    return { uploads, falhas };
  }

  async function enviarFeedback() {
    const mensagem = String(feedbackMensagem || "").trim();
    const contatoEmail = String(feedbackContatoEmail || "").trim();
    const alvoUsuarioId = String(feedbackAlvoId || "").trim();

    if (!mensagem) {
      Alert.alert(tf("mensagemObrigatoria", "Mensagem obrigatoria"), tf("descrevaSugestaoAntesEnviar", "Descreva sua sugestao ou denuncia antes de enviar."));
      return;
    }

    setEnviandoFeedback(true);

    try {
      const uploadResultado = imagensSelecionadas.length > 0
        ? await subirImagensParaStorage()
        : { uploads: [], falhas: [] as string[] };
      const imagensUpload = uploadResultado.uploads;
      const anexosEmail = imagensSelecionadas
        .slice(0, LIMITE_IMAGENS)
        .map((imagem) => ({
          fileName: String(imagem.fileName || `imagem_${Date.now()}.jpg`),
          mimeType: String(imagem.mimeType || "image/jpeg"),
          base64: String(imagem.base64 || "")
        }))
        .filter((item) => !!item.base64);

      let emailEncaminhado = false;
      let emailStatus = "pendente";

      for (const endpoint of FEEDBACK_API_URLS) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              tipo: tipoEfetivo,
              mensagem,
              contatoEmail,
              alvoUsuarioId,
              usuarioId: String(usuarioId || "anonimo"),
              imagens: anexosEmail,
              origem: feedbackOrigem,
              contexto: feedbackContexto || null
            })
          });

          const resultado = await response.json().catch(() => ({}));
          emailEncaminhado = !!resultado?.ok;
          emailStatus = emailEncaminhado
            ? "ok"
            : String(resultado?.erro || `http_${response.status}`);

          if (emailEncaminhado) break;
        } catch (error: any) {
          emailEncaminhado = false;
          emailStatus = String(error?.message || "email_request_failed");
        }
      }
      if(tipoEfetivo === "denuncia" && alvoUsuarioId){

        await addDoc(collection(db,"denuncias"),{
          denunciadoId: alvoUsuarioId,
          denuncianteId: usuarioId || "anonimo",
          motivo: "denuncia via suporte",
          descricao: mensagem,
          contatoEmail: contatoEmail || null,
          imagens: imagensUpload,
          uploadFalhas: uploadResultado.falhas,
          origem: feedbackOrigem,
          ...((feedbackContexto && typeof feedbackContexto === "object") ? feedbackContexto : {}),
          status: "nova",
          prioridade: "media",
          criadoEm: serverTimestamp()
        });

      }
      await addDoc(collection(db, "feedbackUsuarios"), {
        tipo: tipoEfetivo,
        mensagem,
        contatoEmail,
        alvoUsuarioId,
        usuarioId: String(usuarioId || "anonimo"),
        origem: feedbackOrigem,
        contexto: feedbackContexto || null,
        imagens: imagensUpload,
        uploadFalhas: uploadResultado.falhas,
        status: "novo",
        emailEncaminhado,
        emailStatus,
        emailUltimaTentativaEmCliente: new Date().toISOString(),
        criadoEm: serverTimestamp(),
        criadoEmCliente: new Date().toISOString()
      });

      setFeedbackMensagem("");
      setFeedbackContatoEmail("");
      setFeedbackAlvoId(lockAlvoId ? String(initialAlvoId || "") : "");
      setImagensSelecionadas([]);

      Alert.alert(
        tipoEfetivo === "denuncia" ? tf("denunciaEnviadaTitulo", "Denuncia enviada") : tf("sugestaoEnviadaTitulo", "Sugestao enviada"),
        emailEncaminhado
          ? anexosEmail.length > 0
            ? tf("relatoImagensEncaminhados", "Seu relato e as imagens foram encaminhados por email.")
            : tf("relatoEmailEncaminhado", "Seu relato foi salvo e o email foi encaminhado.")
          : tf("relatoSalvoEmailNaoEnviado", "Seu relato foi salvo, mas o email nao foi encaminhado agora. Veja o status no painel de feedback.")
      );
      onSubmitted?.();
    } catch (error) {
      console.log("Erro ao enviar feedback:", error);
      const codigo = String((error as any)?.code || (error as any)?.message || "");
      if (codigo.includes("storage/unauthorized")) {
        Alert.alert(tf("erroPermissao", "Erro de permissao"), tf("firebaseStorageBloqueouUpload", "O Firebase Storage bloqueou o upload das imagens. Ajuste as regras do Storage ou faca login no app."));
      } else if (codigo.includes("storage/quota-exceeded")) {
        Alert.alert(tf("limiteAtingido", "Limite atingido"), tf("limiteStorageAtingido", "O limite do Storage foi atingido. Tente novamente mais tarde."));
      } else {
        Alert.alert(tf("erro", "Erro"), tf("naoFoiPossivelEnviarAgora", "Nao foi possivel enviar agora."));
      }
    } finally {
      setEnviandoFeedback(false);
    }
  }

  return (
    <>
      {!ocultarIntroducao && (
        <>
          <Text style={{color:"#888", marginTop:30, marginBottom:10}}>
            {tf("faleConosco", "Fale conosco")}
          </Text>
          <View style={{
            backgroundColor:"#111",
            padding:14,
            borderRadius:12,
            marginBottom:12,
            borderWidth:1,
            borderColor:"#222"
          }}>
            <Text style={{
              color:"#00eaff",
              fontWeight:"bold",
              fontSize:15,
              marginBottom:6
            }}>
              {tf("sobreInsaneGpsTitulo", "Sobre o INSANE GPS")}
            </Text>

            <Text style={{
              color:"#ccc",
              fontSize:13,
              lineHeight:18
            }}>
              {tf("sobreInsaneGpsTexto", "O INSANE GPS foi criado para transformar a viagem em algo mais leve, direto e sem frescura.")}
            </Text>
          </View>
        </>
      )}
      <View style={{
        backgroundColor:"#1c1c1c",
        padding:18,
        borderRadius:12,
        marginBottom:25
      }}>
        <Text style={{color:"#bbb", marginBottom:12}}>
          {tf("envieSugestoesOuDenuncias", "Envie sugestoes ou denuncias. Voce tambem pode anexar imagens para explicar melhor o problema.")}
        </Text>

        {!onlyTipo && (
          <View style={{flexDirection:"row", marginBottom:12}}>
            <TouchableOpacity
              onPress={()=>setFeedbackTipo("sugestao")}
              style={{
                flex:1,
                marginRight:10,
                backgroundColor: tipoEfetivo === "sugestao" ? "#164e63" : "#111",
                borderWidth:1,
                borderColor: tipoEfetivo === "sugestao" ? "#22d3ee" : "#333",
                borderRadius:10,
                paddingVertical:10,
                alignItems:"center"
              }}
            >
              <Text style={{color:"#fff", fontWeight:"bold"}}>{tf("sugestao", "Sugestao")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=>setFeedbackTipo("denuncia")}
              style={{
                flex:1,
                backgroundColor: tipoEfetivo === "denuncia" ? "#7f1d1d" : "#111",
                borderWidth:1,
                borderColor: tipoEfetivo === "denuncia" ? "#ef4444" : "#333",
                borderRadius:10,
                paddingVertical:10,
                alignItems:"center"
              }}
            >
              <Text style={{color:"#fff", fontWeight:"bold"}}>{tf("denuncia", "Denuncia")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {tipoEfetivo === "denuncia" && (
          <TextInput
            value={feedbackAlvoId}
            onChangeText={setFeedbackAlvoId}
            editable={!lockAlvoId}
            placeholder={tf("idUsuarioDenunciadoOpcional", "ID do usuario denunciado (opcional)")}
            placeholderTextColor="#666"
            style={{
              backgroundColor:"#111",
              borderWidth:1,
              borderColor:"#333",
              borderRadius:10,
              paddingHorizontal:12,
              paddingVertical:12,
              color:"#fff",
              marginBottom:10,
              opacity: lockAlvoId ? 0.75 : 1
            }}
          />
        )}

        <TextInput
          value={feedbackContatoEmail}
          onChangeText={setFeedbackContatoEmail}
          placeholder={tf("emailRespostaOpcional", "Seu email para resposta (opcional)")}
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor:"#111",
            borderWidth:1,
            borderColor:"#333",
            borderRadius:10,
            paddingHorizontal:12,
            paddingVertical:12,
            color:"#fff",
            marginBottom:10
          }}
        />

        <TextInput
          value={feedbackMensagem}
          onChangeText={setFeedbackMensagem}
          placeholder={tipoEfetivo === "denuncia" ? tf("descrevaDenuncia", "Descreva a denuncia") : tf("conteSugestaoMelhorarApp", "Conte sua sugestao para melhorar o app")}
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor:"#111",
            borderWidth:1,
            borderColor:"#333",
            borderRadius:10,
            paddingHorizontal:12,
            paddingVertical:12,
            color:"#fff",
            minHeight:110,
            marginBottom:12
          }}
        />

        <View style={{flexDirection:"row", marginBottom:12}}>
          <TouchableOpacity
            onPress={selecionarImagens}
            style={{
              flex:1,
              backgroundColor:"#111827",
              borderWidth:1,
              borderColor:"#334155",
              borderRadius:10,
              padding:12,
              marginRight:10,
              flexDirection:"row",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            <MaterialCommunityIcons name="image-plus" size={18} color="#93c5fd" style={{marginRight:8}} />
            <Text style={{color:"#e2e8f0", fontWeight:"600"}}>
              {tf("galeria", "Galeria")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={capturarImagem}
            style={{
              flex:1,
              backgroundColor:"#1f2937",
              borderWidth:1,
              borderColor:"#475569",
              borderRadius:10,
              padding:12,
              flexDirection:"row",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            <MaterialCommunityIcons name="camera-outline" size={18} color="#cbd5e1" style={{marginRight:8}} />
            <Text style={{color:"#e2e8f0", fontWeight:"600"}}>
              {tf("tirarFoto", "Tirar foto")}
            </Text>
          </TouchableOpacity>
        </View>

        {imagensSelecionadas.length > 0 && (
          <View style={{marginBottom:12}}>
            <Text style={{color:"#93c5fd", fontSize:12, marginBottom:8}}>
              {tf("anexosSelecionados", "Anexos selecionados")} ({imagensSelecionadas.length}/{LIMITE_IMAGENS})
            </Text>
            <View style={{flexDirection:"row", flexWrap:"wrap"}}>
              {imagensSelecionadas.map((imagem, index) => (
                <View
                  key={`${imagem.fileName}-${index}`}
                  style={{
                    width:88,
                    marginRight:10,
                    marginBottom:10
                  }}
                >
                  <Image
                    source={{ uri: imagem.uri }}
                    style={{
                      width:88,
                      height:88,
                      borderRadius:10,
                      backgroundColor:"#0f172a"
                    }}
                  />
                  <TouchableOpacity
                    onPress={()=>removerImagem(index)}
                    style={{
                      position:"absolute",
                      top:6,
                      right:6,
                      width:24,
                      height:24,
                      borderRadius:12,
                      backgroundColor:"rgba(0,0,0,0.7)",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                  <Text style={{color:"#94a3b8", fontSize:10, marginTop:4}} numberOfLines={2}>
                    {imagem.fileName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={enviarFeedback}
          disabled={enviandoFeedback}
          style={{
            backgroundColor: tipoEfetivo === "denuncia" ? "#dc2626" : "#0ea5e9",
            opacity: enviandoFeedback ? 0.65 : 1,
            padding:14,
            borderRadius:10,
            alignItems:"center"
          }}
        >
          <Text style={{color:"#fff", fontWeight:"bold"}}>
            {enviandoFeedback ? tf("enviando", "Enviando...") : (tipoEfetivo === "denuncia" ? tf("enviarDenuncia", "Enviar denuncia") : tf("enviarSugestao", "Enviar sugestao"))}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}