/**
 * Validação compartilhada de content.json / content.resolved.json.
 * Usada por content.ts (runtime) e pelo pré-build (fail-fast).
 */

export const WP_HOST = 'wp.flowresidencial.com.br';

/** Nome gerado pelo pré-build: wp-<12 hex>. */
export const WP_IMAGE_NAME_RE = /^wp-[a-f0-9]{12}$/;

/** Hero background reescrito: /img/wp-<12 hex>. */
export const WP_BACKGROUND_BASE_RE = /^\/img\/wp-[a-f0-9]{12}$/;

export function optionalHttpsUrl(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!/^https:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

export function normalizeImagesBaseUrl(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (!/^https:\/\//i.test(trimmed)) return null;
  if (!trimmed.endsWith('/')) return null;
  return trimmed;
}

export function isWpImageUrl(value) {
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

/**
 * Aceita: nome no registry, wp-<hash> do pré-build, ou URL WP (pré-rewrite).
 * @param {unknown} value
 * @param {Set<string>} knownNames
 */
export function isImageName(value, knownNames) {
  if (typeof value !== 'string') return false;
  if (knownNames.has(value)) return true;
  if (WP_IMAGE_NAME_RE.test(value)) return true;
  return isWpImageUrl(value);
}

/**
 * @param {unknown} value
 * @param {Set<string>} knownNames
 */
export function isBackgroundImageBase(value, knownNames) {
  if (typeof value !== 'string') return false;
  if (isWpImageUrl(value)) return true;
  if (WP_BACKGROUND_BASE_RE.test(value)) return true;
  if (value.startsWith('/img/')) return true;
  return isImageName(value, knownNames);
}

function isString(value) {
  return typeof value === 'string';
}

function isNumberOrNull(value) {
  return value === null || typeof value === 'number';
}

function isLink(value) {
  if (!value || typeof value !== 'object') return false;
  return isString(value.label) && isString(value.href);
}

function fail(field, value, reason) {
  return { ok: false, field, value, reason };
}

/**
 * Mesma validação estrutural de content.ts, com campo/valor no erro.
 * @param {unknown} raw
 * @param {Set<string>} knownNames
 * @returns {{ ok: true, content: object } | { ok: false, field: string, value: unknown, reason: string }}
 */
export function validateSiteContent(raw, knownNames) {
  if (!raw || typeof raw !== 'object') {
    return fail('(root)', raw, 'conteúdo não é objeto');
  }
  const root = raw;

  const imagesRaw = root.images;
  const baseUrl = normalizeImagesBaseUrl(imagesRaw?.baseUrl);
  if (baseUrl === null) {
    return fail('images.baseUrl', imagesRaw?.baseUrl, 'baseUrl inválida');
  }

  const hero = root.hero;
  const benefits = root.benefits;
  const floorPlans = root.floorPlans;
  const gallery = root.gallery;
  const amenities = root.amenities;
  const location = root.location;
  const about = root.about;
  const certifications = root.certifications;
  const footer = root.footer;

  if (!hero || !benefits || !floorPlans || !gallery || !amenities || !location || !about || !certifications || !footer) {
    return fail('(sections)', null, 'seção obrigatória ausente');
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
    !isString(hero.scrollLabel)
  ) {
    return fail('hero', hero, 'campos de texto/cta inválidos');
  }
  if (!isBackgroundImageBase(hero.backgroundImageBase, knownNames)) {
    return fail('hero.backgroundImageBase', hero.backgroundImageBase, 'imagem de fundo inválida');
  }

  if (
    !isString(benefits.eyebrow) ||
    !isString(benefits.headingHtml) ||
    !isString(benefits.lead) ||
    !isString(benefits.badge) ||
    !Array.isArray(benefits.items)
  ) {
    return fail('benefits', benefits, 'campos de texto/items inválidos');
  }
  if (!isImageName(benefits.imageName, knownNames)) {
    return fail('benefits.imageName', benefits.imageName, 'nome de imagem inválido');
  }

  const benefitItems = [];
  for (let i = 0; i < benefits.items.length; i++) {
    const item = benefits.items[i];
    if (!item || typeof item !== 'object') return fail(`benefits.items[${i}]`, item, 'item inválido');
    if (!isString(item.id) || !isString(item.title)) {
      return fail(`benefits.items[${i}]`, item, 'id/title inválidos');
    }
    if (!(item.description === null || isString(item.description))) {
      return fail(`benefits.items[${i}].description`, item.description, 'description inválida');
    }
    benefitItems.push({ id: item.id, title: item.title, description: item.description });
  }

  if (
    !isString(floorPlans.eyebrow) ||
    !isString(floorPlans.heading) ||
    !isString(floorPlans.lead) ||
    !Array.isArray(floorPlans.items)
  ) {
    return fail('floorPlans', floorPlans, 'campos inválidos');
  }

  const floorItems = [];
  for (let i = 0; i < floorPlans.items.length; i++) {
    const item = floorPlans.items[i];
    if (!item || typeof item !== 'object') return fail(`floorPlans.items[${i}]`, item, 'item inválido');
    if (!isString(item.id) || !isString(item.name)) {
      return fail(`floorPlans.items[${i}]`, item, 'id/name inválidos');
    }
    if (!isImageName(item.imageName, knownNames)) {
      return fail(`floorPlans.items[${i}].imageName`, item.imageName, 'nome de imagem inválido');
    }
    if (!(item.area === null || isString(item.area))) {
      return fail(`floorPlans.items[${i}].area`, item.area, 'area inválida');
    }
    if (
      !isNumberOrNull(item.bedrooms) ||
      !isNumberOrNull(item.suites) ||
      !isNumberOrNull(item.bathrooms) ||
      !isNumberOrNull(item.parkingSpots)
    ) {
      return fail(`floorPlans.items[${i}]`, item, 'números inválidos');
    }
    if (!(item.description === null || isString(item.description))) {
      return fail(`floorPlans.items[${i}].description`, item.description, 'description inválida');
    }
    floorItems.push({
      id: item.id,
      name: item.name,
      imageName: item.imageName,
      imageUrl: optionalHttpsUrl(item.imageUrl),
      area: item.area,
      bedrooms: item.bedrooms,
      suites: item.suites,
      bathrooms: item.bathrooms,
      parkingSpots: item.parkingSpots,
      description: item.description,
    });
  }

  if (
    !isString(gallery.eyebrow) ||
    !isString(gallery.heading) ||
    !isString(gallery.lead) ||
    !Array.isArray(gallery.items)
  ) {
    return fail('gallery', gallery, 'campos inválidos');
  }

  const galleryItems = [];
  for (let i = 0; i < gallery.items.length; i++) {
    const item = gallery.items[i];
    if (!item || typeof item !== 'object') return fail(`gallery.items[${i}]`, item, 'item inválido');
    if (!isString(item.id) || !isString(item.label)) {
      return fail(`gallery.items[${i}]`, item, 'id/label inválidos');
    }
    if (!isImageName(item.name, knownNames)) {
      return fail(`gallery.items[${i}].name`, item.name, 'nome de imagem inválido');
    }
    if (item.category !== 'interior' && item.category !== 'amenity') {
      return fail(`gallery.items[${i}].category`, item.category, 'category inválida');
    }
    galleryItems.push({
      id: item.id,
      name: item.name,
      label: item.label,
      category: item.category,
      imageUrl: optionalHttpsUrl(item.imageUrl),
    });
  }

  if (
    !isString(amenities.eyebrow) ||
    !isString(amenities.heading) ||
    !isString(amenities.sectionId) ||
    !Array.isArray(amenities.items)
  ) {
    return fail('amenities', amenities, 'campos inválidos');
  }

  const amenityItems = [];
  for (let i = 0; i < amenities.items.length; i++) {
    const item = amenities.items[i];
    if (!item || typeof item !== 'object') return fail(`amenities.items[${i}]`, item, 'item inválido');
    if (!isString(item.id) || !isString(item.title)) {
      return fail(`amenities.items[${i}]`, item, 'id/title inválidos');
    }
    if (!isImageName(item.imageName, knownNames)) {
      return fail(`amenities.items[${i}].imageName`, item.imageName, 'nome de imagem inválido');
    }
    amenityItems.push({
      id: item.id,
      title: item.title,
      imageName: item.imageName,
      imageUrl: optionalHttpsUrl(item.imageUrl),
    });
  }

  const project = location.project;
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
    return fail('location', location, 'campos inválidos');
  }

  const pois = [];
  for (let i = 0; i < location.pois.length; i++) {
    const item = location.pois[i];
    if (!item || typeof item !== 'object') return fail(`location.pois[${i}]`, item, 'item inválido');
    if (
      !isString(item.id) ||
      !isString(item.name) ||
      !isString(item.distance) ||
      !isString(item.icon) ||
      typeof item.lat !== 'number' ||
      typeof item.lng !== 'number'
    ) {
      return fail(`location.pois[${i}]`, item, 'campos inválidos');
    }
    pois.push({
      id: item.id,
      name: item.name,
      distance: item.distance,
      icon: item.icon,
      lat: item.lat,
      lng: item.lng,
    });
  }

  if (
    !isString(about.heading) ||
    !isString(about.lead) ||
    !isString(about.cardTitle) ||
    !isString(about.cardText) ||
    !isString(about.videoId) ||
    !Array.isArray(about.stats)
  ) {
    return fail('about', about, 'campos inválidos');
  }
  if (!isImageName(about.thumbImageName, knownNames)) {
    return fail('about.thumbImageName', about.thumbImageName, 'nome de imagem inválido');
  }

  const stats = [];
  for (let i = 0; i < about.stats.length; i++) {
    const item = about.stats[i];
    if (!item || typeof item !== 'object') return fail(`about.stats[${i}]`, item, 'item inválido');
    if (typeof item.value !== 'number' || !isString(item.suffix) || !isString(item.label)) {
      return fail(`about.stats[${i}]`, item, 'campos inválidos');
    }
    stats.push({ value: item.value, suffix: item.suffix, label: item.label });
  }

  if (
    !isString(certifications.eyebrow) ||
    !isString(certifications.heading) ||
    !isString(certifications.lead) ||
    !Array.isArray(certifications.items)
  ) {
    return fail('certifications', certifications, 'campos inválidos');
  }

  const certItems = [];
  for (let i = 0; i < certifications.items.length; i++) {
    const item = certifications.items[i];
    if (!item || typeof item !== 'object') return fail(`certifications.items[${i}]`, item, 'item inválido');
    if (!isString(item.id) || !isString(item.name) || !isString(item.description) || !isString(item.alt)) {
      return fail(`certifications.items[${i}]`, item, 'campos inválidos');
    }
    if (!isImageName(item.imageName, knownNames)) {
      return fail(`certifications.items[${i}].imageName`, item.imageName, 'nome de imagem inválido');
    }
    certItems.push({
      id: item.id,
      name: item.name,
      description: item.description,
      imageName: item.imageName,
      alt: item.alt,
      imageUrl: optionalHttpsUrl(item.imageUrl),
    });
  }

  const contact = footer.contact;
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
    !isString(footer.partnersImage)
  ) {
    return fail('footer', footer, 'campos inválidos');
  }
  if (!isImageName(footer.logoImageName, knownNames)) {
    return fail('footer.logoImageName', footer.logoImageName, 'nome de imagem inválido');
  }

  return {
    ok: true,
    content: {
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
          addressLines: project.addressLines,
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
        nav: footer.nav,
        contact: {
          address: contact.address,
          phone: contact.phone,
          phoneHref: contact.phoneHref,
          email: contact.email,
        },
        social: footer.social,
        privacyUrl: footer.privacyUrl,
        legal: footer.legal,
        partnersImage: footer.partnersImage,
        logoImageName: footer.logoImageName,
        logoImageUrl: optionalHttpsUrl(footer.logoImageUrl),
      },
    },
  };
}

/**
 * Carrega nomes estáticos de optimizedImages.ts + wpGeneratedImages.json.
 * @param {string} rootDir
 * @param {{ readFileSync: Function, existsSync: Function, join: Function }} fsPath
 */
export function loadKnownImageNames(rootDir, { readFileSync, existsSync, join }) {
  const names = new Set();
  const tsPath = join(rootDir, 'src/data/optimizedImages.ts');
  if (existsSync(tsPath)) {
    const src = readFileSync(tsPath, 'utf8');
    const start = src.indexOf('const staticOptimizedImages = {');
    const end = src.indexOf('} as const satisfies');
    if (start === -1 || end === -1) {
      throw new Error('[content] não foi possível ler staticOptimizedImages em optimizedImages.ts');
    }
    const block = src.slice(start, end);
    for (const m of block.matchAll(/^\s+"([a-z0-9-]+)":\s*\{/gm)) {
      names.add(m[1]);
    }
  }
  const metaPath = join(rootDir, 'src/data/wpGeneratedImages.json');
  if (existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    for (const key of Object.keys(meta.images || {})) names.add(key);
  }
  return names;
}
