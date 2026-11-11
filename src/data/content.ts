import { normalizeImagesBaseUrl, setImagesBaseUrl } from './imagesBase';
import {
  optimizedFullSrc,
  optimizedImages,
  type OptimizedImageName,
} from './optimizedImages';

/** URL https opcional por item de imagem — usada só se presente e válida. */
export function optionalHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!/^https:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

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

const IMAGE_NAMES = new Set(Object.keys(optimizedImages));
const WP_HOST = 'wp.flowresidencial.com.br';

/** URL https completa do WordPress do Flow (com extensão). */
export function isWpImageUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return false;
    if (url.hostname !== WP_HOST) return false;
    const pathname = url.pathname;
    const dot = pathname.lastIndexOf('.');
    return dot > pathname.lastIndexOf('/');
  } catch {
    return false;
  }
}

function isImageName(value: unknown): value is OptimizedImageName {
  if (typeof value !== 'string') return false;
  if (IMAGE_NAMES.has(value)) return true;
  if (value.startsWith('wp-')) return true;
  return isWpImageUrl(value);
}

function isBackgroundImageBase(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (isWpImageUrl(value)) return true;
  if (value.startsWith('/img/')) return true;
  return isImageName(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isLink(value: unknown): value is ContentLink {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return isString(o.label) && isString(o.href);
}

function validate(raw: unknown): SiteContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;

  const imagesRaw = root.images as Record<string, unknown> | undefined;
  const baseUrl = normalizeImagesBaseUrl(imagesRaw?.baseUrl);
  if (baseUrl === null) return null;

  const hero = root.hero as Record<string, unknown> | undefined;
  const benefits = root.benefits as Record<string, unknown> | undefined;
  const floorPlans = root.floorPlans as Record<string, unknown> | undefined;
  const gallery = root.gallery as Record<string, unknown> | undefined;
  const amenities = root.amenities as Record<string, unknown> | undefined;
  const location = root.location as Record<string, unknown> | undefined;
  const about = root.about as Record<string, unknown> | undefined;
  const certifications = root.certifications as Record<string, unknown> | undefined;
  const footer = root.footer as Record<string, unknown> | undefined;

  if (!hero || !benefits || !floorPlans || !gallery || !amenities || !location || !about || !certifications || !footer) {
    return null;
  }

  if (
    !Array.isArray(hero.eyebrow) ||
    hero.eyebrow.length !== 2 ||
    !hero.eyebrow.every(isString) ||
    !isString(hero.title) ||
    !isString(hero.titleEmphasized) ||
    !isString(hero.text) ||
    !isLink(hero.ctaPrimary) ||
    !isLink(hero.ctaSecondary) ||
    !isString(hero.scrollLabel) ||
    !isBackgroundImageBase(hero.backgroundImageBase)
  ) {
    return null;
  }

  if (
    !isString(benefits.eyebrow) ||
    !isString(benefits.headingHtml) ||
    !isString(benefits.lead) ||
    !isString(benefits.badge) ||
    !isImageName(benefits.imageName) ||
    !Array.isArray(benefits.items)
  ) {
    return null;
  }

  const benefitItems: SiteContent['benefits']['items'] = [];
  for (const item of benefits.items) {
    if (!item || typeof item !== 'object') return null;
    const b = item as Record<string, unknown>;
    if (!isString(b.id) || !isString(b.title)) return null;
    if (!(b.description === null || isString(b.description))) return null;
    benefitItems.push({ id: b.id, title: b.title, description: b.description });
  }

  if (
    !isString(floorPlans.eyebrow) ||
    !isString(floorPlans.heading) ||
    !isString(floorPlans.lead) ||
    !Array.isArray(floorPlans.items)
  ) {
    return null;
  }

  const floorItems: SiteContent['floorPlans']['items'] = [];
  for (const item of floorPlans.items) {
    if (!item || typeof item !== 'object') return null;
    const p = item as Record<string, unknown>;
    if (!isString(p.id) || !isString(p.name) || !isImageName(p.imageName)) return null;
    if (!(p.area === null || isString(p.area))) return null;
    if (!isNumberOrNull(p.bedrooms) || !isNumberOrNull(p.suites) || !isNumberOrNull(p.bathrooms) || !isNumberOrNull(p.parkingSpots)) {
      return null;
    }
    if (!(p.description === null || isString(p.description))) return null;
    floorItems.push({
      id: p.id,
      name: p.name,
      imageName: p.imageName,
      imageUrl: optionalHttpsUrl(p.imageUrl),
      area: p.area,
      bedrooms: p.bedrooms,
      suites: p.suites,
      bathrooms: p.bathrooms,
      parkingSpots: p.parkingSpots,
      description: p.description,
    });
  }

  if (
    !isString(gallery.eyebrow) ||
    !isString(gallery.heading) ||
    !isString(gallery.lead) ||
    !Array.isArray(gallery.items)
  ) {
    return null;
  }

  const galleryItems: SiteContent['gallery']['items'] = [];
  for (const item of gallery.items) {
    if (!item || typeof item !== 'object') return null;
    const g = item as Record<string, unknown>;
    if (!isString(g.id) || !isImageName(g.name) || !isString(g.label)) return null;
    if (g.category !== 'interior' && g.category !== 'amenity') return null;
    galleryItems.push({
      id: g.id,
      name: g.name,
      label: g.label,
      category: g.category,
      imageUrl: optionalHttpsUrl(g.imageUrl),
    });
  }

  if (
    !isString(amenities.eyebrow) ||
    !isString(amenities.heading) ||
    !isString(amenities.sectionId) ||
    !Array.isArray(amenities.items)
  ) {
    return null;
  }

  const amenityItems: SiteContent['amenities']['items'] = [];
  for (const item of amenities.items) {
    if (!item || typeof item !== 'object') return null;
    const a = item as Record<string, unknown>;
    if (!isString(a.id) || !isString(a.title) || !isImageName(a.imageName)) return null;
    amenityItems.push({
      id: a.id,
      title: a.title,
      imageName: a.imageName,
      imageUrl: optionalHttpsUrl(a.imageUrl),
    });
  }

  const project = location.project as Record<string, unknown> | undefined;
  if (
    !isString(location.eyebrow) ||
    !isString(location.heading) ||
    !isString(location.lead) ||
    !project ||
    !isString(project.id) ||
    !isString(project.name) ||
    typeof project.lat !== 'number' ||
    typeof project.lng !== 'number' ||
    !Array.isArray(project.addressLines) ||
    !project.addressLines.every(isString) ||
    !isString(project.mapsUrl) ||
    !Array.isArray(location.pois)
  ) {
    return null;
  }

  const pois: SiteContent['location']['pois'] = [];
  for (const item of location.pois) {
    if (!item || typeof item !== 'object') return null;
    const p = item as Record<string, unknown>;
    if (
      !isString(p.id) ||
      !isString(p.name) ||
      !isString(p.distance) ||
      !isString(p.icon) ||
      typeof p.lat !== 'number' ||
      typeof p.lng !== 'number'
    ) {
      return null;
    }
    pois.push({
      id: p.id,
      name: p.name,
      distance: p.distance,
      icon: p.icon,
      lat: p.lat,
      lng: p.lng,
    });
  }

  if (
    !isString(about.heading) ||
    !isString(about.lead) ||
    !isString(about.cardTitle) ||
    !isString(about.cardText) ||
    !isString(about.videoId) ||
    !isImageName(about.thumbImageName) ||
    !Array.isArray(about.stats)
  ) {
    return null;
  }

  const stats: SiteContent['about']['stats'] = [];
  for (const item of about.stats) {
    if (!item || typeof item !== 'object') return null;
    const s = item as Record<string, unknown>;
    if (typeof s.value !== 'number' || !isString(s.suffix) || !isString(s.label)) return null;
    stats.push({ value: s.value, suffix: s.suffix, label: s.label });
  }

  if (
    !isString(certifications.eyebrow) ||
    !isString(certifications.heading) ||
    !isString(certifications.lead) ||
    !Array.isArray(certifications.items)
  ) {
    return null;
  }

  const certItems: SiteContent['certifications']['items'] = [];
  for (const item of certifications.items) {
    if (!item || typeof item !== 'object') return null;
    const c = item as Record<string, unknown>;
    if (!isString(c.id) || !isString(c.name) || !isString(c.description) || !isImageName(c.imageName) || !isString(c.alt)) {
      return null;
    }
    certItems.push({
      id: c.id,
      name: c.name,
      description: c.description,
      imageName: c.imageName,
      alt: c.alt,
      imageUrl: optionalHttpsUrl(c.imageUrl),
    });
  }

  const contact = footer.contact as Record<string, unknown> | undefined;
  if (
    !isString(footer.tagline) ||
    !Array.isArray(footer.nav) ||
    !footer.nav.every(isLink) ||
    !contact ||
    !Array.isArray(contact.address) ||
    !contact.address.every(isString) ||
    !isString(contact.phone) ||
    !isString(contact.phoneHref) ||
    !isString(contact.email) ||
    !Array.isArray(footer.social) ||
    !footer.social.every(isLink) ||
    !isString(footer.privacyUrl) ||
    !isString(footer.legal) ||
    !isString(footer.partnersImage) ||
    !isImageName(footer.logoImageName)
  ) {
    return null;
  }

  return {
    images: { baseUrl },
    hero: {
      eyebrow: [hero.eyebrow[0], hero.eyebrow[1]],
      title: hero.title,
      titleEmphasized: hero.titleEmphasized,
      text: hero.text,
      ctaPrimary: hero.ctaPrimary,
      ctaSecondary: hero.ctaSecondary,
      scrollLabel: hero.scrollLabel,
      backgroundImageBase: hero.backgroundImageBase,
    },
    benefits: {
      eyebrow: benefits.eyebrow,
      headingHtml: benefits.headingHtml,
      lead: benefits.lead,
      badge: benefits.badge,
      imageName: benefits.imageName,
      imageUrl: optionalHttpsUrl(benefits.imageUrl),
      items: benefitItems,
    },
    floorPlans: {
      eyebrow: floorPlans.eyebrow,
      heading: floorPlans.heading,
      lead: floorPlans.lead,
      items: floorItems,
    },
    gallery: {
      eyebrow: gallery.eyebrow,
      heading: gallery.heading,
      lead: gallery.lead,
      items: galleryItems,
    },
    amenities: {
      eyebrow: amenities.eyebrow,
      heading: amenities.heading,
      sectionId: amenities.sectionId,
      items: amenityItems,
    },
    location: {
      eyebrow: location.eyebrow,
      heading: location.heading,
      lead: location.lead,
      project: {
        id: project.id,
        name: project.name,
        lat: project.lat,
        lng: project.lng,
        addressLines: project.addressLines as string[],
        mapsUrl: project.mapsUrl,
      },
      pois,
    },
    about: {
      heading: about.heading,
      lead: about.lead,
      cardTitle: about.cardTitle,
      cardText: about.cardText,
      stats,
      videoId: about.videoId,
      thumbImageName: about.thumbImageName,
      thumbImageUrl: optionalHttpsUrl(about.thumbImageUrl),
    },
    certifications: {
      eyebrow: certifications.eyebrow,
      heading: certifications.heading,
      lead: certifications.lead,
      items: certItems,
    },
    footer: {
      tagline: footer.tagline,
      nav: footer.nav as ContentLink[],
      contact: {
        address: contact.address as string[],
        phone: contact.phone,
        phoneHref: contact.phoneHref,
        email: contact.email,
      },
      social: footer.social as ContentLink[],
      privacyUrl: footer.privacyUrl,
      legal: footer.legal,
      partnersImage: footer.partnersImage,
      logoImageName: footer.logoImageName,
      logoImageUrl: optionalHttpsUrl(footer.logoImageUrl),
    },
  };
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
