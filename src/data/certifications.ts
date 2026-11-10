import { siteContent } from './content';
import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface Certification {
  id: string;
  name: string;
  description: string;
  imageName: OptimizedImageName;
  imageUrl?: string;
  src: string;
  alt: string;
}

export const certifications: Certification[] = siteContent.certifications.items.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  imageName: item.imageName,
  imageUrl: item.imageUrl,
  src: item.imageUrl ?? optimizedFullSrc(item.imageName),
  alt: item.alt,
}));
