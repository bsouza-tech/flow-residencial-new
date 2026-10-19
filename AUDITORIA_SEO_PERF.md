# Auditoria SEO e desempenho — Flow Residencial

Documento factual. Medições em **build de produção** (`astro build` + `node ./dist/server/entry.mjs`) em `http://127.0.0.1:4999`, **sem** `DATABASE_URL` e **sem** `--env-file=.env`.  
Artefatos temporários: `C:\Users\bs902\AppData\Local\Temp\flow-residencial-audit-20261002-162620\`.  
Lighthouse CLI: `npx lighthouse@12.8.2` + Chrome `C:\Program Files\Google\Chrome\Application\chrome.exe`.

---

## 1. Lighthouse em produção

### Resumo das categorias e métricas

| | Mobile | Desktop |
|--|--:|--:|
| Performance | **55** | **82** |
| Accessibility | 92 | 92 |
| Best Practices | 93 | 96 |
| SEO | 100 | 100 |
| FCP | 5720 ms | 1088 ms |
| LCP | 11233 ms | 1383 ms |
| TBT | 247 ms | 0 ms |
| CLS | 0 | **0.236** |
| Speed Index | 6581 ms | 1105 ms |
| Transfer total | **3874 KB** (~3,8 MB) | **7044 KB** (~6,9 MB) |

### Elemento do LCP

| Form factor | Seletor | Detalhe |
|--|--|--|
| Mobile | `section#hero > … > p.hero__text` | Texto do hero. Fases LCP: TTFB 4%, **Render Delay 96%** (≈10,8 s) |
| Desktop | `section#hero > … > h1.hero__title` | Título do hero. Fases LCP: TTFB 9%, **Render Delay 91%** (≈1,3 s) |

O LCP não é a imagem da fachada: é texto React que só existe depois da hidratação `client:only`.

### 15 maiores requisições

**Mobile**

| KB | Tipo | URL |
|--:|--|--|
| 495,9 | Image | `…/varanda.jpg` |
| 486,0 | Image | `…/fachada-dois.jpg` |
| 412,8 | Image | `…/fachada.jpg` |
| 315,1 | Image | `…/quarto.jpg` |
| 260,5 | Image | `…/sala.jpg` |
| 233,8 | Script | `/_astro/ConversionCTA.LYExT5te.js` |
| 233,3 | Image | `…/quarto-2.jpg` |
| 207,8 | Image | `…/planta.jpeg` |
| 180,0 | Script | `/_astro/client.DI8FUbLA.js` |
| 173,5 | Image | `…/cozinha.jpg` |
| 165,2 | Script | `/_astro/Location.DZ5tntLt.js` |
| 117,5 | Script | `/_astro/gsap.Q46aAQHs.js` |
| 112,2 | Image | `/flow-residencial.png` |
| 42,0 | Font | Open Sans (gstatic) |
| 34,7 | Font | Montserrat (gstatic) |

**Desktop** (top 15 dominado por imagens WP; ConversionCTA JS em 14º com 233,8 KB). Transfer maior porque o scroll/viewport carrega mais amenidades (até ~497 KB cada).

### Imagens (auditorias Lighthouse)

**`modern-image-formats`** — JPG/PNG sem WebP/AVIF (amostra desktop; economia estimada pelo LH):

| URL | Total KB | Wasted KB |
|--|--:|--:|
| varanda.jpg | 495,5 | 165,5 |
| quadra-2.jpg | 496,7 | 155,7 |
| fachada-dois.jpg | 485,5 | 148,4 |
| area-gourmet.jpg | 456,7 | 144,6 |
| playground.jpg | 458,9 | 144,3 |
| fachada.jpg | 412,5 | 138,3 |
| … | … | … |
| flow-residencial.png (mobile) | 112 | 65,3 |

**`uses-responsive-images`** — arquivos muito maiores que o display (desktop, wasted KB):

| URL | Wasted KB | Seletor |
|--|--:|--|
| quadra-2.jpg | 481,9 | `.amenities__card img` |
| playground.jpg | 445,2 | `.amenities__card img` |
| area-gourmet.jpg | 443,0 | `.amenities__card img` |
| fachada-dois.jpg | 420,8 | `.benefits-top img` |
| varanda.jpg | 314,3 | `.gallery__hero-image` |

**`unsized-images`** (1):

- `div.floorplans__visual … > img` → `planta.jpeg` sem `width`/`height` no markup.

**`uses-optimized-images`**: presente no relatório bruto; itens detalhados sobrepostos a modern/responsive — ver JSON completo.

### Render-blocking

| Recurso | Mobile wastedMs | Desktop wastedMs |
|--|--:|--:|
| fonts.googleapis.com CSS | 903 | 368 |
| `/consent.js` (sem `defer`) | 310 | 88 |
| `/_astro/index.*.css` | 460 | (listado; sem wastedMs explícito) |
| `/_astro/Location.*.css` (Leaflet CSS) | 610 | 128 |

### JavaScript não usado (por arquivo)

| Arquivo | Total KB | Wasted KB |
|--|--:|--:|
| `Location.DZ5tntLt.js` (Leaflet incluso) | 164,9 | ~85 |
| `client.DI8FUbLA.js` (React runtime) | 179,7 | ~82–84 |
| `gsap.Q46aAQHs.js` | 117,2 | ~48 |

### Cache (`uses-long-cache-ttl`)

| Origem | cacheLifetimeMs (LH) | Nota |
|--|--:|--|
| `wp.flowresidencial.com.br` imagens | 604800000 (7 dias) | OK relativo |
| Assets locais Node (`/_astro/*`, `/flow-residencial.png`) | auditados como curtos / `max-age=0` no header HTTP | ver §9 |

### Forced reflow

Score da auditoria: **0** (há forced reflow). Origens principais:

| Arquivo | Coluna / linha (bundle) | Reflow (ms, desktop) |
|--|--|--:|
| `client.DI8FUbLA.js` | line 1, col 1343 | **37,9** (top call) |
| `gsap.Q46aAQHs.js` | várias (ex. col 53661) | até **37,2** |
| `Location.DZ5tntLt.js` | várias | até **6,3** (desktop) / **19,8** (mobile) |
| `ConsentBanner.BEYdsJwZ.js` | line 0, col 591 | **5,5** |

`consent.js` / `tracker.js` **não** aparecem como origem de forced reflow no insight.

### Long tasks (mobile)

| URL | Duração |
|--|--:|
| `gsap.Q46aAQHs.js` | 235 ms |
| `client.DI8FUbLA.js` | 102 / 77 / 51 ms |
| `gsap…` | 55 ms |
| Unattributable | 50 ms |

Desktop: auditoria de long tasks sem itens na tabela exportada (`items: []`); TBT = 0.

### Cookies de terceiros

Auditoria `third-party-cookies`: score **1**, **items vazios** nesta execução (consentimento não concedido → Meta Pixel não carregou). Cookies nomeados: **não encontrados** nesta corrida.

### Acessibilidade — falhas

1. **`aria-allowed-attr`** — `button.location__poi-card` com `role="listitem"` e `aria-pressed="false"`: `aria-pressed` não permitido nesse role.  
2. **`aria-allowed-role`** — mesmo botão: `role="listitem"` não permitido em `<button>`.  
3. **`color-contrast`**  
   - Link do consent banner: o azul do modelo sobre branco, razão **3,7:1** (exige **4,5:1**).  
   - Texto do painel de POIs: `#688b8d` sobre `#ffffff`, razão **3,7:1** (exige **4,5:1**).  
4. **`label-content-name-mismatch`** (desktop) — `a.hero__scroll` com `aria-label="Ir para a próxima seção"` cujo texto visível não está no nome acessível.

### Best Practices — falhas

| ID | Detalhe |
|--|--|
| `errors-in-console` | 404 em `/favicon.ico` |
| `font-size` (mobile) | Texto dinâmico com tamanho &lt; 12px (fonte “dynamic” no LH) |

---

## 2. Custo dos scripts de tracking

| Script | Transfer | Bootup-time no LH | Forced reflow | Long tasks |
|--|--:|--|--|--|
| `/consent.js` | 3,5 KB | **não listado** em bootup-time | **não** | **não** |
| `/tracker.js` | 15,9 KB (`defer`) | **não listado** | **não** | **não** |

Observações:

- `consent.js` é **render-blocking** (script síncrono no `<head>`): mobile ~310 ms / desktop ~88 ms no insight.
- `tracker.js` tem `defer`; não bloqueia parse da mesma forma.
- Nenhum dos dois aparece como origem de forced reflow (diferente de `ConsentBanner.*.js` React, que sim).
- Meta Pixel / `fbevents.js`: **não carregados** nesta corrida (consentimento não granted).

---

## 3. Imagens

### Inventário (arquivos referenciados no código)

Soma dos arquivos baixados/medidos: **7631 KB (~7,5 MB)** em **24** assets (WP + logo local). Flags `flagcdn.com` dinâmicas e tiles OSM não entram neste inventário de assets de conteúdo.

| Asset | Formato | Dimensões | KB | Uso | width/height | loading | fetchpriority | decoding | alt |
|--|--|--|--:|--|--|--|--|--|--|
| fachada.jpg | jpg | 1680×1263 | 412,5 | Hero CSS `background-image` | n/a (CSS) | n/a | n/a | n/a | n/a |
| fachada-dois.jpg | jpg | 1680×1263 | 485,5 | Benefits + AboutGenesis `<img>` | sem | lazy | — | async | sim |
| galeria (5 JPG) | jpg | 1680×1263 | 173–496 | Gallery | sem | eager | high no 1º | async | sim (hero); vazio no strip |
| amenidades (8 JPG) | jpg | 1680×1263 | 278–497 | Amenities | sem | lazy | — | async | sim |
| plantas (3 arquivos) | jpeg | (medido nos downloads) | ~208+ | FloorPlans | sem (LH unsized) | lazy | — | async | sim |
| certificações PNG | png | 1080×1080 | 474–514 | Certifications | sem | lazy | — | async | sim |
| logo Genesis | png | (footer) | medido no inventário | Footer | 220×56 | lazy | — | async | sim |
| `/flow-residencial.png` | png | 1000×1000 | 112 | Header | 180×72 | — | — | — | sim |

Exibição CSS: hero full-bleed; galeria/amenities tipicamente bem menores que 1680px de largura (LH aponta dezenas/centenas de KB desperdiçados).

### Estimativa WebP/AVIF (cópia só em TEMP)

| Fonte | Original | WebP max-width 1200 q80 | AVIF max-width 1200 q50 |
|--|--:|--:|--:|
| `varanda.jpg` 1680×1263 | 495,5 KB | **233,7 KB** (−52,8%) | **152,6 KB** (−69,2%) |
| `nivel-A.png` 1080×1080 | 513,6 KB | **51,9 KB** (−89,9%) | não medido nesta linha |

Arquivos:  
`…\images\varanda-1200.webp`, `…\images\varanda-1200.avif`, `…\images\estimate-1200.webp`.

---

## 4. Renderização e hidratação

Fonte: `src/pages/index.astro`.

| Componente | Diretiva | window/document/GSAP/Leaflet no módulo? | Abaixo da dobra? |
|--|--|--|--|
| Header | `client:only="react"` | usa `window`/`document` em effects | não (fix) |
| MetaPixelTracker | `client:only="react"` | `window`/`document` | n/a |
| ConsentBanner | `client:only="react"` | `window.GenesisConsent` no render | overlay |
| Hero | `client:only="react"` | GSAP + SplitText + ScrollTrigger scrub | não |
| Benefits | `client:only="react"` | motion via libs GSAP | parcial |
| FloorPlans | `client:only="react"` | GSAP + document | sim |
| Gallery | `client:only="react"` | timers/`matchMedia` | sim |
| Amenities | `client:only="react"` | motion | sim |
| Location | `client:only="react"` | **Leaflet** (`import L from 'leaflet'`) | sim |
| ConversionCTA | `client:only="react"` | document/window | sim |
| AboutGenesis | `client:only="react"` | GSAP counters | sim |
| Certifications | `client:only="react"` | motion | sim |
| Footer | `client:only="react"` | `window.GenesisConsent` | sim |

Imports GSAP/Leaflet no topo dos módulos das islands impedem SSR útil dessas trees — coerente com `client:only`.

### HTML cru (`curl` `/`, sem JS)

| Item | Valor |
|--|--|
| `<title>` | Flow Residencial \| Teresópolis |
| `<h1>` / `<h2>` | **0** (outline vazio) |
| Texto “visível” aproximado | **59** caracteres: título + skip-link |
| `astro-island` | 31 marcadores |
| Conteúdo de seções | só placeholders de island — **não** há copy da landing no HTML |

**Conclusão:** sim, uma landing de conteúdo estático **poderia** sair no servidor (Astro já tem `prerender = true`), mas hoje **todo** o conteúdo de marketing está atrás de `client:only="react"`. Crawlers sem JS veem quase nada. A nota SEO 100 do Lighthouse reflete a página **após** executar JS.

---

## 5. Camadas e animações (suspeitas de Layerize)

| Achado | Arquivo:linha | Escopo |
|--|--|--|
| `will-change: transform, opacity` | `src/styles/global.css:125` | cada `.split-char` do SplitText (muitos nós no H1) |
| `will-change: opacity` / `transform` | `Gallery.tsx:233`, `:306` | hero da galeria + faixa animada |
| `translate3d` keyframes | `Gallery.tsx:359–360` | marquee horizontal contínuo |
| `mask-image` | `Gallery.tsx:299–300` | faixa da galeria |
| `backdrop-filter` | Header:158–159; Lightbox:172,320; FloorPlans:569; ConversionCTA:1209 | header sticky/fixed, modais |
| `mix-blend-mode: screen/normal` | Header:199,204 | logo/brand |
| `position: fixed` | index.astro:44 (skip-link); Header:137,364; ConsentBanner:106 | chrome UI |
| `filter: drop-shadow` | Location:233; Certifications:136 | ícones/cards |
| `background-attachment` | **não encontrado** | — |
| `clip-path` | **não encontrado** | — |
| `translateZ` explícito | **não encontrado** (há `translate3d`) | — |

### GSAP

| Item | Evidência |
|--|--|
| ScrollTrigger registrado | `src/lib/gsap.ts` |
| `scrub: true` | `Hero.tsx:34` (parallax `.hero__media`) |
| `pin` | **não encontrado** |
| SplitText | Hero + `animateIntro.ts` — anima **por caractere** |
| Scroll reveals | `animateReveal.ts` / `useSectionMotion.ts` em várias seções |
| Contadores | AboutGenesis `gsap.to` |
| `pointerover` / `mouseenter` animados | **não encontrado** como handlers de animação |
| `requestAnimationFrame` | `LocationMap.tsx:116` (resize do mapa) |
| Lenis / smooth scroll lib | **não encontrado** |

Impacto Layerize: muitas camadas promocionadas (`will-change` em chars + gallery + backdrop-filter no header) + scrub no hero + mapa Leaflet.

---

## 6. Fontes e CSS

| Item | Valor |
|--|--|
| Carregamento | `@import url('https://fonts.googleapis.com/...')` em `src/styles/global.css:1` |
| Famílias | Montserrat (300–800 + italic 400), Open Sans (400–600) |
| `font-display` | `display=swap` na URL do Google Fonts |
| `preload` de fontes | **não encontrado** |
| CSS global build | `/_astro/index.54WAtazZ.css` ≈ **10,4 KB** |
| CSS Location/Leaflet | `/_astro/Location.BgX4OC_Y.css` ≈ **15,1 KB** — linkado no HTML inicial |
| Bloqueio de render | Google Fonts CSS + CSS Astro + `consent.js` (§1) |

---

## 7. JavaScript do cliente (`dist/client/_astro/`)

| Arquivo | KB | Conteúdo relevante |
|--|--:|--|
| ConversionCTA.*.js | 233,5 | formulário / wizard |
| client.*.js | 179,7 | **React** runtime |
| Location.*.js | 164,9 | **Leaflet** + seção |
| gsap.*.js | 117,2 | **GSAP** + plugins registrados |
| FloorPlans / Gallery / Header / … | &lt;20 cada | seções |
| react.*.js | 7,9 | helper React Astro |

**Leaflet e GSAP no carregamento inicial?**  
Sim, nesta arquitetura: todas as islands usam `client:only="react"` e o HTML referencia os scripts das seções (incluindo Location e o chunk compartilhado `gsap.*.js`). O usuário paga Leaflet (~165 KB) e GSAP (~117 KB) mesmo sem rolar até o mapa. Unused-JS do LH confirma ~85 KB desperdiçados só em Location.

---

## 8. SEO on-page (HTML cru)

| Campo | Valor |
|--|--|
| `<title>` | Flow Residencial \| Teresópolis (**30** chars) |
| meta description | 126 chars (presente) |
| canonical | **não encontrado** |
| og:title / og:description | presentes |
| og:image / og:url / og:type | **não encontrados** |
| twitter:* | **não encontrados** |
| meta robots | **não encontrado** |
| `lang` | `pt-BR` |
| viewport | presente |
| theme-color | **não encontrado** |
| favicon / apple-touch-icon | **não encontrados** (404 `/favicon.ico`) |
| JSON-LD | **não encontrado** |
| Outline H1–H6 no HTML cru | **vazio** (0 h1) |
| Imagens sem alt no HTML cru | n/a (imagens só após JS); no código: strip da Gallery e thumbs lightbox com `alt=""` |
| Links sem texto | **não medido** no HTML cru (sem nav real) |
| `robots.txt` | **404** (HTML Astro 404) |
| `sitemap.xml` | **404** |
| URL inexistente | **404** `text/html` (página Astro padrão) |

Nota SEO Lighthouse 100 ≠ HTML indexável completo: o LH executa JS.

---

## 9. Headers do servidor Node

Observado em todos os assets locais testados (`/`, `/_astro/*.js`, `/_astro/*.css`, `/flow-residencial.png`, `/consent.js`):

```
Cache-Control: public, max-age=0
```

Mais: `ETag`, `Last-Modified`, `Accept-Ranges`.  
**Nginx/CDN precisará** definir cache longo para `/_astro/*` (hashed) e imagens estáticas; HTML pode permanecer curto.

---

## 10. Pontos de atenção

1. **Peso**: ~3,8 MB (mobile) / ~6,9 MB (desktop) transferidos; imagens WP ~1680px JPG/PNG sem srcset/WebP.  
2. **LCP = Render Delay**: conteúdo hero só após React + GSAP; mobile LCP &gt; 11 s.  
3. **`client:only` em tudo**: HTML sem H1/copy — risco SEO real para bots sem JS; nota 100 do LH mascara isso.  
4. **Leaflet + GSAP eager**: chunks grandes no critical path.  
5. **Camadas**: SplitText `will-change` por caractere + gallery `translate3d` + `backdrop-filter` no header — alinhado a custo “Layerize” em traces manuais.  
6. **CLS desktop 0,24** (acima do limiar “bom” 0,1).  
7. **Sem** canonical, og:image, favicon, robots.txt, sitemap, JSON-LD.  
8. **Cache Node `max-age=0`**: ok para preview local; obrigatório corrigir na borda.  
9. **consent.js bloqueante** no head.  
10. A11y nos cards de POI (`role="listitem"` + `aria-pressed`).

---

## Perguntas em aberto

1. Trace DevTools “Layerize 52%” do usuário **não foi reproduzido** nesta auditoria (só Lighthouse + análise estática de CSS/GSAP). Percentual exato por camada: **não medido**.  
2. Nomes de funções minifyadas nos bundles (`client…` col 1343) — mapeamento source-map para símbolo original: **não medido** (source maps off no build).  
3. Comportamento com consentimento **granted** (Pixel + cookies Meta): **não medido** (não interagimos com o banner).  
4. Dimensões CSS exatas de cada `<img>` em cada breakpoint: inferidas pelo LH (displayed*), não reexportamos CSS computado completo.  
5. Tiles OSM e flags `flagcdn` no peso total de sessão longa: **não inventariados** no §3.  
6. Nota SEO 100 vs HTML cru vazio — impacto em Googlebot real: **não medido** (Search Console / URL Inspection fora do escopo).  
7. Performance em rede 4G real / hardware médio BR: Lighthouse é simulação; campo (CrUX): **não medido**.
