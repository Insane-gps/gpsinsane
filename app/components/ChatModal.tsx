import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createAudioPlayer,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { doc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ImageBackground,
    ImageSourcePropType,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { State as GestureState, PinchGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from "../../firebase";
import {
    getDocWithLog as getDoc,
    onSnapshotWithLog as onSnapshot,
    setDocWithLog as setDoc,
} from '../../utils/firestoreDebug';

type Props = {
  chatVisivel: boolean;
  setChatVisivel: (v: boolean) => void;
  chatMensagens: any[];
  chatTexto: string;
  setChatTexto: (t: string) => void;
  chatOferta: any;
  chatBloqueado?: boolean;
  usuarioId: string;
  enviarMensagem: (payload: any) => Promise<void> | void;
  excluirMensagem: (mensagem: any, apenasParaMim?: boolean) => Promise<void> | void;
  solicitarAceiteOferta?: () => Promise<void> | void;
  aceitarSolicitacaoChat?: (mensagem: any) => Promise<void> | void;
  recusarSolicitacaoChat?: (mensagem: any) => Promise<void> | void;
  openProfile?: (usuarioPerfilId:any, ofertaParaAceite?:any)=>void;
  onReportMessage?: (payload: { motivo: string; descricao?: string; message?: any; reportedUserId?: string }) => Promise<void> | void;
  onBlockUser?: (userId: string) => Promise<void> | void;
  onUnblockUser?: (userId: string) => Promise<void> | void;
  onModerateMessage?: (mensagem: any, acao: 'ocultar' | 'restaurar' | 'excluir') => Promise<void> | void;
  chatBlockMeta?: { outroId?: string; euBloqueei?: boolean; fuiBloqueado?: boolean };
};

export default function ChatModal({
  chatVisivel,
  setChatVisivel,
  chatMensagens,
  chatTexto,
  setChatTexto,
  chatOferta,
  chatBloqueado = false,
  usuarioId,
  enviarMensagem,
  excluirMensagem,
  solicitarAceiteOferta = () => {},
  aceitarSolicitacaoChat = () => {},
  recusarSolicitacaoChat = () => {},
  openProfile = () => {},
  onReportMessage = async () => {},
  onBlockUser = async () => {},
  onUnblockUser = async () => {},
  onModerateMessage = async () => {},
  chatBlockMeta = {},
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [gravandoAudio, setGravandoAudio] = useState(false);
  const [tocandoAudioId, setTocandoAudioId] = useState<string | null>(null);
  const [audioPausadoId, setAudioPausadoId] = useState<string | null>(null);
  const [gravacaoMs, setGravacaoMs] = useState(0);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [mensagensSelecionadas, setMensagensSelecionadas] = useState<string[]>([]);
  const [solicitacaoEnviadaAgora, setSolicitacaoEnviadaAgora] = useState(false);
  const [assetsGaleriaPorMensagem, setAssetsGaleriaPorMensagem] = useState<Record<string, string>>({});
  const [imagemTelaCheia, setImagemTelaCheia] = useState<string | null>(null);
  const [zoomImagemTelaCheia, setZoomImagemTelaCheia] = useState(1);
  const ultimoToqueImagemRef = useRef(0);
  const [mensagemImagemAberta, setMensagemImagemAberta] = useState<any | null>(null);
  const pinchScale = useRef(new Animated.Value(1)).current;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const playerRef = useRef<any>(null);
  const playerSubscriptionRef = useRef<any>(null);
  const playerMensagemIdRef = useRef<string | null>(null);
  const audioOperacaoEmAndamentoRef = useRef(false);
  // Rastreamento de status online do outro usuário
  const [outroUsuarioOnline, setOutroUsuarioOnline] = useState(false);
  const [termosChatAceitos, setTermosChatAceitos] = useState(false);
  const [termosModalVisivel, setTermosModalVisivel] = useState(false);
  const [aceitandoTermos, setAceitandoTermos] = useState(false);
  const [reportModalVisivel, setReportModalVisivel] = useState(false);
  const [mensagemSelecionadaReport, setMensagemSelecionadaReport] = useState<any | null>(null);
  const [reportDescricaoLivre, setReportDescricaoLivre] = useState('');
  const [reportMotivoSelecionado, setReportMotivoSelecionado] = useState('');
  const [reportEnviando, setReportEnviando] = useState(false);

  const CHAT_TERMS_VERSION = 'chat_terms_v1';
  const REPORT_MOTIVOS = ['Spam', 'Nudez', 'Assédio', 'Violência', 'Golpe', 'Linguagem ofensiva', 'Outro'];

  const FUNDO_PADRAO_URI = require('../../assets/images/fundos/prédios.jpeg');
  const FUNDO_ENTREGA_URI = require('../../assets/images/fundos/entrega.jpeg');
  const FUNDO_CARONA_URI = require('../../assets/images/fundos/carona.jpeg');

  const FUNDO_FUTURISTA_URI: ImageSourcePropType = useMemo(() => {
    const tipo = String(chatOferta?.tipo || '');
    if (tipo === 'entrega') return FUNDO_ENTREGA_URI || FUNDO_PADRAO_URI;
    if (tipo.includes('carona')) return FUNDO_CARONA_URI || FUNDO_PADRAO_URI;
    return FUNDO_PADRAO_URI;
  }, [chatOferta?.tipo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [chatMensagens]);

  useEffect(() => {
    return () => {
      try {
        playerSubscriptionRef.current?.remove?.();
      } catch {}
      try {
        playerRef.current?.remove?.();
      } catch {}
      playerSubscriptionRef.current = null;
      playerRef.current = null;
      playerMensagemIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!gravandoAudio) return;
    setGravacaoMs(Number(recorderState?.durationMillis || 0));
  }, [gravandoAudio, recorderState?.durationMillis]);

  useEffect(() => {
    if (!chatVisivel) {
      setModoSelecao(false);
      setMensagensSelecionadas([]);
    }
  }, [chatVisivel]);

  useEffect(() => {
    setSolicitacaoEnviadaAgora(false);
  }, [chatOferta?.id]);

  useEffect(() => {
    let ativo = true;

    async function carregarTermosChat() {
      if (!chatVisivel || !usuarioId) {
        if (ativo) {
          setTermosChatAceitos(false);
          setTermosModalVisivel(false);
        }
        return;
      }

      try {
        const chaveLocal = `chat_terms_accept_${CHAT_TERMS_VERSION}_${String(usuarioId)}`;
        const localAceite = await AsyncStorage.getItem(chaveLocal);
        let aceito = localAceite === 'sim';

        if (!aceito) {
          const remoto = await getDoc(doc(db, 'chatTermsAccepted', String(usuarioId)));
          const dados: any = remoto.exists() ? remoto.data() : {};
          if (dados?.userId === String(usuarioId) && String(dados?.version || '') === CHAT_TERMS_VERSION) {
            aceito = true;
            await AsyncStorage.setItem(chaveLocal, 'sim');
          }
        }

        if (!ativo) return;
        setTermosChatAceitos(aceito);
        setTermosModalVisivel(!aceito);
      } catch {
        if (!ativo) return;
        setTermosChatAceitos(false);
        setTermosModalVisivel(true);
      }
    }

    carregarTermosChat();

    return () => {
      ativo = false;
    };
  }, [chatVisivel, usuarioId]);

  async function aceitarTermosChatObrigatorio() {
    if (aceitandoTermos) return;
    setAceitandoTermos(true);

    try {
      const uidLocal = String(usuarioId || 'anon_chat').trim() || 'anon_chat';
      const chaveLocal = `chat_terms_accept_${CHAT_TERMS_VERSION}_${uidLocal}`;
      await AsyncStorage.setItem(chaveLocal, 'sim');

      setTermosChatAceitos(true);
      setTermosModalVisivel(false);

      // Sincronizacao remota e opcional: falhas de permissao/rede nao devem bloquear o chat.
      if (usuarioId) {
        setDoc(doc(db, 'chatTermsAccepted', String(usuarioId)), {
          userId: String(usuarioId),
          acceptedAt: serverTimestamp(),
          version: CHAT_TERMS_VERSION,
        }, { merge: true }).catch((error) => {
          console.log('Aviso: nao foi possivel sincronizar aceite remoto dos termos do chat:', error);
        });
      }
    } catch (error) {
      console.log('Erro ao salvar aceite de termos do chat:', error);
      Alert.alert('Erro', 'Não foi possível salvar o aceite dos termos do chat.');
    } finally {
      setAceitandoTermos(false);
    }
  }

  const outroUsuarioId = useMemo(() => {
    const eu = String(usuarioId || '').trim();

    const idMensagem = (Array.isArray(chatMensagens) ? chatMensagens : [])
      .map((m: any) => String(m?.autor || '').trim())
      .find((id: string) => !!id && id !== eu);
    if (idMensagem) return idMensagem;

    const criador = String(chatOferta?.criadorId || '').trim();
    if (criador && criador !== eu) return criador;

    const solicitantes = Array.isArray(chatOferta?.solicitacoes)
      ? chatOferta.solicitacoes
      : (Array.isArray(chatOferta?.solicitantes) ? chatOferta.solicitantes : []);

    const idSolicitante = solicitantes
      .map((id: any) => String(id || '').trim())
      .find((id: string) => !!id && id !== eu);

    return idSolicitante || '';
  }, [chatMensagens, chatOferta?.criadorId, chatOferta?.solicitacoes, chatOferta?.solicitantes, usuarioId]);

  // Monitorar status online do outro usuário
  useEffect(() => {
    if (!outroUsuarioId || !chatVisivel) return;

    try {
      const docRef = doc(db, "usuarios", String(outroUsuarioId));
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        const dados = snapshot.data();
        const lastSeen = Number(dados?.lastSeen || 0);
        const agora = Date.now();
        // Online se visto nos últimos 2 minutos
        const estaOnline = (agora - lastSeen) < 120000;
        setOutroUsuarioOnline(estaOnline);
      }, (error) => {
        // Ignorar erro de doc não encontrado
        setOutroUsuarioOnline(false);
      });

      return () => unsubscribe();
    } catch (error) {
      // Ignorar erros
    }
  }, [outroUsuarioId, chatVisivel]);

  const chaveGaleria = useMemo(() => {
    return `galeria_chat_${String(usuarioId || '')}_${String(chatOferta?.id || '')}`;
  }, [usuarioId, chatOferta?.id]);

  useEffect(() => {
    let ativo = true;

    async function carregarAssetsGaleria() {
      if (!chaveGaleria) return;
      try {
        const salvo = await AsyncStorage.getItem(chaveGaleria);
        if (!ativo) return;
        setAssetsGaleriaPorMensagem(salvo ? JSON.parse(salvo) : {});
      } catch (error) {
        console.log('Erro ao carregar mapa da galeria:', error);
        if (ativo) setAssetsGaleriaPorMensagem({});
      }
    }

    carregarAssetsGaleria();

    return () => {
      ativo = false;
    };
  }, [chaveGaleria]);

  async function salvarMapaGaleria(novoMapa: Record<string, string>) {
    setAssetsGaleriaPorMensagem(novoMapa);
    try {
      await AsyncStorage.setItem(chaveGaleria, JSON.stringify(novoMapa));
    } catch (error) {
      console.log('Erro ao salvar mapa da galeria:', error);
    }
  }

  function extrairDadosDataUrl(dataUrl: string) {
    const match = String(dataUrl || '').match(/^data:(.*?);base64,(.*)$/);
    if (!match) return null;
    const mimeType = String(match[1] || 'image/jpeg');
    const base64 = String(match[2] || '');
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    return { mimeType, base64, ext };
  }

  async function salvarImagemRecebidaNaGaleria(mensagem: any) {
    const mensagemId = String(mensagem?.id || '');
    if (!mensagemId || assetsGaleriaPorMensagem[mensagemId]) return;

    try {
      const permissao = await MediaLibrary.getPermissionsAsync();
      const statusFinal = permissao.granted ? permissao.status : (await MediaLibrary.requestPermissionsAsync()).status;
      if (statusFinal !== 'granted') return;

      const mediaUrl = String(mensagem?.mediaUrl || '');
      let uriLocal = '';

      if (mediaUrl.startsWith('data:')) {
        const data = extrairDadosDataUrl(mediaUrl);
        if (!data) return;
        uriLocal = `${FileSystem.cacheDirectory}chat_img_${String(chatOferta?.id || 'x')}_${mensagemId}.${data.ext}`;
        await FileSystem.writeAsStringAsync(uriLocal, data.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (mediaUrl.startsWith('http')) {
        uriLocal = `${FileSystem.cacheDirectory}chat_img_${String(chatOferta?.id || 'x')}_${mensagemId}.jpg`;
        await FileSystem.downloadAsync(mediaUrl, uriLocal);
      } else if (mediaUrl.startsWith('file://')) {
        uriLocal = mediaUrl;
      }

      if (!uriLocal) return;

      const asset = await MediaLibrary.createAssetAsync(uriLocal);
      await salvarMapaGaleria({
        ...assetsGaleriaPorMensagem,
        [mensagemId]: String(asset.id),
      });
    } catch (error) {
      console.log('Erro ao salvar imagem recebida na galeria:', error);
    }
  }

  useEffect(() => {
    const mensagensImagemRecebidas = (chatMensagens || []).filter(
      (m: any) => m?.tipo === 'imagem' && m?.mediaUrl && String(m?.autor || '') !== String(usuarioId)
    );

    mensagensImagemRecebidas.forEach((mensagem: any) => {
      salvarImagemRecebidaNaGaleria(mensagem);
    });
  }, [chatMensagens, usuarioId, assetsGaleriaPorMensagem]);

  async function apagarMensagemComMidiaLocal(mensagem: any) {
    const mensagemId = String(mensagem?.id || '');
    const assetId = assetsGaleriaPorMensagem[mensagemId];

    if (assetId) {
      try {
        await MediaLibrary.deleteAssetsAsync([assetId]);
      } catch (error) {
        console.log('Erro ao apagar mídia da galeria:', error);
      }

      const novoMapa = { ...assetsGaleriaPorMensagem };
      delete novoMapa[mensagemId];
      await salvarMapaGaleria(novoMapa);
    }

    await excluirMensagem(mensagem);
  }

  async function apagarMensagemDaConversa(mensagem: any) {
    await excluirMensagem(mensagem);
  }

  function abrirAcoesImagem(mensagem: any) {
    const mensagemId = String(mensagem?.id || '');
    const temAssetGaleria = !!assetsGaleriaPorMensagem[mensagemId];
    const nomeRemetente = String(mensagem?.autorNome || mensagem?.autor || 'Usuário');
    const ehMinhaMensagem = String(mensagem?.autor || '') === String(usuarioId || '');

    Alert.alert(
      `Apagar imagem de ${nomeRemetente}`,
      temAssetGaleria
        ? 'Escolha como deseja apagar esta imagem.'
        : 'A imagem ainda não está na galeria local. Você pode apagar da conversa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        ...(ehMinhaMensagem ? [{
          text: 'Apagar para mim',
          style: 'destructive' as const,
          onPress: async () => {
            try {
              await excluirMensagem(mensagem, true);
            } catch (error) {
              console.log('Erro ao apagar imagem para mim:', error);
            }
          },
        }] : []),
        {
          text: 'Apagar só da conversa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apagarMensagemDaConversa(mensagem);
            } catch (error) {
              console.log('Erro ao apagar imagem da conversa:', error);
            }
          },
        },
        ...(temAssetGaleria
          ? [
              {
                text: 'Apagar conversa + galeria',
                style: 'destructive' as const,
                onPress: async () => {
                  Alert.alert(
                    'Confirmar exclusão da galeria',
                    'Além da conversa, essa imagem também será removida da galeria do aparelho (quando existir).',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Apagar agora',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await apagarMensagemComMidiaLocal(mensagem);
                          } catch (error) {
                            console.log('Erro ao apagar imagem da conversa e galeria:', error);
                          }
                        },
                      },
                    ]
                  );
                },
              },
            ]
          : []),
      ]
    );
  }

  function onPinchStateChange(event: any) {
    const state = event?.nativeEvent?.state;
    if (state === GestureState.END || state === GestureState.CANCELLED || state === GestureState.FAILED) {
      const escalaAtual = Number(event?.nativeEvent?.scale || 1);
      const novaEscala = Math.max(1, Math.min(4, Number((zoomImagemTelaCheia * escalaAtual).toFixed(2))));
      setZoomImagemTelaCheia(novaEscala);
      pinchScale.setValue(1);
    }
  }

  function obterIdMensagem(mensagem: any, index: number) {
    if (mensagem?.id) return String(mensagem.id);
    return [
      String(mensagem?.autor || ''),
      String(mensagem?.criadoEm || ''),
      String(mensagem?.tipo || ''),
      String(mensagem?.texto || ''),
      String(mensagem?.mediaUrl || ''),
      String(index),
    ].join('|');
  }

  function alternarSelecaoMensagem(idMensagem: string) {
    setMensagensSelecionadas((anteriores) => {
      if (anteriores.includes(idMensagem)) {
        const atualizadas = anteriores.filter((id) => id !== idMensagem);
        if (atualizadas.length === 0) setModoSelecao(false);
        return atualizadas;
      }
      return [...anteriores, idMensagem];
    });
  }

  function iniciarSelecaoMensagem(idMensagem: string) {
    if (!idMensagem) return;
    setModoSelecao(true);
    setMensagensSelecionadas((anteriores) => (anteriores.includes(idMensagem) ? anteriores : [...anteriores, idMensagem]));
  }

  async function apagarMensagensSelecionadas() {
    const idsSelecionados = [...mensagensSelecionadas];
    if (idsSelecionados.length === 0) return;

    const mensagensParaApagar = todasMensagens.filter((mensagem: any, index: number) => {
      const idMensagem = obterIdMensagem(mensagem, index);
      return idsSelecionados.includes(idMensagem);
    });

    for (const mensagem of mensagensParaApagar) {
      await apagarMensagemDaConversa(mensagem);
    }

    setModoSelecao(false);
    setMensagensSelecionadas([]);
  }

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      if (Platform.OS === 'android') {
        setKeyboardOffset(e.endCoordinates?.height || 0);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
      }
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  async function enviarImagemDaCamera() {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (permissao.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita acesso à câmera para enviar imagem.');
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.25,
        base64: true,
        allowsEditing: false,
      });

      if (resultado.canceled) return;
      const asset = resultado.assets?.[0];
      if (!asset?.uri || !asset.base64) {
        Alert.alert('Erro', 'Não foi possível processar a imagem da câmera para envio.');
        return;
      }

      await enviarMensagem({
        tipo: 'imagem',
        texto: 'Imagem enviada',
        arquivoUri: asset.uri,
        base64Data: asset.base64,
        mediaNome: asset.fileName || 'Foto da câmera',
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (error) {
      console.log('Erro ao capturar imagem:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    }
  }

  async function enviarImagemDaGaleria() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissao.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita acesso à galeria para enviar imagem.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.35,
        base64: true,
        allowsMultipleSelection: false,
      });

      if (resultado.canceled) return;
      const asset = resultado.assets?.[0];
      if (!asset?.uri || !asset.base64) {
        Alert.alert('Erro', 'Não foi possível processar a imagem da galeria para envio.');
        return;
      }

      await enviarMensagem({
        tipo: 'imagem',
        texto: 'Imagem enviada',
        arquivoUri: asset.uri,
        base64Data: asset.base64,
        mediaNome: asset.fileName || 'Imagem da galeria',
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function compartilharLocalizacao() {
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (permissao.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita acesso à localização para compartilhar sua posição.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({});
      const latitude = Number(posicao.coords.latitude.toFixed(6));
      const longitude = Number(posicao.coords.longitude.toFixed(6));

      await enviarMensagem({
        tipo: 'localizacao',
        texto: `Localização compartilhada (${latitude}, ${longitude})`,
        latitude,
        longitude,
      });
    } catch (error) {
      console.log('Erro ao compartilhar localização:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a localização.');
    }
  }

  async function iniciarGravacao() {
    try {
      const permissao = await requestRecordingPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Permita acesso ao microfone para gravar áudio.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setGravandoAudio(true);
      setGravacaoMs(0);
    } catch (error) {
      console.log('Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }

  async function pararGravacao() {
    if (!gravandoAudio) return;

    try {
      await recorder.stop();
      const status: any = recorder.getStatus();
      const uri = String(status?.url || '');
      const duracaoMs = Number(status?.durationMillis || gravacaoMs || 0);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      setGravandoAudio(false);
      setGravacaoMs(0);

      if (!uri) return;

      await enviarMensagem({
        tipo: 'audio',
        texto: 'Áudio enviado',
        arquivoUri: uri,
        mediaNome: 'Mensagem de voz',
        duracaoMs,
        mimeType: 'audio/m4a',
      });
    } catch (error) {
      console.log('Erro ao finalizar gravação:', error);
      Alert.alert('Erro', 'Não foi possível finalizar o áudio.');
      setGravandoAudio(false);
      setGravacaoMs(0);
    }
  }

  function formatarDuracao(ms: number) {
    const totalSegundos = Math.floor(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  }

  function resumoErro(error: any) {
    const bruto = String(error?.message || error || 'erro desconhecido');
    return bruto.length > 180 ? `${bruto.slice(0, 180)}...` : bruto;
  }

  function hashCurto(valor: any) {
    const texto = String(valor || '');
    let hash = 0;
    for (let i = 0; i < texto.length; i += 1) {
      hash = ((hash << 5) - hash + texto.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
  }

  function idArquivoSeguro(valor: any) {
    const texto = String(valor || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (texto) return texto.slice(0, 48);
    return `a${Date.now().toString(36)}`;
  }

  async function resolverUriAudio(url: string, mensagemId: string) {
    if (!String(url || '').startsWith('data:audio')) return url;

    const match = String(url || '').match(/^data:(.*?);base64,(.*)$/);
    if (!match?.[2]) return '';

    const mime = String(match[1] || 'audio/m4a').toLowerCase();
    const ext = mime.includes('mp3') || mime.includes('mpeg')
      ? 'mp3'
      : mime.includes('wav')
        ? 'wav'
        : mime.includes('ogg')
          ? 'ogg'
          : 'm4a';

    const idSeguro = idArquivoSeguro(mensagemId);
    const arquivoLocal = `${FileSystem.cacheDirectory}chat_audio_${String(chatOferta?.id || 'x')}_${idSeguro}.${ext}`;
    if (!FileSystem.cacheDirectory) return url;

    let base64Audio = String(match[2] || '').trim();
    if (/%[0-9A-Fa-f]{2}/.test(base64Audio)) {
      try {
        base64Audio = decodeURIComponent(base64Audio);
      } catch {}
    }

    base64Audio = base64Audio
      .replace(/\s+/g, '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const resto = base64Audio.length % 4;
    if (resto > 0) {
      base64Audio = base64Audio.padEnd(base64Audio.length + (4 - resto), '=');
    }

    try {
      await FileSystem.writeAsStringAsync(arquivoLocal, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return arquivoLocal;
    } catch (error: any) {
      console.log('Falha ao converter áudio base64 para arquivo local:', resumoErro(error));
      return '';
    }
  }

  function obterIdAudioMensagem(mensagem: any) {
    const idNativo = String(mensagem?.id || '').trim();
    if (idNativo) return idNativo;

    const criadoEm = String(mensagem?.criadoEm || '').trim();
    if (criadoEm) return `c_${criadoEm}`;

    const referencia = mensagem?.mediaUrl || mensagem?.texto || 'audio';
    return `h_${hashCurto(referencia)}`;
  }

  async function reproduzirAudio(mensagem: any) {
    const mensagemId = obterIdAudioMensagem(mensagem);

    if (audioOperacaoEmAndamentoRef.current) return;
    if (tocandoAudioId === mensagemId && playerRef.current && playerMensagemIdRef.current === mensagemId) return;

    audioOperacaoEmAndamentoRef.current = true;

    if (audioPausadoId === mensagemId && playerRef.current && playerMensagemIdRef.current === mensagemId) {
      try {
        setTocandoAudioId(mensagemId);
        setAudioPausadoId(null);
        if (typeof playerRef.current?.play === 'function') {
          await Promise.resolve(playerRef.current.play());
        } else if (typeof playerRef.current?.playAsync === 'function') {
          await Promise.resolve(playerRef.current.playAsync());
        }
      } catch (error) {
        console.log('Erro ao continuar áudio:', resumoErro(error));
        setTocandoAudioId(null);
        setAudioPausadoId(mensagemId);
      } finally {
        audioOperacaoEmAndamentoRef.current = false;
      }
      return;
    }

    const urlOriginal = String(mensagem?.mediaUrl || '');
    const url = await resolverUriAudio(urlOriginal, mensagemId);
    if (!url) {
      Alert.alert('Áudio indisponível', 'Esse áudio ainda não está disponível.');
      setTocandoAudioId(null);
      audioOperacaoEmAndamentoRef.current = false;
      return;
    }

    try {
      try {
        playerSubscriptionRef.current?.remove?.();
      } catch {}
      try {
        playerRef.current?.pause?.();
        playerRef.current?.remove?.();
      } catch {}

      playerSubscriptionRef.current = null;
      playerRef.current = null;
      playerMensagemIdRef.current = null;

      const player = createAudioPlayer({ uri: url }, { updateInterval: 250 });
      playerRef.current = player;
      playerMensagemIdRef.current = mensagemId;
      setTocandoAudioId(mensagemId);
      setAudioPausadoId(null);

      playerSubscriptionRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
        if (status?.didJustFinish) {
          setTocandoAudioId(null);
          setAudioPausadoId(null);
          try {
            playerSubscriptionRef.current?.remove?.();
          } catch {}
          playerSubscriptionRef.current = null;
          try {
            player.remove();
          } catch {}
          if (playerRef.current === player) {
            playerRef.current = null;
            playerMensagemIdRef.current = null;
          }
        }
      });

      if (typeof player?.play === 'function') {
        await Promise.resolve(player.play());
      }
    } catch (error) {
      console.log('Erro ao reproduzir áudio:', resumoErro(error));
      setTocandoAudioId(null);
      setAudioPausadoId(null);
    } finally {
      audioOperacaoEmAndamentoRef.current = false;
    }
  }

  async function pausarAudioAtual(mensagemId?: string) {
    const idParaPausar = String(mensagemId || tocandoAudioId || '').trim();
    if (!idParaPausar) return;

    if (audioOperacaoEmAndamentoRef.current) return;
    if (!playerRef.current || playerMensagemIdRef.current !== idParaPausar) return;
    audioOperacaoEmAndamentoRef.current = true;

    try {
      if (typeof playerRef.current?.pause === 'function') {
        await Promise.resolve(playerRef.current.pause());
      } else if (typeof playerRef.current?.pauseAsync === 'function') {
        await Promise.resolve(playerRef.current.pauseAsync());
      }
    } catch (error) {
      console.log('Erro ao pausar áudio:', resumoErro(error));
    } finally {
      audioOperacaoEmAndamentoRef.current = false;
    }

    setAudioPausadoId(idParaPausar);
    setTocandoAudioId(null);
  }

  function abrirLocalizacaoNoMapa(mensagem: any) {
    if (typeof mensagem?.latitude !== 'number' || typeof mensagem?.longitude !== 'number') return;
    const url = `https://www.openstreetmap.org/?mlat=${mensagem.latitude}&mlon=${mensagem.longitude}#map=16/${mensagem.latitude}/${mensagem.longitude}`;
    Linking.openURL(url);
  }

  const todasMensagens = Array.isArray(chatMensagens) ? chatMensagens : [];

  function textoMensagemSeguro(mensagem:any){
    const valor = mensagem?.texto;
    if (typeof valor === 'string') return valor;
    if (valor && typeof valor === 'object') {
      if (typeof valor?.texto === 'string') return valor.texto;
      if (typeof valor?.mensagem === 'string') return valor.mensagem;
      return '';
    }
    if (valor == null) return '';
    return String(valor);
  }

  function iniciaisNome(valor:any){
    const nome = String(valor || '').trim();
    if(!nome) return 'U';
    const partes = nome.split(/\s+/).filter(Boolean);
    const primeira = partes[0]?.[0] || '';
    const segunda = partes.length > 1 ? (partes[partes.length - 1]?.[0] || '') : '';
    return `${primeira}${segunda}`.toUpperCase() || nome[0]?.toUpperCase() || 'U';
  }

  function nomeAutorMensagem(mensagem:any){
    const autorId = String(mensagem?.autor || '').trim();
    const nomeDireto = String(mensagem?.autorNome || '').trim();
    if(nomeDireto) return nomeDireto;

    const solicitanteNome = String(mensagem?.solicitanteNome || '').trim();
    if(solicitanteNome) return solicitanteNome;

    if(autorId && String(chatOferta?.criadorId || '') === autorId){
      const nomeCriador = String(chatOferta?.criadorNome || '').trim();
      if(nomeCriador) return nomeCriador;
    }

    return autorId || 'Usuário';
  }

  async function confirmarBloqueioUsuario(userId: string) {
    const alvo = String(userId || '').trim();
    if (!alvo || alvo === String(usuarioId || '')) return;
    Alert.alert('Bloquear usuário', 'Você não receberá mensagens deste usuário e não poderá enviar mensagens para ele.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Bloquear',
        style: 'destructive',
        onPress: async () => {
          try {
            await onBlockUser(alvo);
          } catch (error) {
            console.log('Erro ao bloquear usuário:', error);
            Alert.alert('Erro', 'Não foi possível bloquear o usuário.');
          }
        },
      },
    ]);
  }

  async function confirmarDesbloqueioUsuario(userId: string) {
    const alvo = String(userId || '').trim();
    if (!alvo) return;
    Alert.alert('Desbloquear usuário', 'Deseja desbloquear este usuário para voltar a conversar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desbloquear',
        onPress: async () => {
          try {
            await onUnblockUser(alvo);
          } catch (error) {
            console.log('Erro ao desbloquear usuário:', error);
            Alert.alert('Erro', 'Não foi possível desbloquear o usuário.');
          }
        },
      },
    ]);
  }

  function abrirModalDenunciaMensagem(mensagem: any) {
    setMensagemSelecionadaReport(mensagem);
    setReportMotivoSelecionado('');
    setReportDescricaoLivre('');
    setReportModalVisivel(true);
  }

  async function enviarDenunciaMensagem() {
    if (!mensagemSelecionadaReport || !reportMotivoSelecionado || reportEnviando) return;
    setReportEnviando(true);
    try {
      await onReportMessage({
        motivo: reportMotivoSelecionado,
        descricao: reportMotivoSelecionado === 'Outro' ? reportDescricaoLivre : '',
        message: mensagemSelecionadaReport,
        reportedUserId: String(mensagemSelecionadaReport?.autor || ''),
      });
      setReportModalVisivel(false);
      setMensagemSelecionadaReport(null);
      Alert.alert('Denúncia enviada', 'Sua denúncia foi registrada para análise.');
    } catch (error) {
      console.log('Erro ao enviar denúncia:', error);
      Alert.alert('Erro', 'Não foi possível enviar a denúncia agora.');
    } finally {
      setReportEnviando(false);
    }
  }

  function abrirAcoesMensagem(mensagem: any) {
    const autorId = String(mensagem?.autor || '').trim();
    const eu = String(usuarioId || '').trim();
    const possoBloquear = !!autorId && autorId !== eu;
    const bloqueadoPorMim = chatBlockMeta?.euBloqueei && String(chatBlockMeta?.outroId || '') === autorId;
    const souCriadorDaOferta = String(chatOferta?.criadorId || '') === eu;

    const abrirAcoesSeguranca = () => {
      const acoesSeguranca: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [
        {
          text: 'Denunciar mensagem',
          onPress: () => abrirModalDenunciaMensagem(mensagem),
        },
      ];

      if (possoBloquear) {
        if (bloqueadoPorMim) {
          acoesSeguranca.push({ text: 'Desbloquear usuário', onPress: () => confirmarDesbloqueioUsuario(autorId) });
        } else {
          acoesSeguranca.push({ text: 'Bloquear usuário', style: 'destructive', onPress: () => confirmarBloqueioUsuario(autorId) });
        }
      }

      acoesSeguranca.push({ text: 'Cancelar', style: 'cancel' });
      Alert.alert('Ações de segurança', 'Escolha uma ação', acoesSeguranca);
    };

    const abrirAcoesModeracao = () => {
      const acoesModeracao: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [];

      if (mensagem?.hiddenByModeration) {
        acoesModeracao.push({ text: 'Restaurar mensagem', onPress: () => onModerateMessage(mensagem, 'restaurar') });
      } else {
        acoesModeracao.push({ text: 'Ocultar por moderação', onPress: () => onModerateMessage(mensagem, 'ocultar') });
      }

      acoesModeracao.push({ text: 'Excluir como admin', style: 'destructive', onPress: () => onModerateMessage(mensagem, 'excluir') });
      acoesModeracao.push({ text: 'Cancelar', style: 'cancel' });
      Alert.alert('Ações de moderação', 'Escolha uma ação', acoesModeracao);
    };

    // No Android, Alert com muitos botões pode ocultar o botão de cancelar.
    // Dividimos em submenus curtos para garantir botão "Cancelar" visível.
    if (Platform.OS === 'android' && souCriadorDaOferta) {
      Alert.alert('Ações da mensagem', 'Escolha uma categoria', [
        { text: 'Segurança', onPress: abrirAcoesSeguranca },
        { text: 'Moderação', onPress: abrirAcoesModeracao },
        { text: 'Cancelar', style: 'cancel' },
      ]);
      return;
    }

    if (Platform.OS === 'android') {
      abrirAcoesSeguranca();
      return;
    }

    const acoes: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [
      {
        text: 'Denunciar mensagem',
        onPress: () => abrirModalDenunciaMensagem(mensagem),
      },
    ];

    if (possoBloquear) {
      if (bloqueadoPorMim) {
        acoes.push({ text: 'Desbloquear usuário', onPress: () => confirmarDesbloqueioUsuario(autorId) });
      } else {
        acoes.push({ text: 'Bloquear usuário', style: 'destructive', onPress: () => confirmarBloqueioUsuario(autorId) });
      }
    }

    if (souCriadorDaOferta) {
      if (mensagem?.hiddenByModeration) {
        acoes.push({ text: 'Restaurar mensagem', onPress: () => onModerateMessage(mensagem, 'restaurar') });
      } else {
        acoes.push({ text: 'Ocultar por moderação', onPress: () => onModerateMessage(mensagem, 'ocultar') });
      }
      acoes.push({ text: 'Excluir como admin', style: 'destructive', onPress: () => onModerateMessage(mensagem, 'excluir') });
    }

    acoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Ações da mensagem', 'Escolha uma ação', acoes);
  }

  const renderizarConteudoMensagem = (mensagem: any) => {
    // Verifica se a mensagem foi apagada para este usuário específico
    const apagadoPara = Array.isArray(mensagem?.apagadoPara) ? mensagem.apagadoPara : [];
    if (apagadoPara.includes(String(usuarioId || ''))) {
      return null;
    }

    if (mensagem?.apagada || String(mensagem?.tipo || '') === 'apagada') {
      return (
        <Text style={styles.mensagemApagadaTexto}>mensagem apagada</Text>
      );
    }

    if (mensagem.tipo === 'imagem' && mensagem.mediaUrl) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setMensagemImagemAberta(mensagem);
            setImagemTelaCheia(String(mensagem.mediaUrl));
            setZoomImagemTelaCheia(1);
          }}
          onLongPress={() => abrirAcoesImagem(mensagem)}
          delayLongPress={260}
        >
          <View style={styles.midiaImagemContainer}>
            <Image source={{ uri: mensagem.mediaUrl }} style={styles.midiaImagem} />
            <View style={styles.midiaImagemIconBadge}>
              <MaterialCommunityIcons name="image-filter-center-focus" size={12} color="#a5f3fc" />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (mensagem.tipo === 'audio') {
      const mensagemAudioId = obterIdAudioMensagem(mensagem);
      const audioPausadoDestaMensagem = audioPausadoId === mensagemAudioId;
      const audioTocandoDestaMensagem = tocandoAudioId === mensagemAudioId;
      return (
        <View style={styles.audioBubble}>
          <TouchableOpacity
            onPress={async () => {
              if (audioTocandoDestaMensagem) {
                await pausarAudioAtual(mensagemAudioId);
                return;
              }
              await reproduzirAudio(mensagem);
            }}
            style={styles.audioPrimaryButton}
          >
            <MaterialCommunityIcons
              name={audioTocandoDestaMensagem
                ? 'pause-octagon-outline'
                : audioPausadoDestaMensagem
                  ? 'play-network-outline'
                  : 'waveform'}
              size={24}
              color="#fff"
            />
            <Text style={styles.audioLabel}>
              {audioTocandoDestaMensagem
                ? 'Pausar áudio'
                : audioPausadoDestaMensagem
                  ? 'Retomar'
                  : 'Ouvir áudio'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mensagem.tipo === 'localizacao') {
      return (
        <TouchableOpacity onPress={() => abrirLocalizacaoNoMapa(mensagem)} style={styles.locationBubble}>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#fff" />
          <Text style={styles.locationLabel}>{textoMensagemSeguro(mensagem) || 'Localização compartilhada'}</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.textoMensagem}>{textoMensagemSeguro(mensagem)}</Text>;
  };

  const ehCriadorOferta = String(chatOferta?.criadorId || '') === String(usuarioId || '');
  const statusOfertaChat = String(chatOferta?.status || '');
  const ofertaBloqueadaParaSolicitacao =
    statusOfertaChat === 'aceita' ||
    statusOfertaChat === 'cancelada' ||
    statusOfertaChat === 'em_andamento' ||
    statusOfertaChat === 'finalizada';
  const solicitacoesAtuais = Array.isArray(chatOferta?.solicitacoes)
    ? chatOferta.solicitacoes.map((id: any) => String(id))
    : (Array.isArray(chatOferta?.solicitantes)
        ? chatOferta.solicitantes.map((id: any) => String(id))
        : []);
  const jaSolicitouNoChatRemoto = solicitacoesAtuais.includes(String(usuarioId || ''));
  const jaSolicitouNoChat = jaSolicitouNoChatRemoto || solicitacaoEnviadaAgora;
  const solicitacaoBloqueadaPorOutro = solicitacoesAtuais.some((id: string) => id !== String(usuarioId || ''));
  const mostrarAcaoSolicitarNoChat =
    !ehCriadorOferta &&
    !ofertaBloqueadaParaSolicitacao &&
    !chatBloqueado &&
    !jaSolicitouNoChat &&
    !solicitacaoBloqueadaPorOutro;
  const podeSolicitarNoChat = mostrarAcaoSolicitarNoChat && !jaSolicitouNoChat && !solicitacaoBloqueadaPorOutro;
  const labelSolicitarNoChat = jaSolicitouNoChat
    ? 'Solicitação enviada'
    : solicitacaoBloqueadaPorOutro
      ? 'Solicitação em análise'
      : String(chatOferta?.tipo || '').includes('entrega')
        ? 'Solicitar entrega'
        : 'Solicitar corrida';
  const statusSolicitacaoChat = jaSolicitouNoChat
    ? 'Solicitação enviada'
    : solicitacaoBloqueadaPorOutro
      ? 'Solicitação em análise'
      : '';
  const bloqueioUsuarioAtivo = !!chatBloqueado || !!chatBlockMeta?.euBloqueei || !!chatBlockMeta?.fuiBloqueado;
  const chatInteracaoBloqueada = bloqueioUsuarioAtivo || !termosChatAceitos;

  useEffect(() => {
    if (chatInteracaoBloqueada && String(chatTexto || '').length > 0) {
      setChatTexto('');
    }
  }, [chatInteracaoBloqueada, chatTexto, setChatTexto]);

  if (!chatVisivel || !chatOferta) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={styles.overlay}
    >
      <ImageBackground source={FUNDO_FUTURISTA_URI} style={styles.background} resizeMode="cover">
        <View style={styles.backgroundTint} />
        <View style={styles.flashLinePink} />
        <View style={styles.flashLineBlue} />
        <View style={styles.flashLineGreen} />

        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {modoSelecao
                  ? `${mensagensSelecionadas.length} selecionada${mensagensSelecionadas.length > 1 ? 's' : ''}`
                  : (String(chatOferta?.criadorNome || '').trim() || 'Conversa')}
              </Text>
              {!modoSelecao && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: outroUsuarioOnline ? '#22c55e' : '#71717a',
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ color: '#a1a1aa', fontSize: 12 }}>
                    {outroUsuarioOnline ? 'Online agora' : 'Offline'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {!modoSelecao && !!chatBlockMeta?.euBloqueei && !!chatBlockMeta?.outroId && (
                <TouchableOpacity
                  onPress={() => confirmarDesbloqueioUsuario(String(chatBlockMeta?.outroId || ''))}
                  style={styles.headerActionButton}
                >
                  <MaterialCommunityIcons name="lock-open-variant-outline" size={22} color="#86efac" />
                </TouchableOpacity>
              )}

              {modoSelecao && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setModoSelecao(false);
                      setMensagensSelecionadas([]);
                    }}
                    style={styles.headerActionButton}
                  >
                    <MaterialCommunityIcons name="close-circle-outline" size={22} color="#dbeafe" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Apagar mensagens',
                        'Deseja apagar as mensagens selecionadas?\n\nNa exclusão em lote, as mídias da galeria NÃO serão apagadas.',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Apagar', style: 'destructive', onPress: () => apagarMensagensSelecionadas() },
                        ]
                      );
                    }}
                    style={styles.headerActionButton}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fecaca" />
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={() => {
                  setModoSelecao(false);
                  setMensagensSelecionadas([]);
                  setChatVisivel(false);
                }}
                style={styles.headerActionButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scrollMensagens}
            contentContainerStyle={styles.scrollMensagensConteudo}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            keyboardDismissMode="on-drag"
          >
            {todasMensagens.length === 0 && (
              <Text style={styles.mensagemVazia}>Comece a conversa!</Text>
            )}

            {todasMensagens.map((mensagem: any, index: number) => {
              // Verificar se a mensagem foi apagada para o usuário atual
              const apagadoParaMim = Array.isArray(mensagem?.apagadoPara) && 
                mensagem.apagadoPara.includes(String(usuarioId || ''));
              if (apagadoParaMim) {
                return null;
              }

              const mensagemApagada = !!mensagem?.apagada || String(mensagem?.tipo || '') === 'apagada';
              const ehMeuMensagem = String(mensagem.autor) === String(usuarioId);
              const autorIdMensagem = String(mensagem?.autor || '').trim();
              const autorNomeMensagem = nomeAutorMensagem(mensagem);
              const autorFotoMensagem = String(mensagem?.autorFoto || '').trim();
              const idMensagem = obterIdMensagem(mensagem, index);
              const selecionada = mensagensSelecionadas.includes(idMensagem);
              const ehSolicitacaoAceite = !mensagemApagada && String(mensagem?.acao || '') === 'solicitacao_aceite';
              const solicitanteIdMsg = String(mensagem?.solicitanteId || mensagem?.autor || '').trim();
              const statusSolicitacaoMsg = String(mensagem?.statusSolicitacao || 'pendente');
              const euSouSolicitanteDaMensagem = String(solicitanteIdMsg) === String(usuarioId);
              const podeAceitarSolicitacaoMsg =
                ehSolicitacaoAceite &&
                statusSolicitacaoMsg === 'pendente' &&
                statusOfertaChat === 'ativa' &&
                !!solicitanteIdMsg &&
                !euSouSolicitanteDaMensagem;
              const foiLidaPorOutro = Array.isArray(mensagem.lidoPor)
                ? mensagem.lidoPor.some((id: string) => id !== usuarioId)
                : false;
              const statusMensagem = mensagem.pendenteEnvio
                ? '⏳ Enviando...'
                : foiLidaPorOutro
                  ? '✓✓ Lida'
                  : '✓ Enviada';

              return (
                <Pressable
                  key={mensagem.id || index}
                  onLongPress={() => iniciarSelecaoMensagem(idMensagem)}
                  delayLongPress={260}
                  onPress={() => {
                    if (!modoSelecao) return;
                    alternarSelecaoMensagem(idMensagem);
                  }}
                  style={[
                    styles.bubble,
                    ehMeuMensagem ? styles.bubbleMinha : styles.bubbleOutro,
                    selecionada && styles.bubbleSelecionada,
                  ]}
                >
                  {modoSelecao && (
                    <View style={styles.selectionMarkContainer}>
                      <MaterialCommunityIcons
                        name={selecionada ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={18}
                        color={selecionada ? '#86efac' : '#d1d5db'}
                      />
                    </View>
                  )}

                  {!!autorIdMensagem && (
                    <TouchableOpacity
                      disabled={modoSelecao}
                      onPress={() => {
                        setChatVisivel(false);
                        openProfile(autorIdMensagem, chatOferta);
                      }}
                      style={styles.authorRow}
                    >
                      {autorFotoMensagem ? (
                        <Image source={{ uri: autorFotoMensagem }} style={styles.authorAvatarImage} />
                      ) : (
                        <View style={styles.authorAvatarFallback}>
                          <Text style={styles.authorAvatarFallbackText}>{iniciaisNome(autorNomeMensagem)}</Text>
                        </View>
                      )}
                      <Text style={styles.authorNameText} numberOfLines={1}>
                        {autorNomeMensagem}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!modoSelecao && (
                    <TouchableOpacity
                      onPress={() => abrirAcoesMensagem(mensagem)}
                      style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.24)' }}
                    >
                      <MaterialCommunityIcons name="dots-horizontal" size={16} color="#e2e8f0" />
                    </TouchableOpacity>
                  )}

                  {renderizarConteudoMensagem(mensagem)}

                  {podeAceitarSolicitacaoMsg && (
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await aceitarSolicitacaoChat(mensagem);
                          } catch (error) {
                            console.log('Erro ao aceitar solicitação pelo chat:', error);
                          }
                        }}
                        style={{
                          backgroundColor: '#16a34a',
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          alignSelf: 'flex-start',
                          marginRight: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#d9f99d" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                          Aceitar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await recusarSolicitacaoChat(mensagem);
                          } catch (error) {
                            console.log('Erro ao recusar solicitação pelo chat:', error);
                          }
                        }}
                        style={{
                          backgroundColor: '#b91c1c',
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          alignSelf: 'flex-start',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="close-octagon" size={14} color="#fecaca" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                          Recusar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {ehSolicitacaoAceite && statusSolicitacaoMsg === 'aceita' && (
                    <View
                      style={{
                        marginTop: 8,
                        backgroundColor: 'rgba(22,163,74,0.22)',
                        borderWidth: 1,
                        borderColor: 'rgba(74,222,128,0.5)',
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#86efac" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#86efac', fontWeight: 'bold', fontSize: 12 }}>
                          Solicitação aceita
                        </Text>
                      </View>
                    </View>
                  )}

                  {ehSolicitacaoAceite && statusSolicitacaoMsg === 'recusada' && (
                    <View
                      style={{
                        marginTop: 8,
                        backgroundColor: 'rgba(239,68,68,0.18)',
                        borderWidth: 1,
                        borderColor: 'rgba(248,113,113,0.45)',
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="close-octagon" size={14} color="#fca5a5" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: 12 }}>
                          Solicitação recusada
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text style={[styles.horaMensagem, ehMeuMensagem ? styles.horaMinha : styles.horaOutro]}>
                    {new Date(mensagem.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {ehMeuMensagem ? ` · ${statusMensagem}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: Math.max(insets.bottom + 10, Platform.OS === 'android' ? 18 : 24),
                marginBottom: Platform.OS === 'android' ? keyboardOffset : 0,
              },
            ]}
          >
            <View style={styles.composerShell}>
              <View style={styles.attachmentRail}>
                <View style={styles.actionPod}>
                  <TouchableOpacity disabled={chatInteracaoBloqueada} onPress={enviarImagemDaCamera} style={[styles.iconButton, styles.iconButtonCamera, chatInteracaoBloqueada && styles.iconButtonDisabled]}>
                    <MaterialCommunityIcons name="camera-wireless-outline" size={14} color="#a5f3fc" />
                  </TouchableOpacity>
                  <View style={[styles.actionPodAura, styles.actionPodAuraCamera]} />
                  <View style={[styles.actionPodGlow, styles.actionPodGlowCamera]} />
                </View>

                <View style={styles.actionPod}>
                  <TouchableOpacity disabled={chatInteracaoBloqueada} onPress={enviarImagemDaGaleria} style={[styles.iconButton, styles.iconButtonGallery, chatInteracaoBloqueada && styles.iconButtonDisabled]}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={14} color="#f5d0fe" />
                  </TouchableOpacity>
                  <View style={[styles.actionPodAura, styles.actionPodAuraGallery]} />
                  <View style={[styles.actionPodGlow, styles.actionPodGlowGallery]} />
                </View>

                <View style={styles.actionPod}>
                  <TouchableOpacity disabled={chatInteracaoBloqueada} onPress={compartilharLocalizacao} style={[styles.iconButton, styles.iconButtonLocation, chatInteracaoBloqueada && styles.iconButtonDisabled]}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#bae6fd" />
                  </TouchableOpacity>
                  <View style={[styles.actionPodAura, styles.actionPodAuraLocation]} />
                  <View style={[styles.actionPodGlow, styles.actionPodGlowLocation]} />
                </View>

                <View style={styles.actionPod}>
                  <TouchableOpacity
                    disabled={chatInteracaoBloqueada}
                    onPress={gravandoAudio ? pararGravacao : iniciarGravacao}
                    style={[styles.iconButton, styles.iconButtonAudio, gravandoAudio && styles.iconButtonAudioRecording, chatInteracaoBloqueada && styles.iconButtonDisabled]}
                  >
                    <MaterialCommunityIcons name={gravandoAudio ? 'stop-circle-outline' : 'microphone-outline'} size={14} color="#ddd6fe" />
                  </TouchableOpacity>
                  <View style={[styles.actionPodAura, styles.actionPodAuraAudio, gravandoAudio && styles.actionPodAuraAudioRecording]} />
                  <View style={[styles.actionPodGlow, styles.actionPodGlowAudio, gravandoAudio && styles.actionPodGlowAudioRecording]} />
                </View>
              </View>

              {!!statusSolicitacaoChat && (
                <View style={{ marginTop: 4, marginBottom: 6, alignSelf: 'flex-start', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#cbd5e1', fontSize: 10, fontWeight: '700' }}>{statusSolicitacaoChat}</Text>
                </View>
              )}

              {mostrarAcaoSolicitarNoChat && (
                <TouchableOpacity
                  disabled={!podeSolicitarNoChat || chatInteracaoBloqueada}
                  onPress={async () => {
                    if (!podeSolicitarNoChat || chatInteracaoBloqueada) return;
                    setSolicitacaoEnviadaAgora(true);
                    try {
                      await solicitarAceiteOferta();
                    } catch (error) {
                      console.log('Erro ao solicitar pelo chat:', error);
                      setSolicitacaoEnviadaAgora(false);
                    }
                  }}
                  style={[
                    styles.solicitarTopoBtn,
                    {
                      backgroundColor: podeSolicitarNoChat ? '#0ea5e9' : '#334155',
                      borderColor: podeSolicitarNoChat ? '#67e8f9' : '#475569',
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons
                      name={podeSolicitarNoChat ? 'send-circle-outline' : 'clock-alert-outline'}
                      size={13}
                      color={podeSolicitarNoChat ? '#cffafe' : '#cbd5e1'}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>
                      {labelSolicitarNoChat}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {!bloqueioUsuarioAtivo && (
                <View style={styles.messageComposerRow}>

                  <View style={styles.textInputFrame}>
                    <TextInput
                      value={chatTexto}
                      onChangeText={chatInteracaoBloqueada ? undefined : setChatTexto}
                      editable={!chatInteracaoBloqueada}
                      placeholder={!termosChatAceitos ? 'Aceite os termos do chat para continuar' : 'Digite mensagem...'}
                      placeholderTextColor="#6e88b8"
                      style={styles.textInput}
                    />
                  </View>

                  <Pressable
                    onPress={async () => {
                      if (chatInteracaoBloqueada) return;
                      if (!chatTexto.trim()) return;
                      await enviarMensagem({ tipo: 'texto', texto: chatTexto });
                      setChatTexto('');
                    }}
                    style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed, chatInteracaoBloqueada && styles.wrapDisabled]}
                  >
                    <View style={styles.outerSkew}>
                      <View style={styles.outerBorder}>
                        <View style={styles.innerSkew}>
                          <View style={styles.innerBox}>
                            <Text style={styles.setas}>»»</Text>
                            <Text style={styles.textoEnviar}>{'ENVIAR'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>
              )}

              {bloqueioUsuarioAtivo && (
                <View style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(248,113,113,0.45)',
                  backgroundColor: 'rgba(127,29,29,0.22)',
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}>
                  <Text style={{ color: '#fecaca', fontWeight: '700' }}>
                    {chatBlockMeta?.fuiBloqueado
                      ? 'Você foi bloqueado e não pode enviar mensagens nesta conversa.'
                      : 'Você bloqueou este usuário. Desbloqueie para voltar a enviar mensagens.'}
                  </Text>

                  {!!chatBlockMeta?.euBloqueei && !!chatBlockMeta?.outroId && (
                    <TouchableOpacity
                      onPress={() => confirmarDesbloqueioUsuario(String(chatBlockMeta?.outroId || ''))}
                      style={{
                        marginTop: 10,
                        alignSelf: 'flex-start',
                        backgroundColor: '#14532d',
                        borderColor: '#4ade80',
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name="lock-open-variant-outline" size={14} color="#bbf7d0" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#dcfce7', fontWeight: '700', fontSize: 12 }}>Desbloquear usuário</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {gravandoAudio && (
                <View style={styles.recordingPanel}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>Gravando áudio {formatarDuracao(gravacaoMs)}</Text>
                  <View style={styles.recordingBars}>
                    {[10, 16, 22, 14, 18, 12].map((altura, index) => (
                      <View key={index} style={[styles.recordingBar, { height: altura }]} />
                    ))}
                  </View>
                </View>
              )}

              {bloqueioUsuarioAtivo && (
                <View style={styles.chatBloqueadoAviso}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#fecaca" style={{ marginRight: 6 }} />
                  <Text style={styles.chatBloqueadoTexto}>Chat bloqueado para esta oferta</Text>
                </View>
              )}

              {!termosChatAceitos && (
                <View style={styles.chatBloqueadoAviso}>
                  <MaterialCommunityIcons name="file-document-alert-outline" size={14} color="#fde68a" style={{ marginRight: 6 }} />
                  <Text style={styles.chatBloqueadoTexto}>Aceite os termos obrigatórios do chat para enviar mensagens</Text>
                </View>
              )}
            </View>

            <Text style={styles.avisoLegalChat}>
              Aviso legal: a plataforma não participa de pagamentos entre usuários e não se responsabiliza por uso ilegal do serviço.
            </Text>
          </View>
        </View>
      </ImageBackground>

      <Modal
        visible={termosModalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.imagemTelaCheiaOverlay}>
          <View style={{ width: '90%', maxWidth: 460, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 16 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Termos obrigatórios do chat</Text>
            <Text style={{ color: '#cbd5e1', lineHeight: 20, marginBottom: 14 }}>
              Não é permitido nudez, violência, ameaças, golpes, spam, assédio ou envio de conteúdo ilegal.
            </Text>
            <TouchableOpacity
              onPress={aceitarTermosChatObrigatorio}
              disabled={aceitandoTermos}
              style={{ backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#67e8f9' }}
            >
              <Text style={{ color: '#f8fafc', fontWeight: '800' }}>{aceitandoTermos ? 'Salvando...' : 'Concordo'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reportModalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisivel(false)}
      >
        <View style={styles.imagemTelaCheiaOverlay}>
          <View style={{ width: '92%', maxWidth: 500, backgroundColor: '#020617', borderWidth: 1, borderColor: '#334155', borderRadius: 16, padding: 14, maxHeight: '80%' }}>
            <Text style={{ color: '#f8fafc', fontSize: 17, fontWeight: '800', marginBottom: 10 }}>Denunciar mensagem</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {REPORT_MOTIVOS.map((motivo) => {
                const ativo = reportMotivoSelecionado === motivo;
                return (
                  <TouchableOpacity
                    key={motivo}
                    onPress={() => setReportMotivoSelecionado(motivo)}
                    style={{
                      borderWidth: 1,
                      borderColor: ativo ? '#67e8f9' : '#334155',
                      backgroundColor: ativo ? 'rgba(14,165,233,0.2)' : 'rgba(15,23,42,0.8)',
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{motivo}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {reportMotivoSelecionado === 'Outro' && (
              <TextInput
                value={reportDescricaoLivre}
                onChangeText={setReportDescricaoLivre}
                multiline
                placeholder="Descreva o motivo"
                placeholderTextColor="#64748b"
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 10,
                  color: '#f1f5f9',
                  padding: 10,
                  minHeight: 72,
                  textAlignVertical: 'top',
                }}
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setReportModalVisivel(false)} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!reportMotivoSelecionado || reportEnviando || (reportMotivoSelecionado === 'Outro' && !String(reportDescricaoLivre || '').trim())}
                onPress={enviarDenunciaMensagem}
                style={{
                  backgroundColor: '#dc2626',
                  borderWidth: 1,
                  borderColor: '#fca5a5',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  opacity: (!reportMotivoSelecionado || reportEnviando) ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{reportEnviando ? 'Enviando...' : 'Enviar denúncia'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!imagemTelaCheia}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMensagemImagemAberta(null);
          setImagemTelaCheia(null);
          setZoomImagemTelaCheia(1);
          pinchScale.setValue(1);
        }}
      >
        <View style={styles.imagemTelaCheiaOverlay}>
          <TouchableOpacity
            style={styles.imagemTelaCheiaFechar}
            onPress={() => {
              setMensagemImagemAberta(null);
              setImagemTelaCheia(null);
              setZoomImagemTelaCheia(1);
              pinchScale.setValue(1);
            }}
          >
            <MaterialCommunityIcons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          {!!mensagemImagemAberta && (
            <TouchableOpacity
              style={styles.imagemTelaCheiaApagar}
              onPress={() => abrirAcoesImagem(mensagemImagemAberta)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fecaca" />
            </TouchableOpacity>
          )}

          <ScrollView
            style={styles.imagemTelaCheiaScroll}
            contentContainerStyle={styles.imagemTelaCheiaScrollConteudo}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => {
                const agora = Date.now();
                const diff = agora - ultimoToqueImagemRef.current;
                ultimoToqueImagemRef.current = agora;

                if (diff < 280) {
                  setZoomImagemTelaCheia((atual) => (atual > 1 ? 1 : 2.4));
                }
              }}
              style={styles.imagemTelaCheiaPressArea}
            >
              {imagemTelaCheia && (
                <PinchGestureHandler
                  onGestureEvent={Animated.event(
                    [{ nativeEvent: { scale: pinchScale } }],
                    { useNativeDriver: true }
                  )}
                  onHandlerStateChange={onPinchStateChange}
                >
                  <Animated.View
                    style={{
                      transform: [
                        { scale: Animated.multiply(pinchScale, zoomImagemTelaCheia) },
                      ],
                    }}
                  >
                    <Image
                      source={{ uri: imagemTelaCheia }}
                      resizeMode="contain"
                      style={styles.imagemTelaCheia}
                    />
                  </Animated.View>
                </PinchGestureHandler>
              )}
            </Pressable>
          </ScrollView>

          <View style={styles.zoomControles}>
            <TouchableOpacity
              style={styles.zoomBotao}
              onPress={() => setZoomImagemTelaCheia((z) => Math.max(1, Number((z - 0.3).toFixed(2))))}
            >
              <MaterialCommunityIcons name="minus" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.zoomTexto}>{`${Math.round(zoomImagemTelaCheia * 100)}%`}</Text>

            <TouchableOpacity
              style={styles.zoomBotao}
              onPress={() => setZoomImagemTelaCheia((z) => Math.min(4, Number((z + 0.3).toFixed(2))))}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999999,
    elevation: 999999,
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  flashLinePink: {
    position: 'absolute',
    top: 80,
    left: -30,
    width: '135%',
    height: 3,
    backgroundColor: 'rgba(252,74,137,0.30)',
    transform: [{ rotate: '12deg' }],
  },
  flashLineBlue: {
    position: 'absolute',
    top: 170,
    left: -26,
    width: '132%',
    height: 3,
    backgroundColor: 'rgba(56,189,248,0.28)',
    transform: [{ rotate: '-8deg' }],
  },
  flashLineGreen: {
    position: 'absolute',
    top: 285,
    left: -42,
    width: '142%',
    height: 2,
    backgroundColor: 'rgba(132,204,22,0.20)',
    transform: [{ rotate: '6deg' }],
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 10,
  },
  scrollMensagens: {
    flex: 1,
  },
  scrollMensagensConteudo: {
    padding: 15,
  },
  mensagemVazia: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  bubble: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 24,
    maxWidth: '85%',
  },
  bubbleSelecionada: {
    borderWidth: 2,
    borderColor: '#86efac',
  },
  bubbleMinha: {
    alignSelf: 'flex-end',
    backgroundColor: '#16a34a',
  },
  bubbleOutro: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
  },
  selectionMarkContainer: {
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  authorAvatarImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.65)',
    backgroundColor: '#0f172a',
  },
  authorAvatarFallback: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.65)',
    backgroundColor: 'rgba(30,41,59,0.9)',
  },
  authorAvatarFallbackText: {
    color: '#e2e8f0',
    fontSize: 9,
    fontWeight: '700',
  },
  authorNameText: {
    color: '#bfdbfe',
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 170,
  },
  midiaImagem: {
    width: 220,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  midiaImagemContainer: {
    position: 'relative',
  },
  midiaImagemIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  imagemTelaCheiaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.97)',
    justifyContent: 'center',
  },
  imagemTelaCheiaFechar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 34 : 52,
    right: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  imagemTelaCheiaApagar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 34 : 52,
    left: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,29,29,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  imagemTelaCheiaScroll: {
    flex: 1,
  },
  imagemTelaCheiaScrollConteudo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  imagemTelaCheiaPressArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemTelaCheia: {
    width: 340,
    height: 620,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  zoomControles: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 24 : 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.45)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  zoomBotao: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.42)',
  },
  zoomTexto: {
    color: '#e2e8f0',
    fontWeight: '700',
    minWidth: 62,
    textAlign: 'center',
    fontSize: 12,
  },
  textoMensagem: {
    color: '#fff',
  },
  mensagemApagadaTexto: {
    color: '#cbd5e1',
    fontStyle: 'italic',
    textDecorationLine: 'line-through',
  },
  horaMensagem: {
    fontSize: 10,
    marginTop: 4,
  },
  horaMinha: {
    color: '#d4f1d4',
  },
  horaOutro: {
    color: '#999',
  },
  audioBubble: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: 'visible',
  },
  audioPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  audioLabel: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  locationBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  locationLabel: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: 'rgba(3, 8, 20, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(84, 124, 255, 0.25)',
  },
  composerShell: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'rgba(10, 18, 34, 0.96)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(110, 168, 255, 0.5)',
    padding: 6,
    overflow: 'hidden',
  },
  attachmentRail: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  actionPod: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 2,
  },
  iconButton: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,38,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.82)',
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
  actionPodAura: {
    position: 'absolute',
    bottom: 1,
    width: 22,
    height: 6,
    borderRadius: 999,
    opacity: 0.3,
  },
  actionPodAuraCamera: {
    backgroundColor: 'rgba(34,211,238,0.35)',
  },
  actionPodAuraGallery: {
    backgroundColor: 'rgba(244,114,182,0.32)',
  },
  actionPodAuraLocation: {
    backgroundColor: 'rgba(56,189,248,0.34)',
  },
  actionPodAuraAudio: {
    backgroundColor: 'rgba(167,139,250,0.34)',
  },
  actionPodAuraAudioRecording: {
    backgroundColor: 'rgba(248,113,113,0.4)',
  },
  actionPodGlow: {
    width: 20,
    height: 6,
    borderRadius: 999,
    marginTop: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(34,211,238,0.2)',
  },
  actionPodGlowCamera: {
    backgroundColor: 'rgba(34,211,238,0.28)',
    borderColor: 'rgba(103,232,249,0.55)',
  },
  actionPodGlowGallery: {
    backgroundColor: 'rgba(244,114,182,0.24)',
    borderColor: 'rgba(244,114,182,0.52)',
  },
  actionPodGlowLocation: {
    backgroundColor: 'rgba(56,189,248,0.24)',
    borderColor: 'rgba(56,189,248,0.54)',
  },
  actionPodGlowAudio: {
    backgroundColor: 'rgba(167,139,250,0.24)',
    borderColor: 'rgba(167,139,250,0.52)',
  },
  actionPodGlowAudioRecording: {
    backgroundColor: 'rgba(248,113,113,0.3)',
    borderColor: 'rgba(248,113,113,0.8)',
  },
  iconButtonCamera: {
    borderColor: 'rgba(34,211,238,0.75)',
    backgroundColor: 'rgba(8,32,43,0.92)',
  },
  iconButtonGallery: {
    borderColor: 'rgba(244,114,182,0.72)',
    backgroundColor: 'rgba(44,16,38,0.92)',
  },
  iconButtonLocation: {
    borderColor: 'rgba(56,189,248,0.78)',
    backgroundColor: 'rgba(8,24,48,0.92)',
  },
  iconButtonAudio: {
    borderColor: 'rgba(167,139,250,0.78)',
    backgroundColor: 'rgba(26,20,58,0.92)',
  },
  iconButtonAudioRecording: {
    borderColor: 'rgba(248,113,113,0.9)',
    backgroundColor: 'rgba(127,29,29,0.96)',
  },
  messageComposerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 6,
  },
  solicitarTopoBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#0ea5e9',
    borderWidth: 1,
    borderColor: '#67e8f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: 160,
  },
  textInputFrame: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(95, 128, 255, 0.35)',
    borderRadius: 10,
    backgroundColor: 'rgba(9, 15, 30, 0.96)',
    paddingHorizontal: 8,
  },
  textInput: {
    color: '#ecfeff',
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
  },
  wrap: {
    width: 74,
    height: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  wrapPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  wrapDisabled: {
    opacity: 0.45,
  },
  outerSkew: {
    width: 70,
    height: 27,
    transform: [{ skewX: '-22deg' }],
    shadowColor: '#7CFF6B',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  outerBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#92FF7A',
    backgroundColor: 'rgba(80,255,120,0.08)',
    justifyContent: 'center',
    padding: 2,
  },
  innerSkew: {
    flex: 1,
    transform: [{ skewX: '0deg' }],
  },
  innerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(180,255,180,0.65)',
    backgroundColor: '#1D2633',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  setas: {
    color: '#E8FFF2',
    fontSize: 9,
    fontWeight: '900',
    textShadowColor: '#B8FFB0',
    textShadowRadius: 6,
    transform: [{ skewX: '22deg' }],
  },
  textoEnviar: {
    color: '#F2FFF6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.2,
    textShadowColor: '#C8FFD0',
    textShadowRadius: 6,
    transform: [{ skewX: '22deg' }],
  },
  recordingPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    color: '#fee2e2',
    fontWeight: '700',
    marginRight: 10,
  },
  recordingBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  recordingBar: {
    width: 4,
    borderRadius: 999,
    backgroundColor: '#fca5a5',
  },
  chatBloqueadoAviso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,29,29,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.55)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  chatBloqueadoTexto: {
    color: '#fecaca',
    fontWeight: '700',
    fontSize: 12,
  },
  avisoLegalChat: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 15,
  },
});
