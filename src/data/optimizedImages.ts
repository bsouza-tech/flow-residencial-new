/* Gerado por scripts/optimize-images.mjs — não editar à mão.
 * imagePath/srcSet respeitam images.baseUrl (via imagesBase.ts).
 * Variantes wp-* vêm de wpGeneratedImages.json (pré-build). */
import { getImagesBaseUrl } from './imagesBase';
import wpGenerated from './wpGeneratedImages.json';

export type OptimizedImageMeta = {
  name: string;
  widths: number[];
  width: number;
  height: number;
  largest: number;
};

const staticOptimizedImages = {
  "fachada": {
    "name": "fachada",
    "widths": [
      1200,
      1680
    ],
    "width": 1920,
    "height": 1440,
    "largest": 1680
  },
  "fachada-dois": {
    "name": "fachada-dois",
    "widths": [
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "flow-logo": {
    "name": "flow-logo",
    "widths": [
      480
    ],
    "width": 1920,
    "height": 1080,
    "largest": 480
  },
  "estudio": {
    "name": "estudio",
    "widths": [
      800,
      1080
    ],
    "width": 1080,
    "height": 1080,
    "largest": 1080
  },
  "double-suite": {
    "name": "double-suite",
    "widths": [
      768
    ],
    "width": 768,
    "height": 768,
    "largest": 768
  },
  "cobertura-double-suite": {
    "name": "cobertura-double-suite",
    "widths": [
      768
    ],
    "width": 768,
    "height": 768,
    "largest": 768
  },
  "dois-quartos-pcd": {
    "name": "dois-quartos-pcd",
    "widths": [
      768
    ],
    "width": 768,
    "height": 768,
    "largest": 768
  },
  "suite-loft": {
    "name": "suite-loft",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "cozinha-loft": {
    "name": "cozinha-loft",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "suite-double-01": {
    "name": "suite-double-01",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "lobby": {
    "name": "lobby",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "suite-double-02": {
    "name": "suite-double-02",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "marketplace": {
    "name": "marketplace",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "coworking": {
    "name": "coworking",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "varanda-loft": {
    "name": "varanda-loft",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "cafeteria": {
    "name": "cafeteria",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "sala-double": {
    "name": "sala-double",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "academia": {
    "name": "academia",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "terraco-cobertura": {
    "name": "terraco-cobertura",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "espaco-fitness": {
    "name": "espaco-fitness",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "laundry": {
    "name": "laundry",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "gourmet-coberto": {
    "name": "gourmet-coberto",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "gourmet-descoberto": {
    "name": "gourmet-descoberto",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "fireplace": {
    "name": "fireplace",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1350,
    "height": 1080,
    "largest": 1200
  },
  "nivel-a": {
    "name": "nivel-a",
    "widths": [
      480
    ],
    "width": 1080,
    "height": 1080,
    "largest": 480
  },
  "pbqp-h": {
    "name": "pbqp-h",
    "widths": [
      480
    ],
    "width": 1080,
    "height": 1080,
    "largest": 480
  },
  "caixa": {
    "name": "caixa",
    "widths": [
      480
    ],
    "width": 1080,
    "height": 1080,
    "largest": 480
  },
  "iso-9001": {
    "name": "iso-9001",
    "widths": [
      480
    ],
    "width": 1080,
    "height": 1080,
    "largest": 480
  },
  "genesis-logo": {
    "name": "genesis-logo",
    "widths": [
      480
    ],
    "width": 2085,
    "height": 495,
    "largest": 480
  }
} as const satisfies Record<string, OptimizedImageMeta>;

export type OptimizedImageName = string;

/** Larguras geradas pelo pré-build para URLs WP (scripts/lib/wp-images.mjs). */
export const WP_VARIANT_WIDTHS = [800, 1200, 1680] as const;

export const optimizedImages: Record<string, OptimizedImageMeta> = {
  ...staticOptimizedImages,
  ...(wpGenerated.images as Record<string, OptimizedImageMeta>),
};

/** Meta para nomes wp-* mesmo se o JSON de registry estiver vazio (paths /img/wp-…). */
export function resolveImageMeta(name: OptimizedImageName): OptimizedImageMeta {
  const existing = optimizedImages[name];
  if (existing) return existing;
  if (name.startsWith('wp-')) {
    const largest = WP_VARIANT_WIDTHS[WP_VARIANT_WIDTHS.length - 1];
    return {
      name,
      widths: [...WP_VARIANT_WIDTHS],
      width: largest,
      height: Math.round(largest * 0.8),
      largest,
    };
  }
  throw new Error(`[images] nome desconhecido: ${name}`);
}

export function imagePath(name: OptimizedImageName, width: number, ext: 'avif' | 'webp') {
  const file = `${name}-${width}.${ext}`;
  // Variantes geradas no pré-build a partir de URL WP ficam sempre em /img local.
  if (name.startsWith('wp-')) return `/img/${file}`;
  const base = getImagesBaseUrl();
  return base ? `${base}${file}` : `/img/${file}`;
}

export function imageSrcSet(name: OptimizedImageName, ext: 'avif' | 'webp') {
  const meta = resolveImageMeta(name);
  return meta.widths.map((w) => `${imagePath(name, w, ext)} ${w}w`).join(', ');
}

/** URL WebP da maior variante — lightbox / fallback único. */
export function optimizedFullSrc(name: OptimizedImageName) {
  const meta = resolveImageMeta(name);
  return imagePath(name, meta.largest, 'webp');
}
