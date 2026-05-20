export type TipoOferta = "entrega" | "carona_solicitada" | "carona_oferecida";

export type StatusOferta = "ativa" | "aceita" | "cancelada" | "finalizada";

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
  criadorId: string;
  criadorNome?: string;
  criadoEm: number;
  nomeOuDescricao?: string;
  quantidadePessoas?: number;
  origem?: GeoPonto;
  destino?: GeoPonto;
  valor?: number;
  status?: StatusOferta;
  dataSaida?: string;
  horarioSaida?: string;
  reservas?: ReservaOferta[];
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
