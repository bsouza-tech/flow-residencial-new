export type PoiIcon =
  | 'home'
  | 'club'
  | 'pharmacy'
  | 'bakery'
  | 'park'
  | 'bus'
  | 'gym'
  | 'hospital';

export interface NearbyPlace {
  id: string;
  name: string;
  distance: string;
  icon: PoiIcon;
  lat: number;
  lng: number;
}

/** Coordenadas aproximadas — Av. Melvin Jones, 1000, Meudon, Teresópolis */
export const projectLocation = {
  id: 'bellavista',
  name: 'Solar Bellavista',
  lat: -22.4128,
  lng: -42.9659,
  addressLines: ['Av. Melvin Jones, 1000', 'Meudon, Teresópolis — RJ', 'CEP 25954-220'],
};

export const nearbyPlaces: NearbyPlace[] = [
  {
    id: 'clube',
    name: 'Clube Bom Retiro',
    distance: '1000 m',
    icon: 'club',
    lat: -22.4088,
    lng: -42.9692,
  },
  {
    id: 'farmacia',
    name: 'Farmácia',
    distance: '700 m',
    icon: 'pharmacy',
    lat: -22.4152,
    lng: -42.9618,
  },
  {
    id: 'padaria',
    name: 'Padaria',
    distance: '750 m',
    icon: 'bakery',
    lat: -22.4105,
    lng: -42.9612,
  },
  {
    id: 'parque',
    name: 'Parque Três Picos',
    distance: '2700 m',
    icon: 'park',
    lat: -22.4045,
    lng: -42.9748,
  },
  {
    id: 'rodoviaria',
    name: 'Rodoviária',
    distance: '650 m',
    icon: 'bus',
    lat: -22.4168,
    lng: -42.9675,
  },
  {
    id: 'academia',
    name: 'Academia',
    distance: '650 m',
    icon: 'gym',
    lat: -22.4112,
    lng: -42.9705,
  },
  {
    id: 'hospital',
    name: 'Hospital',
    distance: '5600 m',
    icon: 'hospital',
    lat: -22.4225,
    lng: -42.9788,
  },
];
