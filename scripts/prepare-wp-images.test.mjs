import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import {
  assertImageContentType,
  collectWpUrls,
  isWpImageUrl,
  rewriteContent,
  variantIdForUrl,
} from './lib/wp-images.mjs';
import { prepareWpImages } from './prepare-wp-images.mjs';

const SAMPLE_PNG_URL =
  'https://wp.flowresidencial.com.br/wp-content/uploads/2026/04/02.-Cozinha-Loft-Flow.png';

test('isWpImageUrl aceita só https do host certo com extensão', () => {
  assert.equal(isWpImageUrl(SAMPLE_PNG_URL), true);
  assert.equal(isWpImageUrl('http://wp.flowresidencial.com.br/a.png'), false);
  assert.equal(isWpImageUrl('https://evil.example/a.png'), false);
  assert.equal(isWpImageUrl('https://wp.flowresidencial.com.br/pasta/sem-ext'), false);
  assert.equal(isWpImageUrl('lobby'), false);
});

test('collectWpUrls ignora partnersImage e acha VARIANT', () => {
  const content = {
    hero: { backgroundImageBase: SAMPLE_PNG_URL },
    benefits: { imageName: 'fachada-dois' },
    floorPlans: { items: [{ imageName: SAMPLE_PNG_URL }] },
    gallery: { items: [] },
    amenities: { items: [] },
    about: { thumbImageName: 'fachada-dois' },
    certifications: { items: [] },
    footer: {
      partnersImage: 'https://wp.flowresidencial.com.br/wp-content/uploads/x.png',
      logoImageName: 'flow-logo',
    },
  };
  const urls = collectWpUrls(content);
  assert.equal(urls.size, 1);
  assert.ok(urls.has(SAMPLE_PNG_URL));
});

test('assertImageContentType recusa não-imagem', () => {
  assert.throws(() => assertImageContentType('application/octet-stream', 'u'), /content-type/);
  assert.equal(assertImageContentType('image/png', 'u'), 'image/png');
});

test('rewriteContent troca URL por id /img/id no hero', () => {
  const id = variantIdForUrl(SAMPLE_PNG_URL);
  const content = {
    hero: { backgroundImageBase: SAMPLE_PNG_URL },
    benefits: { imageName: SAMPLE_PNG_URL },
    floorPlans: { items: [] },
    gallery: { items: [] },
    amenities: { items: [] },
    about: { thumbImageName: 'x' },
    certifications: { items: [] },
    footer: { logoImageName: 'flow-logo', partnersImage: '/img/genesis-caixa.png' },
  };
  const out = rewriteContent(content, new Map([[SAMPLE_PNG_URL, id]]));
  assert.equal(out.hero.backgroundImageBase, `/img/${id}`);
  assert.equal(out.benefits.imageName, id);
  assert.equal(out.footer.partnersImage, '/img/genesis-caixa.png');
});

test('prepareWpImages baixa, gera variantes e falha com content-type ruim', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wp-img-'));
  const srcData = path.join(tmp, 'src/data');
  const imgDir = path.join(tmp, 'public/img');
  fs.mkdirSync(srcData, { recursive: true });
  fs.mkdirSync(imgDir, { recursive: true });

  const png = await sharp({
    create: { width: 1600, height: 900, channels: 3, background: '#336699' },
  })
    .png()
    .toBuffer();

  const content = {
    images: { baseUrl: '' },
    hero: {
      eyebrow: ['A', 'B'],
      title: 't',
      titleEmphasized: 't',
      text: 'x',
      ctaPrimary: { label: 'a', href: '#' },
      ctaSecondary: { label: 'b', href: '#' },
      scrollLabel: 's',
      backgroundImageBase: '/img/fachada',
    },
    benefits: {
      eyebrow: 'e',
      headingHtml: 'h',
      lead: 'l',
      badge: 'b',
      imageName: SAMPLE_PNG_URL,
      items: [],
    },
    floorPlans: { eyebrow: 'e', heading: 'h', lead: 'l', items: [] },
    gallery: { eyebrow: 'e', heading: 'h', lead: 'l', items: [] },
    amenities: { eyebrow: 'e', heading: 'h', sectionId: 'benfeitorias', items: [] },
    location: {
      eyebrow: 'e',
      heading: 'h',
      lead: 'l',
      project: { id: 'p', name: 'n', lat: 0, lng: 0, addressLines: ['a'], mapsUrl: 'https://x' },
      pois: [],
    },
    about: {
      heading: 'h',
      lead: 'l',
      cardTitle: 'c',
      cardText: 't',
      stats: [],
      videoId: 'v',
      thumbImageName: 'fachada-dois',
    },
    certifications: { eyebrow: 'e', heading: 'h', lead: 'l', items: [] },
    footer: {
      tagline: 't',
      nav: [],
      contact: { address: ['a'], phone: '1', phoneHref: 'tel:1', email: 'a@b.c' },
      social: [],
      privacyUrl: 'https://x',
      legal: 'l',
      partnersImage: '/img/genesis-caixa.png',
      logoImageName: 'flow-logo',
    },
  };
  fs.writeFileSync(path.join(srcData, 'content.json'), JSON.stringify(content, null, 2));

  const fetchFn = async (url, init = {}) => {
    assert.equal(url, SAMPLE_PNG_URL);
    if (init.method === 'HEAD') {
      return {
        ok: true,
        status: 200,
        headers: {
          get: (k) => {
            if (k === 'content-type') return 'image/png';
            if (k === 'content-length') return String(png.length);
            if (k === 'etag') return '"etag-1"';
            return null;
          },
        },
      };
    }
    return {
      ok: true,
      status: 200,
      headers: {
        get: (k) => {
          if (k === 'content-type') return 'image/png';
          if (k === 'content-length') return String(png.length);
          if (k === 'etag') return '"etag-1"';
          return null;
        },
      },
      arrayBuffer: async () => png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength),
    };
  };

  const cacheDir = path.join(tmp, 'cache');
  const result = await prepareWpImages({ rootDir: tmp, cacheDir, fetchFn });
  assert.equal(result.generated.length, 1);
  const id = result.generated[0];
  for (const w of [800, 1200, 1680]) {
    for (const ext of ['webp', 'avif']) {
      assert.ok(fs.existsSync(path.join(imgDir, `${id}-${w}.${ext}`)));
    }
  }
  const resolved = JSON.parse(fs.readFileSync(path.join(srcData, 'content.resolved.json'), 'utf8'));
  assert.equal(resolved.benefits.imageName, id);
  assert.equal(resolved.footer.partnersImage, '/img/genesis-caixa.png');

  // cache quente
  const t0 = Date.now();
  await prepareWpImages({ rootDir: tmp, cacheDir, fetchFn });
  const warmMs = Date.now() - t0;
  assert.ok(warmMs < 5000, `cache quente demorou ${warmMs}ms`);

  // content-type inválido → falha
  const badFetch = async () => ({
    ok: true,
    status: 200,
    headers: { get: (k) => (k === 'content-type' ? 'text/html' : null) },
    arrayBuffer: async () => new ArrayBuffer(8),
  });
  fs.writeFileSync(
    path.join(srcData, 'content.json'),
    JSON.stringify({ ...content, benefits: { ...content.benefits, imageName: SAMPLE_PNG_URL } }, null, 2),
  );
  // limpa cache para forçar download
  fs.rmSync(cacheDir, { recursive: true, force: true });
  await assert.rejects(() => prepareWpImages({ rootDir: tmp, cacheDir: path.join(tmp, 'cache2'), fetchFn: badFetch }), /content-type/);
});
