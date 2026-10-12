/**
 * Baixa originais (TEMP) e gera AVIF/WebP em public/img/.
 * Uso: node scripts/optimize-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'img');
const tmpRoot =
  process.env.OPTIMIZE_TMP ||
  path.join(process.env.TEMP || '/tmp', 'solar-bellavista-img-opt');
const downloadDir = path.join(tmpRoot, 'originals');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(downloadDir, { recursive: true });

/** @type {{ name: string, source: string, local?: boolean, widths: number[] }[]} */
const IMAGES = [
  { name: 'fachada', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/fachada.jpg', widths: [1200, 1680] },
  { name: 'fachada-dois', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/fachada-dois.jpg', widths: [800, 1200] },
  { name: 'cozinha', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/cozinha.jpg', widths: [480, 800, 1200] },
  { name: 'sala', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/sala.jpg', widths: [480, 800, 1200] },
  { name: 'quarto', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/quarto.jpg', widths: [480, 800, 1200] },
  { name: 'quarto-infantil', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/quarto-infantil.jpg', widths: [480, 800, 1200] },
  { name: 'varanda', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/varanda.jpg', widths: [480, 800, 1200] },
  { name: 'area-gourmet', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/area-gourmet.jpg', widths: [480, 800] },
  { name: 'area-fit', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/area-fit.jpg', widths: [480, 800] },
  { name: 'quadra', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/quadra.jpg', widths: [480, 800] },
  { name: 'piscina', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/piscina.jpg', widths: [480, 800] },
  { name: 'salao-de-festas', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/salao-de-festas.jpg', widths: [480, 800] },
  { name: 'playground', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/playground.jpg', widths: [480, 800] },
  { name: 'quadra-poliesportiva', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/quadra-poliesportiva.jpg', widths: [480, 800] },
  { name: 'area-gourmet-dois', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/area-gourmet-dois.jpg', widths: [480, 800] },
  { name: 'ponta', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/Ponta.jpeg', widths: [800, 1200] },
  { name: 'ponta-pcd', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/Ponta-PCD.jpeg', widths: [800, 1200] },
  { name: 'meio-garden', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2025/10/Meio-Garden.jpeg', widths: [800, 1200] },
  { name: 'nivel-a', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2026/09/nivel-A.png', widths: [480] },
  { name: 'pbqp-h', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2026/09/pbqp-h-icon.png', widths: [480] },
  { name: 'caixa', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2026/09/caixa-icon.png', widths: [480] },
  { name: 'iso-9001', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2026/09/iso-9001.png', widths: [480] },
  { name: 'genesis-logo', source: 'https://wp.solarbellavista.com.br/wp-content/uploads/2026/09/SR-GN-Int-Logo-Horizontal-azulbranco.png', widths: [480] },
  { name: 'solar-bellavista', source: path.join(root, 'public', 'solar-bellavista.png'), local: true, widths: [480] },
];

function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) return;
  execSync(`curl.exe -sSL "${url}" -o "${dest}"`, { stdio: 'pipe' });
}

const meta = {};
let beforeBytes = 0;
let afterBytes = 0;
const generated = [];

for (const img of IMAGES) {
  const srcPath = img.local
    ? img.source
    : path.join(downloadDir, path.basename(img.source.split('?')[0]));
  if (!img.local) download(img.source, srcPath);
  if (!fs.existsSync(srcPath)) throw new Error(`Missing source: ${img.name}`);

  const input = sharp(srcPath);
  const info = await input.metadata();
  const origW = info.width || 0;
  const origH = info.height || 0;
  beforeBytes += fs.statSync(srcPath).size;

  const widths = [...new Set(img.widths)]
    .filter((w) => w > 0)
    .map((w) => Math.min(w, origW || w))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .sort((a, b) => a - b)
    .slice(0, 3);

  for (const w of widths) {
    const h = origW ? Math.round((origH * w) / origW) : undefined;
    for (const [ext, opts] of [
      ['avif', { quality: 50 }],
      ['webp', { quality: 80 }],
    ]) {
      const file = path.join(outDir, `${img.name}-${w}.${ext}`);
      let pipeline = sharp(srcPath).resize({
        width: w,
        withoutEnlargement: true,
      });
      if (ext === 'avif') pipeline = pipeline.avif(opts);
      else pipeline = pipeline.webp(opts);
      await pipeline.toFile(file);
      const size = fs.statSync(file).size;
      afterBytes += size;
      generated.push({ file: path.relative(root, file).replace(/\\/g, '/'), kb: +(size / 1024).toFixed(1), w, h });
    }
  }

  meta[img.name] = {
    name: img.name,
    widths,
    width: origW,
    height: origH,
    largest: widths[widths.length - 1],
  };
}

const metaPath = path.join(root, 'src', 'data', 'optimizedImages.ts');
const ts = `/* Gerado por scripts/optimize-images.mjs — não editar à mão. */
export type OptimizedImageMeta = {
  name: string;
  widths: number[];
  width: number;
  height: number;
  largest: number;
};

export const optimizedImages = ${JSON.stringify(meta, null, 2)} as const satisfies Record<string, OptimizedImageMeta>;

export type OptimizedImageName = keyof typeof optimizedImages;

export function imagePath(name: OptimizedImageName, width: number, ext: 'avif' | 'webp') {
  return \`/img/\${name}-\${width}.\${ext}\`;
}

export function imageSrcSet(name: OptimizedImageName, ext: 'avif' | 'webp') {
  const meta = optimizedImages[name];
  return meta.widths.map((w) => \`\${imagePath(name, w, ext)} \${w}w\`).join(', ');
}
`;
fs.writeFileSync(metaPath, ts);

const summary = {
  beforeKb: +(beforeBytes / 1024).toFixed(1),
  afterKb: +(afterBytes / 1024).toFixed(1),
  generatedCount: generated.length,
  generated,
  meta,
};
fs.writeFileSync(path.join(tmpRoot, 'optimize-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ beforeKb: summary.beforeKb, afterKb: summary.afterKb, files: generated.length, metaPath }, null, 2));
