"use client";

import { MarketplacePanel } from "@/components/MarketplacePanel";
import type { TipoOferta } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OfertasPageContent() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") as TipoOferta | null;

  return <MarketplacePanel filtroTipo={tipo} />;
}

export default function OfertasPage() {
  return (
    <Suspense fallback={<section className="sectionPane">Carregando ofertas...</section>}>
      <OfertasPageContent />
    </Suspense>
  );
}
