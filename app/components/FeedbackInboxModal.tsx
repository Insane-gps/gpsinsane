import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../../firebase";

type Props = {
  visivel: boolean;
  onClose: () => void;
};

type FeedbackItem = {
  id: string;
  tipo?: string;
  status?: string;
  mensagem?: string;
  contatoEmail?: string;
  usuarioId?: string;
  alvoUsuarioId?: string;
  criadoEmCliente?: string;
  emailStatus?: string;
  emailEncaminhado?: boolean;
  imagens?: Array<{ url?: string; fileName?: string }>;
};

export default function FeedbackInboxModal({ visivel, onClose }: Props) {
  const [itens, setItens] = useState<FeedbackItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "sugestao" | "denuncia">("todos");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "novo" | "em_analise" | "resolvido">("todos");

  useEffect(() => {
    if (!visivel) return;

    setCarregando(true);
    setErro("");

    const q = query(collection(db, "feedbackUsuarios"), orderBy("criadoEmCliente", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((docAtual: any) => ({
          id: docAtual.id,
          ...(docAtual.data?.() || {})
        }));

        setItens(lista);
        setCarregando(false);
      },
      (error) => {
        console.log("Erro ao carregar painel de feedback:", error);
        setErro("Não foi possível carregar o painel. Verifique as permissões do Firestore.");
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [visivel]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      const tipoOk = filtroTipo === "todos" || String(item.tipo || "") === filtroTipo;
      const statusAtual = String(item.status || "novo");
      const statusOk = filtroStatus === "todos" || statusAtual === filtroStatus;
      return tipoOk && statusOk;
    });
  }, [itens, filtroTipo, filtroStatus]);

  async function atualizarStatus(item: FeedbackItem, novoStatus: "novo" | "em_analise" | "resolvido") {
    try {
      await updateDoc(doc(db, "feedbackUsuarios", item.id), {
        status: novoStatus,
        atualizadoEmCliente: new Date().toISOString()
      });
    } catch (error) {
      console.log("Erro ao atualizar status do feedback:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  }

  async function apagarMensagem(item: FeedbackItem) {
    Alert.alert(
      "Apagar mensagem",
      "Tem certeza que deseja apagar esta mensagem? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "feedbackUsuarios", item.id));
            } catch (error) {
              console.log("Erro ao apagar feedback:", error);
              Alert.alert("Erro", "Não foi possível apagar a mensagem.");
            }
          }
        }
      ]
    );
  }

  function statusLabel(valor: string) {
    if (valor === "em_analise") return "Em análise";
    if (valor === "resolvido") return "Resolvido";
    return "Novo";
  }

  function emailStatusLabel(item: FeedbackItem) {
    if (item.emailEncaminhado === true) return { texto: "✓ Email enviado", cor: "#4ade80" };
    const st = String(item.emailStatus || "pendente");
    if (st === "pendente") return { texto: "⏳ Email pendente", cor: "#fbbf24" };
    return { texto: `✗ ${st}`, cor: "#f87171" };
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#030712" }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 54,
          paddingHorizontal: 18,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#172033"
        }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
              Painel de feedback
            </Text>
            <Text style={{ color: "#7dd3fc", marginTop: 4 }}>
              Sugestões e denúncias salvas no Firebase
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {[
              { id: "todos", label: "Todos" },
              { id: "sugestao", label: "Sugestões" },
              { id: "denuncia", label: "Denúncias" }
            ].map((opcao) => {
              const ativo = filtroTipo === opcao.id;
              return (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => setFiltroTipo(opcao.id as any)}
                  style={{
                    backgroundColor: ativo ? "#0ea5e9" : "#111827",
                    borderWidth: 1,
                    borderColor: ativo ? "#38bdf8" : "#334155",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{opcao.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {[
              { id: "todos", label: "Todos os status" },
              { id: "novo", label: "Novo" },
              { id: "em_analise", label: "Em análise" },
              { id: "resolvido", label: "Resolvido" }
            ].map((opcao) => {
              const ativo = filtroStatus === opcao.id;
              return (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => setFiltroStatus(opcao.id as any)}
                  style={{
                    backgroundColor: ativo ? "#16a34a" : "#111827",
                    borderWidth: 1,
                    borderColor: ativo ? "#4ade80" : "#334155",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{opcao.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          {carregando && (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
          )}

          {!carregando && !!erro && (
            <View style={{
              backgroundColor: "#2b1111",
              borderWidth: 1,
              borderColor: "#7f1d1d",
              borderRadius: 14,
              padding: 14
            }}>
              <Text style={{ color: "#fecaca" }}>{erro}</Text>
            </View>
          )}

          {!carregando && !erro && itensFiltrados.length === 0 && (
            <Text style={{ color: "#64748b" }}>Nenhum feedback encontrado com os filtros atuais.</Text>
          )}

          {!carregando && !erro && itensFiltrados.map((item) => {
            const statusAtual = String(item.status || "novo");

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#0f172a",
                  borderWidth: 1,
                  borderColor: "#1e293b",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 14
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{
                      backgroundColor: String(item.tipo) === "denuncia" ? "#7f1d1d" : "#164e63",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginRight: 8
                    }}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                        {String(item.tipo || "feedback").toUpperCase()}
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: statusAtual === "resolvido" ? "#14532d" : statusAtual === "em_analise" ? "#78350f" : "#1d4ed8",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4
                    }}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                        {statusLabel(statusAtual)}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: "#64748b", fontSize: 11 }}>
                    {String(item.criadoEmCliente || "").slice(0, 16).replace("T", " ")}
                  </Text>
                </View>

                {
                  (() => {
                    const es = emailStatusLabel(item);
                    return (
                      <Text style={{ color: es.cor, fontSize: 11, marginBottom: 8 }}>
                        {es.texto}
                      </Text>
                    );
                  })()
                }

                <Text style={{ color: "#e2e8f0", fontWeight: "700", marginBottom: 6 }}>
                  Usuário: {String(item.usuarioId || "anonimo")}
                </Text>

                {!!item.alvoUsuarioId && (
                  <Text style={{ color: "#cbd5e1", marginBottom: 4 }}>
                    Alvo: {String(item.alvoUsuarioId)}
                  </Text>
                )}

                {!!item.contatoEmail && (
                  <Text style={{ color: "#93c5fd", marginBottom: 6 }}>
                    Contato: {String(item.contatoEmail)}
                  </Text>
                )}

                <Text style={{ color: "#e5e7eb", lineHeight: 20 }}>{String(item.mensagem || "")}</Text>

                {Array.isArray(item.imagens) && item.imagens.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {item.imagens.map((imagem, index) => (
                      <View key={`${imagem.url || "img"}-${index}`} style={{ marginRight: 10 }}>
                        {!!imagem.url && (
                          <Image
                            source={{ uri: String(imagem.url) }}
                            style={{ width: 108, height: 108, borderRadius: 12, backgroundColor: "#111827" }}
                          />
                        )}
                        <Text style={{ color: "#94a3b8", fontSize: 10, width: 108, marginTop: 4 }} numberOfLines={2}>
                          {String(imagem.fileName || "imagem")}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={{ flexDirection: "row", marginTop: 12 }}>
                  {[
                    { id: "novo", label: "Novo", color: "#1d4ed8" },
                    { id: "em_analise", label: "Em análise", color: "#b45309" },
                    { id: "resolvido", label: "Resolvido", color: "#15803d" }
                  ].map((acao, index) => {
                    const ativo = statusAtual === acao.id;
                    return (
                      <TouchableOpacity
                        key={acao.id}
                        disabled={ativo}
                        onPress={() => atualizarStatus(item, acao.id as any)}
                        style={{
                          flex: 1,
                          backgroundColor: ativo ? acao.color : "#111827",
                          borderWidth: 1,
                          borderColor: ativo ? acao.color : "#334155",
                          borderRadius: 10,
                          paddingVertical: 10,
                          alignItems: "center",
                          marginRight: index < 2 ? 8 : 0,
                          opacity: ativo ? 0.9 : 1
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{acao.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => apagarMensagem(item)}
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1c0a0a",
                    borderWidth: 1,
                    borderColor: "#7f1d1d",
                    borderRadius: 10,
                    paddingVertical: 10,
                  }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={15} color="#f87171" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#f87171", fontWeight: "700", fontSize: 12 }}>Apagar mensagem</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}