import { siteContent } from './content';

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

export const projectLocation = siteContent.location.project;

export const nearbyPlaces: NearbyPlace[] = siteContent.location.pois.map((place) => ({
  ...place,
  icon: place.icon as PoiIcon,
}));
