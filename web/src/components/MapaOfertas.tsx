"use client";

import { useWebI18n } from "@/components/WebI18nProvider";
import type { Oferta, TipoOferta } from "@/lib/types";
import { mdiCubeSend, mdiSeatPassenger } from "@mdi/js";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";

type Coordenadas = [number, number];

type MapaOfertasProps = {
  ofertas: Oferta[];
  ofertaSelecionadaId: string | null;
  onSelecionarOferta: (oferta: Oferta) => void;
  centroInicial: Coordenadas;
};

type OfertaMapa = {
  oferta: Oferta;
  ponto: Coordenadas;
};

const DEFAULT_ZOOM = 12;

function coordenadasValidas(lat?: number, lng?: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function extrairPonto(oferta: Oferta): Coordenadas | null {
  const origem = oferta.origem;
  if (origem && coordenadasValidas(origem.lat, origem.lng)) {
    return [origem.lat, origem.lng];
  }

  const destino = oferta.destino;
  if (destino && coordenadasValidas(destino.lat, destino.lng)) {
    return [destino.lat, destino.lng];
  }

  return null;
}

function labelTipo(tipo: TipoOferta, t: ReturnType<typeof useWebI18n>["t"]): string {
  if (tipo === "carona_oferecida") return t.mapLegendRide;
  if (tipo === "entrega") return t.mapLegendDelivery;
  return t.mapLegendRequest;
}

function markerIcon(tipo: TipoOferta, ativo: boolean) {
  const classe = tipo === "carona_oferecida"
    ? "ride"
    : tipo === "carona_solicitada"
      ? "request"
      : "delivery";
  const path = tipo === "entrega" ? mdiCubeSend : mdiSeatPassenger;
  const fill = tipo === "entrega"
    ? (ativo ? "#ffb180" : "#ff8a3d")
    : tipo === "carona_oferecida"
      ? (ativo ? "#9affea" : "#00f0b5")
      : (ativo ? "#a8f3ff" : "#05d1ff");

  return L.divIcon({
    className: "mapMarkerIcon",
    html: `
      <span class="mapMarker ${classe} ${ativo ? "active" : ""}">
        <svg viewBox="0 0 24 24" class="mapMarkerSvg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="${fill}" opacity="0.96"></circle>
          <path d="${path}" fill="#06111c"></path>
        </svg>
      </span>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -12],
  });
}

export function MapaOfertas({ ofertas, ofertaSelecionadaId, onSelecionarOferta, centroInicial }: MapaOfertasProps) {
  const { t } = useWebI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const ofertasMapa = useMemo<OfertaMapa[]>(() => {
    return ofertas
      .map((oferta) => {
        const ponto = extrairPonto(oferta);
        return ponto ? { oferta, ponto } : null;
      })
      .filter((item): item is OfertaMapa => Boolean(item));
  }, [ofertas]);

  const ofertaAtiva = useMemo(() => {
    if (!ofertaSelecionadaId) return null;
    return ofertasMapa.find((item) => item.oferta.id === ofertaSelecionadaId) || null;
  }, [ofertaSelecionadaId, ofertasMapa]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(centroInicial, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [centroInicial]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (ofertaAtiva) {
      map.flyTo(ofertaAtiva.ponto, 14, { animate: true, duration: 0.8 });
    } else {
      map.setView(centroInicial, DEFAULT_ZOOM, { animate: true });
    }

    ofertasMapa.forEach(({ oferta, ponto }) => {
      const ativo = ofertaSelecionadaId === oferta.id;
      const marker = L.marker(ponto, {
        icon: markerIcon(oferta.tipo, ativo),
      });

      marker.on("click", () => onSelecionarOferta(oferta));
      marker.bindPopup(`
        <div class="mapPopup">
          <strong>${oferta.nomeOuDescricao || t.offerNoDescription}</strong>
          <span>${labelTipo(oferta.tipo, t)}</span>
          <span>${oferta.origem?.endereco || oferta.destino?.endereco || t.mapNoCoords}</span>
        </div>
      `);

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [centroInicial, ofertaAtiva, ofertasMapa, ofertaSelecionadaId, onSelecionarOferta, t]);

  return (
    <section className="mapShell neoPane">
      <header className="mapHeader">
        <div>
          <p className="kicker">{t.mapTitle}</p>
          <h2>{t.mapTitle}</h2>
          <p className="muted">{t.mapSubtitle}</p>
        </div>

        <div className="mapLegend">
          <span className="mapLegendItem ride">{t.mapLegendRide}</span>
          <span className="mapLegendItem request">{t.mapLegendRequest}</span>
          <span className="mapLegendItem delivery">{t.mapLegendDelivery}</span>
        </div>
      </header>

      <div className="mapFrame">
        <div ref={containerRef} className="mapCanvas" />

        <div className="mapOverlay">
          <span>{ofertaAtiva ? t.mapSelectedOffer : t.mapNoSelection}</span>
          <strong>{ofertaAtiva?.oferta.nomeOuDescricao || t.mapTitle}</strong>
          {ofertaAtiva ? (
            <small>
              {ofertaAtiva.oferta.origem?.endereco || ofertaAtiva.oferta.destino?.endereco || t.mapNoCoords}
            </small>
          ) : (
            <small>{t.mapSubtitle}</small>
          )}
        </div>
      </div>
    </section>
  );
}