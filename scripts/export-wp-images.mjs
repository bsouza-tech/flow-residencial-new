/**
 * Copia para wp-upload/flow/ todos os arquivos de public/img usados pelo site,
 * com os nomes originais, e gera LEIA-ME.txt.
 *
 * Uso: node scripts/export-wp-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { listPublicImgFiles, listUsedImgFiles, root } from './img-manifest.mjs';

const srcDir = path.join(root, 'public/img');
const outDir = path.join(root, 'wp-upload/flow');

fs.mkdirSync(outDir, { recursive: true });
for (const name of fs.readdirSync(outDir)) {
  fs.rmSync(path.join(outDir, name), { force: true, recursive: true });
}

const used = listUsedImgFiles();
const publicFiles = new Set(listPublicImgFiles());
const missing = [];
const copied = [];
let totalBytes = 0;

for (const name of used) {
  const from = path.join(srcDir, name);
  if (!fs.existsSync(from)) {
    missing.push(name);
    continue;
  }
  const to = path.join(outDir, name);
  fs.copyFileSync(from, to);
  const size = fs.statSync(to).size;
  totalBytes += size;
  copied.push({ name, size });
}

const unreferenced = [...publicFiles].filter((name) => !used.includes(name)).sort();

const readme = [
  'wp-upload/flow — imagens do Flow Residencial para o WordPress',
  '',
  `Arquivos: ${copied.length}`,
  `Tamanho total: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB (${totalBytes} bytes)`,
  '',
  'Instrução: enviar a pasta inteira sem renomear.',
  'Os nomes dos arquivos devem permanecer iguais aos gerados pelo site',
  '(ex.: fachada-1200.webp, genesis-caixa.png).',
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, 'LEIA-ME.txt'), readme, 'utf8');

console.log(JSON.stringify({
  outDir: path.relative(root, outDir).replace(/\\/g, '/'),
  copied: copied.length,
  totalBytes,
  totalMb: +(totalBytes / (1024 * 1024)).toFixed(2),
  missing,
  unreferenced,
}, null, 2));

if (missing.length) process.exitCode = 1;
