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

export const galleryImages: GalleryImage[] = [
  {
    id: 'cozinha',
    name: 'cozinha',
    src: optimizedFullSrc('cozinha'),
    alt: 'Cozinha e área de serviço integradas do Solar Bellavista, com armários em tom areia e lavanderia',
    category: 'interior',
    label: 'Cozinha',
  },
  {
    id: 'sala',
    name: 'sala',
    src: optimizedFullSrc('sala'),
    alt: 'Sala de estar e jantar integrada do Solar Bellavista, com painel de TV em madeira e vista ao entardecer',
    category: 'interior',
    label: 'Sala',
  },
  {
    id: 'quarto',
    name: 'quarto',
    src: optimizedFullSrc('quarto'),
    alt: 'Quarto de casal do Solar Bellavista com cabeceira estofada, guarda-roupa espelhado e iluminação aconchegante',
    category: 'interior',
    label: 'Quarto',
  },
  {
    id: 'quarto-infantil',
    name: 'quarto-infantil',
    src: optimizedFullSrc('quarto-infantil'),
    alt: 'Quarto infantil do Solar Bellavista com duas camas, guarda-roupa e vista para as montanhas',
    category: 'interior',
    label: 'Quarto infantil',
  },
  {
    id: 'varanda',
    name: 'varanda',
    src: optimizedFullSrc('varanda'),
    alt: 'Varanda do Solar Bellavista com jardim vertical, mesa de madeira e vista para a mata',
    category: 'interior',
    label: 'Varanda',
  },
];
