# Flow Residencial

Landing page institucional do empreendimento Flow Residencial.

Stack: **Astro 7** + **React 19** (islands) + **Tailwind CSS v4** + **Neon Postgres** (leads).

## Requisitos

- Node.js 22+
- pnpm 10+
- Variável `DATABASE_URL` (Neon GêLeads — connection pooled)
- Variáveis de tracking em runtime: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_ID=3` (e `TRUST_PROXY=true` atrás do Nginx)

## Começar

```bash
cp .env.example .env
# edite DATABASE_URL com a connection string do Neon
# edite SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SITE_ID=3
pnpm install
pnpm dev
```

Abre em `http://localhost:8443` (ou a porta definida em `$PORT`).

## Scripts

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento (Node + API) |
| `pnpm build` | Build SSR/Node em `dist/` |
| `pnpm preview` | Preview do build Node |
| `pnpm format` | Formatação com oxfmt |

## Leads (Neon)

Tabela: `leads` (projeto GêLeads), com `empreendimento_interesse = 'Flow Residencial'`.

- `POST /api/leads` — cadastro básico (nome, e-mail, telefone)
- `PATCH /api/leads/:id` — salva uma etapa do wizard (`step` 1–8) ou marca `whatsapp_clicked`

Fluxo do modal: cadastro → **Quase lá** → wizard (sem sair; cada etapa salva/atualiza no Neon) → sucesso.

## Tracking (acessos_user)

Pageviews em `acessos_user` via mesma origem (`SITE_ID=3`):

- `POST /api/tracking` — entrada
- `POST /api/tracking/saida` — saída (sendBeacon)
- `PATCH /api/tracking/consentimento` — promove `pendente` → `aceito`

## Estrutura

```
src/
  pages/index.astro          # Página principal (prerender)
  pages/api/leads*           # API de leads
  layouts/BaseLayout.astro
  styles/global.css
  components/
  data/leadForm.ts           # Opções do wizard
  lib/db.ts                  # Client Neon
  lib/leadsApi.ts            # Client HTTP do formulário
public/
```

## Notas

- Componentes interativos usam `client:only="react"`.
- Nunca commite `.env` — use secrets no deploy.
- Alias `@/` aponta para `src/`.
