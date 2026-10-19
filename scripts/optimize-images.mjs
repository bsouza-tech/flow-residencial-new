/**
 * Baixa originais do Flow (TEMP) e gera AVIF/WebP em public/img/.
 * Mantém os selos comuns da Gênesis já gerados. Uso: node scripts/optimize-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'img');
const publicDir = path.join(root, 'public');
const tmpRoot =
  process.env.OPTIMIZE_TMP ||
  path.join(process.env.TEMP || '/tmp', 'flow-residencial-img-opt');
const downloadDir = path.join(tmpRoot, 'originals');
const WP = 'https://wp.flowresidencial.com.br/wp-content/uploads/';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(downloadDir, { recursive: true });

const KEEP = /^(nivel-a|pbqp-h|caixa|iso-9001|genesis-logo)-/;

/** Metadados dos selos comuns, já presentes em disco. Não são regerados. */
const SEAL_META = {
  'nivel-a': { name: 'nivel-a', widths: [480], width: 1080, height: 1080, largest: 480 },
  'pbqp-h': { name: 'pbqp-h', widths: [480], width: 1080, height: 1080, largest: 480 },
  caixa: { name: 'caixa', widths: [480], width: 1080, height: 1080, largest: 480 },
  'iso-9001': { name: 'iso-9001', widths: [480], width: 1080, height: 1080, largest: 480 },
  'genesis-logo': { name: 'genesis-logo', widths: [480], width: 2085, height: 495, largest: 480 },
};

/** @type {{ name: string, source: string, widths: number[] }[]} */
const IMAGES = [
  { name: 'fachada', source: `${WP}2026/10/Fachada-Frontal-1920x1440-1.webp`, widths: [1200, 1680] },
  { name: 'fachada-dois', source: `${WP}2026/04/03.-Fachada-Letreiro-Flow.png`, widths: [800, 1200] },
  { name: 'flow-logo', source: `${WP}2026/04/Flow-Logo.pdf.png`, widths: [480] },
  { name: 'estudio', source: `${WP}2026/04/coluna_05-1.png`, widths: [800, 1200] },
  { name: 'double-suite', source: `${WP}2026/04/coluna_03-1-768x768-1.png`, widths: [800, 1200] },
  { name: 'cobertura-double-suite', source: `${WP}2026/04/coluna_09-1-768x768-1.png`, widths: [800, 1200] },
  { name: 'dois-quartos-pcd', source: `${WP}2026/04/coluna_13-PCD-1-768x768-1.png`, widths: [800, 1200] },
  { name: 'suite-loft', source: `${WP}2026/04/01.-Suite-Loft-Flow.png`, widths: [480, 800, 1200] },
  { name: 'cozinha-loft', source: `${WP}2026/04/02.-Cozinha-Loft-Flow.png`, widths: [480, 800, 1200] },
  { name: 'suite-double-01', source: `${WP}2026/04/03.-Suite-Double-01-Flow.png`, widths: [480, 800, 1200] },
  { name: 'lobby', source: `${WP}2026/04/04.-Lobby-Flow.png`, widths: [480, 800, 1200] },
  { name: 'suite-double-02', source: `${WP}2026/04/04.-Suite-Double-02-Flow.png`, widths: [480, 800, 1200] },
  { name: 'marketplace', source: `${WP}2026/04/05.-Marketplace-Flow.png`, widths: [480, 800, 1200] },
  { name: 'coworking', source: `${WP}2026/04/06.-Coworking-Flow.png`, widths: [480, 800, 1200] },
  { name: 'varanda-loft', source: `${WP}2026/04/06.-Varanda-Loft-Flow.png`, widths: [480, 800, 1200] },
  { name: 'cafeteria', source: `${WP}2026/04/07.-Cafeteria-Flow.png`, widths: [480, 800, 1200] },
  { name: 'sala-double', source: `${WP}2026/04/07.-Sala-Double-Flow.png`, widths: [480, 800, 1200] },
  { name: 'academia', source: `${WP}2026/04/08.-Academia-Flow.png`, widths: [480, 800, 1200] },
  { name: 'terraco-cobertura', source: `${WP}2026/04/08.-Terraco-Cobertura-Flow.png`, widths: [480, 800, 1200] },
  { name: 'espaco-fitness', source: `${WP}2026/04/10.-Espaco-Fitness-Flow.png`, widths: [480, 800, 1200] },
  { name: 'laundry', source: `${WP}2026/04/10.-Loundry-Flow.png`, widths: [480, 800, 1200] },
  { name: 'gourmet-coberto', source: `${WP}2026/04/11.-Espaco-Gourmet-Coberto-Flow.png`, widths: [480, 800, 1200] },
  { name: 'gourmet-descoberto', source: `${WP}2026/04/12.-Espaco-Gourmet-Descoberto-Flow.png`, widths: [480, 800, 1200] },
  { name: 'fireplace', source: `${WP}2026/04/13.-Fireplace-Flow.png`, widths: [480, 800, 1200] },
];

function download(url, dest) {
  execSync(`curl.exe -fsSL --retry 3 --retry-all-errors "${url}" -o "${dest}"`, { stdio: 'pipe' });
  const size = fs.statSync(dest).size;
  const buf = fs.readFileSync(dest);
  const hex = buf.subarray(0, 12).toString('hex');
  const head = buf.subarray(0, 200).toString('utf8');
  const isPng = hex.startsWith('89504e47');
  const isJpeg = hex.startsWith('ffd8ff');
  const isWebp = buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  const isSvg = /<svg[\s>]/i.test(head) || head.includes('<?xml');
  if (size < 400 || (!isPng && !isJpeg && !isWebp && !isSvg)) {
    throw new Error(`Download inválido ${url} (${size} bytes, ${hex.slice(0, 16)})`);
  }
  console.log(`ok ${size} ${path.basename(dest)}`);
}

function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32;
  entry[1] = 32;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

for (const nome of fs.readdirSync(outDir)) {
  if (!KEEP.test(nome)) fs.unlinkSync(path.join(outDir, nome));
}
const meta = {};
let beforeBytes = 0;
let afterBytes = 0;
const generated = [];

for (const img of IMAGES) {
  const srcPath = path.join(downloadDir, `${img.name}${path.extname(new URL(img.source).pathname)}`);
  download(img.source, srcPath);

  const info = await sharp(srcPath).metadata();
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
    for (const [ext, opts] of [
      ['avif', { quality: 50 }],
      ['webp', { quality: 80 }],
    ]) {
      const file = path.join(outDir, `${img.name}-${w}.${ext}`);
      let pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
      if (ext === 'avif') pipeline = pipeline.avif(opts);
      else pipeline = pipeline.webp(opts);
      await pipeline.toFile(file);
      const size = fs.statSync(file).size;
      afterBytes += size;
      generated.push({ file: path.relative(root, file).replace(/\\/g, '/'), kb: +(size / 1024).toFixed(1), w });
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

const iconUrl = 'https://flowresidencial.com.br/icon-final.svg';
const iconPath = path.join(downloadDir, 'icon-final.svg');
download(iconUrl, iconPath);
const iconSvg = fs.readFileSync(iconPath);
const iconPng = async (size, dest) => {
  await sharp(iconSvg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(dest);
  console.log(`icon ${size} ${fs.statSync(dest).size}`);
};
await iconPng(32, path.join(publicDir, 'favicon-32.png'));
await iconPng(180, path.join(publicDir, 'apple-touch-icon.png'));
await iconPng(192, path.join(publicDir, 'icon-192.png'));
await iconPng(512, path.join(publicDir, 'icon-512.png'));
const png32 = await sharp(iconSvg, { density: 384 }).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngToIco(png32));

const facade = path.join(downloadDir, `fachada-dois${path.extname(new URL(IMAGES[1].source).pathname)}`);
const facadeMeta = await sharp(facade).metadata();
const fw = facadeMeta.width || 1200;
const fh = facadeMeta.height || 630;
const targetRatio = 1200 / 630;
const sourceRatio = fw / fh;
let cropW = fw;
let cropH = fh;
if (sourceRatio > targetRatio) cropW = Math.round(fh * targetRatio);
else cropH = Math.round(fw / targetRatio);
const left = Math.max(0, Math.round((fw - cropW) / 2));
const top = Math.max(0, Math.round((fh - cropH) / 2));
await sharp(facade)
  .extract({ left, top, width: cropW, height: cropH })
  .resize(1200, 630)
  .jpeg({ quality: 82 })
  .toFile(path.join(publicDir, 'og-flow-residencial.jpg'));
console.log(`og ${fs.statSync(path.join(publicDir, 'og-flow-residencial.jpg')).size} crop ${cropW}x${cropH} from ${fw}x${fh}`);

Object.assign(meta, SEAL_META);

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

/** URL WebP da maior variante — lightbox / fallback único. */
export function optimizedFullSrc(name: OptimizedImageName) {
  const meta = optimizedImages[name];
  return imagePath(name, meta.largest, 'webp');
}
`;
fs.writeFileSync(metaPath, ts);

const summary = {
  beforeKb: +(beforeBytes / 1024).toFixed(1),
  afterKb: +(afterBytes / 1024).toFixed(1),
  generatedCount: generated.length,
};
fs.writeFileSync(path.join(tmpRoot, 'optimize-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, metaPath }, null, 2));
