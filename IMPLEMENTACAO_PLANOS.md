# Sistema Completo de Planos Mensais - Implementação Concluída

## Resumo das Mudanças

Implementei um sistema robusto e escalável de planos mensais com suporte a múltiplos idiomas, múltiplas moedas e fases de lançamento dinâmicas, sem quebrar a estrutura existente do app.

---

## 📦 Novos Arquivos Criados

### 1. **data/configPlanos.ts** — Configuração Central
Contém toda a lógica de fases, preços e permissões:

- **Tipos TypeScript:**
  - `PlanoUsuario`: "free" | "pro" | "premium"
  - `FasePlano`: "lancamento" | "transicao" | "normal"
  - `MoedaPlano`: "BRL" | "USD" | "EUR"
  - `AssinaturaUsuario`: Tipo com todos os dados da assinatura

- **Configurações:**
  - `DATA_LANCAMENTO_APP`: Data de lançamento oficial (08/04/2026)
  - `TABELA_PRECOS`: Tabela completa de preços por fase/plano/moeda
  - `PERMISSOES_POR_PLANO`: Mapeamento de permissões para cada plano
  - Duração das fases: 180 dias (LANCAMENTO) + 90 dias (TRANSIÇÃO)

- **Fases de Preço:**
  ```
  FASE 1 (Lançamento — 6 meses)
  - PRO: BRL 49,90 | USD 9,99 | EUR 9,99
  - PREMIUM: BRL 49,90 | USD 9,99 | EUR 9,99
  
  FASE 2 (Transição — 3 meses)
  - PRO: BRL 14,90 | USD 2,99 | EUR 2,99
  - PREMIUM: BRL 79,90 | USD 14,99 | EUR 14,99
  
  FASE 3 (Normal — pós 9 meses)
  - PRO: BRL 14,90 | USD 2,99 | EUR 2,99
  - PREMIUM: BRL 99,90 | USD 18,99 | EUR 18,99
  ```

---

### 2. **utils/planos.ts** — Funções Utilitárias
Biblioteca centralizada com 20+ funções helper:

#### **Fase e Preço:**
- `obterFasePlanoAtual()`: Retorna fase atual
- `obterPrecosAtuaisNovosAssinantes(regiao)`: Preços dinâmicos por região
- `moedaPorRegiao(regiao)`: Converte código de país para moeda
- `obterSimboloMoeda(moeda)`: Retorna símbolo (R$, $, €)
- `formatarPreco(valor, moeda, idioma)`: Formata com Intl.NumberFormat

#### **Permissões:**
- `usuarioEhFree(plano)`
- `usuarioEhPro(plano)`
- `usuarioEhPremium(plano)`
- `usuarioPodeModoComico(plano)`
- `usuarioPodeXingamentoNivel(nivel, plano)`
- `usuarioPodeCriarOfertaPremium(plano)`
- `usuarioPodeGanharDinheiroComOfertas(plano)`
- `obterPermissoesDoPlano(plano)`

#### **Ciclo de Vida:**
- `assinaturaExpirada(assinatura, agora?)`: Verifica expiração
- `normalizarStatusAssinatura(assinatura, agora?)`: Retorna plano com válid
- `ativarPlano({plano, regiao, origem, precoCustom?})`: Cria assinatura
- `cancelarAssinatura()`: Reverte para free

#### **Persistência:**
- `carregarAssinaturaLocal()`: Carrega do AsyncStorage (inclui migração de "pro_ativo")
- `salvarAssinaturaLocal(assinatura)`: Persiste nova estrutura

#### **Utilitário Extra:**
- `calcularLiquidoPlayStore(valor)`: Calcula valor após 15% da taxa

---

## 🌐 Atualizações em data/idiomas.ts

Adicionados **35+ novas chaves de tradução** para os 5 idiomas (PT, EN, ES, FR, DE):

### **Textos Planos:**
- `nomePlanoFree`, `nomePlanoPro`, `nomePlanoPremium`
- `tituloPlanosUpsell`, `subtituloPlanosUpsell`
- `precoDeLancamento`, `valorAtualNovosAssinantes`, `precoTravadoPromessa`
- `pormesLabel`

### **Ações:**
- `assinarPro`, `assinarPremium`
- `agoraNao`, `statusPremium`

### **Benefícios (3 planos):**
- FREE: `beneficioFreeCarona`, `beneficioFreeXingamento`, `beneficioFreeSemComico`, `beneficioFreeSemGanhar`
- PRO: `beneficioProComico`, `beneficioProXingamento`, `beneficioProSemGanhar`
- PREMIUM: `beneficioPremiumTudo`, `beneficioPremiumCarona`, `beneficioPremiumEntrega`, `beneficioPremiumOfertas`

### **Fases:**
- `faseLancamentoLabel`, `faseTransicaoLabel`, `faseNormalLabel`

### **Status Online:**
- `usuarioOnline`, `usuarioOffline`, `viuPorUltimo`

---

## 🔄 Alterações em app/index.tsx

### **Novos Imports:**
```typescript
import type { AssinaturaUsuario, PlanoUsuario } from "../data/configPlanos";
import {
  formatarPreco, obterFasePlanoAtual, obterPrecosAtuaisNovosAssinantes,
  obterSimboloMoeda, moedaPorRegiao, carregarAssinaturaLocal,
  salvarAssinaturaLocal, ativarPlano, normalizarStatusAssinatura,
  usuarioEhFree as planoEhFree,
  usuarioEhPro as planoEhPro,
  usuarioEhPremium as planoEhPremium,
  usuarioPodeModoComico, usuarioPodeXingamentoNivel,
  usuarioPodeCriarOfertaPremium, usuarioPodeGanharDinheiroComOfertas,
  obterPermissoesDoPlano,
} from "../utils/planos";
```

### **Novo Estado:**
```typescript
const [planoAtual, setPlanoAtual] = useState<PlanoUsuario>("free");
const [assinatura, setAssinatura] = useState<AssinaturaUsuario | null>(null);
```

### **Compatibilidade Legada:**
- `modoPro` e `assinaturaAtiva` mantidos para código antigo
- `carregarPro()` atualizado para usar `carregarAssinaturaLocal()` e migrar dados legados automaticamente

### **Funções Atualizadas:**
- `limiteNivelUsuario()`: Agora usa `obterPermissoesDoPlano(planoAtual).nivelMaxXingamento`
- `nivelPermitido()`: Idem
- `usuarioEhPro()`: Usa `planoEhPro(planoAtual)`
- `usuarioEhFree()`: Usa `planoEhFree(planoAtual)`
- **NOVO:** `usuarioEhPremiumAtual()`: Usa `planoEhPremium(planoAtual)`

### **Lógica de Ofertas:**
- `podeSolicitarAcaoEmOferta()`: Agora diferencia PRO (sem ganhar) de PREMIUM (pode tudo)
- Apenas PREMIUM pode `podeDarCarona` e `podeFazerEntrega`

### **Tela de Planos (Redesenhada):**
- UI completa e refatorada mostrando PRO e PREMIUM lado a lado
- Exibe preços dinâmicos conforme fase e região
- Mostra fase atual em tempo real
- Textos localizados obtidos de `TEXTOS`
- Cards com cor de destaque diferente (vermelho PRO, ouro PREMIUM)

### **Rastreamento Online:**
```typescript
useEffect(() => {
  if (!usuarioId) return;
  const intervalo = setInterval(async () => {
    const docRef = doc(db, "usuarios", usuarioId);
    await updateDoc(docRef, { lastSeen: Date.now() });
  }, 30000);
  return () => clearInterval(intervalo);
}, [usuarioId]);
```
- Atualiza `usuarios/{usuarioId}` no Firestore a cada 30 segundos
- Preparado para ChatModal mostrar online/offline

---

## 💬 Alterações em app/components/ChatModal.tsx

### **Novos Imports:**
```typescript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
```

### **Novo Estado:**
```typescript
const [outroUsuarioOnline, setOutroUsuarioOnline] = useState(false);
```

### **Listener de Status Online:**
```typescript
useEffect(() => {
  if (!chatOferta?.criadorId || !chatVisivel) return;
  const docRef = doc(db, "usuarios", String(chatOferta.criadorId));
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    const dados = snapshot.data();
    const lastSeen = Number(dados?.lastSeen || 0);
    const estaOnline = (Date.now() - lastSeen) < 120000; // 2 minutos
    setOutroUsuarioOnline(estaOnline);
  }, () => setOutroUsuarioOnline(false));
  return () => unsubscribe();
}, [chatOferta?.criadorId, chatVisivel]);
```

### **Header Atualizado:**
- Exibe nome do outro usuário (em vez de "Conversa")
- Mostra indicador visual: 🟢 (verde online) / ⚫ (cinza offline)
- Texto: "Online agora" ou "Offline"
- Atualizado em tempo real conforme Firestore

---

## 🎯 Regras de Negócio Implementadas

### **Planos e Permissões:**

| Recurso | FREE | PRO | PREMIUM |
|---------|------|-----|---------|
| Modo cômico | ❌ | ✅ | ✅ |
| Xingamentos | Nível 1 | Até 4 | Até 4 |
| Dar carona | ❌ | ❌ | ✅ |
| Fazer entrega | ❌ | ❌ | ✅ |
| Aceitar ofertas | ❌ | ❌ | ✅ |
| Ganhar dinheiro | ❌ | ❌ | ✅ |

### **Preço Travado:**
- Ao assinar, salva: `precoTravadoMensal`, `moeda`, `faseNaEntrada`, `regiaoNaEntrada`
- Assinantes antigos mantêm preço mesmo após mudanças de fase
- Novos assinantes pagam preço vigente

### **Compatibilidade de Região:**
- Brasil (BR) → BRL
- Zona euro (AT, BE, CY, etc.) → EUR
- Resto do mundo → USD (fallback)
- Idioma totalmente separado de moeda

### **Ciclo de Assinatura:**
- 30 dias por padrão
- Suporta `dataFim` explícita ou cálculo automático
- `assinaturaExpirada()` verifica validade

---

## ✅ Validações

- ✓ Sem erros TypeScript
- ✓ Imports corretos
- ✓ Compatibilidade com AsyncStorage legado
- ✓ Migração automática de usuários antigas com "pro_ativo"
- ✓ Firebase integrado para online tracking
- ✓ Localization via Expo.localization
- ✓ Todos os 5 idiomas suportados
- ✓ Todas as 3 moedas configuradas
- ✓ Lógica de fase dinâmica baseada em data
- ✓ Sem quebra de funcionalidade existente
- ✓ Estado legado mantido para compatibilidade (`modoPro`, `assinaturaAtiva`)

---

## 🚀 Como Usar

### **Carregar Assinatura do Usuário:**
```typescript
const assinatura = await carregarAssinaturaLocal();
const plano = normalizarStatusAssinatura(assinatura);
```

### **Ativar Plano PRO:**
```typescript
const novaAssinatura = await ativarPlano({
  plano: "pro",
  regiao: regiaoDoDispositivo(),
  origem: "play_store"
});
```

### **Verificar Permissão:**
```typescript
if (usuarioPodeXingamentoNivel(3, planoAtual)) {
  // Liberar xingamento nível 3
}
```

### **Obter Preço Dinâmico:**
```typescript
const precos = obterPrecosAtuaisNovosAssinantes("BR");
const texto = formatarPreco(precos.pro, precos.moeda, "pt");
```

### **Mostrar Tela de Planos:**
```typescript
setTelaProVisivel(true); // Exibe PRO + PREMIUM com preços dinâmicos
```

---

## 📋 Resumo de Trechos Alterados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `data/configPlanos.ts` | CRIAR | Config central com tipos, fases, preços |
| `utils/planos.ts` | CRIAR | 20+ funções helper |
| `data/idiomas.ts` | EDITAR | +35 chaves de tradução em 5 idiomas |
| `app/index.tsx` | EDITAR | Imports, state, funções, tela de planos, online tracking |
| `app/components/ChatModal.tsx` | EDITAR | Imports, state, listener online, header com status |

---

## 🔐 Segurança e Escalabilidade

- ✓ Dados travados na assinatura impedem alteração retroativa
- ✓ Validação de expiração em tempo real
- ✓ Migração segura de dados legados
- ✓ Firestore ready para sync remoto
- ✓ Função utilitária para cálculo líquido de taxa (15% Play Store)
- ✓ Sem hardcoding de preços em componentes

---

## 🎓 Próximos Passos Recomendados

1. **Integração de Pagamento:** Conectar a tela de assinatura com In-App Billing (Google Play / App Store)
2. **Webhook de Assinatura:** Sincronizar status via Firebase para cancelamentos automáticos
3. **Analytics:** Rastrear taxa de conversão FREE → PRO → PREMIUM
4. **A/B Testing:** Testa diferentes preços/fases em cohorts de usuários
5. **Support de Cupons:** Adicionar `precoCustom` em `ativarPlano()` para promoções

---

**Sistema implementado com sucesso! 🎉 O app agora suporta múltiplos planos, moedas, idiomas e fases de preço dinâmicas.**
