/**
 * Pré-build: lê src/data/content.json, baixa URLs https de wp.flowresidencial.com.br
 * nos campos VARIANT, gera 800/1200/1680 webp+avif em public/img/, reescreve
 * referências em content.resolved.json e registra metadados em wpGeneratedImages.json.
 *
 * Cache opcional: VITRINE_IMG_CACHE_DIR (fora do repo), chave URL+ETag/tamanho.
 *
 * Uso: node scripts/prepare-wp-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadKnownImageNames,
  validateSiteContent,
} from '../src/data/contentValidate.mjs';
import {
  VARIANT_WIDTHS,
  cacheKey,
  collectWpUrls,
  copyVariantsFromCache,
  downloadImage,
  generateVariants,
  headMeta,
  readJson,
  rewriteContent,
  variantIdForUrl,
  writeJson,
  writeVariantsToDir,
} from './lib/wp-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function prepareWpImages({
  rootDir = root,
  cacheDir = process.env.VITRINE_IMG_CACHE_DIR || '',
  fetchFn = fetch,
} = {}) {
  const contentFile = path.join(rootDir, 'src/data/content.json');
  const resolvedFile = path.join(rootDir, 'src/data/content.resolved.json');
  const metaFile = path.join(rootDir, 'src/data/wpGeneratedImages.json');
  const imgDir = path.join(rootDir, 'public/img');

  if (!fs.existsSync(contentFile)) {
    throw new Error(`[wp-images] ausente: ${contentFile}`);
  }

  const content = readJson(contentFile);
  const urls = collectWpUrls(content);
  const urlToId = new Map();
  const images = {};

  // Limpa variantes wp-* antigas em public/img (só as geradas por este script).
  if (fs.existsSync(imgDir)) {
    for (const name of fs.readdirSync(imgDir)) {
      if (name.startsWith('wp-') && (name.endsWith('.webp') || name.endsWith('.avif'))) {
        fs.rmSync(path.join(imgDir, name), { force: true });
      }
    }
  }

  for (const [url] of urls) {
    const id = variantIdForUrl(url);
    urlToId.set(url, id);

    let meta;
    try {
      meta = await headMeta(url, { fetchFn });
    } catch (err) {
      // Alguns hosts não implementam HEAD bem — tenta GET direto.
      console.warn(`[wp-images] HEAD falhou, tentando GET: ${err.message}`);
      meta = { etag: '', size: null, contentType: '' };
    }

    const key = cacheKey(url, meta);
    const cacheRoot = cacheDir ? path.join(cacheDir, key) : '';
    const cacheMetaFile = cacheRoot ? path.join(cacheRoot, 'meta.json') : '';
    const cacheHit =
      Boolean(cacheRoot) &&
      fs.existsSync(cacheMetaFile) &&
      VARIANT_WIDTHS.every((w) =>
        ['webp', 'avif'].every((ext) => fs.existsSync(path.join(cacheRoot, `${w}.${ext}`))),
      );

    let variants;
    if (cacheHit) {
      const cached = readJson(cacheMetaFile);
      copyVariantsFromCache(cacheRoot, imgDir, id);
      variants = {
        width: cached.width,
        height: cached.height,
        widths: cached.widths || VARIANT_WIDTHS,
        largest: cached.largest || VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1],
      };
      console.log(`[wp-images] cache hit ${id} ← ${url}`);
    } else {
      const downloaded = await downloadImage(url, { fetchFn });
      // Atualiza meta com dados reais do GET (ETag/tamanho) para a chave de cache.
      meta = {
        etag: downloaded.etag || meta.etag || '',
        size: downloaded.size,
        contentType: downloaded.contentType || meta.contentType,
      };
      const key2 = cacheKey(url, meta);
      const cacheRoot2 = cacheDir ? path.join(cacheDir, key2) : '';

      try {
        variants = await generateVariants(downloaded.buffer);
      } catch (err) {
        throw new Error(`[wp-images] conversão falhou para ${url}: ${err.message}`);
      }

      writeVariantsToDir(imgDir, id, variants);

      if (cacheRoot2) {
        fs.mkdirSync(cacheRoot2, { recursive: true });
        for (const [suffix, buf] of Object.entries(variants.files)) {
          fs.writeFileSync(path.join(cacheRoot2, suffix), buf);
        }
        writeJson(path.join(cacheRoot2, 'meta.json'), {
          url,
          etag: meta.etag,
          size: meta.size,
          width: variants.width,
          height: variants.height,
          widths: variants.widths,
          largest: variants.largest,
        });
      }
      console.log(`[wp-images] gerado ${id} ← ${url}`);
    }

    images[id] = {
      name: id,
      widths: variants.widths,
      width: variants.width,
      height: variants.height,
      largest: variants.largest,
    };
  }

  const resolved = rewriteContent(content, urlToId);
  writeJson(resolvedFile, resolved);
  writeJson(metaFile, { images });

  // Mesma validação de content.ts: se o resolved cairia no FALLBACK, falha o build.
  const knownNames = loadKnownImageNames(rootDir, {
    readFileSync: fs.readFileSync,
    existsSync: fs.existsSync,
    join: path.join,
  });
  const check = validateSiteContent(resolved, knownNames);
  if (!check.ok) {
    throw new Error(
      `[content] pré-build: validação falhou — campo ${check.field}=${JSON.stringify(check.value)} (${check.reason}). ` +
        `Sem esta correção o site usaria FALLBACK_CONTENT em silêncio.`,
    );
  }

  return {
    urls: [...urls.keys()],
    generated: Object.keys(images),
    resolvedFile,
    metaFile,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const result = await prepareWpImages();
    console.log(
      JSON.stringify(
        {
          ok: true,
          count: result.generated.length,
          generated: result.generated,
          urls: result.urls,
        },
        null,
        2,
      ),
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
