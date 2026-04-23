export function calcularDistancia(
  lat1:number,
  lng1:number,
  lat2:number,
  lng2:number
){

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export function distanciaFormatada(
  lat1:number,
  lng1:number,
  lat2:number,
  lng2:number
){

  const km = calcularDistancia(lat1,lng1,lat2,lng2);

  if(km < 1){
    return Math.round(km*1000)+" m";
  }

  return km.toFixed(1)+" km";
}

export function getDistanciaMetros(
  lat1:number,
  lon1:number,
  lat2:number,
  lon2:number
){

  const R = 6371000;

  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)*Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R*c;
}