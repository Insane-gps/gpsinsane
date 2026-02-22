// TIPOS DE NÍVEL
export type PoiLevel = 0 | 1 | 2 | 3 | 4;

// ESTRUTURA DAS FALAS POR POI
export const POI_LINES: Record<string, Record<PoiLevel, string[]>> = {

  police:{
    0:[
      "Polícia à frente.",
      "Viatura à frente.",
    ],

    1:[
      "Polícia à frente. Anda direito.",
      "Tem polícia. Não inventa.",
      "Polícia ali. Finge que dirige bem.",
    ],

    2:[
      "Polícia ali. Tenta não fazer merda agora.",
      "Olha a polícia. Dirige como gente.",
      "Se fizer cagada ali, parabéns.",
      "Polícia observando você dirigir.",
    ],

    3:[
      "Polícia na frente, presta atenção porra.",
      "Olha a polícia e dirige direito.",
      "Não faz merda perto da polícia.",
      "Se te pararem eu finjo que não te conheço.",
    ],

    4:[
      "Polícia na frente. Hoje você roda.",
      "Vai, faz merda na frente da polícia.",
      "Quero ver explicar essa direção pra PM.",
      "A polícia vai te adotar hoje.",
    ]
  },

  radar:{
    0:[
      "Radar à frente.",
      "Controle de velocidade à frente.",
    ],

    1:[
      "Radar ali. Não acelera.",
      "Radar na frente. Se controla.",
    ],

    2:[
      "Radar ali. Tenta não falir hoje.",
      "Radar te esperando fazer merda.",
    ],

    3:[
      "Radar na frente. Vai, acelera gênio.",
      "Radar ali pra registrar sua burrice.",
    ],

    4:[
      "Acelera no radar. Confia.",
      "Radar vai bater foto sua hoje.",
    ]
  },

  gas:{
    0:[
      "Posto de combustível à frente.",
    ],
    1:[
      "Posto ali. Aproveita.",
    ],
    2:[
      "Posto ali. Abastece essa lata velha.",
    ],
    3:[
      "Posto ali. Talvez aceite seu carro.",
    ],
    4:[
      "Posto ali. Vende o carro e vai a pé.",
    ]
  },

  hospital:{
    0:[
      "Hospital próximo.",
    ],
    1:[
      "Hospital ali. Útil pra você.",
    ],
    2:[
      "Hospital perto. Estatisticamente útil.",
    ],
    3:[
      "Hospital ali. Já prepara a ficha.",
    ],
    4:[
      "Hospital na frente. Em breve necessário.",
    ]
  },

  restaurant:{
    0:[
      "Restaurante à frente.",
    ],
    1:[
      "Restaurante ali.",
    ],
    2:[
      "Restaurante ali. Come e pensa na vida.",
    ],
    3:[
      "Come ali e reflete nas escolhas.",
    ],
    4:[
      "Come bastante. Pode ser a última direção.",
    ]
  },

  school:{
    0:[
      "Escola à frente.",
    ],
    1:[
      "Escola ali. Vai devagar.",
    ],
    2:[
      "Escola ali. Não traumatiza ninguém.",
    ],
    3:[
      "Escola ali. Dirige como adulto.",
    ],
    4:[
      "Se errar ali traumatiza uma geração.",
    ]
  },

  driving_school:{
    0:[
      "Autoescola próxima.",
    ],
    1:[
      "Autoescola ali. Recomendo.",
    ],
    2:[
      "Autoescola ali. Considera voltar.",
    ],
    3:[
      "Autoescola ali. Ainda dá tempo.",
    ],
    4:[
      "Entra na autoescola e recomeça a vida.",
    ]
  }

};
