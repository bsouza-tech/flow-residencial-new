/**
 * Faz HEAD em cada URL esperada sob images.baseUrl e reporta status/tipo/tamanho.
 * Sai com código 1 se algum falhar.
 *
 * Uso:
 *   node scripts/verify-images.mjs
 *   node scripts/verify-images.mjs --base-url https://exemplo.test/flow/
 *
 * Teste local (sem rede externa):
 *   node scripts/verify-images.mjs --self-test
 */
import http from 'node:http';
import { listUsedImgFiles, normalizeBaseUrl, readContentJson } from './img-manifest.mjs';

function parseArgs(argv) {
  const out = { baseUrl: null, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--self-test') out.selfTest = true;
    else if (a === '--base-url') out.baseUrl = argv[++i];
  }
  return out;
}

async function head(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  const len = res.headers.get('content-length');
  return {
    url,
    ok: res.ok,
    status: res.status,
    contentType: res.headers.get('content-type') || '',
    size: len != null ? Number(len) : null,
  };
}

function formatRow(row) {
  const size = row.size == null ? '-' : String(row.size);
  return `${row.status}\t${row.contentType || '-'}\t${size}\t${row.url}`;
}

async function verify(baseUrl) {
  const files = listUsedImgFiles();
  const rows = [];
  let failed = 0;
  for (const file of files) {
    const url = `${baseUrl}${file}`;
    try {
      const row = await head(url);
      rows.push(row);
      if (!row.ok) failed += 1;
    } catch (err) {
      failed += 1;
      rows.push({
        url,
        ok: false,
        status: 0,
        contentType: '',
        size: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log('status\tcontent-type\tsize\turl');
  for (const row of rows) {
    if (row.error) console.log(`ERR\t-\t-\t${row.url}\t${row.error}`);
    else console.log(formatRow(row));
  }
  console.log(JSON.stringify({ baseUrl, checked: rows.length, failed }, null, 2));
  return failed === 0;
}

async function selfTest() {
  const files = listUsedImgFiles();
  if (files.length < 2) throw new Error('lista usada vazia');

  const okFile = files[0];
  const missingFile = files[1];
  const payload = Buffer.from('ok-image');

  const server = http.createServer((req, res) => {
    if (req.method !== 'HEAD' && req.method !== 'GET') {
      res.writeHead(405);
      res.end();
      return;
    }
    const name = decodeURIComponent((req.url || '/').slice(1));
    if (name === okFile) {
      res.writeHead(200, {
        'content-type': 'image/webp',
        'content-length': String(payload.length),
      });
      if (req.method === 'GET') res.end(payload);
      else res.end();
      return;
    }
    // missingFile e demais → 404 (um falhando de propósito)
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end();
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/`;

  // verify-images exige https em produção; no self-test usamos http local direto.
  console.log(`[self-test] baseUrl=${baseUrl} ok=${okFile} fail=${missingFile}`);
  const rows = [];
  for (const file of [okFile, missingFile]) {
    rows.push(await head(`${baseUrl}${file}`));
  }
  for (const row of rows) console.log(formatRow(row));

  const okRow = rows[0];
  const failRow = rows[1];
  const passed =
    okRow.ok &&
    okRow.status === 200 &&
    failRow &&
    !failRow.ok &&
    failRow.status === 404;

  server.close();

  if (!passed) {
    console.error('[self-test] falhou: esperado 200 + 404');
    process.exit(1);
  }

  // Roda verify completo contra o servidor (vai sair 1 por causa do 404)
  const server2 = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '/').slice(1));
    if (name === okFile) {
      res.writeHead(200, {
        'content-type': 'image/webp',
        'content-length': String(payload.length),
      });
      res.end();
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise((resolve) => server2.listen(0, '127.0.0.1', resolve));
  const port2 = server2.address().port;
  const base2 = `http://127.0.0.1:${port2}/`;
  console.log('[self-test] verify completo (espera exit 1 por falhas)...');
  const allOk = await verify(base2);
  server2.close();
  if (allOk) {
    console.error('[self-test] verify deveria falhar com pelo menos um 404');
    process.exit(1);
  }
  console.log('[self-test] ok — detectou falhas como esperado');
  process.exit(0);
}

const args = parseArgs(process.argv.slice(2));

if (args.selfTest) {
  await selfTest();
} else {
  let baseUrl = args.baseUrl;
  if (baseUrl == null) {
    const content = readContentJson();
    baseUrl = content?.images?.baseUrl ?? '';
  }
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized === null || normalized === '') {
    console.error(
      'images.baseUrl vazio ou inválido. Preencha content.json (https + /) ou passe --base-url.',
    );
    process.exit(1);
  }
  const ok = await verify(normalized);
  process.exit(ok ? 0 : 1);
}
