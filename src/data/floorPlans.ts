import { siteContent } from './content';
import { optimizedFullSrc, optimizedImages, type OptimizedImageName } from './optimizedImages';

export interface FloorPlan {
  id: string;
  name: string;
  imageName: OptimizedImageName;
  imageUrl?: string;
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

export const floorPlans: FloorPlan[] = siteContent.floorPlans.items.map((partial) => {
  const meta = optimizedImages[partial.imageName];
  return {
    ...partial,
    image: partial.imageUrl ?? optimizedFullSrc(partial.imageName),
    imageWidth: meta.width,
    imageHeight: meta.height,
  };
});
