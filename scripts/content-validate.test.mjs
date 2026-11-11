import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  isBackgroundImageBase,
  isImageName,
  isWpImageStemUrl,
  loadKnownImageNames,
  validateSiteContent,
} from '../src/data/contentValidate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://wp.flowresidencial.com.br/wp-content/uploads/2026/11/';
const STEM = `${BASE}fachada`;
const KITCHEN =
  'https://wp.flowresidencial.com.br/wp-content/uploads/2026/04/02.-Cozinha-Loft-Flow.png';

function known() {
  return loadKnownImageNames(root, {
    readFileSync: fs.readFileSync,
    existsSync: fs.existsSync,
    join: path.join,
  });
}

test('isBackgroundImageBase aceita /img/, stem em baseUrl, /img/wp-* e URL com extensão', () => {
  const names = known();
  assert.equal(isBackgroundImageBase('/img/fachada', names, BASE), true);
  assert.equal(isBackgroundImageBase(STEM, names, BASE), true);
  assert.equal(isBackgroundImageBase('/img/wp-2d10c5d863a3', names, BASE), true);
  assert.equal(isBackgroundImageBase(KITCHEN, names, BASE), true);
  assert.equal(isWpImageStemUrl(STEM, BASE), true);
  assert.equal(isWpImageStemUrl(KITCHEN, BASE), false);
  assert.equal(isBackgroundImageBase('https://evil.example/fachada', names, BASE), false);
});

test('isImageName mantém paridade pré-1133d22 (registry, wp-*, URL com extensão)', () => {
  const names = known();
  assert.equal(isImageName('fachada-dois', names), true);
  assert.equal(isImageName('wp-2d10c5d863a3', names), true);
  assert.equal(isImageName('wp-anything', names), true);
  assert.equal(isImageName(KITCHEN, names), true);
  assert.equal(isImageName('not-a-real-image', names), false);
});

test('regression: content.json de 28c0fb5 e 5c1ae87 passam na validação', () => {
  const names = known();
  for (const rev of ['28c0fb5', '5c1ae87']) {
    const raw = execFileSync('git', ['show', `${rev}:src/data/content.json`], {
      cwd: root,
      encoding: 'utf8',
    });
    const json = JSON.parse(raw);
    const result = validateSiteContent(json, names);
    assert.equal(result.ok, true, `${rev} deveria passar: ${JSON.stringify(result)}`);
  }
});

test('regression: hero stem real de produção passa', () => {
  const names = known();
  const raw = JSON.parse(fs.readFileSync(path.join(root, 'src/data/content.json'), 'utf8'));
  raw.hero.backgroundImageBase = STEM;
  const result = validateSiteContent(raw, names);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(isBackgroundImageBase(STEM, names, raw.images.baseUrl), true);
});
