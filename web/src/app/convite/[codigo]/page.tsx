import { redirect } from "next/navigation";

function limparCodigoIndicacao(codigo: string) {
  return String(codigo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const resolvedParams = await params;
  const codigoLimpo = limparCodigoIndicacao(resolvedParams?.codigo || "");

  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.insanelabs.insanegps" +
    `&referrer=${encodeURIComponent(`indicador=${codigoLimpo}`)}`;

  redirect(playStoreUrl);
}