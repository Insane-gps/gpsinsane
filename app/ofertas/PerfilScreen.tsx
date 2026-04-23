import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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

type Props = {
  usuarioId: string;
  somenteLeitura?: boolean;
  onClose?: () => void;
  titulo?: string;
};

const perfilVazio: PerfilData = {
  nome: "",
  foto: "",
  cidade: "",
  telefone: "",
  veiculos: []
};

const tiposVeiculo: Array<Veiculo["tipo"]> = ["carro", "moto", "van"];


export default function PerfilScreen({
  usuarioId,
  somenteLeitura = false,
  onClose,
  titulo
}: Props) {
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

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      try {
        const salvo = await AsyncStorage.getItem(`perfil_${usuarioId}`);
        const perfil: PerfilData = salvo ? JSON.parse(salvo) : perfilVazio;

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
      Alert.alert("Perfil salvo", "As informações deste usuário foram atualizadas.");
    } catch (e) {
      console.log("Erro ao salvar perfil:", e);
      Alert.alert("Erro", "Não foi possível salvar o perfil agora.");
    }
  }

  function adicionarVeiculo() {
    if (!veiculoMarca.trim() || !veiculoModelo.trim()) {
      Alert.alert("Dados incompletos", "Informe pelo menos a marca e o modelo do veículo.");
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

  const tituloTela = titulo || (somenteLeitura ? `Perfil de ${usuarioId}` : "Perfil do Usuário");
  const valorOuFallback = (valor: string, fallback: string) => (valor?.trim() ? valor : fallback);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{tituloTela}</Text>
          <Text style={styles.subtitle}>{somenteLeitura ? "Avalie quem pediu a entrega ou a carona antes de aceitar." : `ID: ${usuarioId}`}</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={20} color="#9be7ff" />
          </TouchableOpacity>
        )}
      </View>

      {carregando ? (
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dados pessoais</Text>
            <CampoPerfil
              label="Nome"
              placeholder="Nome do usuário"
              value={nome}
              onChangeText={setNome}
              editable={!somenteLeitura}
              fallback="Nome não informado"
            />
            <CampoPerfil
              label="Foto"
              placeholder="Foto (URL)"
              value={foto}
              onChangeText={setFoto}
              editable={!somenteLeitura}
              fallback="Foto não informada"
            />
            <CampoPerfil
              label="Cidade"
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
              editable={!somenteLeitura}
              fallback="Cidade não informada"
            />
            <CampoPerfil
              label="Telefone"
              placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              editable={!somenteLeitura}
              fallback="Telefone não informado"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Veículos</Text>
            {veiculos.length === 0 && (
              <Text style={styles.emptyText}>
                {somenteLeitura ? "Este usuário ainda não cadastrou veículo." : "Cadastre seu veículo para transmitir mais confiança."}
              </Text>
            )}

            {veiculos.map((veiculo, index) => (
              <View key={`${veiculo.placa}-${index}`} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleBadge}>
                    <Text style={styles.vehicleBadgeText}>{veiculo.tipo.toUpperCase()}</Text>
                  </View>
                  {!somenteLeitura && (
                    <TouchableOpacity onPress={() => removerVeiculo(index)} style={styles.removeVehicleButton}>
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ff7b7b" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.vehicleTitle}>{valorOuFallback(`${veiculo.marca} ${veiculo.modelo}`.trim(), "Veículo sem modelo")}</Text>
                <Text style={styles.vehicleMeta}>Ano: {valorOuFallback(veiculo.ano, "não informado")}</Text>
                <Text style={styles.vehicleMeta}>Cor: {valorOuFallback(veiculo.cor, "não informada")}</Text>
                <Text style={styles.vehicleMeta}>Placa: {valorOuFallback(veiculo.placa, "não informada")}</Text>
              </View>
            ))}

            {!somenteLeitura && (
              <>
                <Text style={styles.sectionSubtitle}>Adicionar veículo</Text>
                <View style={styles.typeRow}>
                  {tiposVeiculo.map((tipo) => {
                    const ativo = veiculoTipo === tipo;
                    return (
                      <TouchableOpacity
                        key={tipo}
                        onPress={() => setVeiculoTipo(tipo)}
                        style={[styles.typeChip, ativo && styles.typeChipActive]}
                      >
                        <Text style={[styles.typeChipText, ativo && styles.typeChipTextActive]}>{tipo[0].toUpperCase() + tipo.slice(1)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <CampoPerfil label="Marca" placeholder="Marca" value={veiculoMarca} onChangeText={setVeiculoMarca} editable />
                <CampoPerfil label="Modelo" placeholder="Modelo" value={veiculoModelo} onChangeText={setVeiculoModelo} editable />
                <CampoPerfil label="Ano" placeholder="Ano" value={veiculoAno} onChangeText={setVeiculoAno} editable keyboardType="numeric" />
                <CampoPerfil label="Cor" placeholder="Cor" value={veiculoCor} onChangeText={setVeiculoCor} editable />
                <CampoPerfil label="Placa" placeholder="Placa" value={veiculoPlaca} onChangeText={setVeiculoPlaca} editable autoCapitalize="characters" />

                <TouchableOpacity onPress={adicionarVeiculo} style={styles.primaryButton}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#001018" />
                  <Text style={styles.primaryButtonText}>Adicionar veículo</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {!somenteLeitura && (
            <TouchableOpacity onPress={salvarPerfil} style={styles.saveButton}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color="#001018" />
              <Text style={styles.saveButtonText}>Salvar perfil</Text>
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

function CampoPerfil({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  fallback,
  keyboardType = "default",
  autoCapitalize = "sentences"
}: CampoPerfilProps) {
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
  emptyText: {
    color: "#8da8b7",
    marginBottom: 10
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