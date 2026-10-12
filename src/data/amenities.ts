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

function img(
  id: string,
  name: OptimizedImageName,
  alt: string,
  label: string,
): AmenityImage {
  return {
    id,
    name,
    src: optimizedFullSrc(name),
    alt,
    label,
    category: 'amenity',
  };
}

export const amenities: Amenity[] = [
  {
    id: 'espacos-gourmet',
    title: 'Espaços Gourmet',
    images: [img('gourmet-1', 'area-gourmet', 'Espaço gourmet externo com churrasqueira, mesas e vista para a natureza', 'Espaços Gourmet')],
  },
  {
    id: 'area-fitness',
    title: 'Área Fitness',
    images: [img('fitness-1', 'area-fit', 'Área fitness com academia externa e espaço indoor equipado', 'Área Fitness')],
  },
  {
    id: 'quadra-esportiva',
    title: 'Quadra Esportiva',
    images: [img('quadra-1', 'quadra', 'Quadra poliesportiva cercada com vista para a piscina e o pet place', 'Quadra Esportiva')],
  },
  {
    id: 'piscina-deck',
    title: 'Piscina com Deck',
    images: [img('piscina-1', 'piscina', 'Piscina com deck, espreguiçadeiras e vista para a montanha', 'Piscina com Deck')],
  },
  {
    id: 'salao-festas',
    title: 'Salão de Festas',
    images: [img('salao-1', 'salao-de-festas', 'Salão de festas com mesas, bar e ambientação moderna', 'Salão de Festas')],
  },
  {
    id: 'playground',
    title: 'Playground',
    images: [img('play-1', 'playground', 'Playground externo com brinquedos coloridos e gramado', 'Playground')],
  },
  {
    id: 'petplace',
    title: 'Petplace',
    images: [img('pet-1', 'quadra-poliesportiva', 'Pet place com equipamentos de agility ao lado da quadra esportiva', 'Petplace')],
  },
  {
    id: 'praca-jogos',
    title: 'Praça de Jogos',
    images: [img('jogos-1', 'area-gourmet-dois', 'Praça de jogos ao ar livre com mesas e área de lazer', 'Praça de Jogos')],
  },
];
