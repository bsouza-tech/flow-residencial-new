import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface GalleryImage {
  id: string;
  name: OptimizedImageName;
  /** Maior WebP local — lightbox / fallback. */
  src: string;
  alt: string;
  category: 'interior' | 'amenity';
  label: string;
}

function shot(id: string, name: OptimizedImageName, label: string, category: GalleryImage['category']): GalleryImage {
  return {
    id,
    name,
    src: optimizedFullSrc(name),
    alt: label,
    category,
    label,
  };
}

export const galleryImages: GalleryImage[] = [
  shot('suite-loft', 'suite-loft', 'Suíte Loft', 'interior'),
  shot('cozinha-loft', 'cozinha-loft', 'Cozinha Loft', 'interior'),
  shot('fachada-letreiro', 'fachada-dois', 'Fachada Letreiro', 'amenity'),
  shot('suite-double-01', 'suite-double-01', 'Suíte Double 01', 'interior'),
  shot('lobby', 'lobby', 'Lobby', 'amenity'),
  shot('suite-double-02', 'suite-double-02', 'Suíte Double 02', 'interior'),
  shot('marketplace', 'marketplace', 'Marketplace', 'amenity'),
  shot('coworking', 'coworking', 'Coworking', 'amenity'),
  shot('varanda-loft', 'varanda-loft', 'Varanda Loft', 'interior'),
  shot('cafeteria', 'cafeteria', 'Cafeteria', 'amenity'),
  shot('sala-double', 'sala-double', 'Sala Double', 'interior'),
  shot('academia', 'academia', 'Academia', 'amenity'),
  shot('terraco-cobertura', 'terraco-cobertura', 'Terraço Cobertura', 'amenity'),
  shot('espaco-fitness', 'espaco-fitness', 'Espaço Fitness', 'amenity'),
  shot('laundry', 'laundry', 'Laundry', 'amenity'),
  shot('gourmet-coberto', 'gourmet-coberto', 'Espaço Gourmet Coberto', 'amenity'),
  shot('gourmet-descoberto', 'gourmet-descoberto', 'Espaço Gourmet Descoberto', 'amenity'),
  shot('fireplace', 'fireplace', 'Fireplace', 'amenity'),
];
