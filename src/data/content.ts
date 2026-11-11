import { setImagesBaseUrl } from './imagesBase';
import {
  optimizedFullSrc,
  optimizedImages,
  type OptimizedImageName,
} from './optimizedImages';
import {
  isWpImageUrl,
  optionalHttpsUrl,
  validateSiteContent,
} from './contentValidate.mjs';

export { isWpImageUrl, optionalHttpsUrl };

export type ContentLink = { label: string; href: string };

export type SiteContent = {
  images: {
    /** https://…/ com barra final, ou "" para /img/ local. */
    baseUrl: string;
  };
  hero: {
    eyebrow: [string, string];
    title: string;
    titleEmphasized: string;
    text: string;
    ctaPrimary: ContentLink;
    ctaSecondary: ContentLink;
    scrollLabel: string;
    backgroundImageBase: string;
  };
  benefits: {
    eyebrow: string;
    headingHtml: string;
    lead: string;
    badge: string;
    imageName: OptimizedImageName;
    imageUrl?: string;
    items: Array<{ id: string; title: string; description: string | null }>;
  };
  floorPlans: {
    eyebrow: string;
    heading: string;
    lead: string;
    items: Array<{
      id: string;
      name: string;
      imageName: OptimizedImageName;
      imageUrl?: string;
      area: string | null;
      bedrooms: number | null;
      suites: number | null;
      bathrooms: number | null;
      parkingSpots: number | null;
      description: string | null;
    }>;
  };
  gallery: {
    eyebrow: string;
    heading: string;
    lead: string;
    items: Array<{
      id: string;
      name: OptimizedImageName;
      label: string;
      category: 'interior' | 'amenity';
      imageUrl?: string;
    }>;
  };
  amenities: {
    eyebrow: string;
    heading: string;
    sectionId: string;
    items: Array<{
      id: string;
      title: string;
      imageName: OptimizedImageName;
      imageUrl?: string;
    }>;
  };
  location: {
    eyebrow: string;
    heading: string;
    lead: string;
    project: {
      id: string;
      name: string;
      lat: number;
      lng: number;
      addressLines: string[];
      mapsUrl: string;
    };
    pois: Array<{
      id: string;
      name: string;
      distance: string;
      icon: string;
      lat: number;
      lng: number;
    }>;
  };
  about: {
    heading: string;
    lead: string;
    cardTitle: string;
    cardText: string;
    stats: Array<{ value: number; suffix: string; label: string }>;
    videoId: string;
    thumbImageName: OptimizedImageName;
    thumbImageUrl?: string;
  };
  certifications: {
    eyebrow: string;
    heading: string;
    lead: string;
    items: Array<{
      id: string;
      name: string;
      description: string;
      imageName: OptimizedImageName;
      alt: string;
      imageUrl?: string;
    }>;
  };
  footer: {
    tagline: string;
    nav: ContentLink[];
    contact: {
      address: string[];
      phone: string;
      phoneHref: string;
      email: string;
    };
    social: ContentLink[];
    privacyUrl: string;
    legal: string;
    partnersImage: string;
    logoImageName: OptimizedImageName;
    logoImageUrl?: string;
  };
};

/** Registry estático + wpGeneratedImages.json (escrito pelo pré-build antes do astro build). */
const IMAGE_NAMES = new Set(Object.keys(optimizedImages));

/**
 * Valida content.json / content.resolved.json.
 * Em runtime, falha → FALLBACK_CONTENT (silencioso).
 * No pré-build, a mesma função falha o processo (exit 1) via prepare-wp-images.
 */
export function validate(raw: unknown): SiteContent | null {
  const result = validateSiteContent(raw, IMAGE_NAMES);
  if (!result.ok) return null;
  return result.content as SiteContent;
}

/** Explica falha de validação (campo + valor) — usado pelo pré-build. */
export function explainValidationFailure(
  raw: unknown,
  knownNames: Set<string> = IMAGE_NAMES,
): { field: string; value: unknown; reason: string } | null {
  const result = validateSiteContent(raw, knownNames);
  if (result.ok) return null;
  return { field: result.field, value: result.value, reason: result.reason };
}

/** Fallback idêntico ao conteúdo atual do site (sem JSON). */
export const FALLBACK_CONTENT: SiteContent = {
  images: { baseUrl: '' },
  hero: {
    eyebrow: ['Flow Residencial', 'Teresópolis'],
    title: 'Morar com praticidade nunca foi tão fácil',
    titleEmphasized: 'praticidade',
    text: 'Um empreendimento moderno, funcional e perfeito para quem busca viver com estilo e praticidade em Teresópolis.',
    ctaPrimary: { label: 'Receber condições', href: '#interesse' },
    ctaSecondary: { label: 'Ver plantas', href: '#plantas' },
    scrollLabel: 'Explorar',
    backgroundImageBase: '/img/fachada',
  },
  benefits: {
    eyebrow: 'Flow Residencial',
    headingHtml: 'Destaques que elevam sua experiência de morar',
    lead: 'No Flow, você escolhe entre quatro plantas versáteis que unem conforto, praticidade e design otimizado. Seja para morar sozinho ou para compartilhar, aqui você encontra o espaço ideal para viver com liberdade e fluidez.',
    badge: 'TERESÓPOLIS — RJ',
    imageName: 'fachada-dois',
    items: [
      {
        id: 'localizacao',
        title: 'Localização Privilegiada',
        description: 'No bairro N. S. de Fátima, em Teresópolis, com acesso fácil ao que você precisa no dia a dia.',
      },
      {
        id: 'condicoes',
        title: 'Condições Facilitadas',
        description: 'Planos pensados para o seu momento, com a equipe do Flow para apresentar as melhores condições.',
      },
      {
        id: 'tipologias',
        title: 'Tipologias Modernas',
        description: 'Quatro plantas versáteis, do studio à cobertura, com conforto e design otimizado.',
      },
      {
        id: 'lazer',
        title: 'Lazer Completo',
        description: 'Academia, fitness, gourmet, coworking, café e laundry no próprio condomínio.',
      },
    ],
  },
  floorPlans: {
    eyebrow: 'Plantas',
    heading: 'Plantas para todos os estilos de vida',
    lead: 'No Flow, você escolhe entre quatro plantas versáteis que unem conforto, praticidade e design otimizado. Seja para morar sozinho ou para compartilhar, aqui você encontra o espaço ideal para viver com liberdade e fluidez.',
    items: [
      {
        id: 'estudio',
        name: 'Estúdio',
        imageName: 'estudio',
        area: '24,52 m²',
        bedrooms: 1,
        suites: null,
        bathrooms: 1,
        parkingSpots: null,
        description: null,
      },
      {
        id: 'double-suite',
        name: 'Double Suite',
        imageName: 'double-suite',
        area: '46,00 m²',
        bedrooms: 2,
        suites: 1,
        bathrooms: 2,
        parkingSpots: null,
        description: null,
      },
      {
        id: 'cobertura-double-suite',
        name: 'Cobertura Double Suite',
        imageName: 'cobertura-double-suite',
        area: '91,79 m²',
        bedrooms: 2,
        suites: 2,
        bathrooms: 2,
        parkingSpots: null,
        description: null,
      },
      {
        id: 'dois-quartos-pcd',
        name: 'Dois Quartos (PCD)',
        imageName: 'dois-quartos-pcd',
        area: '45,19 m²',
        bedrooms: 2,
        suites: null,
        bathrooms: 1,
        parkingSpots: null,
        description: null,
      },
    ],
  },
  gallery: {
    eyebrow: 'Galeria',
    heading: 'Conheça cada ambiente do Flow',
    lead: 'Clique numa foto na faixa para ampliar e navegar entre os ambientes.',
    items: [
      { id: 'suite-loft', name: 'suite-loft', label: 'Suíte Loft', category: 'interior' },
      { id: 'cozinha-loft', name: 'cozinha-loft', label: 'Cozinha Loft', category: 'interior' },
      { id: 'fachada-letreiro', name: 'fachada-dois', label: 'Fachada Letreiro', category: 'amenity' },
      { id: 'suite-double-01', name: 'suite-double-01', label: 'Suíte Double 01', category: 'interior' },
      { id: 'lobby', name: 'lobby', label: 'Lobby', category: 'amenity' },
      { id: 'suite-double-02', name: 'suite-double-02', label: 'Suíte Double 02', category: 'interior' },
      { id: 'marketplace', name: 'marketplace', label: 'Marketplace', category: 'amenity' },
      { id: 'coworking', name: 'coworking', label: 'Coworking', category: 'amenity' },
      { id: 'varanda-loft', name: 'varanda-loft', label: 'Varanda Loft', category: 'interior' },
      { id: 'cafeteria', name: 'cafeteria', label: 'Cafeteria', category: 'amenity' },
      { id: 'sala-double', name: 'sala-double', label: 'Sala Double', category: 'interior' },
      { id: 'academia', name: 'academia', label: 'Academia', category: 'amenity' },
      { id: 'terraco-cobertura', name: 'terraco-cobertura', label: 'Terraço Cobertura', category: 'amenity' },
      { id: 'espaco-fitness', name: 'espaco-fitness', label: 'Espaço Fitness', category: 'amenity' },
      { id: 'laundry', name: 'laundry', label: 'Laundry', category: 'amenity' },
      { id: 'gourmet-coberto', name: 'gourmet-coberto', label: 'Espaço Gourmet Coberto', category: 'amenity' },
      { id: 'gourmet-descoberto', name: 'gourmet-descoberto', label: 'Espaço Gourmet Descoberto', category: 'amenity' },
      { id: 'fireplace', name: 'fireplace', label: 'Fireplace', category: 'amenity' },
    ],
  },
  amenities: {
    eyebrow: 'Lazer',
    heading: 'Seu condomínio com lazer e infraestrutura',
    sectionId: 'benfeitorias',
    items: [
      { id: 'marketplace', title: 'Marketplace', imageName: 'marketplace' },
      { id: 'fireplace', title: 'Fireplace', imageName: 'fireplace' },
      { id: 'area-gourmet', title: 'Área Gourmet', imageName: 'gourmet-coberto' },
      { id: 'coworking', title: 'Coworking', imageName: 'coworking' },
      { id: 'academia', title: 'Academia', imageName: 'academia' },
      { id: 'espaco-fitness', title: 'Espaço Fitness', imageName: 'espaco-fitness' },
      { id: 'laundry', title: 'Laundry', imageName: 'laundry' },
      { id: 'cafe', title: 'Café', imageName: 'cafeteria' },
      { id: 'lobby', title: 'Lobby', imageName: 'lobby' },
    ],
  },
  location: {
    eyebrow: 'Localização',
    heading: 'Uma localização privilegiada para uma vida prática e conectada',
    lead: 'Localizado no bairro N. S. de Fátima, em Teresópolis, o Flow oferece fácil acesso a tudo o que você precisa. Um endereço que une mobilidade, comodidade e qualidade de vida no seu dia a dia.',
    project: {
      id: 'flow',
      name: 'Flow Residencial',
      lat: -22.433223,
      lng: -42.9759936,
      addressLines: ['Rua João Batista Vaz, 165', 'N. S. de Fátima, Teresópolis — RJ', 'CEP 25961-355'],
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Rua%20Jo%C3%A3o%20Batista%20Vaz%2C%20165%20-%20N.%20S.%20de%20F%C3%A1tima%2C%20Teres%C3%B3polis%20-%20RJ%2C%2025961-355',
    },
    pois: [
      {
        id: 'unifeso',
        name: 'Centro Universitário Serra dos Órgãos',
        distance: '350 m',
        icon: 'school',
        lat: -22.4341169,
        lng: -42.9792498,
      },
      {
        id: 'alberto-torres',
        name: 'Av. Alberto Torres',
        distance: '860 m',
        icon: 'landmark',
        lat: -22.4264508,
        lng: -42.9801246,
      },
      {
        id: 'colegio-sao-paulo',
        name: 'Colégio São Paulo',
        distance: '960 m',
        icon: 'school',
        lat: -22.4400353,
        lng: -42.9817843,
      },
      {
        id: 'comary',
        name: 'Comary Shopping',
        distance: '1 km',
        icon: 'shopping',
        lat: -22.4419261,
        lng: -42.9788334,
      },
      {
        id: 'feirinha-do-alto',
        name: 'Feirinha do Alto',
        distance: '1,1 km',
        icon: 'calendar',
        lat: -22.4426429,
        lng: -42.9798993,
      },
      {
        id: 'botania',
        name: 'Botania Restaurante',
        distance: '1,2 km',
        icon: 'cafe',
        lat: -22.4428684,
        lng: -42.9805993,
      },
    ],
  },
  about: {
    heading: 'Confiança e Tradição da Construtora',
    lead: 'Mais de 16 anos unindo tradição e inovação, com milhares de famílias atendidas e lares entregues.',
    cardTitle: 'Sobre Gênesis',
    cardText:
      'A Gênesis Incorporadora é sinônimo de excelência no mercado imobiliário, com mais de uma década construindo sonhos e transformando vidas.',
    stats: [
      { value: 5000, suffix: '+', label: 'Famílias Atendidas' },
      { value: 16, suffix: '+', label: 'Anos de Experiência' },
    ],
    videoId: 'QHXUM6yo8zQ',
    thumbImageName: 'fachada-dois',
  },
  certifications: {
    eyebrow: 'Qualidade',
    heading: 'Certificações e parcerias',
    lead: 'Reconhecimentos que reforçam qualidade e confiabilidade em cada entrega.',
    items: [
      {
        id: 'nivel-a',
        name: 'Nível A',
        description: 'SiAC · PBQP-H',
        imageName: 'nivel-a',
        alt: 'Selo SiAC PBQP-H Nível A — ABS Quality Evaluations',
      },
      {
        id: 'pbqp-h',
        name: 'PBQP-H',
        description: 'Qualidade do Habitat',
        imageName: 'pbqp-h',
        alt: 'Selo PBQP-H — Programa Brasileiro da Qualidade e Produtividade do Habitat',
      },
      {
        id: 'caixa',
        name: 'Caixa',
        description: 'Parceria financeira',
        imageName: 'caixa',
        alt: 'Logo Caixa Econômica Federal',
      },
      {
        id: 'iso-9001',
        name: 'ISO 9001',
        description: 'Gestão da Qualidade',
        imageName: 'iso-9001',
        alt: 'Certificação ISO 9001 — ABS Quality Evaluations',
      },
    ],
  },
  footer: {
    tagline: 'Seu espaço, Seu ritmo, Seu futuro.',
    nav: [
      { label: 'Início', href: '#hero' },
      { label: 'Destaques', href: '#beneficios' },
      { label: 'Plantas', href: '#plantas' },
      { label: 'Galeria', href: '#galeria' },
      { label: 'Lazer', href: '#benfeitorias' },
      { label: 'Localização', href: '#localizacao' },
      { label: 'Receber condições', href: '#interesse' },
      { label: 'Sobre', href: '#sobre' },
    ],
    contact: {
      address: ['Av. Oliveira Botelho, 982 — Alto', 'Teresópolis — RJ, 25960-004'],
      phone: '(21) 2642-1203',
      phoneHref: 'tel:+552126421203',
      email: 'comercial@genesisempreendimentos.com.br',
    },
    social: [
      { label: 'Facebook', href: 'https://www.facebook.com/genesisempreendimentos' },
      { label: 'Instagram', href: 'https://www.instagram.com/genesisempreendimentos/' },
      { label: 'YouTube', href: 'https://www.youtube.com/@genesisempreendimentos_' },
    ],
    privacyUrl: 'https://genesisempreendimentos.com.br/politicas/',
    legal: 'Responsável técnico do projeto: Renata Pessôa de Rezende, CAU/RJ A33148-1.',
    partnersImage: '/img/genesis-caixa.png',
    logoImageName: 'flow-logo',
  },
};

function loadContent(): SiteContent {
  // Prefer content.resolved.json (saída do pré-build com URLs WP reescritas).
  const resolved = import.meta.glob('./content.resolved.json', { eager: true, import: 'default' });
  const modules = import.meta.glob('./content.json', { eager: true, import: 'default' });
  const raw = resolved['./content.resolved.json'] ?? modules['./content.json'];
  if (raw === undefined) return FALLBACK_CONTENT;
  return validate(raw) ?? FALLBACK_CONTENT;
}

export const siteContent: SiteContent = loadContent();
setImagesBaseUrl(siteContent.images.baseUrl);

/** Resolve src de imagem: URL https opcional, senão pipeline local por imageName. */
export function resolveImageSrc(imageName: OptimizedImageName, imageUrl?: string): string {
  return imageUrl ?? optimizedFullSrc(imageName);
}
