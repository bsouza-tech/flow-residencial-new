import { optimizedFullSrc, optimizedImages, type OptimizedImageName } from './optimizedImages';

export interface FloorPlan {
  id: string;
  name: string;
  imageName: OptimizedImageName;
  image: string;
  imageWidth: number;
  imageHeight: number;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number | null;
  description: string | null;
}

function plan(
  partial: Omit<FloorPlan, 'image' | 'imageWidth' | 'imageHeight'> & { imageName: OptimizedImageName },
): FloorPlan {
  const meta = optimizedImages[partial.imageName];
  return {
    ...partial,
    image: optimizedFullSrc(partial.imageName),
    imageWidth: meta.width,
    imageHeight: meta.height,
  };
}

export const floorPlans: FloorPlan[] = [
  plan({
    id: 'ponta',
    name: 'Ponta',
    imageName: 'ponta',
    area: '52,32m²',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: null,
    description: 'Planta de ponta com boa distribuição e varandas, pensada para o dia a dia da família.',
  }),
  plan({
    id: 'meio',
    name: 'Meio',
    imageName: 'ponta',
    area: '50,02m²',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: null,
    description: 'Tipologia intermediária com aproveitamento inteligente dos ambientes.',
  }),
  plan({
    id: 'pcd',
    name: 'PCD',
    imageName: 'ponta-pcd',
    area: '54,60m²',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: null,
    description: 'Unidade acessível, com circulação e banheiro pensados para mais autonomia.',
  }),
  plan({
    id: 'garden',
    name: 'Garden',
    imageName: 'meio-garden',
    area: '55,96m²',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: null,
    description: 'Opção garden com área externa ampliada para viver mais perto do ar livre.',
  }),
];
