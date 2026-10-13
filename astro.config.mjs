import node from '@astrojs/node';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function publicEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const text = readFileSync(new URL('./.env', import.meta.url), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1 || trimmed.slice(0, eq).trim() !== name) continue;
      return trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    return '';
  }
  return '';
}

const building = process.argv.includes('build');
if (building && publicEnv('PUBLIC_FORMULARIO_GLOBAL') === '1') {
  const base = publicEnv('PUBLIC_FORMS_WIDGET_BASE');
  if (base.includes('localhost') || !base.startsWith('https://')) {
    throw new Error(
      '[formulario] Build interrompido: com PUBLIC_FORMULARIO_GLOBAL=1, PUBLIC_FORMS_WIDGET_BASE precisa começar com https:// e não pode conter localhost.',
    );
  }
}

export default defineConfig({
  site: 'https://solarbellavista.com.br',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  server: {
    host: true,
    port: parseInt(process.env.PORT || '8443', 10),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
