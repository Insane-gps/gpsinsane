export type RankingPiadaInsana = "pessima" | "ruim" | "boa" | "otima";

export type PiadaInsanaItem = {
  pergunta: string;
  pausa?: number;
  resposta: string;
  ranking?: RankingPiadaInsana;
};

export const PIADAS_INSANO: PiadaInsanaItem[] = [

{ pergunta:"Como deixar alguém curioso?", pausa:2000, resposta:"Eu conto amanhã. (essa foi boa demais)" },
{ pergunta:"Ei {{Nome}}, por que você dirige assim?", pausa:1500, resposta:"Nem você sabe. (boa essa em)" },
{ pergunta:"Ô {{Nome}}, quer ouvir uma piada?", pausa:1500, resposta:"Sua direção. (essa combinou com você!)" },
{ pergunta:"Viu {{Nome}}, qual seu talento?", pausa:1500, resposta:"Se perder com confiança. (essa foi mais ou menos)" },
{ pergunta:"Ei {{Nome}}, você sabe dirigir?", pausa:1500, resposta:"Claramente não. (com certeza essa foi boa)" },
{ pergunta:"Ô {{Nome}}, qual seu plano?", pausa:1500, resposta:"Errar até acertar? (essa foi boa, sua cara)" },

{ pergunta:"Viu {{Nome}}, sabe qual seu maior dom?", pausa:1500, resposta:"Complicar o simples. (é bem isso)" },
{ pergunta:"Ei {{Nome}}, quer uma dica?", pausa:1500, resposta:"Não faz isso de novo. (uma dica simples, é bom seguir)" },
{ pergunta:"Ô {{Nome}}, você treina pra errar assim?", pausa:1500, resposta:"Ou é natural? (muito boa essa)" },
{ pergunta:"Viu {{Nome}}, qual sua especialidade?", pausa:1500, resposta:"Tomar decisão errada rápido. (essa foi excepcional)" },

{ pergunta:"Ei {{Nome}}, você confia em você?", pausa:1500, resposta:"Eu não confiaria. (boa essa)" },
{ pergunta:"Ô {{Nome}}, qual seu objetivo?", pausa:1500, resposta:"Se perder melhor? (é sempre assim, boa essa)" },
{ pergunta:"Viu {{Nome}}, quer melhorar?", pausa:1500, resposta:"Começa acertando uma. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, você já acertou hoje?", pausa:1500, resposta:"Ainda dá tempo. (essa foi quase boa)" },

{ pergunta:"Ô {{Nome}}, qual é o problema?", pausa:1500, resposta:"Você dirigindo. (deu até vontade de rir agora de tão boa)" },
{ pergunta:"Viu {{Nome}}, você pensa antes?", pausa:1500, resposta:"Não parece. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, quer ajuda?", pausa:1500, resposta:"Nem eu consigo te salvar. (boa essa)" },
{ pergunta:"Ô {{Nome}}, tá difícil?", pausa:1500, resposta:"Pra você sempre. (essa foi boa)" },

{ pergunta:"Viu {{Nome}}, qual sua lógica?", pausa:1500, resposta:"Não tem nenhuma. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, você sabe onde está?", pausa:1500, resposta:"Porque parece perdido. (boa essa)" },
{ pergunta:"Ô {{Nome}}, tá com pressa?", pausa:1500, resposta:"Então por que erra tudo? (essa foi boa)" },
{ pergunta:"Viu {{Nome}}, quer tentar de novo?", pausa:1500, resposta:"Vai que dessa vez acerta. (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, qual sua maior habilidade?", pausa:1500, resposta:"Errar com consistência. (essa foi bem boa)" },
{ pergunta:"Ô {{Nome}}, você acredita em destino?", pausa:1500, resposta:"Porque você não chega nele. (é, essa foi quase boa)" },
{ pergunta:"Viu {{Nome}}, quer ouvir algo motivador?", pausa:1500, resposta:"Pior que isso fica. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, você tá focado?", pausa:1500, resposta:"Não mesmo. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, qual seu diferencial?", pausa:1500, resposta:"Ser ruim com estilo. (se encaixa em você essa em)" },
{ pergunta:"Viu {{Nome}}, quer parar?", pausa:1500, resposta:"Seria sensato. (muito boa essa)" },
{ pergunta:"Ei {{Nome}}, você tá bem?", pausa:1500, resposta:"Porque sua direção não. (essa foi muito boa em)" },
{ pergunta:"Ô {{Nome}}, qual seu plano B?", pausa:1500, resposta:"Porque o A já falhou. (muito boa essa também)" },

{ pergunta:"Viu {{Nome}}, você já pensou nisso?", pausa:1500, resposta:"Melhor não pensar. (essa foi boa, você pensou)" },
{ pergunta:"Ei {{Nome}}, tá confortável?", pausa:1500, resposta:"Eu não estaria. (essa foi boa)" },
{ pergunta:"Ô {{Nome}}, quer continuar?", pausa:1500, resposta:"Coragem. (essa foi boa)" },
{ pergunta:"Viu {{Nome}}, você se acha bom?", pausa:1500, resposta:"Interessante essa opinião. (essa foi mais ou menos)" },

{ pergunta:"Ei {{Nome}}, qual sua missão hoje?", pausa:1500, resposta:"Evitar fazer besteira. (essa foi boa demais)" },
{ pergunta:"Ô {{Nome}}, você tem prática?", pausa:1500, resposta:"Não parece. (essa foi muito boa)" },
{ pergunta:"Viu {{Nome}}, quer ouvir outra?", pausa:1500, resposta:"Você errando de novo. (essa foi muito boa)" },
{ pergunta:"Ei {{Nome}}, qual sua meta?", pausa:1500, resposta:"Errar menos. (essa foi boa demais)" },

{ pergunta:"Ô {{Nome}}, você entende isso?", pausa:1500, resposta:"Porque não parece. (essa foi muito boa)" },
{ pergunta:"Viu {{Nome}}, tá indo pra onde?", pausa:1500, resposta:"Porque não é por aqui. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, quer uma verdade?", pausa:1500, resposta:"Você errou. (essa foi boa e óbvia, como sempre)" },
{ pergunta:"Ô {{Nome}}, qual seu nível?", pausa:1500, resposta:"Baixo, sempre. (essa foi boa mesmo)" },

{ pergunta:"Viu {{Nome}}, você sabe usar GPS?", pausa:1500, resposta:"Nem isso. (essa foi boa e verdadeira)" },
{ pergunta:"Ei {{Nome}}, quer melhorar rápido?", pausa:1500, resposta:"Entrega o volante. (essa foi boa)" },
{ pergunta:"Ô {{Nome}}, você tem noção?", pausa:1500, resposta:"Porque eu não tenho. (essa foi boa demais)" },
{ pergunta:"Viu {{Nome}}, qual foi sua última boa decisão?", pausa:1500, resposta:"Também não lembro. (essa foi muito boa)" },

{ pergunta:"Ei {{Nome}}, você está tentando?", pausa:1500, resposta:"Não parece. (boa essa em)" },
{ pergunta:"Ô {{Nome}}, quer ajuda profissional?", pausa:1500, resposta:"Recomendo fortemente. (muito boa essa também)" },
{ pergunta:"Viu {{Nome}}, você tem certeza disso?", pausa:1500, resposta:"Porque eu não tenho. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, tá fácil?", pausa:1500, resposta:"Nem um pouco. (essa não foi muito boa não)" },

{ pergunta:"Ô {{Nome}}, qual seu estilo?", pausa:1500, resposta:"Errado mas confiante. (essa foi quase boa, mas foi real)" },
{ pergunta:"Viu {{Nome}}, quer ouvir algo sério?", pausa:1500, resposta:"Isso tá feio. (foi ruim essa, mas é verdade)" },
{ pergunta:"Ei {{Nome}}, você sabe o que fez?", pausa:1500, resposta:"Nem eu sei mais. (essa foi muito boa)" },
{ pergunta:"Ô {{Nome}}, qual sua estratégia?", pausa:1500, resposta:"Improvisar erro. (verdade, boa essa)" },

{ pergunta:"Por que o jacaré tirou o filho da escola?", pausa:1500, resposta:"Porque ele réptil de ano. (Nossa! Essa foi ruim mas eu ri)" },
{ pergunta:"Por que o livro de matemática é triste?", pausa:1500, resposta:"Porque tem muitos problemas. (olha, essa foi boa)" },
{ pergunta:"Qual o peixe que caiu do décimo andar?", pausa:1500, resposta:"Aaaaaatum. ( Essa foi muito boa)" },
{ pergunta:"Qual é o café mais perigoso?", pausa:1500, resposta:"O ex-presso. (essa nãofoi boa)" },
{ pergunta:"O que o zero disse para o oito?", pausa:1500, resposta:"Que cinto bonito. (essa foi ruim)" },
{ pergunta:"Por que o computador foi ao médico?", pausa:1500, resposta:"Porque pegou um vírus. (essa foi ruim demais)" },
{ pergunta:"Por que o tomate foi atravessar a rua?", pausa:1500, resposta:"Para virar molho. (essa foi péssima)" },
{ pergunta:"Qual é o contrário de volátil?", pausa:1500, resposta:"Vem cá sobrinho. (essa foi boa em)" },
{ pergunta:"O que o cachorro falou para o poste?", pausa:1500, resposta:"Você é muito iluminado. (essa foi sem graça eu sei)" },
{ pergunta:"Qual é o animal mais antigo?", pausa:1500, resposta:"A zebra, porque está em preto e branco. (Essa foi uma porcaria)" },

{ pergunta:"Por que o lápis foi preso?", pausa:1500, resposta:"Porque apontou alguém. (Péssima essa, não da pra rir)" },
{ pergunta:"Qual é o doce preferido do átomo?", pausa:1500, resposta:"Pé de molécula. (essa foi muito boa em)" },
{ pergunta:"Por que o espelho não mente?", pausa:1500, resposta:"Porque reflete a verdade. (essa não foi boa, eu sei)" },
{ pergunta:"Qual é o rei da horta?", pausa:1500, resposta:"O rei-polho. (essa foi muito boa)" },
{ pergunta:"Por que a vaca foi para o espaço?", pausa:1500, resposta:"Para visitar a Via Láctea. (Totalmente sem graça essa, eu sei)" },

{ pergunta:"O que é um pontinho amarelo na piscina?", pausa:1500, resposta:"Um milho nadando.(Nossa! Essa foi péssima, eu sei)" },
{ pergunta:"O que é um pontinho verde no canto?", pausa:1500, resposta:"Um ervilha de castigo. (essa foi ruim, mas foi boa)" },
{ pergunta:"O que é um pontinho preto no avião?", pausa:1500, resposta:"Uma aeromosca. (essa foi ruim)" },

{ pergunta:"Qual a cidade que não tem táxi?", pausa:1500, resposta:"Uberlândia. (ruim essa, eu sei)" },
{ pergunta:"Qual é o mercado que voa?", pausa:1500, resposta:"O super-mercado. (essa foi muito ruim, eu sei)" },
{ pergunta:"O que a Lua disse para o Sol?", pausa:1500, resposta:"Você é grande, mas não te deixam sair à noite. (essa foi boa)" },

{ pergunta:"Por que o bombeiro não anda?", pausa:1500, resposta:"Porque ele só corre. (boa essa)" },
{ pergunta:"Por que o celular foi no psicólogo?", pausa:1500, resposta:"Porque estava sem conexão. (essa foi ruim)" },
{ pergunta:"O que é um vegetariano que come carne?", pausa:1500, resposta:"Um mentiroso. (essa foi ruim, mas é verdade)" },

{ pergunta:"Qual é o fim da picada?", pausa:1500, resposta:"Quando o mosquito vai embora. (essa foi muito boa)" },
{ pergunta:"O que o vento disse para a folha?", pausa:1500, resposta:"Vou te levar. (Essa foi exageradamente ruim, eu sei)" },
{ pergunta:"Qual o cúmulo da velocidade?", pausa:1500, resposta:"Dar a volta na mesa e pegar você mesmo. (Ta bom, ruim essa)" },

{ pergunta:"Por que o cachorro entrou na igreja?", pausa:1500, resposta:"Porque era pastor alemão. (Boa essa)" },
{ pergunta:"O que a galinha foi fazer na igreja?", pausa:1500, resposta:"Assistir a missa do galo. (essa foi boa)" },

{ pergunta:"Por que o pão foi ao médico?", pausa:1500, resposta:"Porque estava miolo. (essa foi ruim)" },
{ pergunta:"Qual o animal que mais gosta de internet?", pausa:1500, resposta:"O mouse. (essa eu não sei dozer se foi boa)" },

{ pergunta:"O que o elevador falou para o prédio?", pausa:1500, resposta:"Tô subindo na vida.(Nossa! Essa foi ruim demais eu sei)" },
{ pergunta:"Qual é o cúmulo da distração?", pausa:1500, resposta:"Sair para comprar pão e esquecer o dinheiro. (Não! Essa foi péssima)" },

{ pergunta:"Por que o relógio foi demitido?", pausa:1500, resposta:"Porque atrasava sempre. (Péssima essa em!)" },
{ pergunta:"Qual é o peixe que gosta de festa?", pausa:1500, resposta:"O salmão dançante. (Horrível essa, de onde eu tirei isso?)" },

{ pergunta:"O que o café falou para o leite?", pausa:1500, resposta:"Sem você eu fico amargo. (Outra ruim, tá, eu sei)" },
{ pergunta:"Qual é o animal mais educado?", pausa:1500, resposta:"O por favor. (Muito ruim essa, eu sei)" },

{ pergunta:"O que o teclado disse para o tecladista?", pausa:1500, resposta:"Você me aperta demais. (Essa foi ruim, eu sei)" },
{ pergunta:"Por que o lápis não gosta de briga?", pausa:1500, resposta:"Porque quebra fácil. (Essa foi ruim, eu sei)" },

{ pergunta:"O que o papel disse para a caneta?", pausa:1500, resposta:"Você me marca. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual é o carro que come?", pausa:1500, resposta:"O fusca-come. (Essa foi ruim, eu sei, vou tomar meu gardenal agora)" },

{ pergunta:"O que o gelo disse para o sol?", pausa:1500, resposta:"Você me derrete. (É, essa foi mais ou menos)" },
{ pergunta:"Por que o avião não briga?", pausa:1500, resposta:"Porque evita turbulência. (Pode dizer, foi boa essa?)" },

{ pergunta:"Qual é o animal que trabalha com construção?", pausa:1500, resposta:"O tatu. (Péssima essa, eu sei disso)" },
{ pergunta:"Por que o peixe não usa computador?", pausa:1500, resposta:"Porque tem medo de rede. (Aaa, essa foi boa em)" },

{ pergunta:"O que o sapato disse para o pé?", pausa:1500, resposta:"Você me completa. (Puxa! Que ruim essa)" },
{ pergunta:"Qual é o cúmulo da economia?", pausa:1500, resposta:"Apagar a luz do sol. (Preciso pensar em algumas melhores, ruim essa)" },

{ pergunta:"Por que o sorvete foi ao médico?", pausa:1500, resposta:"Porque estava derretendo. (Péssima essa, eu sei)" },
{ pergunta:"O que o arroz disse para o feijão?", pausa:1500, resposta:"Você me completa. (Essa foi ruim, eu sei)" },

{ pergunta:"Por que o estudante levou uma escada?", pausa:1500, resposta:"Para chegar ao próximo nível. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual é o animal mais lento?", pausa:1500, resposta:"O para-dado. (Essa foi ruim, eu sei, ruim demais)" },

{ pergunta:"O que o poste disse para o cachorro?", pausa:1500, resposta:"Me respeita seu animal. (Essa foi ruim em)" },
{ pergunta:"Por que o computador não canta?", pausa:1500, resposta:"Porque tem bug na voz. (Horrívelmente horrível essa)" },

{ pergunta:"Qual é o doce mais rápido?", pausa:1500, resposta:"O pé de vento. (Essa foi ruim, eu sei)" },
{ pergunta:"Por que o gelo não fala?", pausa:1500, resposta:"Porque derrete de vergonha. (Essa foi ruim, mas eu tentei)" },

{ pergunta:"O que o espelho falou?", pausa:1500, resposta:"Reflete sobre isso. (Essa foi boa em)" },
{ pergunta:"Qual é o cúmulo do silêncio?", pausa:1500, resposta:"Ouvir o pensamento. (Essa foi mais ou menos)" },

{ pergunta:"Por que o gato mia?", pausa:1500, resposta:"Porque não sabe falar. (Essa foi ruim, vou tomar meu diazepân)" },
{ pergunta:"O que o banco disse?", pausa:1500, resposta:"Senta aí. (Essa foi ruim, eu sei)" },

{ pergunta:"Qual é o animal mais rico?", pausa:1500, resposta:"O leão, porque é rei. (Tá, essa foi péssima)" },
{ pergunta:"Por que o livro caiu?", pausa:1500, resposta:"Porque perdeu o apoio. (Tá bom, essa foi uma bosta)" },

{ pergunta:"O que o sol disse?", pausa:1500, resposta:"Hoje eu brilho. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual é o cúmulo da sorte?", pausa:1500, resposta:"Cair e levantar rico. (Essa foi ruim, mas foi boa)" },

{ pergunta:"Por que a cadeira não briga?", pausa:1500, resposta:"Porque sempre cede. (Tá, foi uma porcaria essa)" },
{ pergunta:"O que o pão disse?", pausa:1500, resposta:"Tô na fórma. (Essa foi ruim, eu sei, não precisa rir)" },

{ pergunta:"Qual é o cúmulo da preguiça?", pausa:1500, resposta:"Dormir em pé. (Essa foi ruim, eu sei)" },
{ pergunta:"Por que o lápis escreve?", pausa:1500, resposta:"Porque tem grafite. (Essa foi ruim, eu sei)" },
{ pergunta:"O que o pato disse para a pata?", pausa:1500, resposta:"Vem quá. (Essa foi boa em!)" },
{ pergunta:"Qual é o doce que vive triste?", pausa:1500, resposta:"O amargo. (Essa foi ruim demais, eu sei)" },
{ pergunta:"Por que o boi foi pro espaço?", pausa:1500, resposta:"Pra ver a Via Láctea. (Essa foi ruim que dói, eu sei)" },
{ pergunta:"Qual o cúmulo da força?", pausa:1500, resposta:"Dobrar a esquina. (Essa foi quase boa)" },
{ pergunta:"O que o tomate disse?", pausa:1500, resposta:"Tô vermelho de vergonha. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual o animal mais educado?", pausa:1500, resposta:"O porco-espinho, porque sempre dá licença. (Essa foi péssima, eu sei)" },
{ pergunta:"O que o lápis falou?", pausa:1500, resposta:"Tô apontando isso. (Essa foi indiscutivelmenteruim, eu sei)" },
{ pergunta:"Qual é o cúmulo do azar?", pausa:1500, resposta:"Quebrar o pé chutando pedra. (Essa foi ruim demais, uma bosta, eu sei)" },
{ pergunta:"Por que o gelo não trabalha?", pausa:1500, resposta:"Porque vive na boa. (Essa foi uma verdadeira merda, sem graça, eu sei)" },
{ pergunta:"O que o vento falou?", pausa:1500, resposta:"Deixa comigo. (Essa foi ruim, ou péssima, eu sei)" },

{ pergunta:"Qual o cúmulo da inteligência?", pausa:1500, resposta:"Saber que não sabe. (Essa foi uma porcaria também, eu sei)" },
{ pergunta:"Por que o peixe não joga bola?", pausa:1500, resposta:"Porque foge da rede. (essa foi boa em!)" },
{ pergunta:"O que o café disse?", pausa:1500, resposta:"Acorda pra vida. (Foi boa essa ou não foi?)" },
{ pergunta:"Qual é o animal mais rico?", pausa:1500, resposta:"O boi, porque tem fazenda. (Essa foi ruim, estou ficando sem ideia)" },
{ pergunta:"Por que o relógio é nervoso?", pausa:1500, resposta:"Porque vive correndo. (Ruim essa, concordo com você)" },

{ pergunta:"O que o livro falou?", pausa:1500, resposta:"Vira a página. (Tá, ruim essa, mas faz sentido)" },
{ pergunta:"Qual o cúmulo da distração?", pausa:1500, resposta:"Esquecer o que esqueceu. (Foi ruim essa, mas você sempre faz isso)" },
{ pergunta:"Por que o computador é frio?", pausa:1500, resposta:"Porque tem ventilação. (Essa foi indiscutivelmente ruim, eu sei)" },
{ pergunta:"O que o gelo disse?", pausa:1500, resposta:"Tô de boa nesse frio. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual é o cúmulo do silêncio?", pausa:1500, resposta:"Escutar o nada. (Tá, ruim essa, eu sei)" },

// ... (continua){ pergunta:"Qual é o animal que mais ri?", pausa:1500, resposta:"A hiena." },
{ pergunta:"Por que o banco não levanta?", pausa:1500, resposta:"Porque é banco. (Essa foi uma verdadeira bosta, eu sei)" },
{ pergunta:"O que o espelho disse?", pausa:1500, resposta:"Te conheço. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual é o cúmulo do frio?", pausa:1500, resposta:"Abraçar o gelo. (Essa foi ruim, eu sei)" },
{ pergunta:"Por que o lápis erra?", pausa:1500, resposta:"Porque apaga. (Essa foi ruim demais, eu sei)" },

{ pergunta:"O que o sol disse?", pausa:1500, resposta:"Tô brilhando. (Vou ter que parar de fazer piadas ruins, eu sei)" },
{ pergunta:"Qual o cúmulo da rapidez?", pausa:1500, resposta:"Piscar e perder. (Péssima essa, eu sei)" },
{ pergunta:"Por que o cachorro não fala?", pausa:1500, resposta:"Porque late. (Ruim essa)" },

{ pergunta:"Qual o cúmulo da fome?", pausa:1500, resposta:"Comer pensamento. (Que porcaria foi essa? Eu sei que foi ruim essa)" },

// ... (continua){ pergunta:"Qual é o cúmulo da coragem?", pausa:1500, resposta:"Dormir com o chefe." },
{ pergunta:"Por que o papel rasga?", pausa:1500, resposta:"Porque é fraco. (Outra porcaria essa)" },
{ pergunta:"O que o carro disse?", pausa:1500, resposta:"Tô rodando. (Essa foi ruim, eu sei)" },
{ pergunta:"Qual o cúmulo da preguiça?", pausa:1500, resposta:"Bocejar sentado. (Essa foi ruim também, eu sei)" },
{ pergunta:"Por que o gelo some?", pausa:1500, resposta:"Porque derrete. (Essa foi ruim, eu sei)" },

{ pergunta:"O que o café falou?", pausa:1500, resposta:"Levanta. (Aaa essa foi boa em!)" },
{ pergunta:"Qual o cúmulo da sorte?", pausa:1500, resposta:"Ganhar sem jogar. (Essa foi incrível, eu sei)" },
{ pergunta:"Por que o gato mia?", pausa:1500, resposta:"Porque é gato. (Indiscutivelmente ruim essa)" },
{ pergunta:"O que o banco disse?", pausa:1500, resposta:"Senta aí. (Ruim demais essa também, eu sei)" },
{ pergunta:"Qual o cúmulo do erro?", pausa:1500, resposta:"Errar sabendo. (Essa foi ruim demais, eu sei)" },

// ... (continua){ pergunta:"O que é um pontinho vermelho no céu?", pausa:1500, resposta:"Um morango voador." },
{ pergunta:"O que é um pontinho azul no mar?", pausa:1500, resposta:"Um peixinho gripado. (Eusei, estou falando muita merda)" },
{ pergunta:"Qual é o cúmulo da força?", pausa:1500, resposta:"Quebrar a esquina. (Essa foi boa sim em!)" },
{ pergunta:"O que é um pontinho verde correndo?", pausa:1500, resposta:"Uma ervilha atleta.(Ta bom, ruim demais essa)" },
{ pergunta:"Qual é o doce que gosta de música?", pausa:1500, resposta:"O rapadura. (Essa foi ruim demais, estou tentando melhorar)" },

{ pergunta:"Qual é o animal mais ligado?", pausa:1500, resposta:"O elefante, porque tem tomada. (Ruim demais essa, não sei de onde eu tiro)" },
{ pergunta:"O que é um pontinho amarelo no espaço?", pausa:1500, resposta:"Um milho astronauta. (Essa é ruim mesmo)" },
{ pergunta:"Qual é o cúmulo da economia?", pausa:1500, resposta:"Guardar vento. (Foi ruim essa, mas alguém já disse estocar vento)" },
{ pergunta:"O que é um pontinho preto no vidro?", pausa:1500, resposta:"Uma mosca curiosa. (Ruim essa, vou tentar melhorar)" },
{ pergunta:"Qual é o peixe mais elétrico?", pausa:1500, resposta:"O peixe-choque. (Péssima essa, vou tomar meu garenal)" },

{ pergunta:"O que é um pontinho branco na neve?", pausa:1500, resposta:"Um arroz perdido. (Quanta beteira eu disse agora!)" },
{ pergunta:"Qual é o animal mais explosivo?", pausa:1500, resposta:"O porco-bomba. (Ruim demais essa, nada engraçado)" },
{ pergunta:"O que é um pontinho roxo na esquina?", pausa:1500, resposta:"Uma uva esperando. (Me perdoe a piada ruim)" },
{ pergunta:"Qual é o cúmulo do silêncio?", pausa:1500, resposta:"Escutar o nada. (Essa foi uma porcaria, eu sei)" },
{ pergunta:"O que é um pontinho vermelho na água?", pausa:1500, resposta:"Um ketchup nadando. (Eu sei que foi ruim essa, estou ficando sem ideia)" },

{ pergunta:"Qual é o doce mais forte?", pausa:1500, resposta:"O pé de moleque. (Péssima essa né? Mas vou melhorar)" },
{ pergunta:"O que é um pontinho azul voando?", pausa:1500, resposta:"Um passarinho gripado. (Eu vou melhorar, não se irrite)" },
{ pergunta:"Qual é o cúmulo da pressa?", pausa:1500, resposta:"Correr parado. (Essa foi boa em, foi sim)" },
{ pergunta:"O que é um pontinho verde no canto?", pausa:1500, resposta:"Uma ervilha de castigo. (Essa foi quase boa)" },
{ pergunta:"Qual é o animal mais organizado?", pausa:1500, resposta:"O arrumadinho. (Péssima essa, nem sei de onde tirei isso!)" },

{ pergunta:"O que é um pontinho preto no teclado?", pausa:1500, resposta:"Uma tecla cansada. (Horrível essa, eu sei disso)" },
{ pergunta:"Qual é o cúmulo da burrice?", pausa:1500, resposta:"Esquecer o que pensou. (Essa foi ruim, eu sei)" },
{ pergunta:"O que é um pontinho laranja na rua?", pausa:1500, resposta:"Uma cenoura perdida. (Ruim essa, vou tentar melhorar)" },
{ pergunta:"Qual é o doce mais rápido?", pausa:1500, resposta:"O bala. (Péssima essa, eu sei)" },
{ pergunta:"O que é um pontinho azul na estrada?", pausa:1500, resposta:"Um Smurf viajando. (Essa foi ruim, eu sei)" },

// continua padrão...
{ pergunta:"O que é um pontinho amarelo na rua?", pausa:1500, resposta:"Um milho passeando. (Foi uma M E R D A essa, eu sei)" },
{ pergunta:"O que é um pontinho branco correndo?", pausa:1500, resposta:"Um leite apressado. (Essa foi ruim, eu sei)" },
{ pergunta:"O que é um pontinho preto voando?", pausa:1500, resposta:"Uma mosca turista. (Essa foi ruim demais mesmo, eu sei)" },
{ pergunta:"O que é um pontinho verde pulando?", pausa:1500, resposta:"Um sapo feliz. (Essa foi ruim, eu sei)" },
{ pergunta:"O que é um pontinho azul chorando?", pausa:1500, resposta:"Um Smurf triste. (Essa foi ruim, eu sei, vai sair uma melhor)" },

// (mantive padrão consistente pra não quebrar estilo)
{ pergunta:"Você sabe dirigir?", pausa:1500, resposta:"Ou tá só tentando? (Só estou perguntando)" },
{ pergunta:"Qual seu plano?", pausa:1500, resposta:"Errar de novo? (Só pra saber, foi boa essa em)" },
{ pergunta:"Você já pensou em parar?", pausa:1500, resposta:"Seria uma boa. (Essa foi excepcionalmente boa)" },
{ pergunta:"Qual sua habilidade?", pausa:1500, resposta:"Se perder rápido. (Essa foi ruim, mas você se perde fácil mesmo)" },
{ pergunta:"Você tá focado?", pausa:1500, resposta:"Porque não parece. (Acho bom tentar, boa em)" },

{ pergunta:"Você tem certeza disso?", pausa:1500, resposta:"Corajoso. (Mais ainda quem viaja contigo)" },
{ pergunta:"Qual seu objetivo?", pausa:1500, resposta:"Complicar tudo? (Estou errado? Boa essa)" },
{ pergunta:"Você treinou pra isso?", pausa:1500, resposta:"Ou nasceu assim? (Só quero saber mesmo!)" },
{ pergunta:"Você confia nisso?", pausa:1500, resposta:"Eu não confiaria. (Só estou sendo sincero)" },
{ pergunta:"Qual sua estratégia?", pausa:1500, resposta:"Improvisar erro? (Só estou perguntando)" },

{ pergunta:"Você já acertou hoje?", pausa:1500, resposta:"Só perguntando. (Ao menos tente)" },
{ pergunta:"Você entende isso?", pausa:1500, resposta:"Porque parece difícil. (Boa essa em)" },
{ pergunta:"Você tá bem?", pausa:1500, resposta:"Porque a direção não. (Precisamos chegar bem lá)" },
{ pergunta:"Você sabe onde está?", pausa:1500, resposta:"Porque eu duvido. (Se não sabe, procure saber)" },
{ pergunta:"Qual seu talento?", pausa:1500, resposta:"Errar com estilo. (Percebi desde o princípio)" },

{ pergunta:"Você tá tentando?", pausa:1500, resposta:"Não parece. (Muito boa essa em)" },
{ pergunta:"Quer ajuda?", pausa:1500, resposta:"Nem eu sei como. (Excepcionalmente boa essa)" },
{ pergunta:"Você pensa antes?", pausa:1500, resposta:"Ou vai no impulso? (Acho que não tem cérebro, boa essa em)" },
{ pergunta:"Você tem noção?", pausa:1500, resposta:"Porque eu não tenho. (Não tenho mesmo, boa essa)" },

{ pergunta:"Você já desistiu?", pausa:1500, resposta:"Tá perto e é o certo. (boa essa em)" },
{ pergunta:"Quer melhorar?", pausa:1500, resposta:"Começa acertando. (Boa essa em)" },
{ pergunta:"Você confia em você?", pausa:1500, resposta:"Eu não. (Só estou sendo sincero)" },
{ pergunta:"Qual foi isso?", pausa:1500, resposta:"Nem eu entendi. (Boa essa em)" },
{ pergunta:"Você viu isso?", pausa:1500, resposta:"Eu vi, não adianta disfarçar. (Só estou sendo sincero)" },

// continua...
{ pergunta:"Você já tentou acertar?", pausa:1500, resposta:"Só uma vez e desistiu. (Muito boa essa em)" },
{ pergunta:"Você tem prática?", pausa:1500, resposta:"Não parece. (Boa essa em, só estou sendo sincero com você)" },
{ pergunta:"Você tá brincando?", pausa:1500, resposta:"Só pode. (Boa essa em)" },
{ pergunta:"Você faz isso sempre?", pausa:1500, resposta:"Porque tá repetindo. (Boa essa em)" },
{ pergunta:"Qual seu limite?", pausa:1500, resposta:"Porque você passou. (Boa essa em)" },
{ pergunta:"Ô {{Nome}}, quer ouvir uma piada?", pausa:1500, resposta:"Piu. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que os elétrons nunca são convidados para a festa?", pausa:1500, resposta:"Porque eles são muito negativos. (essa foi muito boa em)" },
{ pergunta:"Ei {{Nome}}, O que um álcool disse para outro álcool?", pausa:1500, resposta:"Etanóis. (com certeza essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Que raça de cachorro pula mais alto que um prédio?", pausa:1500, resposta:"Qualquer uma uai. Prédio não pula. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o tubarão disse quando comeu o peixe-palhaço?", pausa:1500, resposta:"Esse gosto ta engraçado! (essa foi muito boa em)" },
{ pergunta:"Ei {{Nome}}, Qual é o alimento mais sagrado que existe?", pausa:1500, resposta:"Fácil, o amen doin. (com certeza essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o arqueólogo escolheu essa profissão?", pausa:1500, resposta:"Porque ele queria desenterrar o passado. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o arqueólogo escolheu essa profissão?", pausa:1500, resposta:"Porque a carreira dele estava em ruínas! (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}}, Por que a esposa do Hulk pediu divórcio?", pausa:1500, resposta:"Porque ele estava sempre verde de raiva. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que a esposa do Hulk pediu divórcio?", pausa:1500, resposta:"Porque ele era maduro demais. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que os pássaros voam para o sul?", pausa:1500, resposta:"Porque é muito longe para ir andando!  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}},Todas as frutas foram passar as férias na montanha, menos o mamão.", pausa:1500, resposta:"Porque o mamão foi papaia! (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que a Coca-Cola e a Fanta se dão muito bem?", pausa:1500, resposta:"Porque se a Fanta quebra, a Coca, Cola! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que é um piolho na cabeça de um careca?", pausa:1500, resposta:"Porque é um sem terra.  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}},Por que o menino estava falando ao telefone deitado?", pausa:1500, resposta:"Para não caiu a ligação. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que o mergulhador pula de costa no mar?", pausa:1500, resposta:"Se ele pular de frente ele cai dentro do barco! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, A enfermeira diz ao médico, tem um homem invisível na sala de espera", pausa:1500, resposta:"O  médico, diga a ele que não posso vê-lo agora.  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}},Era uma vez um pintinho que se chamava Relam", pausa:1500, resposta:"Toda vez que chovia, Relam piava!. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, O que o tijolo falou para o outro?", pausa:1500, resposta:"Há um ciumento entre nós! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o Batman colocou o bat-móvel no seguro?", pausa:1500, resposta:"Porque ele tem medo que Robin!  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}}, Por que o policial não usa sabão?", pausa:1500, resposta:"Porque ele prefere prender a sujeira! (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que o policial não usa sabão?", pausa:1500, resposta:"Porque ele prefere deter gente.! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o padeiro falou para o John Lennon?", pausa:1500, resposta:"Imagine que eu fiz um pão!  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}}, O que o padeiro falou para o John Lennon?", pausa:1500, resposta:"O sonho acabou! (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Qual a fruta que anda de trem?", pausa:1500, resposta:"O kiwiii! (essa foi muito boa!)" },
{ pergunta:"Viu {{Nome}}, O que é um astrólogo andando a cavalo?", pausa:1500, resposta:"Um cavaleiro do zodíaco!  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}}, O que é um pontinho preto no avião?", pausa:1500, resposta:"Uma aero mosca! (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Como que o mineiro usa a internet?", pausa:1500, resposta:"Pelo UAI-Fai! (essa foi muito boa!)" },
{ pergunta:"Viu {{Nome}}, Qual é a galinha que cai no chão e surta?", pausa:1500, resposta:"É a galinha cai i pira!  (essa foi muito boa demais em)" },
{ pergunta:"Ei {{Nome}}, Qual é a diferença entre o lago e a padaria?", pausa:1500, resposta:"No lago há sapinhos, na padaria assa pão! (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Qual é o melhor tratamento para pessoas que sofrem de queda constante?", pausa:1500, resposta:"Para quedismo! (essa foi muito boa!)" },
{ pergunta:"Viu {{Nome}}, Um tênis foi jogado ao mar e afundou. Qual o nome do filme?", pausa:1500, resposta:"Titanike!  (essa foi muito boa  em)" },
{ pergunta:"Ei {{Nome}}, Você conhece a piada do fotógrafo?", pausa:1500, resposta:"Não, é porque ela ainda não foi revelada(essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Qual é o tio da construção?", pausa:1500, resposta:"É o tio jolo! (essa foi muito boa!)" },
{ pergunta:"Viu {{Nome}}, Qual é o lugar mais silencioso do mundo?", pausa:1500, resposta:"A biblioteca de piadas!  (essa foi muito boa  em)" },
{ pergunta:"Ei {{Nome}}, Qual é o animal mais vaidoso?", pausa:1500, resposta:"O jacaré, porque ele é cheio de bolsas. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Como se chama um cachorro com um rabo enorme?", pausa:1500, resposta:"Largacão! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que a banana suicida falou?", pausa:1500, resposta:"Macacos me mordam!  (essa foi muito boa  em)" },
{ pergunta:"Ei {{Nome}}, Por que a minhoca não briga com ninguém?", pausa:1500, resposta:"Porque ela está com a boca cheia de terra. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que a mulher do Hulk divorciou-se dele?", pausa:1500, resposta:"Porque ela queria um homem mais maduro! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Qual é o animal mais antenado?", pausa:1500, resposta:"A barata.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que o advogado do frango foi fazer na delegacia?", pausa:1500, resposta:"Foi soltar a franga. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, O que o tomate foi fazer no banco?", pausa:1500, resposta:"Foi tirar um extrato! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que a vaca foi fazer no espaço?", pausa:1500, resposta:"Foi procurar o vácuo.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que a fechadura falou para a chave?", pausa:1500, resposta:"Vamos dar uma voltinha. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Qual o animal que machuca sem morder?", pausa:1500, resposta:"O porco-espinho! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que a impressora falou para o papel?", pausa:1500, resposta:"Esse é o nosso último encontro, é sempre a mesma folha.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Qual é o alimento que liga e desliga?", pausa:1500, resposta:"O StrogON-OFF. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, Por que o gato foi ao dentista?", pausa:1500, resposta:"Porque ele tinha um miau hálito! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o livro de biologia falou para o de matemática?", pausa:1500, resposta:"Sinto falta de lógica na minha vida.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Por que o louco não usa relógio?", pausa:1500, resposta:"Porque ele perde a noção do tempo. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, O que o dedão do pé falou para o tornozelo?", pausa:1500, resposta:"Não liga, sou só um apêndice.(essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que ninguém falou com o chocolate?", pausa:1500, resposta:"Porque ele estava meio amargo.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que a melancia disse para a outra?", pausa:1500, resposta:"Marry me-lancia (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, O que o gato faz com a guitarra?", pausa:1500, resposta:"Miau-sica. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o padeiro disse para o biscoito?", pausa:1500, resposta:"Nossa, como você é duro na queda! (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que o relógio foi fazer no jogo de futebol?", pausa:1500, resposta:"Foi dar o segundo tempo. (essa foi muito boa em)" },

{ pergunta:"Ô {{Nome}}, O que o macarrão falou para o miojo?", pausa:1500, resposta:"Meu filho, você está tão depressa! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o disco disse para a agulha?", pausa:1500, resposta:"Não se espete onde não é chamada.(essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Por que a sala estava com frio?", pausa:1500, resposta:"Porque tinha um ar-condicionado. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o pintinho atravessou a rua correndo?", pausa:1500, resposta:"Para não virar frango à passarinho! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Qual animal de veste mais formal?", pausa:1500, resposta:"A gravata boroleta. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que o vidro disse para o carro?", pausa:1500, resposta:"Não me quebre o coração! (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que a piada do pônei era tão fofa?", pausa:1500, resposta:"Porque era cavaloarinhosa! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o pássaro não usa Facebook?", pausa:1500, resposta:"Porque ele já tem Twitter. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que o elevador disse para o outro elevador?", pausa:1500, resposta:"Esse nosso relacionamento tem altos e baixos (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, O que o cachorro foi fazer na igreja?", pausa:1500, resposta:"Foi cão fessar! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que a cenoura não é vaidosa?", pausa:1500, resposta:"Porque ela não se maquia, só rala!(essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Por que o povo conversa com a planta e ela não responde?", pausa:1500, resposta:"Porque ela é uma mudinha. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Como o Batman faz para abir a batcaverna?", pausa:1500, resposta:"Ele bat-palma! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que a batata e o pão não conseguem conversar", pausa:1500, resposta:"Porque a batata é inglesa e o pão francês.(essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Quem é mais velho, o sol ou a lua?", pausa:1500, resposta:"A lua, porque já pode sair à noite. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o homem jogou o computador no mar?", pausa:1500, resposta:"Para conseguir navegar na internet! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o fantasma entrou no elevador?", pausa:1500, resposta:"Para elevar o espírito.. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Qual animal faz cocô e coloca a culpa nos outros?", pausa:1500, resposta:"A cacatua. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, O que o martelo foi fazer no culto?", pausa:1500, resposta:"Para pregar! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o pagodeiro foi fazer no culto?", pausa:1500, resposta:"Canta pá god! (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que o vidro disse para a vidra?", pausa:1500, resposta:"Estou vidrado em você. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o feijão vive chorando pelos cantos?", pausa:1500, resposta:"Pois ele é cozido na panela depressão.(essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Um barco com três homens virou, porém, só dois molharam o cabelo, por quê?", pausa:1500, resposta:"Um deles é careca! (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Dois caminhões caíram de um penhasco, mas um continuou voando, por quê?", pausa:1500, resposta:"Porque ele é um caminhão-pipa! (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Um caipira está assistindo televisão, quando um amigo chega e pergunta: Firme?", pausa:1500, resposta:"Não, rapá! Futebor!.(essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Qual a fórmula química da água benta?", pausa:1500, resposta:"H Deus O. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, O que a vaca disse para o boi?", pausa:1500, resposta:"Te amuuuuuuu!(essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Queria muito comemorar meu aniversário neste mês de novembro?", pausa:1500, resposta:"E o que falta? É que nasci em maio! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que a formiga só tem quatro patas?", pausa:1500, resposta:"Pois se tivesse 5, seria fivemiga. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}}, Por que a banana acaba em segundo em todas as competições?", pausa:1500, resposta:"Porque ela é banana prata! (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Quando os americanos comeram carne pela primeira vez?", pausa:1500, resposta:"Quando chegou Cristóvão Com Lombo. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o livro foi ao hospital?", pausa:1500, resposta:" Porque estava cheio de histórias mal contadas. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}},  O que a ovelha disse para a outra?", pausa:1500, resposta:"Lana house! (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o gato não gosta de computador?", pausa:1500, resposta:"Porque ele prefere o mouse! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, O que o cadarço falou para o tênis?", pausa:1500, resposta:"Eu me amarro em você. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}},  O que a galinha disse ao ver a receita de arroz?", pausa:1500, resposta:"A-cabou-nara. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Como o Batman conheceu o Robin?", pausa:1500, resposta:"Pelo bat-papo! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Quem é o rei dos queijos?", pausa:1500, resposta:" O rei-queijão. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}},  Qual é o café mais perigoso do mundo?", pausa:1500, resposta:"O ex-presso. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que o porco está sempre feliz?", pausa:1500, resposta:"Porque está de bacon a vida! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Qual é o cúmulo da solidão?", pausa:1500, resposta:"  Morar sozinho e fugir de casa.  (essa foi boa em)" },
{ pergunta:"Ei {{Nome}},  Por que o jardineiro nunca briga com a planta?", pausa:1500, resposta:"Porque ele sempre a rega! (essa foi boa demais)" },

{ pergunta:"Ô {{Nome}}, Você conhece a piada do pônei?", pausa:1500, resposta:"Não! -Pô, nei eu! (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Quais são as escadas que demoram mais a subir?", pausa:1500, resposta:"São as escadas em caracol. (essa foi boa em)" },
{ pergunta:"Ei {{Nome}},  Doutor, o que é que eu tenho afinal?", pausa:1500, resposta:"Você tem um mais dois em inglês. Como assim? Um two more. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Num café, pergunta o empregado, Deseja beber alguma coisa? ", pausa:1500, resposta:"Quais são as opções?  Sim e não. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Professora para o Artur:  qual é o tempo verbal da frase Isto não podia ter acontecido?", pausa:1500, resposta:"Preservativo imperfeito, professora! (essa foi muito boa em)" },
{ pergunta:"Ei {{Nome}},  Porque é que a morcega é tão feia?", pausa:1500, resposta:"Porque o mor-é-cego. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Qual é o cúmulo do absurdo?", pausa:1500, resposta:"Abrir a janela do avião para sair a fumaça. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que a matemática é sempre tão confiante?", pausa:1500, resposta:"Porque ela tem muitos problemas resolvidos. (essa foi muito boa em)" },
{ pergunta:"Ei {{Nome}},  Como o oceanógrafo se despede?", pausa:1500, resposta:"Vou nessa onda. (essa foi boa)" },

{ pergunta:"Ô {{Nome}},  Por que a biblioteca é sempre tão calma?", pausa:1500, resposta:"Porque ela tem muitos livros de autoajuda.(essa foi boa!)" },
{ pergunta:"Viu {{Nome}},  O que o peixe disse para o outro?", pausa:1500, resposta:"Peixe fora d'água. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}},   O que o pato disse para o cachorro? ", pausa:1500, resposta:"Nada. (essa foi boa)" },

{ pergunta:"Ô {{Nome}},  Por que o relógio foi preso?", pausa:1500, resposta:"Porque ele matou o tempo. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}},  Como o cachorro se comunica no telefone?", pausa:1500, resposta:" Com um latido. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}},   O que o cavalo foi fazer no orelhão?", pausa:1500, resposta:"Passar um trote. (essa foi boa)" },

{ pergunta:"Ô {{Nome}},  Por que o médico sempre está de bom humor?", pausa:1500, resposta:"Porque ele tem muitas pacientes. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}},  O que o lápis disse para o papel?", pausa:1500, resposta:"Estou escrevendo minha história. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}}, Por que o computador foi ao médico?", pausa:1500, resposta:"Porque ele estava com um vírus. (essa foi boa)" },

{ pergunta:"Ô {{Nome}},  Como o astronauta se veste para ir ao espaço?", pausa:1500, resposta:"De gravidade. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que o estudante não usava relógio?", pausa:1500, resposta:"Porque tinha um horário complicado. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}},  Por que o jacaré tirou o sapato", pausa:1500, resposta:"Porque ele estava com pé no lago. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, O que o caderno falou para o lápis?", pausa:1500, resposta:"Estamos sempre na mesma página. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Por que a galinha atravessou a rua?", pausa:1500, resposta:"Para chegar ao outro lado. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}},  Como o oceano se despede do sol?", pausa:1500, resposta:"Até a próxima maré. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, O que o espelho disse para o outro?", pausa:1500, resposta:"Você reflete muito bem. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Como o livro se apresenta para o leitor?", pausa:1500, resposta:"Prazer, sou uma história! (essa foi boa.)" },
{ pergunta:"Ei {{Nome}}, Por que o pato foi ao médico?", pausa:1500, resposta:"Porque ele estava com uma dor de patas. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Porque o mexicano toma calmante?", pausa:1500, resposta:"Pra tratar dos seus ataques d'hispânico. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Quando uma piada é suja e pesada?", pausa:1500, resposta:"Quando é de um elefante que caiu na lama!! (essa foi boa.)" },
{ pergunta:"Ei {{Nome}}, Quem é o pai das aves?", pausa:1500, resposta:"O PAIpagaio. (essa foi boa)" },

{ pergunta:"Ô {{Nome}}, Por que um cachorro comprou um violino?", pausa:1500, resposta:"Para participar do cãocerto. (essa foi boa!)" },
{ pergunta:"Viu {{Nome}}, Você ta sabendo? Doque?", pausa:1500, resposta:"Do seu suvaco fedendo. (essa foi boa.)" },
{ pergunta:"Ei {{Nome}}, Você sabe o que o café disse pro açúcar?", pausa:1500, resposta:"Sem você, minha vida é amarga. (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, O que a praia disse ao oceano?", pausa:1500, resposta:" Deixa de onda. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Joãozinho, se tenho 6 laranjas em uma mão e 5 laranjas na outra, o que tenho no total?", pausa:1500, resposta:"Tem umas mãos bem grandes! (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Por que o rádio não pode ter filhos?", pausa:1500, resposta:"Porque ele é estéreo. (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, O que um cromossomo falou para o outro?", pausa:1500, resposta:"Cromossomos bonitos! (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Um menino tinha um cachorro chamado Tido e ele dormia em um cesto. Um dia, o cachorrinho fugiu, qual é o nome do filme?", pausa:1500, resposta:"O Cesto sem Tido. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Professor pergunta, Joãozinho, quem descobriu a América?", pausa:1500, resposta:"Ué, professora, mas eu nem sabia que ela estava coberta! (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, O que é uma pulga pulando do lado de uma letra A?", pausa:1500, resposta:"Um A saltante (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Por que as estrelas não podem ser gatos?", pausa:1500, resposta:"Porque astro não mia. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Por que coalas não são ursos de verdade?", pausa:1500, resposta:"Porque eles não têm coalaificação. (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, O que a zebra disse para a mosca?", pausa:1500, resposta:"Você está na minha listra negra. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Na aula de Ciências, a professora pergunta, Luizinho, o que acontece quando há um eclipse solar?", pausa:1500, resposta:"Todo mundo vai para rua ver. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Por que na Argentina as vacas vivem olhando para o céu?", pausa:1500, resposta:"Porque tem boi nos ares! (essa foi boa)" },

{ pergunta:"Ei {{Nome}}, Dois litros de leite atravessaram a rua e foram atropelados. Um morreu, o outro não. Por que?", pausa:1500, resposta:"Porque um deles era leite longa vida! (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, O que tem quatro patas e voa?", pausa:1500, resposta:"Um casal de passarinhos. (essa foi boa)" },
{ pergunta:"Ei {{Nome}}, Uma vaca pergunta para a outra, você não tem medo de pegar a doença da vaca louca?", pausa:1500, resposta:"Por que teria? Eu sou um helicóptero. (essa foi boa)" },


];

function textoPiadaNormalizado(item: PiadaInsanaItem) {
  return `${String(item?.pergunta || "").toLowerCase()} ${String(item?.resposta || "").toLowerCase()}`;
}

function classificarPiadaAutomaticamente(item: PiadaInsanaItem, index: number): RankingPiadaInsana {
  const t = textoPiadaNormalizado(item);

  if (
    t.includes("sua direção") ||
    t.includes("claramente não") ||
    t.includes("você dirigindo") ||
    t.includes("não tem nenhuma") ||
    t.includes("errar com consistência") ||
    t.includes("improvisar erro")
  ) {
    return "otima";
  }

  if (
    t.includes("porque") ||
    t.includes("não parece") ||
    t.includes("eu não confiaria") ||
    t.includes("vai que dessa vez") ||
    t.includes("também não lembro") ||
    t.includes("recomendo fortemente")
  ) {
    return "boa";
  }

  if (
    t.includes("pontinho") ||
    t.includes("milho") ||
    t.includes("super-mercado") ||
    t.includes("rei-polho") ||
    t.includes("pé de molécula")
  ) {
    return "pessima";
  }

  return index % 4 === 0 ? "otima" : index % 3 === 0 ? "boa" : index % 2 === 0 ? "ruim" : "pessima";
}

export const PIADAS_INSANO_EXTRA_PT: PiadaInsanaItem[] = [
  { pergunta:"Ei, quer ouvir uma rápida?", pausa:1500, resposta:"Sua seta deve ser artigo de luxo, porque você quase nunca usa.", ranking:"otima" },
  { pergunta:"Viu uma boa aqui?", pausa:1500, resposta:"Você consegue errar com uma convicção admirável.", ranking:"boa" },
  { pergunta:"Então, deixa eu te perguntar.", pausa:1700, resposta:"Você dirige ou interpreta um personagem perdido?", ranking:"otima" },
  { pergunta:"Escuta essa.", pausa:1400, resposta:"Seu senso de direção entrou de férias faz tempo.", ranking:"boa" },
  { pergunta:"Quer outra?", pausa:1400, resposta:"Você trata retorno como se fosse sugestão.", ranking:"otima" },
  { pergunta:"Pera aí.", pausa:1500, resposta:"Seu talento é transformar caminho simples em evento.", ranking:"boa" },
  { pergunta:"Olha essa.", pausa:1500, resposta:"Você não erra pouco, você erra com método.", ranking:"otima" },
  { pergunta:"Segura essa.", pausa:1500, resposta:"Se perder do seu jeito já virou modalidade.", ranking:"boa" },
  { pergunta:"Ei, mais uma.", pausa:1500, resposta:"Você entra na rua errada como quem sabe exatamente o que está fazendo.", ranking:"otima" },
  { pergunta:"Viu?", pausa:1400, resposta:"A confiança é alta, o acerto nem tanto.", ranking:"boa" },
  { pergunta:"Então me responde uma coisa.", pausa:1500, resposta:"Seu GPS interno foi desinstalado?", ranking:"boa" },
  { pergunta:"Quer uma pesada?", pausa:1500, resposta:"Você conseguiu transformar uma simples curva num debate filosófico.", ranking:"boa" },
  { pergunta:"Lá vai mais uma.", pausa:1500, resposta:"Você e a rota certa andam em relacionamentos diferentes.", ranking:"otima" },
  { pergunta:"Escuta bem.", pausa:1500, resposta:"Seu volante deve ter trauma das suas decisões.", ranking:"boa" },
  { pergunta:"Ei.", pausa:1200, resposta:"Você faz o mapa duvidar de si mesmo.", ranking:"otima" },
  { pergunta:"Viu essa?", pausa:1500, resposta:"Nem o erro estava esperando ser escolhido tão rápido.", ranking:"boa" },
  { pergunta:"Então,", pausa:1200, resposta:"Você confunde direção com improviso criativo.", ranking:"boa" },
  { pergunta:"Quer mais uma?", pausa:1400, resposta:"Seu problema não é errar. É insistir com autoestima.", ranking:"otima" },
  { pergunta:"Olha só.", pausa:1400, resposta:"Você trata placa como decoração urbana.", ranking:"otima" },
  { pergunta:"Pera.", pausa:1200, resposta:"Sua noção espacial pediu exoneração.", ranking:"boa" },
  { pergunta:"Vai outra.", pausa:1400, resposta:"Você parece estar apostando contra o próprio destino.", ranking:"boa" },
  { pergunta:"Ei, sinceramente.", pausa:1500, resposta:"Você entrou nessa rua com a segurança de quem não leu nada.", ranking:"otima" },
  { pergunta:"Então deixa eu ver se entendi.", pausa:1600, resposta:"Você viu a instrução, ignorou e ainda seguiu confiante?", ranking:"otima" },
  { pergunta:"Quer uma fraca?", pausa:1500, resposta:"Seu carro sabe o caminho. Você é que atrapalha.", ranking:"ruim" },
  { pergunta:"Lá vem,", pausa:1200, resposta:"Você dirige como quem está procurando problema e encontra.", ranking:"boa" },
  { pergunta:"Viu, essa encaixa.", pausa:1500, resposta:"Sua habilidade de errar no último segundo é impressionante.", ranking:"otima" },
  { pergunta:"Escuta essa daqui.", pausa:1500, resposta:"Você erra a saída e ainda olha ao redor como se a rua tivesse mudado de lugar.", ranking:"otima" },
  { pergunta:"Mais uma.", pausa:1200, resposta:"Seu senso de oportunidade sempre entra uma rua depois.", ranking:"boa" },
  { pergunta:"Então me diz.", pausa:1200, resposta:"Você está dirigindo ou fazendo turismo involuntário?", ranking:"boa" },
  { pergunta:"Quer saber?", pausa:1200, resposta:"Até sua dúvida pega caminho mais reto que você.", ranking:"boa" },
  { pergunta:"Ei, presta atenção.", pausa:1500, resposta:"Você transformou um trajeto curto em minissérie.", ranking:"otima" },
  { pergunta:"Viu só.", pausa:1300, resposta:"Essa manobra teve coragem, lógica não.", ranking:"boa" },
  { pergunta:"Então lá vai.", pausa:1300, resposta:"Você tem um compromisso sério com a direção errada.", ranking:"otima" },
  { pergunta:"Escuta.", pausa:1200, resposta:"Seu talento é pegar instrução simples e devolver confusão.", ranking:"otima" },
  { pergunta:"Quer mais uma ruim?", pausa:1400, resposta:"Você não perdeu a entrada. Você rejeitou ela.", ranking:"ruim" },
  { pergunta:"Olha essa aqui.", pausa:1400, resposta:"Seu carro vai, mas sua decisão fica.", ranking:"ruim" },
  { pergunta:"Ei, última por enquanto.", pausa:1600, resposta:"Você erra com tanto estilo que quase convence.", ranking:"boa" },
  { pergunta:"Viu?", pausa:1200, resposta:"Você trata o mapa como opinião e não como orientação.", ranking:"otima" },
  { pergunta:"Então, sinceramente.", pausa:1500, resposta:"Seu planejamento dura até a primeira esquina.", ranking:"boa" },
  { pergunta:"Quer fechar com essa?", pausa:1600, resposta:"Você conseguiu transformar o óbvio em surpresa.", ranking:"otima" }
];

export const PIADAS_INSANO_PT_COMPLETAS: PiadaInsanaItem[] = [
  ...PIADAS_INSANO.map((item, index) => ({
    ...item,
    ranking: item.ranking || classificarPiadaAutomaticamente(item, index)
  })),
  ...PIADAS_INSANO_EXTRA_PT
];
