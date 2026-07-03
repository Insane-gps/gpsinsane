export type TipoOferta = "entrega" | "carona_solicitada" | "carona_oferecida";

export type SubtipoEntrega = "comum" | "restaurante";

export type TipoEstabelecimento =
  | "restaurante"
  | "lanchonete"
  | "pizzaria"
  | "hamburgueria"
  | "mercado"
  | "outro";

export type StatusOferta = "ativa" | "aceita" | "em_andamento" | "cancelada" | "finalizada";

export type GeoPonto = {
  lat: number;
  lng: number;
  endereco: string;
};

export type ReservaOferta = {
  usuarioId: string;
  usuarioNome: string;
  status: "pendente" | "confirmada" | "cancelada";
  criadoEm: number;
};

export type Oferta = {
  id: string;
  tipo: TipoOferta;
  subtipoEntrega?: SubtipoEntrega;

  criadorId: string;
  criadorNome?: string;
  criadoEm: number;

  nomeOuDescricao?: string;

  nomeEstabelecimento?: string;
  tipoEstabelecimento?: TipoEstabelecimento;
  nomeCliente?: string;
  telefoneCliente?: string;
  precisaBagTermica?: boolean;
  fragil?: boolean;
bagTermicaModo?: "nao_necessaria" | "necessaria" | "fornecida";
bagTermicaFornecida?: boolean;

tamanhoPedido?:
  | "pequeno"
  | "medio"
  | "grande"
  | "muito_grande";
codigoEntrega?: string;
codigoEntregaConfirmado?: boolean;
codigoEntregaConfirmadoEm?: number;

clienteFinalTemApp?: boolean;
clienteFinalUid?: string;

clienteFinalLinkToken?: string;
clienteFinalLinkCriadoEm?: number;
clienteFinalLinkEnviado?: boolean;
clienteFinalLinkEnviadoEm?: number | null;

clienteFinalAvaliouEntregador?: boolean;
clienteFinalAvaliouEstabelecimento?: boolean;
clienteFinalAvaliouEm?: number;
clienteFinalVoltariaComprar?: "sim" | "nao" | "";
entregadorNome?: string;
entregadorFoto?: string;
entregadorVeiculo?: string;
entregadorNotaMedia?: number;
aceitaPor?: string;
aceitoPor?: string;
aceitaPorNome?: string;

quantidadePessoas?: number;
  origem?: GeoPonto;
  destino?: GeoPonto;
  valor?: number;
  status?: StatusOferta;
  dataSaida?: string;
  horarioSaida?: string;
  reservas?: ReservaOferta[];

  modoPreco?: "compartilhado" | "direto";
  modoCarona?: "compartilhado" | "direto";
  tipoBagagem?: string;
  observacao?: string;
};

export type MensagemChat = {
  id: string;
  tipo: "texto";
  texto: string;
  autor: string;
  autorNome: string;
  ofertaId: string;
  criadoEm: number;
  lidoPor: string[];
  reported: boolean;
  hiddenByModeration: boolean;
  moderated: boolean;
  deletedByAdmin: boolean;
  apagada?: boolean;
  apagadoPara?: string[];
  apagadoParaMimEm?: number;
};

export type PlanoUsuario = "free" | "pro" | "premium" | "premium_free";
