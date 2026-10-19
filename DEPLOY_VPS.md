# Deploy na VPS — Flow Residencial

O processo abaixo só prepara e sobe o servidor Node. Não altera o nginx e não aponta o domínio.

## Node

O projeto não pina versão: não há `engines`, `.nvmrc` nem `.mise.toml`. O teste deste documento usou Node **v24.18.1**.

## Instalação

O lockfile é `pnpm-lock.yaml` (pnpm 9). O servidor precisa do pnpm. Com Node 24:

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install
pnpm build
```

`pnpm install` inclui `devDependencies`. O `build` precisa delas (`astro`, Tailwind, TypeScript). Não use instalação só de produção antes do build.

O `build` gera `dist/server/entry.mjs` e `dist/client/`. Não baixa imagens nem chama API externa. `scripts/optimize-images.mjs` não faz parte do `build`; é manual e baixa originais do WordPress.

## Start

Variáveis de ambiente injetadas pelo processo (systemd, por exemplo):

```bash
PORT=4999 HOST=127.0.0.1 node dist/server/entry.mjs
```

Troque `4999` pela porta interna escolhida. Em produção use `HOST=127.0.0.1`.

`pnpm start` executa `node --env-file=.env ./dist/server/entry.mjs`. Esse comando exige que o arquivo `.env` exista. Se as variáveis já estiverem no ambiente do processo, use o `node` direto, sem `--env-file`.

O adapter `@astrojs/node` (standalone) lê `PORT` e `HOST` na hora de subir. Sem `PORT`, o padrão do adapter é 8080. O `8443` em `astro.config.mjs` vale só para `pnpm dev`.

## Variáveis de ambiente

Sem valores.

| Nome | Uso | Obrigatória | Quando é lida |
| --- | --- | --- | --- |
| `DATABASE_URL` | Conexão Neon usada por `/api/leads` e `/api/leads/[id]` | Sim, para gravar lead | Só no servidor, a cada request |
| `PUBLIC_TRACK_ENDPOINT` | Endereço do tracker no HTML | Não | No build (`PUBLIC_*`). Se faltar, o código usa o endereço público padrão |
| `PORT` | Porta de escuta do servidor Node | Não | Na subida do servidor. Padrão do adapter: 8080 |
| `HOST` | Endereço de escuta | Não | Na subida do servidor. Em produção: `127.0.0.1` |

`src/lib/db.ts` também chama `dotenv` e, se existir um arquivo `.env` no diretório de trabalho, carrega essas variáveis em tempo de execução.

## Conferir se subiu

```bash
curl -I http://127.0.0.1:$PORT/
```

A primeira linha deve ser `HTTP/1.1 200 OK`.

## Arquivos estáticos e cache do nginx

O servidor Node entrega o que está em `dist/client/` (cópia de `public/` mais o que o build gerou).

| Prefixo | Hash no nome quando o conteúdo muda |
| --- | --- |
| `/_astro/` | Sim. JS e CSS gerados pelo build levam hash no arquivo |
| `/img/` | Não. Arquivos fixos em `public/img/` |
| `/favicon.ico`, `/favicon-32.png` | Não |
| `/apple-touch-icon.png` | Não |
| `/icon-192.png`, `/icon-512.png` | Não |
| `/og-flow-residencial.jpg` | Não |
| `/robots.txt` | Não |
| `/sitemap.xml` | Não |
| `/consent.js` | Não |
| `/tracker.js` | Não |

## sharp

`sharp` está em `devDependencies`. O `pnpm install` baixa o binário nativo. O script `pnpm build` não chama `sharp`. O servidor gerado importa `sharp` só se o serviço de imagem do Astro for acionado. As imagens da página vêm de `public/img/` e são arquivo estático. Manter as `devDependencies` instaladas deixa esse binário disponível.

## Arquivos de outro ambiente

Não foram apagados. Podem sair depois, se não forem mais usados:

- `scripts/optimize-images.mjs` — gera `public/img/` a partir do WordPress; não roda no servidor.
- `.env` e `.env.local` — segredos locais. Já estão no `.gitignore`.
- `public/flow-residencial.png` — está em `public/`, mas nenhum código em `src/` referencia esse arquivo.

`dist/`, `node_modules/` e `.astro/` são gerados no servidor. `package-lock.json` está no `.gitignore` porque o gerenciador é o pnpm.

## Pontos de atenção

- O domínio canônico no código e em `astro.config.mjs` (`site`) é `https://flowresidencial.com.br`. O nginx só deve passar a apontar para esta porta depois que este servidor estiver no ar ao lado do site antigo.
- O banner de cookies não vem no HTML da primeira resposta. `ConsentBanner` está com `client:only="react"` e só aparece depois do JavaScript.
- Sem `DATABASE_URL`, as rotas de lead existem e respondem erro de validação ou erro interno. Não retornam 404 de rota ausente.
- `pnpm start` falha se o arquivo `.env` não existir, por causa de `--env-file=.env`.
