import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface AmenityImage {
  id: string;
  name: OptimizedImageName;
  src: string;
  alt: string;
  label: string;
  category?: 'interior' | 'amenity';
}

export interface Amenity {
  id: string;
  title: string;
  images: AmenityImage[];
}

function img(id: string, name: OptimizedImageName, label: string): AmenityImage {
  return {
    id,
    name,
    src: optimizedFullSrc(name),
    alt: label,
    label,
    category: 'amenity',
  };
}

export const amenities: Amenity[] = [
  { id: 'marketplace', title: 'Marketplace', images: [img('marketplace-1', 'marketplace', 'Marketplace')] },
  { id: 'fireplace', title: 'Fireplace', images: [img('fireplace-1', 'fireplace', 'Fireplace')] },
  { id: 'area-gourmet', title: 'Área Gourmet', images: [img('gourmet-1', 'gourmet-coberto', 'Área Gourmet')] },
  { id: 'coworking', title: 'Coworking', images: [img('coworking-1', 'coworking', 'Coworking')] },
  { id: 'academia', title: 'Academia', images: [img('academia-1', 'academia', 'Academia')] },
  { id: 'espaco-fitness', title: 'Espaço Fitness', images: [img('fitness-1', 'espaco-fitness', 'Espaço Fitness')] },
  { id: 'laundry', title: 'Laundry', images: [img('laundry-1', 'laundry', 'Laundry')] },
  { id: 'cafe', title: 'Café', images: [img('cafe-1', 'cafeteria', 'Café')] },
  { id: 'lobby', title: 'Lobby', images: [img('lobby-1', 'lobby', 'Lobby')] },
];
