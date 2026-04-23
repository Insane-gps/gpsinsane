import type { LinhaComica } from "../data/xingamentos";

function capitalizarNome(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

function normalizarComparacao(texto: string): string {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limparPlaceholderNome(texto: string): string {
  const semPlaceholder = String(texto || "")
    .replace(/\{nome\}\s*,?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!semPlaceholder) return "";

  return semPlaceholder.charAt(0).toUpperCase() + semPlaceholder.slice(1);
}

export function obterNomeFalavelUsuario(valor: any): string | null {
  const bruto = String(valor || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!bruto) return null;
  if (/^user\s*\d+/i.test(bruto)) return null;

  const somenteLetras = bruto.replace(/[^A-Za-zÀ-ÿ\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!somenteLetras) return null;

  const partes = somenteLetras.split(" ").filter((item) => item.length >= 2);
  if (!partes.length) return null;

  const nomeBase = partes.slice(0, 2).join(" ");
  if (nomeBase.length < 2) return null;

  const nomeNormalizado = normalizarComparacao(nomeBase);
  const nomesPlaceholder = new Set([
    "nome",
    "nome do",
    "nome do usuario",
    "nome do usuario",
    "usuario",
    "user",
    "seu nome",
    "your name",
    "nombre",
    "nombre del usuario",
    "nom",
    "nom utilisateur",
    "benutzername",
  ]);

  if (nomesPlaceholder.has(nomeNormalizado)) return null;

  return capitalizarNome(nomeBase);
}

export function limparTextoParaFala(valor: any, idioma: string = "pt"): string {
  let texto = String(valor || "")
    .normalize("NFC")
    .replace(/\uFFFD/g, " ")
    .replace(/[⬦•]/g, ", ")
    .replace(/\.{4,}/g, "...")
    .replace(/\s+/g, " ")
    .trim();

  if (!texto) return "";

  texto = texto
    .replace(/\b(?:a+h+|ah+|aa+h+|aah+)\b[,.!?…-]*/gi, " ")
    .replace(/\b(?:x+i+|ixi+)\b[,.!?…-]*/gi, " ")
    .replace(/\b(?:h+u+m+|h+m+)\b[,.!?…-]*/gi, idioma === "pt" ? " " : " ")
    .replace(/\b(?:uh+|oh+)\b[,.!?…-]*/gi, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([,.;!?]){2,}/g, "$1")
    .replace(/(^|\s)[,.;:!?](?=\s|$)/g, " ")
    .replace(/[,.;:!?…]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (idioma === "pt") {
    texto = texto
      // Evita pronuncia "emmi" no final de frases como "essa foi boa em".
      .replace(/\b(essa foi(?: muito)? boa)\s+em\b/gi, "$1, hein")
      .replace(/\b(essa foi(?: muito)? boa demais)\s+em\b/gi, "$1, hein")
      .replace(/\b(foi(?: muito)? boa)\s+em\b/gi, "$1, hein")
      .replace(/\s+/g, " ")
      .trim();
  }

  return texto;
}

export function materializarLinhaComica(linha: LinhaComica | string, nomeFalavel?: string | null, chanceNome: number = 0.38): string {
  if (typeof linha === "string") {
    return nomeFalavel ? linha.replace(/\{nome\}/g, nomeFalavel) : limparPlaceholderNome(linha);
  }

  if (nomeFalavel && linha.textoComNome) {
    return linha.textoComNome.replace(/\{nome\}/g, nomeFalavel);
  }

  return limparPlaceholderNome(linha.texto);
}