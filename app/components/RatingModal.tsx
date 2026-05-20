import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { db } from "../../firebase";
import {
    addDocWithLog as addDoc,
    getDocsWithLog as getDocs,
    updateDocWithLog as updateDoc,
} from "../../utils/firestoreDebug";

type Props = {
  visivel: boolean;
  onClose: () => void;
  ofertaId: string;
  usuarioId: string;
  usuarioAvaliadoId: string;
  nomeUsuarioAvaliado?: string;
};

export default function RatingModal({
  visivel,
  onClose,
  ofertaId,
  usuarioId,
  usuarioAvaliadoId,
  nomeUsuarioAvaliado = "Usuário"
}: Props) {
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [avaliacaoExistenteId, setAvaliacaoExistenteId] = useState<string | null>(null);

  useEffect(() => {
    if (!visivel) return;

    async function verificarAvaliacaoExistente() {
      try {
        const snapshot = await getDocs(collection(db, "avaliacoesUsuarios"));
        const minhaAvaliacao: any = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any || {}) }))
          .find(
            (item: any) =>
              String(item?.avaliadoId) === String(usuarioAvaliadoId) &&
              String(item?.avaliadorId) === String(usuarioId)
          );

        if (minhaAvaliacao) {
          setAvaliacaoExistenteId(minhaAvaliacao.id);
          setNotaSelecionada(Number(minhaAvaliacao?.nota || 0));
          setComentario(String(minhaAvaliacao?.comentario || ""));
        } else {
          setAvaliacaoExistenteId(null);
          setNotaSelecionada(0);
          setComentario("");
        }
      } catch (e) {
        console.log("Erro ao verificar avaliação existente:", e);
      }
    }

    verificarAvaliacaoExistente();
  }, [visivel, usuarioId, usuarioAvaliadoId]);

  async function enviarAvaliacao() {
    if (notaSelecionada < 1) {
      Alert.alert("Avaliação incompleta", "Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setCarregando(true);

    try {
      if (avaliacaoExistenteId) {
        await updateDoc(doc(db, "avaliacoesUsuarios", avaliacaoExistenteId), {
          nota: notaSelecionada,
          comentario: comentario.trim(),
          editadoEm: serverTimestamp(),
          editadoEmCliente: new Date().toISOString(),
          ofertaId: ofertaId
        });
      } else {
        await addDoc(collection(db, "avaliacoesUsuarios"), {
          avaliadoId: usuarioAvaliadoId,
          avaliadorId: usuarioId,
          nota: notaSelecionada,
          comentario: comentario.trim(),
          ofertaId: ofertaId,
          criadoEm: serverTimestamp(),
          criadoEmCliente: new Date().toISOString()
        });
      }

      Alert.alert(
        avaliacaoExistenteId ? "Avaliação atualizada" : "Avaliação registrada",
        "Obrigado por avaliar este usuário!"
      );

      // Fechar modal
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (e) {
      console.log("Erro ao enviar avaliação:", e);
      Alert.alert("Erro", "Não foi possível enviar a avaliação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Avaliar viagem</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Descrição */}
            <View style={styles.descricao}>
              <Text style={styles.descricaoTexto}>
                Como foi a experiência com <Text style={styles.destaque}>{nomeUsuarioAvaliado}</Text>?
              </Text>
            </View>

            {/* Seletor de Estrelas */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((nota) => (
                <TouchableOpacity
                  key={nota}
                  onPress={() => setNotaSelecionada(nota)}
                  style={styles.starButton}
                >
                  <MaterialCommunityIcons
                    name={nota <= notaSelecionada ? "star" : "star-outline"}
                    size={40}
                    color={nota <= notaSelecionada ? "#fbbf24" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Rótulo da Nota */}
            {notaSelecionada > 0 && (
              <View style={styles.notaLabel}>
                <Text style={styles.notaTexto}>
                  {notaSelecionada === 1
                    ? "Ruim 😞"
                    : notaSelecionada === 2
                    ? "Poderia ser melhor 😐"
                    : notaSelecionada === 3
                    ? "Bom 🙂"
                    : notaSelecionada === 4
                    ? "Muito bom 😊"
                    : "Perfeito! 🤩"}
                </Text>
              </View>
            )}

            {/* Campo de Comentário */}
            <View style={styles.comentarioContainer}>
              <Text style={styles.comentarioLabel}>
                Comentário (opcional)
              </Text>
              <TextInput
                style={styles.comentarioInput}
                placeholder="Descreva sua experiência..."
                placeholderTextColor="#999"
                value={comentario}
                onChangeText={setComentario}
                multiline
                maxLength={500}
                textAlignVertical="top"
                editable={!carregando}
              />
              <Text style={styles.charCount}>
                {comentario.length}/500
              </Text>
            </View>

            {/* Info sobre a avaliação */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="information"
                size={18}
                color="#7dd3fc"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.infoText}>
                Sua avaliação é importante para manter a comunidade segura e confiável.
              </Text>
            </View>
          </ScrollView>

          {/* Botões de Ação */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={carregando}
            >
              <Text style={styles.cancelButtonText}>Pular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                notaSelecionada === 0 || carregando
                  ? styles.submitButtonDisabled
                  : null
              ]}
              onPress={enviarAvaliacao}
              disabled={notaSelecionada === 0 || carregando}
            >
              <Text style={styles.submitButtonText}>
                {carregando ? "Enviando..." : "Enviar avaliação"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end"
  },
  content: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  descricao: {
    marginBottom: 20
  },
  descricaoTexto: {
    fontSize: 15,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 22
  },
  destaque: {
    fontWeight: "bold",
    color: "#93c5fd"
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8
  },
  starButton: {
    padding: 8
  },
  notaLabel: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6"
  },
  notaTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#93c5fd"
  },
  comentarioContainer: {
    marginBottom: 20
  },
  comentarioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8
  },
  comentarioInput: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    minHeight: 100,
    fontFamily: "System"
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "right"
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(125, 211, 252, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#7dd3fc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#7dd3fc",
    lineHeight: 18
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a"
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelButton: {
    backgroundColor: "#475569",
    borderWidth: 1,
    borderColor: "#64748b"
  },
  cancelButtonText: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 14
  },
  submitButton: {
    backgroundColor: "#3b82f6"
  },
  submitButtonDisabled: {
    backgroundColor: "#1e40af",
    opacity: 0.5
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14
  }
});
