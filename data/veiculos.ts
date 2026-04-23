export type TipoVeiculo = "carro" | "moto";

export type VeiculoSkin = {
  id: string;
  tipo: TipoVeiculo;
  nome: string;
  source: number;
  headingOffset?: number;
};

export const VEICULOS_CARROS: VeiculoSkin[] = [
  {
    id: "silverado-preta",
    tipo: "carro",
    nome: "Silverado Preta",
    source: require("../assets/images/veiculos/carros/Silveradopreta.png"),
    headingOffset: 0,
  },
  {
    id: "civic",
    tipo: "carro",
    nome: "Civic",
    source: require("../assets/images/veiculos/carros/Civic.jpeg"),
    headingOffset: 0,
  },
  {
    id: "fusca",
    tipo: "carro",
    nome: "Fusca",
    source: require("../assets/images/veiculos/carros/Fusca.jpeg"),
    headingOffset: 0,
  },
  {
    id: "fusca-1",
    tipo: "carro",
    nome: "Fusca 1",
    source: require("../assets/images/veiculos/carros/Fusca1.jpeg"),
    headingOffset: 0,
  },
  {
    id: "fusca-2",
    tipo: "carro",
    nome: "Fusca 2",
    source: require("../assets/images/veiculos/carros/Fusca2.jpeg"),
    headingOffset: 0,
  },
  {
    id: "fusca-3",
    tipo: "carro",
    nome: "Fusca 3",
    source: require("../assets/images/veiculos/carros/Fusca3.jpeg"),
    headingOffset: 0,
  },
  {
    id: "neon",
    tipo: "carro",
    nome: "Neon",
    source: require("../assets/images/veiculos/carros/Neon.jpeg"),
    headingOffset: 0,
  },
  {
    id: "saveiro",
    tipo: "carro",
    nome: "Saveiro",
    source: require("../assets/images/veiculos/carros/Saveiro.jpeg"),
    headingOffset: 0,
  },
  {
    id: "saveiro-2",
    tipo: "carro",
    nome: "Saveiro 2",
    source: require("../assets/images/veiculos/carros/Saveiro2.jpeg"),
    headingOffset: 0,
  },
  {
    id: "silverado-cinza",
    tipo: "carro",
    nome: "Silverado Cinza",
    source: require("../assets/images/veiculos/carros/Silveradocinza.jpeg"),
    headingOffset: 0,
  },
  {
    id: "silverado-cinza-2",
    tipo: "carro",
    nome: "Silverado Cinza 2",
    source: require("../assets/images/veiculos/carros/Silveradocinza2.jpeg"),
    headingOffset: 0,
  },
  {
    id: "silverado-preta-2",
    tipo: "carro",
    nome: "Silverado Preta 2",
    source: require("../assets/images/veiculos/carros/Silveradopreta2.jpeg"),
    headingOffset: 0,
  },
];

export const VEICULOS_MOTOS: VeiculoSkin[] = [
  { id: "biz", tipo: "moto", nome: "Biz", source: require("../assets/images/veiculos/motos/Biz.jpeg"), headingOffset: 0 },
  { id: "biz-2", tipo: "moto", nome: "Biz 2", source: require("../assets/images/veiculos/motos/Biz2.jpeg"), headingOffset: 0 },
  { id: "hornet-1", tipo: "moto", nome: "Hornet 1", source: require("../assets/images/veiculos/motos/Hornet1.jpeg"), headingOffset: 0 },
  { id: "hornet-2", tipo: "moto", nome: "Hornet 2", source: require("../assets/images/veiculos/motos/Hornet2.jpeg"), headingOffset: 0 },
  { id: "hornet-3", tipo: "moto", nome: "Hornet 3", source: require("../assets/images/veiculos/motos/Hornet3.jpeg"), headingOffset: 0 },
  { id: "hornet-4", tipo: "moto", nome: "Hornet 4", source: require("../assets/images/veiculos/motos/Hornet4.jpeg"), headingOffset: 0 },
  { id: "hornet-5", tipo: "moto", nome: "Hornet 5", source: require("../assets/images/veiculos/motos/Hornet5.jpeg"), headingOffset: 0 },
  { id: "hornet-6", tipo: "moto", nome: "Hornet 6", source: require("../assets/images/veiculos/motos/Hornet6.jpeg"), headingOffset: 0 },
  { id: "hornet-7", tipo: "moto", nome: "Hornet 7", source: require("../assets/images/veiculos/motos/Hornet7.jpeg"), headingOffset: 0 },
  { id: "hornet-8", tipo: "moto", nome: "Hornet 8", source: require("../assets/images/veiculos/motos/Hornet8.jpeg"), headingOffset: 0 },
  { id: "hornet-9", tipo: "moto", nome: "Hornet 9", source: require("../assets/images/veiculos/motos/Hornet9.jpeg"), headingOffset: 0 },
  { id: "hornet-10", tipo: "moto", nome: "Hornet 10", source: require("../assets/images/veiculos/motos/Hornet10.jpeg"), headingOffset: 0 },
  { id: "hornet-11", tipo: "moto", nome: "Hornet 11", source: require("../assets/images/veiculos/motos/Hornet11.jpeg"), headingOffset: 0 },
  { id: "hornet-12", tipo: "moto", nome: "Hornet 12", source: require("../assets/images/veiculos/motos/Hornet12.jpeg"), headingOffset: 0 },
  { id: "hornet-14", tipo: "moto", nome: "Hornet 14", source: require("../assets/images/veiculos/motos/Hornet14.jpeg"), headingOffset: 0 },
  { id: "hornet-15", tipo: "moto", nome: "Hornet 15", source: require("../assets/images/veiculos/motos/Hornet15.jpeg"), headingOffset: 0 },
  { id: "hornet-16", tipo: "moto", nome: "Hornet 16", source: require("../assets/images/veiculos/motos/Hornet16.jpeg"), headingOffset: 0 },
  { id: "hornet-17", tipo: "moto", nome: "Hornet 17", source: require("../assets/images/veiculos/motos/Hornet17.jpeg"), headingOffset: 0 },
  { id: "hornet-18", tipo: "moto", nome: "Hornet 18", source: require("../assets/images/veiculos/motos/Hornet18.jpeg"), headingOffset: 0 },
  { id: "hornet-19", tipo: "moto", nome: "Hornet 19", source: require("../assets/images/veiculos/motos/Hornet19.jpeg"), headingOffset: 0 },
  { id: "hornet-20", tipo: "moto", nome: "Hornet 20", source: require("../assets/images/veiculos/motos/Hornet20.jpeg"), headingOffset: 0 },
  { id: "hornet-21", tipo: "moto", nome: "Hornet 21", source: require("../assets/images/veiculos/motos/Hornet21.jpeg"), headingOffset: 0 },
  { id: "hornet-22", tipo: "moto", nome: "Hornet 22", source: require("../assets/images/veiculos/motos/Hornet22.jpeg"), headingOffset: 0 },
  { id: "moto-1000-preta-c1", tipo: "moto", nome: "Moto 1000 Preta C1", source: require("../assets/images/veiculos/motos/Moto1000pretac1.jpeg"), headingOffset: 0 },
  { id: "moto-1000-preta-c11", tipo: "moto", nome: "Moto 1000 Preta C11", source: require("../assets/images/veiculos/motos/Moto1000pretac11.jpeg"), headingOffset: 0 },
  { id: "moto-1000-preta-c2", tipo: "moto", nome: "Moto 1000 Preta C2", source: require("../assets/images/veiculos/motos/Moto1000pretac2.jpeg"), headingOffset: 0 },
  { id: "moto-1000-preta-c21", tipo: "moto", nome: "Moto 1000 Preta C21", source: require("../assets/images/veiculos/motos/Moto1000pretac21.jpeg"), headingOffset: 0 },
  { id: "moto-150", tipo: "moto", nome: "Moto 150", source: require("../assets/images/veiculos/motos/Moto150.jpeg"), headingOffset: 0 },
  { id: "moto-antiga-azul", tipo: "moto", nome: "Moto Antiga Azul", source: require("../assets/images/veiculos/motos/Motoantigaazul.jpeg"), headingOffset: 0 },
  { id: "moto-azul", tipo: "moto", nome: "Moto Azul", source: require("../assets/images/veiculos/motos/Motoazul.jpeg"), headingOffset: 0 },
  { id: "moto-azul-g", tipo: "moto", nome: "Moto Azul G", source: require("../assets/images/veiculos/motos/Motoazulg.jpeg"), headingOffset: 0 },
  { id: "moto-com-2", tipo: "moto", nome: "Moto Com 2", source: require("../assets/images/veiculos/motos/Motocom2.jpeg"), headingOffset: 0 },
  { id: "motoneta", tipo: "moto", nome: "Motoneta", source: require("../assets/images/veiculos/motos/Motoneta.jpeg"), headingOffset: 0 },
  { id: "moto-race-1", tipo: "moto", nome: "Moto Race 1", source: require("../assets/images/veiculos/motos/Motorace1.jpeg"), headingOffset: 0 },
  { id: "moto-race-2", tipo: "moto", nome: "Moto Race 2", source: require("../assets/images/veiculos/motos/Motorace2.jpeg"), headingOffset: 0 },
  { id: "moto-race-3", tipo: "moto", nome: "Moto Race 3", source: require("../assets/images/veiculos/motos/Motorace3.jpeg"), headingOffset: 0 },
  { id: "moto-race-4", tipo: "moto", nome: "Moto Race 4", source: require("../assets/images/veiculos/motos/Motorace4.jpeg"), headingOffset: 0 },
  { id: "titan-150-verm", tipo: "moto", nome: "Titan 150 Verm", source: require("../assets/images/veiculos/motos/Titan150verm.jpeg"), headingOffset: 0 },
  { id: "titan-150-verm-c2", tipo: "moto", nome: "Titan 150 Verm C2", source: require("../assets/images/veiculos/motos/Titan150vermc2.jpeg"), headingOffset: 0 },
];

export function getVeiculoPadrao(tipo: TipoVeiculo): VeiculoSkin | null {
  const lista = tipo === "carro" ? VEICULOS_CARROS : VEICULOS_MOTOS;
  return lista.length > 0 ? lista[0] : null;
}

export const VEICULOS_GPS: VeiculoSkin[] = [...VEICULOS_CARROS, ...VEICULOS_MOTOS];

export function getVeiculoPorId(id: string): VeiculoSkin | null {
  const encontrado = VEICULOS_GPS.find((item) => item.id === id);
  if (encontrado) return encontrado;

  return getVeiculoPadrao("carro");
}
