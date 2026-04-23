import { WRONG_LINES } from "./wrongLines";

export function pickWrongLineProgressive(
  nivelAtual: number,
  contadorErros: number
) {
  const _erro = Math.max(1, Number(contadorErros || 1));
  const nivelBase = Math.max(0, Math.min(Number(nivelAtual || 0), 4)) as 0 | 1 | 2 | 3 | 4;
  const banco = WRONG_LINES[nivelBase] || WRONG_LINES[1] || WRONG_LINES[0] || [];

  if (!Array.isArray(banco) || banco.length === 0) {
    return "Recalculando rota.";
  }

  const index = Math.floor(Math.random() * banco.length);
  return String(banco[index] || "Recalculando rota.");
}