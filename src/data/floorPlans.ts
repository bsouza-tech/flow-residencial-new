import { optimizedFullSrc, optimizedImages, type OptimizedImageName } from './optimizedImages';

export interface FloorPlan {
  id: string;
  name: string;
  imageName: OptimizedImageName;
  image: string;
  imageWidth: number;
  imageHeight: number;
  area: string | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
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
    id: 'estudio',
    name: 'Estúdio',
    imageName: 'estudio',
    area: '24,52 m²',
    bedrooms: 1,
    suites: null,
    bathrooms: 1,
    parkingSpots: null,
    description: null,
  }),
  plan({
    id: 'double-suite',
    name: 'Double Suite',
    imageName: 'double-suite',
    area: '46,00 m²',
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpots: null,
    description: null,
  }),
  plan({
    id: 'cobertura-double-suite',
    name: 'Cobertura Double Suite',
    imageName: 'cobertura-double-suite',
    area: '91,79 m²',
    bedrooms: 2,
    suites: 2,
    bathrooms: 2,
    parkingSpots: null,
    description: null,
  }),
  plan({
    id: 'dois-quartos-pcd',
    name: 'Dois Quartos (PCD)',
    imageName: 'dois-quartos-pcd',
    area: '45,19 m²',
    bedrooms: 2,
    suites: null,
    bathrooms: 1,
    parkingSpots: null,
    description: null,
  }),
];
