import { siteContent } from './content';
import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface AmenityImage {
  id: string;
  name: OptimizedImageName;
  src: string;
  imageUrl?: string;
  alt: string;
  label: string;
  category?: 'interior' | 'amenity';
}

export interface Amenity {
  id: string;
  title: string;
  images: AmenityImage[];
}

export const amenities: Amenity[] = siteContent.amenities.items.map((item) => ({
  id: item.id,
  title: item.title,
  images: [
    {
      id: `${item.id}-1`,
      name: item.imageName,
      src: item.imageUrl ?? optimizedFullSrc(item.imageName),
      imageUrl: item.imageUrl,
      alt: item.title,
      label: item.title,
      category: 'amenity' as const,
    },
  ],
}));
