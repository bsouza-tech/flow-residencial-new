# PROJECT_STRUCTURE — Solar Bellavista

Documento factual da estrutura atual do repositório, para planejamento de tracking (pageviews, UTM, leads) e backend em Supabase Edge Functions.

> Gerado por inspeção do código. Onde algo não existe ou não foi encontrado, está marcado como **não encontrado**.

---

## 1. Stack e versões

| Item | Valor no projeto |
| --- | --- |
| Framework | Astro `^7.3.5` (`package.json`) |
| React | `^19.0.0` + `react-dom` + `@astrojs/react` `^7.0.0` |
| Tailwind | v4 via `@tailwindcss/vite` `^4.0.0` + `tailwindcss` `^4.0.0` (plugin Vite, não integração `@astrojs/tailwind`) |
| Adapter | `@astrojs/node` `^11.1.6` (devDependency) |
| Banco / leads | `@neondatabase/serverless` `^1.1.0` + `dotenv` `^18.0.4` |
| Motion / mapa | `gsap` `^3.15.0`, `leaflet` `^1.9.4` |
| Gerenciador de pacotes | **pnpm** (`pnpm-lock.yaml` presente; `.mise.toml` pinna `npm:pnpm = 10.34.3`; README pede pnpm 10+) |
| Node | `.mise.toml` pinna `node = "22"`; README: Node.js 22+ |
| Sitemap | **não encontrado** (`@astrojs/sitemap` ausente) |
| Outras integrações Astro | só `react()` em `astro.config.mjs` |

### `astro.config.mjs` (conteúdo completo)

```js
import node from '@astrojs/node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
```

### Dependências do `package.json`

**dependencies**

- `@astrojs/react` `^7.0.0`
- `@neondatabase/serverless` `^1.1.0`
- `astro` `^7.3.5`
- `dotenv` `^18.0.4`
- `gsap` `^3.15.0`
- `leaflet` `^1.9.4`
- `react` `^19.0.0`
- `react-dom` `^19.0.0`

**devDependencies**

- `@astrojs/node` `^11.1.6`
- `@astrojs/ts-plugin` `^1.10.12`
- `@tailwindcss/vite` `^4.0.0`
- `@types/leaflet` `^1.9.22`
- `@types/node` `^22.0.0`
- `@types/react` `^19.0.0`
- `@types/react-dom` `^19.0.0`
- `oxfmt` `^0.2.0`
- `tailwindcss` `^4.0.0`
- `typescript` `^5.7.0`

**scripts:** `dev`, `build`, `preview`, `start` (`node --env-file=.env ./dist/server/entry.mjs`), `format`

---

## 2. Modo de renderização e deploy

| Item | Valor |
| --- | --- |
| `output` | `server` |
| Adapter | `@astrojs/node` com `mode: 'standalone'` |
| Página `/` | `export const prerender = true` em `src/pages/index.astro` |
| API leads | `export const prerender = false` em `src/pages/api/leads.ts` e `src/pages/api/leads/[id].ts` |
| Hospedagem / plataforma de deploy | **não encontrado** nos arquivos do repo (`vercel.json`, `netlify.toml`, `wrangler.toml`, `Dockerfile`, `_headers`, `_redirects` ausentes na raiz) |
| Inferência fraca de runtime | script `start` aponta para Node standalone em `dist/server/entry.mjs` (compatível com VPS / Node process manager); não há config de plataforma |
| Headers / redirects / CSP | **não encontrado** |
| Middleware Astro (`src/middleware.*`) | **não encontrado** |

---

## 3. Estrutura de pastas

### Árvore `src/` (até 3 níveis)

```
src/
  components/
    layout/          # Header e Footer (React islands)
    sections/        # Seções da landing (Hero, plantas, CTA/formulário, etc.)
    ui/              # Lightbox, mapa Leaflet, ícones de POI
    MetaPixelTracker.tsx  # Observer de scroll → Meta ViewContent
  data/              # Conteúdo hardcoded (TS/JSON): plantas, galeria, leads options, cidades IBGE
  layouts/
    BaseLayout.astro # Layout único: <head>, CSS global, Meta Pixel
  lib/               # DB Neon, API client de leads, Meta Pixel helper, GSAP helpers
  pages/
    index.astro      # Única página HTML
    api/
      leads.ts       # POST criar lead
      leads/[id].ts  # PATCH etapas / whatsapp_clicked
  styles/
    global.css       # Tailwind + tokens/estilos globais
  env.d.ts           # /// <reference types="astro/client" />
```

Outras pastas na raiz relevantes:

- `public/` — assets estáticos (`solar-bellavista.png`)
- `scripts/generate-cities.mjs` — gera `brazilianCities.json` a partir da API IBGE

### Rotas / páginas

| Rota | Arquivo | Dinâmica? | Notas |
| --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | Não | Landing única; `prerender = true` |
| `POST /api/leads` | `src/pages/api/leads.ts` | Endpoint server | Cria lead |
| `PATCH /api/leads/:id` | `src/pages/api/leads/[id].ts` | Dinâmica (`[id]`) | Atualiza etapa ou `whatsapp_clicked` |

Nenhuma outra página em `src/pages/` (sem `/obrigado`, blog, etc.).

---

## 4. Layouts e `<head>`

### Layouts existentes

| Layout | Usado por |
| --- | --- |
| `src/layouts/BaseLayout.astro` | `src/pages/index.astro` (único consumidor) |

Outros layouts: **não encontrado**.

### `BaseLayout.astro` — `<head>` e `<body>`

```astro
---
import '../styles/global.css';
import { META_PIXEL_ID } from '../lib/metaPixel';
// props: title, description (defaults Solar Bellavista)
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <title>{title}</title>
    <!-- Meta Pixel: script is:inline + noscript img -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

- Final do `<body>`: apenas `<slot />` — **sem** scripts globais no rodapé.
- CSS global importado no frontmatter: `../styles/global.css`.

### Onde scripts globais são injetados hoje

1. **Meta Pixel** — `<script is:inline define:vars={{ META_PIXEL_ID }}>` no `<head>` de `BaseLayout.astro` + `<noscript>` com pixel image.
2. **Islands React** — hidratadas por Astro via `client:only="react"` em `index.astro` (scripts de bundle Vite/React, não tags manuais).
3. **Leaflet / GSAP** — carregados como dependências dos islands React (não tags no layout).

---

## 5. Navegação entre páginas (MUITO IMPORTANTE)

| Pergunta | Resposta factual |
| --- | --- |
| View Transitions / `<ClientRouter />` / `<ViewTransitions />` | **não encontrado** no código da aplicação (`src/`) |
| Navegação client-side com router React | **não encontrado** (sem React Router / Astro transitions) |
| Eventos `astro:page-load`, `astro:after-swap`, etc. | **não encontrado** em `src/` |
| Modelo real de navegação | Landing **single-page**: âncoras `#hero`, `#beneficios`, `#plantas`, `#galeria`, `#benfeitorias`, `#localizacao`, `#interesse`, `#sobre`. Header/Footer/Hero usam `href="#..."` |

Consequência para tracking: pageview de rota Astro ocorre tipicamente **uma vez** no load; mudança de seção é scroll na mesma URL.

---

## 6. Scripts e tracking existentes

### Ferramentas

| Ferramenta | Presente? | Onde / como |
| --- | --- | --- |
| Meta Pixel | Sim | ID em `src/lib/metaPixel.ts` (`META_PIXEL_ID`); init + `PageView` no `<head>` de `BaseLayout.astro`; helper `trackMeta()`; `MetaPixelTracker` → `ViewContent`; formulário → `Lead` / `CompleteRegistration` |
| Google Tag Manager | **não encontrado** | — |
| GA4 / gtag | **não encontrado** | — |
| Google Ads | **não encontrado** | — |
| Hotjar | **não encontrado** | — |
| Clarity | **não encontrado** | — |

### Eventos Meta já implementados

| Evento | Quando | Arquivo |
| --- | --- | --- |
| `PageView` | Load (script inline no head) | `BaseLayout.astro` |
| `ViewContent` | Scroll/fim da página (footer IO ou scroll ≥ height−120), **uma vez** | `MetaPixelTracker.tsx` → `trackMeta` |
| `Lead` | Após `createLead` OK (nome/e-mail/telefone) | `ConversionCTA.tsx` |
| `CompleteRegistration` | Após salvar etapa 8 do wizard | `ConversionCTA.tsx` |

`trackMeta` usa `Set` em memória (`firedEvents`) com `once: true` por padrão — não persiste entre reloads; evita double-fire na mesma sessão de página.

### `localStorage` / `sessionStorage` / cookies

| API | Uso |
| --- | --- |
| `sessionStorage` | `FloorPlans.tsx`: `sessionStorage.setItem('bellavista-selected-plan', activePlan.id)` ao clicar interesse na planta. **Leitura (`getItem`) não encontrada** em nenhum outro arquivo. |
| `localStorage` | **não encontrado** |
| Cookies (`document.cookie` / Set-Cookie app) | **não encontrado** no código da aplicação |

### UTM / `gclid` / `fbclid` / referrer

**não encontrado** no frontend ou nas API routes. Nenhum código lê query string de UTM/`gclid`/`fbclid` nem grava referrer.

Observação de schema (via inspeção prévia do Neon GêLeads, não via migration no repo): a tabela `leads` possui colunas `utm_first_*` / `utm_last_*`, mas o `INSERT` atual em `src/pages/api/leads.ts` **não** as preenche — só `origem_tipo = 'site'` e `origem_detalhe = 'landing-solar-bellavista'`.

Código completo de captura UTM/gclid/fbclid/referrer: **não encontrado**.

### Banner de consentimento LGPD

**não encontrado** (sem biblioteca, componente, cookie de consentimento ou gate antes do Pixel).

O Footer liga para política externa:

`https://genesisempreendimentos.com.br/politicas/`

O Pixel carrega no `<head>` sem checagem de consentimento.

---

## 7. Formulário(s) de lead

### Lista

| Formulário | Arquivo | Onde aparece |
| --- | --- | --- |
| Modal de conversão (único) | `src/components/sections/ConversionCTA.tsx` | Seção `#interesse` em `/` (`index.astro`, `client:only="react"`) |

Outros formulários HTML/`<form>`: **não encontrado**.

### Fluxo do modal

1. **basic** — campos `nome`, `email`, `telefone` (DDI/país + máscara nacional).
2. **quase-la** — mensagem + CTA “Completar meu cadastro” + link WhatsApp.
3. **wizard** — 8 etapas (estado civil, filhos, profissão, renda, sexo, cidade+UF, nascimento, perfil).
4. **done** — sucesso.

Durante o wizard o modal fica “travado” (não fecha); cada etapa faz `PATCH`.

### Campos e validação (cliente)

- Basic: nome ≥ 2 chars; e-mail regex; telefone validado por país (`isValidNationalPhone` / `toE164`) em `phoneCountries.ts`.
- Wizard: opções em `leadForm.ts`; cidade obrigatoriamente da lista IBGE + UF; nascimento `DD/MM/AAAA` via `parseBirthDateBR`.

### Envio

Client HTTP: `src/lib/leadsApi.ts`.

#### Código completo do envio (client)

```ts
// src/lib/leadsApi.ts
export async function createLead(payload: BasicLeadPayload) {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) {
    throw new Error(data.error || 'Não foi possível enviar seus dados. Tente novamente.');
  }
  return data.id;
}

export async function saveLeadStep(id: string, step: number, payload: Record<string, string>) {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, ...payload }),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Não foi possível salvar esta etapa. Tente novamente.');
  }
}

export async function markWhatsappClicked(id: string) {
  try {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_clicked: true }),
    });
  } catch {
    // tracking best-effort — não bloqueia abertura do WhatsApp
  }
}
```

#### Trecho do submit básico + conversão Meta

```tsx
const id = await createLead({
  nome: form.nome.trim(),
  email: form.email.trim(),
  telefone: e164,
});
trackMeta('Lead', {
  params: {
    content_name: 'Solar Bellavista',
    content_category: 'formulario_basico',
  },
});
setLeadId(id);
setView('quase-la');
```

#### Após envio

- Sem redirect de página.
- View interna `quase-la` → wizard → `done`.
- Meta: `Lead` no basic; `CompleteRegistration` no fim do wizard.

### Server: `POST /api/leads` (resumo)

Insere em Neon `leads`: `nome`, `email`, `telefone` (E.164), `empreendimento_interesse` (`EMPREENDIMENTO`), `origem_tipo='site'`, `origem_detalhe='landing-solar-bellavista'`, `whatsapp_clicked=false`, `status='ativo'`. Retorna `{ id }`.

### Anti-spam

| Mecanismo | Presente? |
| --- | --- |
| Honeypot | **não encontrado** |
| Captcha / Turnstile / reCAPTCHA | **não encontrado** |
| Rate limit | **não encontrado** |
| CSRF token | **não encontrado** |

Há validação de campos no server e UUID no PATCH.

### CTAs / conversões auxiliares

| CTA | Onde | Evento |
| --- | --- | --- |
| WhatsApp (quase-lá) | `ConversionCTA.tsx` → `https://link.genesisempreendimentos.com.br/solar-bellavista-whatsapp` | `markWhatsappClicked(leadId)` (coluna DB); **sem** evento Meta dedicado |
| “Tenho interesse” / âncoras `#interesse` | Header, Hero, FloorPlans, Footer | Scroll na página; FloorPlans também grava `sessionStorage` da planta |
| Telefone | Footer `tel:+552126421203` | Sem tracking no código |
| E-mail | Footer `mailto:comercial@genesisempreendimentos.com.br` | Sem tracking no código |

---

## 8. Supabase e variáveis de ambiente

### Supabase

**não encontrado** — sem `@supabase/*`, client, Edge Functions no repo, ou vars `SUPABASE_*`.

Backend atual de leads: **Neon Postgres** via `@neondatabase/serverless` (`src/lib/db.ts`).

### Variáveis de ambiente

| Nome | Onde usada | Exposta ao client (`PUBLIC_`)? |
| --- | --- | --- |
| `DATABASE_URL` | `src/lib/db.ts` (`import.meta.env.DATABASE_URL \|\| process.env.DATABASE_URL`); carregada também via `dotenv` `config()`; script `start` usa `--env-file=.env` | Não (sem prefixo `PUBLIC_`; só server) |
| `PORT` | `astro.config.mjs` → `process.env.PORT \|\| '8443'` | N/A (config de server) |

Outras `import.meta.env.*` / `process.env.*` na app: **não encontrado**.

Constantes sensíveis/públicas hardcoded (não env):

- `META_PIXEL_ID` em `src/lib/metaPixel.ts` (ID do Pixel Meta, embutido no bundle/layout).

### `.env.example`

Sim — existe:

```
# Neon (GêLeads) — pooled connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

---

## 9. API routes / endpoints / middleware

### Middleware

**não encontrado** (`src/middleware.ts` / `.js` ausentes).

### Endpoints

#### `POST /api/leads` — `src/pages/api/leads.ts`

- `prerender = false`
- Body JSON: `nome`, `email`, `telefone`
- Valida e normaliza telefone E.164
- INSERT Neon → retorna `{ id }`

#### `PATCH /api/leads/[id]` — `src/pages/api/leads/[id].ts`

- `prerender = false`
- Se `whatsapp_clicked === true` e sem `step`: seta flag
- Se `step` 1–8: atualiza coluna correspondente (`estado_civil`, `filhos`, `profissao`, `renda_familiar`, `genero`, `cidade`+`uf`, `data_nascimento`, `perfil`)
- Retorna `{ ok, id, step? }`

Outro código server-side: adapter Node + `getSql()`; sem SSR de dados dinâmicos na landing além das API routes.

---

## 10. Componentes e conteúdo

### Componentes principais (todos React `.tsx`, islands `client:only="react"` em `index.astro`, exceto layout Astro)

| Grupo | Arquivo | Tipo |
| --- | --- | --- |
| Layout página | `layouts/BaseLayout.astro` | `.astro` (não island) |
| Header | `components/layout/Header.tsx` | island |
| Footer | `components/layout/Footer.tsx` | island |
| Hero | `components/sections/Hero.tsx` | island |
| Benefícios | `components/sections/Benefits.tsx` | island |
| Plantas | `components/sections/FloorPlans.tsx` | island |
| Galeria | `components/sections/Gallery.tsx` | island |
| Lazer / amenities | `components/sections/Amenities.tsx` | island |
| Localização | `components/sections/Location.tsx` (+ `ui/LocationMap.tsx`, `ui/PoiIcons.tsx`) | island |
| Formulário / CTA | `components/sections/ConversionCTA.tsx` | island |
| Sobre Gênesis | `components/sections/AboutGenesis.tsx` | island |
| Certificações | `components/sections/Certifications.tsx` | island |
| Lightbox | `components/ui/ImageLightbox.tsx` | usado por seções |
| Meta Pixel scroll | `components/MetaPixelTracker.tsx` | island |

Nenhum componente de seção em `.astro` além do layout e da página.

### Fonte do conteúdo

| Fonte | Uso |
| --- | --- |
| Hardcoded TS | `data/benefits.ts`, `floorPlans.ts`, `gallery.ts`, `amenities.ts`, `pointsOfInterest.ts`, `certifications.ts`, `genesisStats.ts`, `leadForm.ts`, `phoneCountries.ts` |
| JSON local | `data/brazilianCities.json` (municípios IBGE) |
| Content collections Astro | **não encontrado** (sem `src/content/`) |
| CMS | **não encontrado** |
| API externa de conteúdo | IBGE só no script de geração offline; runtime do form usa JSON local. Logo Gênesis no Footer aponta para URL WordPress `wp.solarbellavista.com.br`. Mapa: tiles Leaflet (terceiro). |

---

## 11. Identidade do site (para o tracking)

| Item | Valor no código |
| --- | --- |
| Nome do empreendimento | `Solar Bellavista` — constante `EMPREENDIMENTO` em `src/data/leadForm.ts` |
| Package / repo name | `solar-bellavista` (`package.json`) |
| Origem lead (detalhe) | `landing-solar-bellavista` (`POST /api/leads`) |
| Origem lead (tipo) | `site` |
| Pixel Meta | constante `META_PIXEL_ID` em `src/lib/metaPixel.ts` |
| Domínio de produção | **não encontrado** como config de site; indícios: asset `https://wp.solarbellavista.com.br/...` (Footer); WhatsApp short-link `link.genesisempreendimentos.com.br/solar-bellavista-whatsapp` |
| Domínios preview/staging | **não encontrado** |
| Site institucional Gênesis | `https://genesisempreendimentos.com.br` |

### Reutilização como base multi-empreendimento

Parcialmente genérico (estrutura Astro/React/Neon), mas **específico deste site** em muitos pontos:

- Textos, imagens e dados em `src/data/*`
- `EMPREENDIMENTO`, `origem_detalhe`, Pixel ID, logo, WhatsApp slug, sessionStorage key `bellavista-selected-plan`
- Conteúdo de seções e SEO defaults no `BaseLayout`

Não há sistema de multi-tenant / env `SITE_SLUG` / config por empreendimento.

---

## 12. Pontos de atenção

### Tracking / pageview

- SPA de âncoras: **um** `PageView` Meta no load; seções não geram pageviews de rota.
- Pixel **sem** gate LGPD — carrega sempre no head.
- `trackMeta(..., { once: true })` default: eventos Meta de conversão não reenviam na mesma carga de página (ok para Lead único; atenção se quiser retestar sem reload).
- `MetaPixelTracker` monta com `client:only` **antes** do Footer no DOM; se `footer` ainda não existir no `useEffect`, o IO pode falhar — há fallback por scroll.
- Página de obrigado dedicada: **não encontrada** (sucesso é view `done` no modal).
- Redirects que stripam query string: **não encontrados** no repo.
- Iframes: **não encontrados** em `src/`.
- Colunas UTM existem no banco GêLeads (contexto operacional), mas **não são populadas** pelo código atual.

### Formulários / leads

- Sem anti-spam / rate limit nas API routes.
- `sessionStorage` da planta selecionada **nunca é lido** nem enviado ao lead.
- WhatsApp marca DB mas não dispara evento Meta próprio.
- Telefone Footer sem tracking.
- API usa Neon connection string server-side; plano Supabase Edge Functions seria **novo** caminho (hoje não há Supabase).

### Inconsistências / dívidas técnicas relevantes

- `output: 'server'` + homepage `prerender = true` + APIs dinâmicas: modelo híbrido de fato, sem `output: 'hybrid'` explícito (Astro 7 `server` + prerender por rota).
- Adapter Node em **devDependencies** (funciona no build local; atenção em installs de produção `pnpm install --prod`).
- README fala “Neon GêLeads”; código não referencia Supabase.
- `bellavista-selected-plan` gravado e não consumido.
- Sem captura de UTM apesar de colunas no schema compartilhado de leads.

---

## Perguntas em aberto

1. Qual é o **domínio de produção** canônico da landing (além do indício `wp.solarbellavista.com.br` / short-link Gênesis)?
2. Onde o site será / é **deployado** (VPS Node, Docker, painel interno Gênesis, etc.)? Não há arquivo de plataforma no repo.
3. O schema completo da tabela `leads` (migrations versionadas) **não está neste repositório** — apenas uso via SQL embutido. Onde vive a fonte da verdade do schema?
4. Há pipeline/CRM que já lê `utm_*` / `whatsapp_clicked` / `geleads_id` fora deste site?
5. Consentimento LGPD será exigido antes do Pixel/outros tags? (hoje não há banner).
6. A chave `sessionStorage` `bellavista-selected-plan` deveria alimentar o lead ou foi abandonada?
7. Escopo do tracking futuro: só Meta + UTM no Neon, ou também GA4/GTM/Supabase analytics?
8. Supabase Edge Functions substituirão as rotas `src/pages/api/leads*`, coexistirão, ou só farão ingestão de pageview/UTM?
9. Existem ambientes staging/preview com Pixel/DB separados? **não encontrado** no código.
10. Versão efetiva de pnpm no CI/deploy (mise pede 10.34.3; ambiente local pode divergir).
