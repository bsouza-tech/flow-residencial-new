/* Gerado por scripts/optimize-images.mjs — não editar à mão. */
export type OptimizedImageMeta = {
  name: string;
  widths: number[];
  width: number;
  height: number;
  largest: number;
};

export const optimizedImages = {
  "fachada": {
    "name": "fachada",
    "widths": [
      1200,
      1680
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1680
  },
  "fachada-dois": {
    "name": "fachada-dois",
    "widths": [
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "cozinha": {
    "name": "cozinha",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "sala": {
    "name": "sala",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "quarto": {
    "name": "quarto",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "quarto-infantil": {
    "name": "quarto-infantil",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "varanda": {
    "name": "varanda",
    "widths": [
      480,
      800,
      1200
    ],
    "width": 1680,
    "height": 1263,
    "largest": 1200
  },
  "area-gourmet": {
    "name": "area-gourmet",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "area-fit": {
    "name": "area-fit",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "quadra": {
    "name": "quadra",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "piscina": {
    "name": "piscina",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "salao-de-festas": {
    "name": "salao-de-festas",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "playground": {
    "name": "playground",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "quadra-poliesportiva": {
    "name": "quadra-poliesportiva",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "area-gourmet-dois": {
    "name": "area-gourmet-dois",
    "widths": [
      480,
      800
    ],
    "width": 1680,
    "height": 1263,
    "largest": 800
  },
  "ponta": {
    "name": "ponta",
    "widths": [
      800,
      1200
    ],
    "width": 1280,
    "height": 905,
    "largest": 1200
  },
  "ponta-pcd": {
    "name": "ponta-pcd",
    "widths": [
      800,
      1200
    ],
    "width": 1280,
    "height": 905,
    "largest": 1200
  },
  "meio-garden": {
    "name": "meio-garden",
    "widths": [
      800,
      1200
    ],
    "width": 1280,
    "height": 905,
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
  },
  "solar-bellavista": {
    "name": "solar-bellavista",
    "widths": [
      480
    ],
    "width": 1000,
    "height": 1000,
    "largest": 480
  }
} as const satisfies Record<string, OptimizedImageMeta>;

export type OptimizedImageName = keyof typeof optimizedImages;

export function imagePath(name: OptimizedImageName, width: number, ext: 'avif' | 'webp') {
  return `/img/${name}-${width}.${ext}`;
}

export function imageSrcSet(name: OptimizedImageName, ext: 'avif' | 'webp') {
  const meta = optimizedImages[name];
  return meta.widths.map((w) => `${imagePath(name, w, ext)} ${w}w`).join(', ');
}

/** URL WebP da maior variante — lightbox / fallback único. */
export function optimizedFullSrc(name: OptimizedImageName) {
  const meta = optimizedImages[name];
  return imagePath(name, meta.largest, 'webp');
}
