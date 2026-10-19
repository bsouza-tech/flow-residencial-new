# Flow Residencial

Landing page institucional do empreendimento Flow Residencial.

Stack: **Astro 7** + **React 19** (islands) + **Tailwind CSS v4** + **Neon Postgres** (leads).

## Requisitos

- Node.js 22+
- pnpm 10+
- Variável `DATABASE_URL` (Neon GêLeads — connection pooled)
- Variável `PUBLIC_TRACK_ENDPOINT` (Edge Function `/track` do Supabase) — **obrigatória no build/deploy**, pois a página `/` é `prerender = true` e valores `PUBLIC_*` são embutidos no HTML em tempo de build

## Começar

```bash
cp .env.example .env
# edite DATABASE_URL com a connection string do Neon
# edite PUBLIC_TRACK_ENDPOINT com a URL da Edge Function /track
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
