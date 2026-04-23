import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { getVeiculoPorId } from "../../data/veiculos";

type Coordenada = {
  latitude: number;
  longitude: number;
};

type OfertaMapa = {
  id: string;
  tipo: string;
  origem: { lat: number; lng: number };
  destino: { lat: number; lng: number };
};

type Props = {
  regiaoInicial: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  carroPos: { latitude: number; longitude: number; heading?: number | null } | null;
  ofertas: OfertaMapa[];
  ofertasVisivel: boolean;
  routeCoords: Coordenada[];
  altRouteCoords?: Coordenada[];
  veiculoId: string;
  veiculoHeadingOffset?: number;
  isPro?: boolean;
  navegando?: boolean;
  modoNoturno?: boolean;
  mapMovido?: boolean;
  flyToTarget?: { lat: number; lng: number; zoom?: number } | null;
  onMapCoordinatePress: (latitude: number, longitude: number) => void;
  onMapTouch: () => void;
  onMapPanStart: () => void;
  onOfertaPress: (ofertaId: string) => void;
};

function coordValida(p: any) {
  return (
    p &&
    Number.isFinite(Number(p.latitude)) &&
    Number.isFinite(Number(p.longitude))
  );
}

function getDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcularIndiceMaisProximoNaRota(
  pontos: Coordenada[],
  lat: number,
  lng: number
) {
  if (!Array.isArray(pontos) || pontos.length === 0) return 0;

  let menorDist = Infinity;
  let melhorIdx = 0;

  for (let i = 0; i < pontos.length; i++) {
    const p = pontos[i];
    const d = getDistanciaMetros(lat, lng, Number(p.latitude), Number(p.longitude));

    if (d < menorDist) {
      menorDist = d;
      melhorIdx = i;
    }
  }

  return melhorIdx;
}

function separarTrechosRotaPorProgresso(
  pontos: Coordenada[],
  lat: number,
  lng: number
) {
  const coords = (Array.isArray(pontos) ? pontos : []).filter(coordValida);

  if (coords.length <= 1) {
    return {
      done: [] as Coordenada[],
      ahead: coords,
    };
  }

  const idx = calcularIndiceMaisProximoNaRota(coords, lat, lng);

  const done = coords.slice(0, Math.max(2, idx + 1));
  const ahead = coords.slice(Math.max(0, idx));

  return {
    done,
    ahead: ahead.length > 1 ? ahead : coords.slice(Math.max(0, coords.length - 2)),
  };
}

export default function OsmAndroidMap({
  regiaoInicial,
  carroPos,
  ofertas,
  ofertasVisivel,
  routeCoords,
  altRouteCoords = [],
  veiculoId,
  veiculoHeadingOffset = 0,
  isPro = false,
  navegando = false,
  modoNoturno = false,
  mapMovido = false,
  flyToTarget = null,
  onMapCoordinatePress,
  onMapTouch,
  onMapPanStart,
  onOfertaPress,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [userVehicleIconUrl, setUserVehicleIconUrl] = useState("");
  const [routeCoordsDone, setRouteCoordsDone] = useState<Coordenada[]>([]);
  const [routeCoordsAhead, setRouteCoordsAhead] = useState<Coordenada[]>([]);

  useEffect(() => {
    let ativo = true;

    const veiculo = getVeiculoPorId(veiculoId);
    if (!veiculo) {
      setUserVehicleIconUrl("");
      return () => {
        ativo = false;
      };
    }

    (async () => {
      try {
        const asset = Asset.fromModule(veiculo.source);
        await asset.downloadAsync();

        const localUri = asset.localUri || asset.uri;
        const resolved = Image.resolveAssetSource(veiculo.source);
        const resolvedUri = String(resolved?.uri || "");

        if (localUri) {
          const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const uriLower = localUri.toLowerCase();
          const mime =
            uriLower.endsWith(".jpg") || uriLower.endsWith(".jpeg")
              ? "image/jpeg"
              : "image/png";
          const dataUri = `data:${mime};base64,${base64}`;

          if (ativo) {
            setUserVehicleIconUrl(dataUri);
            return;
          }
        }

        if (ativo && resolvedUri.trim()) {
          setUserVehicleIconUrl(resolvedUri);
          return;
        }

        if (ativo && typeof localUri === "string" && localUri.trim()) {
          setUserVehicleIconUrl(localUri);
          return;
        }

        if (ativo) {
          setUserVehicleIconUrl("");
        }
      } catch (e) {
        console.log("Falha ao carregar ícone do veículo no mapa:", e);
        const source = Image.resolveAssetSource(veiculo.source);
        if (ativo) {
          setUserVehicleIconUrl(String(source?.uri || ""));
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, [veiculoId]);

  const routePoints = useMemo(
    () =>
      Array.isArray(routeCoords)
        ? routeCoords.filter(
            (p) =>
              Number.isFinite(Number(p?.latitude)) &&
              Number.isFinite(Number(p?.longitude))
          )
        : [],
    [routeCoords]
  );

  const altRoutePoints = useMemo(
    () =>
      Array.isArray(altRouteCoords)
        ? altRouteCoords.filter(
            (p) =>
              Number.isFinite(Number(p?.latitude)) &&
              Number.isFinite(Number(p?.longitude))
          )
        : [],
    [altRouteCoords]
  );

  const ofertasValidas = useMemo(
    () =>
      (Array.isArray(ofertas) ? ofertas : []).map((item) => ({
        ...item,
        origemValida:
          Number.isFinite(Number(item?.origem?.lat)) &&
          Number.isFinite(Number(item?.origem?.lng)),
        destinoValida:
          Number.isFinite(Number(item?.destino?.lat)) &&
          Number.isFinite(Number(item?.destino?.lng)),
      })),
    [ofertas]
  );

  const headingAtual = useMemo(() => {
    return Number(carroPos?.heading || 0) + Number(veiculoHeadingOffset || 0);
  }, [carroPos?.heading, veiculoHeadingOffset]);

  const mapStyle = useMemo(
    () =>
      modoNoturno
        ? [
            { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
            {
              featureType: "poi",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#1f2937" }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry",
              stylers: [{ color: "#2b3442" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#374151" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#05080f" }],
            },
            {
              featureType: "administrative",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
          ]
        : [
            { elementType: "geometry", stylers: [{ color: "#eef4ea" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#41515e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#eef4ea" }] },
            {
              featureType: "poi",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative",
              elementType: "all",
              stylers: [{ visibility: "off" }],
            },
          ],
    [modoNoturno]
  );

  useEffect(() => {
    if (routePoints.length === 0) {
      setRouteCoordsDone([]);
      setRouteCoordsAhead([]);
      return;
    }

    if (!navegando || !carroPos) {
      setRouteCoordsDone([]);
      setRouteCoordsAhead(routePoints);
      return;
    }

    const { done, ahead } = separarTrechosRotaPorProgresso(
      routePoints,
      Number(carroPos.latitude),
      Number(carroPos.longitude)
    );

    setRouteCoordsDone(done);
    setRouteCoordsAhead(ahead);
  }, [routePoints, carroPos, navegando]);

  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;

    const { lat, lng, zoom = 16.8 } = flyToTarget;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: Number(lat),
          longitude: Number(lng),
        },
        zoom,
        pitch: 0,
      },
      { duration: 550 }
    );
  }, [flyToTarget]);

  useEffect(() => {
    if (!mapRef.current || !navegando || mapMovido) return;
    if (!carroPos || !Number.isFinite(carroPos.latitude) || !Number.isFinite(carroPos.longitude)) {
      return;
    }

    const heading = Number(carroPos.heading || 0) + Number(veiculoHeadingOffset || 0);
    const rad = (heading * Math.PI) / 180;
    const metersPerDegLat = 111111;
    const metersPerDegLng =
      metersPerDegLat * Math.max(0.15, Math.cos((carroPos.latitude * Math.PI) / 180));

    const lookAheadMeters = 42;
    const dLat = (Math.cos(rad) * lookAheadMeters) / metersPerDegLat;
    const dLng = (Math.sin(rad) * lookAheadMeters) / metersPerDegLng;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: Number(carroPos.latitude) + dLat,
          longitude: Number(carroPos.longitude) + dLng,
        },
        heading,
        pitch: 64,
        zoom: 19.15,
      },
      { duration: 420 }
    );
  }, [carroPos, navegando, mapMovido, veiculoHeadingOffset]);

  return (
    <View style={{ flex: 1, backgroundColor: modoNoturno ? "#1a1a2e" : "#e8e0d8" }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={regiaoInicial}
        mapType="none"
        customMapStyle={mapStyle}
        onPress={(event) => {
          onMapTouch();
          const { latitude, longitude } = event.nativeEvent.coordinate;
          onMapCoordinatePress(Number(latitude), Number(longitude));
        }}
        onPanDrag={() => {
          onMapPanStart();
        }}
      >
        <UrlTile
          urlTemplate={
            modoNoturno
              ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              : "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          }
          maximumZ={19}
          tileSize={256}
          flipY={false}
        />

        {altRoutePoints.length > 1 && (
          <Polyline
            coordinates={altRoutePoints}
            strokeColor="rgba(107,114,128,0.55)"
            strokeWidth={8}
            lineCap="round"
            lineJoin="round"
            lineDashPattern={[12, 8]}
            zIndex={14}
          />
        )}

        {(routeCoordsAhead.length > 1 || routePoints.length > 1) && (
          <>
            {routeCoordsDone.length > 1 && (
              <>
                <Polyline
                  coordinates={routeCoordsDone}
                  strokeColor="rgba(0,0,0,0.12)"
                  strokeWidth={18}
                  lineCap="round"
                  lineJoin="round"
                  zIndex={18}
                />
                <Polyline
                  coordinates={routeCoordsDone}
                  strokeColor="#d1d5db"
                  strokeWidth={12}
                  lineCap="round"
                  lineJoin="round"
                  zIndex={19}
                />
              </>
            )}

            <Polyline
              coordinates={routeCoordsAhead.length > 1 ? routeCoordsAhead : routePoints}
              strokeColor="rgba(15,23,42,0.20)"
              strokeWidth={22}
              lineCap="round"
              lineJoin="round"
              zIndex={20}
            />

            <Polyline
              coordinates={routeCoordsAhead.length > 1 ? routeCoordsAhead : routePoints}
              strokeColor="#ffffff"
              strokeWidth={15}
              lineCap="round"
              lineJoin="round"
              zIndex={21}
            />

            <Polyline
              coordinates={routeCoordsAhead.length > 1 ? routeCoordsAhead : routePoints}
              strokeColor="#1a73e8"
              strokeWidth={10}
              lineCap="round"
              lineJoin="round"
              zIndex={22}
            />
          </>
        )}

        {ofertasValidas.map((oferta) => {
          const idBase = String(oferta.id);

          return (
            <React.Fragment key={idBase}>
              {oferta.origemValida && (
                <Marker
                  coordinate={{
                    latitude: Number(oferta.origem.lat),
                    longitude: Number(oferta.origem.lng),
                  }}
                  onPress={() => onOfertaPress(idBase)}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#123b8f",
                      borderWidth: 2,
                      borderColor: "#7dd3fc",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {String(oferta.tipo || "").includes("entrega") ? "📦" : "💺"}
                    </Text>
                  </View>
                </Marker>
              )}

              {oferta.destinoValida && (
                <Marker
                  coordinate={{
                    latitude: Number(oferta.destino.lat),
                    longitude: Number(oferta.destino.lng),
                  }}
                  onPress={() => onOfertaPress(idBase)}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#14532d",
                      borderWidth: 2,
                      borderColor: "#4ade80",
                    }}
                  >
                    <Text style={{ fontSize: 17 }}>
                      {String(oferta.tipo || "").includes("entrega") ? "✅" : "🏁"}
                    </Text>
                  </View>
                </Marker>
              )}

              {ofertasVisivel && oferta.origemValida && oferta.destinoValida && (
                <Polyline
                  coordinates={[
                    {
                      latitude: Number(oferta.origem.lat),
                      longitude: Number(oferta.origem.lng),
                    },
                    {
                      latitude: Number(oferta.destino.lat),
                      longitude: Number(oferta.destino.lng),
                    },
                  ]}
                  strokeColor="#22c55e"
                  strokeWidth={4}
                />
              )}
            </React.Fragment>
          );
        })}

        {carroPos &&
          Number.isFinite(carroPos.latitude) &&
          Number.isFinite(carroPos.longitude) && (
            <Marker
              coordinate={{
                latitude: Number(carroPos.latitude),
                longitude: Number(carroPos.longitude),
              }}
              anchor={{ x: 0.5, y: 0.58 }}
              flat
              zIndex={3000}
            >
              <View
                style={{
                  width: 76,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    transform: [{ rotate: `${headingAtual}deg` }],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 58,
                      height: 58,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: "rgba(37,99,235,0.18)",
                        transform: [{ scale: 1.7 }],
                      }}
                    />

                    {userVehicleIconUrl ? (
                      <Image
                        source={{ uri: userVehicleIconUrl }}
                        style={{
                          width: 46,
                          height: 46,
                          resizeMode: "contain",
                        }}
                      />
                    ) : (
                      <Text style={{ fontSize: 24, color: "#2563eb" }}>▲</Text>
                    )}
                  </View>

                  <View
                    style={{
                      marginTop: -2,
                      width: 0,
                      height: 0,
                      borderLeftWidth: 10,
                      borderRightWidth: 10,
                      borderBottomWidth: 0,
                      borderTopWidth: 18,
                      borderLeftColor: "transparent",
                      borderRightColor: "transparent",
                      borderTopColor: "#ffffff",
                    }}
                  />
                </View>
              </View>
            </Marker>
          )}
      </MapView>
    </View>
  );
}