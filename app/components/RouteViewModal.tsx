import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// grab window dims once
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

function esc(str:string){
  return str.replace(/</g, "\\u003c");
}

function toRad(value:number){
  return (value * Math.PI) / 180;
}

function distanceMeters(lat1:number, lng1:number, lat2:number, lng2:number){
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatClock(date:Date){
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function parseDeparture(dataSaida?:string, horarioSaida?:string){
  const rawHora = String(horarioSaida || '').trim();
  const matchHora = rawHora.match(/^(\d{1,2}):(\d{2})$/);
  const rawData = String(dataSaida || '').trim();
  const matchDataBr = rawData.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const matchDataIso = rawData.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if(matchDataBr){
    day = Math.max(1, Math.min(31, Number(matchDataBr[1])));
    month = Math.max(1, Math.min(12, Number(matchDataBr[2]))) - 1;
    year = Number(matchDataBr[3]);
  } else if(matchDataIso){
    year = Number(matchDataIso[1]);
    month = Math.max(1, Math.min(12, Number(matchDataIso[2]))) - 1;
    day = Math.max(1, Math.min(31, Number(matchDataIso[3])));
  }

  const hours = matchHora ? Math.max(0, Math.min(23, Number(matchHora[1]))) : now.getHours();
  const minutes = matchHora ? Math.max(0, Math.min(59, Number(matchHora[2]))) : now.getMinutes();

  return new Date(year, month, day, hours, minutes, 0, 0);
}

function formatDatePt(date:Date){
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());
  return `${d}/${m}/${y}`;
}

type Props = {
  visivel: boolean;
  fechar: () => void;
  origem: any;
  destino: any;
  paradas?: any[];
  dataSaida?: string;
  horarioSaida?: string;
  rota: any[];
};

export default function RouteViewModal({
  visivel,
  fechar,
  origem,
  destino,
  paradas = [],
  dataSaida,
  horarioSaida,
  rota
}: Props) {
  const insets = useSafeAreaInsets();
  const etaParadas = useMemo(() => {
    if(!Array.isArray(rota) || rota.length < 2){
      return [] as Array<{ label:string; eta:string; distKm:number }>;
    }

    const velocidadeMediaKmh = 58;
    const velocidadeMs = (velocidadeMediaKmh * 1000) / 3600;

    const cumulativa:number[] = [0];
    for(let i = 1; i < rota.length; i++){
      const prev = rota[i - 1];
      const curr = rota[i];
      const trecho = distanceMeters(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
      cumulativa.push(cumulativa[i - 1] + trecho);
    }

    const marcadores:any[] = [
      ...(Array.isArray(paradas)
        ? paradas.map((p:any, idx:number) => ({
            label: `Parada ${idx + 1}${p?.endereco ? ` - ${p.endereco}` : ''}`,
            lat: Number(p?.lat),
            lng: Number(p?.lng)
          }))
        : []),
      {
        label: `Destino${destino?.endereco ? ` - ${destino.endereco}` : ''}`,
        lat: Number(destino?.lat),
        lng: Number(destino?.lng)
      }
    ].filter((item:any) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

    const partida = parseDeparture(dataSaida, horarioSaida);

    return marcadores.map((m:any) => {
      let idxMaisPerto = 0;
      let menor = Number.POSITIVE_INFINITY;

      for(let i = 0; i < rota.length; i++){
        const p = rota[i];
        const d = distanceMeters(m.lat, m.lng, p.latitude, p.longitude);
        if(d < menor){
          menor = d;
          idxMaisPerto = i;
        }
      }

      const distAtePonto = cumulativa[idxMaisPerto] || 0;
      const segundos = velocidadeMs > 0 ? distAtePonto / velocidadeMs : 0;
      const eta = new Date(partida.getTime() + (segundos * 1000));

      return {
        label: m.label,
        eta: formatClock(eta),
        distKm: distAtePonto / 1000
      };
    });
  }, [rota, paradas, destino, dataSaida, horarioSaida]);

  const saidaBase = useMemo(() => {
    const partida = parseDeparture(dataSaida, horarioSaida);
    return `${formatDatePt(partida)} às ${formatClock(partida)}`;
  }, [dataSaida, horarioSaida]);

  const androidRouteHtml = useMemo(() => {
    const payload = esc(JSON.stringify({ origem, destino, paradas, rota }));
    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#020617;}</style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const payload = ${payload};
      const map = L.map('map', { zoomControl:true }).setView([payload.origem.lat, payload.origem.lng], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains:'abcd',
        maxZoom:20,
        attribution:'&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);

      const layers = L.layerGroup().addTo(map);
      L.circleMarker([payload.origem.lat, payload.origem.lng], { radius:8, color:'#16a34a', fillColor:'#16a34a', fillOpacity:1, weight:2 }).addTo(layers);
      L.circleMarker([payload.destino.lat, payload.destino.lng], { radius:8, color:'#2563eb', fillColor:'#2563eb', fillOpacity:1, weight:2 }).addTo(layers);

      if(Array.isArray(payload.paradas)){
        payload.paradas.forEach((p, idx) => {
          L.circleMarker([p.lat, p.lng], { radius:7, color:'#f59e0b', fillColor:'#f59e0b', fillOpacity:0.95, weight:2 }).bindPopup('Parada ' + (idx + 1)).addTo(layers);
        });
      }

      if(Array.isArray(payload.rota) && payload.rota.length > 1){
        const points = payload.rota.map((p) => [p.latitude, p.longitude]);
        const line = L.polyline(points, { color:'#007AFF', weight:6 }).addTo(layers);
        map.fitBounds(line.getBounds(), { padding:[40,40] });
      }
    </script>
  </body>
</html>`;
  }, [origem, destino, paradas, rota]);

console.log("RouteViewModal RENDERIZANDO com props:", {
  visivel, 
  origemLat: origem?.lat, 
  origemLng: origem?.lng,
  destinoLat: destino?.lat, 
  destinoLng: destino?.lng,
  rotaLen: rota?.length
});

if (!visivel) {
  console.log("RouteViewModal: visivel é false, retornando null");
  return null;
}

if (!origem) {
  console.log("RouteViewModal: origem é undefined, retornando null");
  return null;
}

if (!destino) {
  console.log("RouteViewModal: destino é undefined, retornando null");
  return null;
}

if (!rota || rota.length === 0) {
  console.log("RouteViewModal: rota vazia ou undefined, retornando null");
  return null;
}

  return (
    <View
      style={styles.overlay}
    >
      <WebView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: windowWidth,
          height: windowHeight,
        }}
        originWhitelist={["*"]}
        source={{ html: androidRouteHtml }}
        javaScriptEnabled
        domStorageEnabled
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 12,
          top: Math.max(insets.top + 12, 18),
          backgroundColor: 'rgba(15,23,42,0.72)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#e2e8f0', fontSize: 10, fontWeight: '600' }}>
          Mapa © OpenStreetMap
        </Text>
      </View>

      {/* BOTTOM SHEET COM INFO E BOTÕES */}
      <View
        style={[
          styles.bottomSheet,
          { paddingBottom: Math.max(insets.bottom + 18, Platform.OS === 'android' ? 70 : 40) }
        ]}
      >
        <View
          style={{
            height: 4,
            width: 40,
            backgroundColor: '#444',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 15
          }}
        />

        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
            textAlign: 'center'
          }}
        >
          Rota para aceitar a oferta
        </Text>

        <View style={{
          backgroundColor:'#0f172a',
          borderWidth:1,
          borderColor:'#1e293b',
          borderRadius:12,
          padding:12,
          marginBottom:12
        }}>
          <Text style={{ color:'#93c5fd', fontWeight:'700', marginBottom:6 }}>
            Saída base: {saidaBase}
          </Text>

          {etaParadas.length === 0 && (
            <Text style={{ color:'#94a3b8' }}>
              ETA indisponível para esta rota.
            </Text>
          )}

          {etaParadas.map((item, idx) => (
            <Text key={`${item.label}-${idx}`} style={{ color:'#e2e8f0', marginBottom:4 }}>
              {idx + 1}. {item.label} — ETA {item.eta} ({item.distKm.toFixed(1)} km)
            </Text>
          ))}
        </View>

        <TouchableOpacity
          onPress={fechar}
          style={{
            backgroundColor: '#16a34a',
            padding: 16,
            borderRadius: 12,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MaterialCommunityIcons name="check-circle" size={20} color="#fff" style={{marginRight: 8}} />
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 16
            }}
          >
            Entendi a rota
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={fechar}
          style={{
            borderWidth: 1,
            borderColor: '#666',
            padding: 14,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#fff" style={{marginRight: 8}} />
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 14
            }}
          >
            Fechar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 999999,
    elevation: 999999,
    justifyContent: 'flex-end'
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    zIndex: 999999,
    elevation: 30
  }
});