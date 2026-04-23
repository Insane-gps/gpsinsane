type BancoProgressivo = {
  [nivel: number]: {
    2?: string[];
    3?: string[];
    4?: string[];
  };
};

export const WRONG_PROGRESSIVE_AFTER: BancoProgressivo = {
  0: {
    2: [
      "Errou de novo. Você realmente não colabora.",
      "Segundo erro seguido. Vamos fingir surpresa."
    ],
    3: [
      "Terceiro erro. Seu senso de direção tirou folga.",
      "Mais uma errada. O mapa já perdeu a esperança."
    ],
    4: [
      "Quarto erro. Isso já parece escolha consciente.",
      "Erro número quatro. Agora virou tradição."
    ]
  },
  1: {
    2: [
      "Errou de novo. Está difícil confiar no seu senso de direção.",
      "Segunda vez seguida. Você e essa rota não estão se entendendo."
    ],
    3: [
      "Terceiro erro. Você está colecionando desvios.",
      "Mais uma errada. Seu talento para se perder impressiona."
    ],
    4: [
      "Quarta falha. Isso já está bem além do acaso.",
      "Erro quatro. Seu volante entrou em modo sabotagem."
    ]
  },
  2: {
    2: [
      "Errou de novo. Sua leitura da rota continua muito ruim.",
      "Segunda errada seguida. Seu mapa mental não apareceu hoje."
    ],
    3: [
      "Terceiro erro. Você está se especializando em perder curvas fáceis.",
      "Mais uma falha. Sua interpretação espacial segue precária."
    ],
    4: [
      "Quarta vez errando. Esse trajeto está virando teste de paciência.",
      "Erro quatro. Sua navegação entrou em colapso operacional."
    ]
  },
  3: {
    2: [
      "Errou de novo. Você está se superando do pior jeito.",
      "Segunda falha seguida. Cada decisão piora o percurso."
    ],
    3: [
      "Terceira cagada. Isso já virou assinatura sua.",
      "Mais uma errada. Seu volante só produz decisão ruim."
    ],
    4: [
      "Quarta falha. Vai ser difícil defender essa direção.",
      "Erro quatro. Você está humilhando a rota."
    ]
  },
  4: {
    2: [
      "Errou de novo. Sua atenção evaporou de vez.",
      "Segunda vez seguida. Isso já está irritando até o mapa."
    ],
    3: [
      "Terceiro erro. Você não acerta uma sequência simples.",
      "Mais uma falha. Essa direção está um desastre."
    ],
    4: [
      "Quarta cagada. Você conseguiu estragar o caminho mais fácil.",
      "Erro quatro. Até a rota quer distância de você."
    ]
  }
};

export function pickWrongLineProgressiveAfter(
  nivelAtual: number,
  contadorErros: number
) {
  const nivel = Math.max(0, Math.min(Number(nivelAtual || 1), 4));
  const erro = Math.max(1, Number(contadorErros || 1));

  if (erro < 2) return "";

  const faixa = erro >= 4 ? 4 : erro >= 3 ? 3 : 2;
  const lista = WRONG_PROGRESSIVE_AFTER[nivel]?.[faixa] || [];
  if (!lista.length) return "";

  return lista[Math.floor(Math.random() * lista.length)] || "";
}