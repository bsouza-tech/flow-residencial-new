export type PoiIcon =
  | 'home'
  | 'club'
  | 'pharmacy'
  | 'bakery'
  | 'park'
  | 'bus'
  | 'gym'
  | 'hospital'
  | 'school'
  | 'landmark'
  | 'shopping'
  | 'calendar'
  | 'cafe';

export interface NearbyPlace {
  id: string;
  name: string;
  distance: string;
  icon: PoiIcon;
  lat: number;
  lng: number;
}

/**
 * Coordenada A CONFIRMAR.
 * Nominatim (OpenStreetMap), consulta em 16/10/2026 pelo endereço completo.
 * O resultado é o centro da via (way 524971078), não o número 165.
 * CEP devolvido pelo OSM: 25961-110. CEP do empreendimento: 25961-355.
 */
export const projectLocation = {
  id: 'flow',
  name: 'Flow Residencial',
  lat: -22.433223,
  lng: -42.9759936,
  addressLines: ['Rua João Batista Vaz, 165', 'N. S. de Fátima, Teresópolis — RJ', 'CEP 25961-355'],
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Rua%20Jo%C3%A3o%20Batista%20Vaz%2C%20165%20-%20N.%20S.%20de%20F%C3%A1tima%2C%20Teres%C3%B3polis%20-%20RJ%2C%2025961-355',
};

/**
 * Coordenadas: Nominatim em 19/10/2026.
 * Distâncias são as publicadas no site do Flow; a distância em linha reta
 * a partir de Rua João Batista Vaz, 165 confere com esses valores.
 */
export const nearbyPlaces: NearbyPlace[] = [
  {
    id: 'unifeso',
    name: 'Centro Universitário Serra dos Órgãos',
    distance: '350 m',
    icon: 'school',
    lat: -22.4341169,
    lng: -42.9792498,
  },
  {
    id: 'alberto-torres',
    name: 'Av. Alberto Torres',
    distance: '860 m',
    icon: 'landmark',
    lat: -22.4264508,
    lng: -42.9801246,
  },
  {
    id: 'colegio-sao-paulo',
    name: 'Colégio São Paulo',
    distance: '960 m',
    icon: 'school',
    lat: -22.4400353,
    lng: -42.9817843,
  },
  {
    id: 'comary',
    name: 'Comary Shopping',
    distance: '1 km',
    icon: 'shopping',
    lat: -22.4419261,
    lng: -42.9788334,
  },
  {
    id: 'feirinha-do-alto',
    name: 'Feirinha do Alto',
    distance: '1,1 km',
    icon: 'calendar',
    lat: -22.4426429,
    lng: -42.9798993,
  },
  {
    id: 'botania',
    name: 'Botania Restaurante',
    distance: '1,2 km',
    icon: 'cafe',
    lat: -22.4428684,
    lng: -42.9805993,
  },
];
