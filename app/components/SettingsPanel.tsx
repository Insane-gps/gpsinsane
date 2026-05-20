import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { PlanoUsuario } from "../../data/configPlanos";
import { IDIOMAS_DISPONIVEIS, type IdiomaId } from "../../data/idiomas";
import { getVeiculoPorId, VEICULOS_CARROS, VEICULOS_MOTOS } from "../../data/veiculos";
import FaleConoscoSection from "./FaleConoscoSection";
import FeedbackInboxModal from "./FeedbackInboxModal";

type Props = {
  visivel: boolean;
  fechar: () => void;
  usuarioId?: string | null;
  idiomaAtual: IdiomaId;
  trocarIdioma: (id: IdiomaId) => void;
  modoComico: boolean;
  setModoComico: (v: boolean) => void;
  modoPro: boolean;
  planoAtual?: PlanoUsuario;
  abrirTelaPro: () => void;
  somPolicia: boolean;
  setSomPolicia: (v: boolean) => void;
  somRadar: boolean;
  setSomRadar: (v: boolean) => void;
  veiculoGpsId: string;
  trocarVeiculoGps: (id: string) => void;
  raioNotificacaoKm?: number;
  trocarRaioNotificacao?: (km: number) => void;
  textos: any;
  mostrarBotaoPremiumTopo?: boolean;
  textoBotaoPremiumTopo?: string;
  onPressBotaoPremiumTopo?: () => void | Promise<void>;
};

export default function SettingsPanel({
  visivel,
  fechar,
  usuarioId,
  idiomaAtual,
  trocarIdioma,
  modoComico,
  setModoComico,
  modoPro,
  planoAtual = "free",
  abrirTelaPro,
  somPolicia,
  setSomPolicia,
  somRadar,
  setSomRadar,
  veiculoGpsId,
  trocarVeiculoGps,
  raioNotificacaoKm = 10,
  trocarRaioNotificacao = () => {},
  textos,
  mostrarBotaoPremiumTopo = false,
  textoBotaoPremiumTopo = "ATIVAR PREMIUM",
  onPressBotaoPremiumTopo,
}: Props) {
  const [painelFeedbackVisivel, setPainelFeedbackVisivel] = useState(false);
  const [modalVeiculoVisivel, setModalVeiculoVisivel] = useState(false);

  const veiculoAtual = useMemo(() => getVeiculoPorId(veiculoGpsId), [veiculoGpsId]);

  function textoComKm(km: number) {
    const base = String(textos?.ateKm || "Até {{km}} km");
    return base.replace("{{km}}", String(km));
  }

  function avisoTraducaoModoComico(idioma: IdiomaId) {
    const porIdioma: Record<IdiomaId, { titulo: string; mensagem: string; ok: string }> = {
      pt: {
        titulo: "Aviso",
        mensagem: "No modo cômico, piadas e xingamentos são traduzidos para todos os idiomas. Algumas frases podem soar estranhas fora do idioma original.",
        ok: "Entendi",
      },
      en: {
        titulo: "Notice",
        mensagem: "In comic mode, jokes and insults are translated into all languages. Some lines may sound odd outside the original language. If you want, send jokes in your language for upcoming app updates and improvements.",
        ok: "Got it",
      },
      es: {
        titulo: "Aviso",
        mensagem: "En modo cómico, los chistes e insultos se traducen a todos los idiomas. Algunas frases pueden sonar raras fuera del idioma original. Si quieres, envía chistes en tu idioma para próximas actualizaciones y mejoras de la app.",
        ok: "Entendido",
      },
      fr: {
        titulo: "Avertissement",
        mensagem: "En mode comique, les blagues et insultes sont traduites dans toutes les langues. Certaines phrases peuvent sembler étranges hors de la langue d'origine. Si vous voulez, envoyez des blagues dans votre langue pour les prochaines mises a jour et ameliorations de l'application.",
        ok: "Compris",
      },
      de: {
        titulo: "Hinweis",
        mensagem: "Im Komikmodus werden Witze und Beleidigungen in alle Sprachen ubersetzt. Manche Sätze konnen außerhalb der Originalsprache ungewohnt klingen. Wenn du willst, sende Witze in deiner Sprache fur kommende Updates und Verbesserungen der App.",
        ok: "Verstanden",
      },
    };

    return porIdioma[idioma] || porIdioma.pt;
  }

  function pressionarModoComico() {
    if (!modoPro) {
      abrirTelaPro();
      return;
    }

    if (!modoComico && idiomaAtual !== "pt") {
      const aviso = avisoTraducaoModoComico(idiomaAtual);
      Alert.alert(aviso.titulo, aviso.mensagem, [{ text: aviso.ok }]);
    }

    setModoComico(!modoComico);
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={fechar} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: "#111",
        }}
      >
      <TouchableOpacity
        onPress={fechar}
        style={{
          position: "absolute",
          top: 35,
          right: 20,
          zIndex: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 26 }}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 70, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        decelerationRate="normal"
        overScrollMode="always"
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 14,
          }}
        >
          ⚙️ {textos.configuracoes}
        </Text>

       {/* 
{mostrarBotaoPremiumTopo && (
  <TouchableOpacity
    onPress={() => {
      Keyboard.dismiss();
      onPressBotaoPremiumTopo?.();
    }}
    style={{
      backgroundColor: "#d4a017",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 18,
    }}
  >
    <Text style={{ color: "#111", fontWeight: "900", fontSize: 12 }}>
      {textoBotaoPremiumTopo}
    </Text>
  </TouchableOpacity>
)}
*/}

        <Text style={{ color: "#888", marginBottom: 10 }}>{textos?.plano || "Plano"}</Text>

        <View
          style={{
            backgroundColor: "#1c1c1c",
            padding: 18,
            borderRadius: 12,
            marginBottom: 25,
          }}
        >
          <Text style={{ color: "#fff" }}>
            {textos?.status || "Status"}: {planoAtual === "premium" ? "Premium" : planoAtual === "pro" ? "Pro" : "Free"}
          </Text>
        </View>

        <Text style={{ color: "#888", marginBottom: 10 }}>{textos?.modoComicoTitulo || "Modo cômico"}</Text>

        <TouchableOpacity
          onPress={pressionarModoComico}
          style={{
            backgroundColor: modoComico ? "#b9411c" : "#3cf916",
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <Text style={{ color: "#523333", fontWeight: "bold" }}>
            {modoComico ? (textos?.desativarModoComico || "Desativar modo cômico") : (textos?.ativarModoComico || "Modo cômico 😎")}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: "#888", marginBottom: 10 }}>{textos.idioma}</Text>

        <View style={{ marginBottom: 25 }}>
          {IDIOMAS_DISPONIVEIS.map((idioma) => {
            const ativo = idiomaAtual === idioma.id;
            return (
              <TouchableOpacity
                key={idioma.id}
                onPress={() => trocarIdioma(idioma.id)}
                style={{
                  backgroundColor: ativo ? "#0ea5e922" : "#1c1c1c",
                  borderColor: ativo ? "#0ea5e9" : "transparent",
                  borderWidth: 1,
                  padding: 18,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#fff" }}>
                  {idioma.flag} {idioma.label}
                  {ativo ? " ✓" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ color: "#888", marginTop: 30, marginBottom: 10 }}>{textos?.navegar || "Navegação"}</Text>

        <View style={{ backgroundColor: "#1c1c1c", padding: 18, borderRadius: 12 }}>
          <TouchableOpacity onPress={() => setSomPolicia(!somPolicia)} style={{ marginBottom: 15 }}>
            <Text style={{ color: "#fff" }}>{somPolicia ? (textos?.somPoliciaOn || "🚔 Som polícia: ON") : (textos?.somPoliciaOff || "Som polícia: OFF")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSomRadar(!somRadar)}>
            <Text style={{ color: "#fff" }}>{somRadar ? (textos?.somRadarOn || "📷 Som radar: ON") : (textos?.somRadarOff || "Som radar: OFF")}</Text>
          </TouchableOpacity>

          <Text style={{ color: "#94a3b8", marginTop: 16, marginBottom: 8, fontSize: 12 }}>
            {textos?.raioNotificacaoOfertas || "Raio de notificação de ofertas"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[10, 25, 50, 100].map((km) => {
              const ativo = Number(raioNotificacaoKm || 10) === km;
              return (
                <TouchableOpacity
                  key={`notif-km-${km}`}
                  onPress={() => trocarRaioNotificacao(km)}
                  style={{
                    backgroundColor: ativo ? "#166534" : "#0f172a",
                    borderColor: ativo ? "#22c55e" : "#334155",
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: ativo ? "#dcfce7" : "#cbd5e1", fontWeight: "700", fontSize: 12 }}>
                    {textoComKm(km)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Text style={{ color: "#888", marginTop: 30, marginBottom: 10 }}>{textos?.veiculoGps || "Veículo do GPS"}</Text>

        <View style={{ backgroundColor: "#1c1c1c", padding: 18, borderRadius: 12, marginBottom: 25 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Image
              source={veiculoAtual?.source || VEICULOS_CARROS[0]?.source}
              style={{ width: 54, height: 54, borderRadius: 8, marginRight: 12, backgroundColor: "#0a0a0a" }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>{veiculoAtual?.nome || "Padrão"}</Text>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                {veiculoAtual?.tipo === "moto" ? "Moto" : "Carro"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setModalVeiculoVisivel(true)}
            style={{
              backgroundColor: "#0f172a",
              borderWidth: 1,
              borderColor: "#334155",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#e2e8f0", fontWeight: "700" }}>{textos?.escolherVeiculo || "Escolher veículo"}</Text>
          </TouchableOpacity>
        </View>

        <FaleConoscoSection usuarioId={usuarioId} textos={textos} />

        <Text style={{ color: "#888", marginBottom: 10 }}>{textos?.painelInterno || "Painel interno"}</Text>

        <TouchableOpacity
          onPress={() => setPainelFeedbackVisivel(true)}
          style={{
            backgroundColor: "#111827",
            borderWidth: 1,
            borderColor: "#334155",
            padding: 18,
            borderRadius: 12,
            marginBottom: 25,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: "bold" }}>{textos?.painelFeedback || "Abrir painel de feedback"}</Text>
        </TouchableOpacity>

        <Text style={{ color: "#888", marginBottom: 10 }}>{textos?.sistema || "Sistema"}</Text>

        <View
          style={{
            backgroundColor: "#1c1c1c",
            padding: 18,
            borderRadius: 12,
            marginBottom: 25,
          }}
        >
          <Text style={{ color: "#666" }}>Versão 1.0.0</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <FeedbackInboxModal visivel={painelFeedbackVisivel} onClose={() => setPainelFeedbackVisivel(false)} />

      {modalVeiculoVisivel && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0b0f19",
            zIndex: 999999,
            paddingTop: 60,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{textos?.veiculoGps || "Veículo do GPS"}</Text>
            <TouchableOpacity onPress={() => setModalVeiculoVisivel(false)}>
              <Text style={{ color: "#fff", fontSize: 18 }}>{textos?.fechar || "Fechar"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={{ color: "#94a3b8", marginBottom: 8 }}>{textos?.carros || "Carros"}</Text>
            {VEICULOS_CARROS.map((item) => {
              const ativo = veiculoGpsId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    trocarVeiculoGps(item.id);
                    setModalVeiculoVisivel(false);
                  }}
                  style={{
                    backgroundColor: ativo ? "#0ea5e922" : "#111",
                    borderWidth: 1,
                    borderColor: ativo ? "#0ea5e9" : "#2a2a2a",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={item.source}
                    style={{ width: 54, height: 54, borderRadius: 8, marginRight: 12, backgroundColor: "#0a0a0a" }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "#fff", flex: 1, fontSize: 15 }}>{ativo ? "✅ " : ""}{item.nome}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={{ color: "#94a3b8", marginTop: 12, marginBottom: 8 }}>{textos?.motos || "Motos"}</Text>
            {VEICULOS_MOTOS.map((item) => {
              const ativo = veiculoGpsId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    trocarVeiculoGps(item.id);
                    setModalVeiculoVisivel(false);
                  }}
                  style={{
                    backgroundColor: ativo ? "#0ea5e922" : "#111",
                    borderWidth: 1,
                    borderColor: ativo ? "#0ea5e9" : "#2a2a2a",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={item.source}
                    style={{ width: 54, height: 54, borderRadius: 8, marginRight: 12, backgroundColor: "#0a0a0a" }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "#fff", flex: 1, fontSize: 15 }}>{ativo ? "✅ " : ""}{item.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
      </View>
    </Modal>
  );
}
