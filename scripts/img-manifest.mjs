/**
 * Lista os arquivos de public/img usados pelo site (optimizedImages + extras).
 * Compartilhado por export-wp-images.mjs e verify-images.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function readOptimizedImages() {
  const src = fs.readFileSync(path.join(root, 'src/data/optimizedImages.ts'), 'utf8');
  const start = src.indexOf('export const optimizedImages = ');
  if (start < 0) throw new Error('optimizedImages.ts: const não encontrado');
  const brace = src.indexOf('{', start);
  const endMark = src.indexOf('} as const', brace);
  if (brace < 0 || endMark < 0) throw new Error('optimizedImages.ts: objeto inválido');
  const jsonText = src.slice(brace, endMark + 1);
  return JSON.parse(jsonText);
}

export function readContentJson() {
  const p = path.join(root, 'src/data/content.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function normalizeBaseUrl(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (!/^https:\/\//i.test(trimmed)) return null;
  if (!trimmed.endsWith('/')) return null;
  return trimmed;
}

/** Nomes de arquivo em public/img referenciados pelo site. */
export function listUsedImgFiles() {
  const optimized = readOptimizedImages();
  const files = new Set();
  for (const meta of Object.values(optimized)) {
    for (const width of meta.widths) {
      files.add(`${meta.name}-${width}.avif`);
      files.add(`${meta.name}-${width}.webp`);
    }
  }

  const content = readContentJson();
  const partners = content?.footer?.partnersImage;
  if (typeof partners === 'string' && partners.startsWith('/img/')) {
    files.add(partners.slice('/img/'.length));
  } else {
    files.add('genesis-caixa.png');
  }

  return [...files].sort();
}

export function listPublicImgFiles() {
  const dir = path.join(root, 'public/img');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();
}

export { root };
