// Procura restos do empreendimento-modelo em um site novo.
// Uso, na raiz do projeto: node scripts/verificar-residuos.mjs
// Lê scripts/valores-do-modelo.json. Sai com código 1 se achar qualquer resto.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cfgPath = path.join(root, 'scripts', 'valores-do-modelo.json');
if (!fs.existsSync(cfgPath)) {
  console.error('Falta scripts/valores-do-modelo.json');
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const termos = (cfg.termos || []).map(String).filter(Boolean);
const ignorarArquivos = new Set((cfg.ignorarArquivos || []).map((f) => path.normalize(f)));
// o verificador e a própria lista de termos nunca contam
ignorarArquivos.add(path.normalize('scripts/verificar-residuos.mjs'));
ignorarArquivos.add(path.normalize('scripts/valores-do-modelo.json'));
const PASTAS_IGNORADAS = new Set(['node_modules', 'dist', '.git', '.astro', '.vercel', '.netlify']);
const TEXTO = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.astro', '.json', '.md', '.css', '.html', '.txt', '.xml', '.svg', '.example', '.toml', '.yml', '.yaml', '']);

const alvos = termos.map((t) => ({ t, re: new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
const achados = [];

function visitar(dir) {
  for (const nome of fs.readdirSync(dir)) {
    if (PASTAS_IGNORADAS.has(nome)) continue;
    const abs = path.join(dir, nome);
    const rel = path.relative(root, abs);
    const st = fs.statSync(abs);
    if (st.isDirectory()) { visitar(abs); continue; }
    if (ignorarArquivos.has(path.normalize(rel))) continue;
    // 1) o NOME do arquivo também conta (ex.: img/fachada-bellavista-1200.webp)
    for (const { t, re } of alvos) if (re.test(nome)) achados.push(`${rel}  (nome do arquivo)  "${t}"`);
    // 2) o conteúdo, só de arquivos de texto
    const ext = path.extname(nome).toLowerCase();
    if (!TEXTO.has(ext) || st.size > 2_000_000) continue;
    const linhas = fs.readFileSync(abs, 'utf8').split('\n');
    linhas.forEach((linha, i) => {
      for (const { t, re } of alvos) if (re.test(linha)) achados.push(`${rel}:${i + 1}  "${t}"`);
    });
  }
}
visitar(root);

if (achados.length) {
  console.error(`\n${achados.length} resto(s) do modelo encontrados:\n`);
  for (const a of achados) console.error('  ' + a);
  console.error('\nTroque ou remova cada um antes de publicar.');
  process.exit(1);
}
console.log(`Nenhum resto do modelo encontrado (${termos.length} termos verificados).`);
