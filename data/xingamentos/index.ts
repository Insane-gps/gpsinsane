import { LINHAS_COMICAS_PT_NIVEL_0, LINHAS_COMICAS_PT_NIVEL_1, type LinhaComica } from "./wrongLines_nivel01";
import { LINHAS_COMICAS_PT_NIVEL_2 } from "./wrongLines_nivel2";
import { LINHAS_COMICAS_PT_NIVEL_3 } from "./wrongLines_nivel3";
import { LINHAS_COMICAS_PT_NIVEL_4 } from "./wrongLines_nivel4";

export type NivelXingamento = 0 | 1 | 2 | 3 | 4;

export const LINHAS_COMICAS_PT_POR_NIVEL: Record<NivelXingamento, LinhaComica[]> = {
  0: LINHAS_COMICAS_PT_NIVEL_0,
  1: LINHAS_COMICAS_PT_NIVEL_1,
  2: LINHAS_COMICAS_PT_NIVEL_2,
  3: LINHAS_COMICAS_PT_NIVEL_3,
  4: LINHAS_COMICAS_PT_NIVEL_4,
};

export const WRONG_LINES_PT_POR_NIVEL: Record<NivelXingamento, string[]> = {
  0: LINHAS_COMICAS_PT_NIVEL_0.map((item) => item.texto),
  1: LINHAS_COMICAS_PT_NIVEL_1.map((item) => item.texto),
  2: LINHAS_COMICAS_PT_NIVEL_2.map((item) => item.texto),
  3: LINHAS_COMICAS_PT_NIVEL_3.map((item) => item.texto),
  4: LINHAS_COMICAS_PT_NIVEL_4.map((item) => item.texto),
};

export type { LinhaComica };
