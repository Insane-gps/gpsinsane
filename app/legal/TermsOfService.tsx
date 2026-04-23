import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function TermsOfService() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000', padding: 20 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      keyboardDismissMode="on-drag"
    >
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        TERMOS DE SERVIÇO
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        A plataforma atua apenas como intermediária entre usuários.
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        A plataforma não participa, não intermedeia e não garante pagamentos entre usuários.
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        A plataforma não garante segurança das viagens.
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        A plataforma não se responsabiliza por:
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginLeft: 20, marginBottom: 10 }}>
        • acidentes
      </Text>
      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginLeft: 20, marginBottom: 10 }}>
        • fraudes
      </Text>
      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginLeft: 20, marginBottom: 10 }}>
        • transporte ilegal
      </Text>
      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginLeft: 20, marginBottom: 20 }}>
        • acordos financeiros entre usuários
      </Text>

      <Text style={{ color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        É proibido usar a plataforma para qualquer finalidade ilegal. O usuário é integralmente responsável pelo cumprimento da legislação aplicável.
      </Text>

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 30 }}>
        Esta plataforma atua apenas como intermediária entre usuários.
      </Text>
    </ScrollView>
  );
}