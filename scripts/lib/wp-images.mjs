/**
 * Núcleo: detectar URLs WP, baixar com limites, gerar variantes webp/avif.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const WP_HOST = 'wp.flowresidencial.com.br';
export const VARIANT_WIDTHS = [800, 1200, 1680];
export const MAX_BYTES = 25 * 1024 * 1024;
export const DOWNLOAD_TIMEOUT_MS = 60_000;

/** Campos VARIANT em content.json (partnersImage fora). */
export const VARIANT_PATHS = [
  ['hero', 'backgroundImageBase'],
  ['benefits', 'imageName'],
  ['about', 'thumbImageName'],
  ['footer', 'logoImageName'],
];

export const VARIANT_ARRAY_PATHS = [
  ['floorPlans', 'items', 'imageName'],
  ['gallery', 'items', 'name'],
  ['amenities', 'items', 'imageName'],
  ['certifications', 'items', 'imageName'],
];

export function isWpImageUrl(value) {
  if (typeof value !== 'string') return false;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.hostname !== WP_HOST) return false;
  const ext = path.posix.extname(url.pathname).toLowerCase();
  if (!ext || ext === '.') return false;
  return true;
}

export function variantIdForUrl(url) {
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 12);
  return `wp-${hash}`;
}

export function collectWpUrls(content) {
  const found = new Map(); // url -> { kind: 'name' | 'backgroundBase' }

  const add = (value, kind) => {
    if (!isWpImageUrl(value)) return;
    const url = value.trim();
    if (!found.has(url)) found.set(url, { kind });
  };

  for (const [section, field] of VARIANT_PATHS) {
    const kind = field === 'backgroundImageBase' ? 'backgroundBase' : 'name';
    add(content?.[section]?.[field], kind);
  }

  for (const [section, listKey, field] of VARIANT_ARRAY_PATHS) {
    const items = content?.[section]?.[listKey];
    if (!Array.isArray(items)) continue;
    for (const item of items) add(item?.[field], 'name');
  }

  return found;
}

export function rewriteContent(content, urlToId) {
  const next = structuredClone(content);

  const rewrite = (value, asBackground) => {
    if (!isWpImageUrl(value)) return value;
    const id = urlToId.get(value.trim());
    if (!id) throw new Error(`[wp-images] sem id gerado para ${value}`);
    return asBackground ? `/img/${id}` : id;
  };

  for (const [section, field] of VARIANT_PATHS) {
    if (next?.[section] && field in next[section]) {
      next[section][field] = rewrite(next[section][field], field === 'backgroundImageBase');
    }
  }

  for (const [section, listKey, field] of VARIANT_ARRAY_PATHS) {
    const items = next?.[section]?.[listKey];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item && field in item) item[field] = rewrite(item[field], false);
    }
  }

  return next;
}

export function assertImageContentType(contentType, url) {
  const type = String(contentType || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!type.startsWith('image/')) {
    throw new Error(
      `[wp-images] content-type recusado para ${url}: "${contentType || '(vazio)'}" (esperado image/*)`,
    );
  }
  return type;
}

export async function headMeta(url, { fetchFn = fetch, timeoutMs = DOWNLOAD_TIMEOUT_MS } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`[wp-images] HEAD ${res.status} em ${url}`);
    }
    assertImageContentType(res.headers.get('content-type'), url);
    const len = res.headers.get('content-length');
    return {
      etag: res.headers.get('etag') || '',
      size: len != null ? Number(len) : null,
      contentType: res.headers.get('content-type') || '',
    };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`[wp-images] timeout no HEAD (${timeoutMs}ms): ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function downloadImage(url, { fetchFn = fetch, timeoutMs = DOWNLOAD_TIMEOUT_MS, maxBytes = MAX_BYTES } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`[wp-images] GET ${res.status} em ${url}`);
    }
    assertImageContentType(res.headers.get('content-type'), url);
    const lenHeader = res.headers.get('content-length');
    if (lenHeader != null && Number(lenHeader) > maxBytes) {
      throw new Error(`[wp-images] arquivo acima de ${maxBytes} bytes (${lenHeader}): ${url}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > maxBytes) {
      throw new Error(`[wp-images] download acima de ${maxBytes} bytes (${buf.length}): ${url}`);
    }
    if (buf.length === 0) {
      throw new Error(`[wp-images] download vazio: ${url}`);
    }
    return {
      buffer: buf,
      etag: res.headers.get('etag') || '',
      size: buf.length,
      contentType: res.headers.get('content-type') || '',
    };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`[wp-images] timeout no download (${timeoutMs}ms): ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function cacheKey(url, meta) {
  const raw = `${url}|${meta.etag || ''}|${meta.size ?? ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function generateVariants(buffer, { widths = VARIANT_WIDTHS } = {}) {
  const image = sharp(buffer, { failOn: 'error' });
  const info = await image.metadata();
  if (!info.width || !info.height) {
    throw new Error('[wp-images] sharp não leu dimensões da imagem');
  }

  const files = {}; // `${width}.${ext}` -> Buffer
  let largest = widths[0];

  for (const width of widths) {
    const resized = sharp(buffer, { failOn: 'error' }).resize({
      width,
      withoutEnlargement: true,
    });
    const webp = await resized.clone().webp({ quality: 82 }).toBuffer();
    const avif = await resized.clone().avif({ quality: 50 }).toBuffer();
    files[`${width}.webp`] = webp;
    files[`${width}.avif`] = avif;
    largest = width;
  }

  return {
    width: info.width,
    height: info.height,
    widths: [...widths],
    largest,
    files,
  };
}

export function writeVariantsToDir(outDir, id, variants) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [suffix, buf] of Object.entries(variants.files)) {
    const file = `${id}-${suffix}`;
    fs.writeFileSync(path.join(outDir, file), buf);
  }
}

export function copyVariantsFromCache(cacheVariantDir, outDir, id) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const width of VARIANT_WIDTHS) {
    for (const ext of ['webp', 'avif']) {
      const name = `${id}-${width}.${ext}`;
      const from = path.join(cacheVariantDir, `${width}.${ext}`);
      if (!fs.existsSync(from)) {
        throw new Error(`[wp-images] cache incompleto: falta ${from}`);
      }
      fs.copyFileSync(from, path.join(outDir, name));
    }
  }
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
