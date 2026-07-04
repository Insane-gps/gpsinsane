"use client";

import { MarketplacePanel } from "@/components/MarketplacePanel";
import type { TipoOferta } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProcurarPageContent() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") as TipoOferta | null;

  return <MarketplacePanel filtroTipo={tipo} ocultarVencidas />;
}

export default function ProcurarPage() {
  return (
    <Suspense fallback={<section className="sectionPane">Carregando...</section>}>
      <ProcurarPageContent />
    </Suspense>
  );
}
