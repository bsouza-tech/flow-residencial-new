import { siteContent } from './content';
import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface GalleryImage {
  id: string;
  name: OptimizedImageName;
  /** Maior WebP local — lightbox / fallback. Ou URL https se fornecida. */
  src: string;
  imageUrl?: string;
  alt: string;
  category: 'interior' | 'amenity';
  label: string;
}

export const galleryImages: GalleryImage[] = siteContent.gallery.items.map((item) => ({
  id: item.id,
  name: item.name,
  src: item.imageUrl ?? optimizedFullSrc(item.name),
  imageUrl: item.imageUrl,
  alt: item.label,
  category: item.category,
  label: item.label,
}));
