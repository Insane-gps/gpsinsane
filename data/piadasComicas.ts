import {
    PIADAS_INSANO,
    PIADAS_INSANO_EXTRA_PT,
    PIADAS_INSANO_PT_COMPLETAS,
    type PiadaInsanaItem,
    type RankingPiadaInsana,
} from "./piadasInsano";

export type RankingPiadaComica = RankingPiadaInsana;
export type PiadaComicaItem = PiadaInsanaItem;

export const PIADAS_COMICAS: PiadaComicaItem[] = PIADAS_INSANO;
export const PIADAS_COMICAS_EXTRA_PT: PiadaComicaItem[] = PIADAS_INSANO_EXTRA_PT;
export const PIADAS_COMICAS_PT_COMPLETAS: PiadaComicaItem[] = PIADAS_INSANO_PT_COMPLETAS;

// Compatibilidade legada durante a migração completa.
export type RankingPiadaInsanaCompat = RankingPiadaComica;