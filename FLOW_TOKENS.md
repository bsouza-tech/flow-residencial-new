# Tokens do site publicado do Flow

Fonte: HTML e CSS baixados em 16/10/2026 de `https://flowresidencial.com.br/`.

- CSS: `/assets/index-CM8F1Yvz.css` (51 682 bytes)
- JS: `/assets/index-BVQDyK7T.js` (269 719 bytes)
- Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` (ícones, não é paleta)

## Variáveis em `:root`

| Token | Valor | Onde |
|---|---|---|
| `--flow-bg` | `#161724` | Fundo da página. `body { background-color: var(--flow-bg) }` |
| `--flow-bg-soft` | `#1b1d2e` | Superfície clara em relação ao fundo (cartões e faixas) |
| `--flow-bg-deep` | `#0f1019` | Fundo profundo e rodapé |
| `--flow-footer-rule` | `#252636` | Linha divisória do rodapé |
| `--flow-page-bg-image` | `url(/BG-LP-Flow.svg)` | Onda de fundo. Não aplicada neste projeto |
| `--flow-page-bg-second-shift-y` | `calc(-1 * min(48vw, 580px))` | Deslocamento da segunda onda |
| `--flow-hero-gradient` | `linear-gradient(to bottom, var(--flow-bg) 0%, var(--flow-bg) 48%, #161724f0 68%, #16172480 84%, transparent 100%)` | Esmaecimento do hero |
| `--flow-scroll-mt` | `5.5rem` | Margem de scroll dos âncoras |
| `--font-vartek` | `"Inter", ui-sans-serif, system-ui, sans-serif` | Fonte de títulos no site do Flow |

## Corpo e seções

`body`: cor `#fff`, fundo `var(--flow-bg)`, imagem `BG-LP-Flow.svg` no topo, `no-repeat`, largura `100vw`, família Manrope.

O vidro do hero `#10121e` não está no CSS. Aparece uma vez no JS, como fundo de cartão.

## Botões

O gradiente dos botões está no JS, três vezes, não no CSS:

`linear-gradient(90deg, #38D6FD 0%, #A855F7 50%, #D633FF 100%)`

Há também `linear-gradient(135deg, #38D6FD 0%, #A855F7 55%, #D633FF 100%)`.

Raios no JS (classes Tailwind): `rounded-full` (20), `rounded-xl` = 12px (8), `rounded-[10px]` (7), `rounded-lg`, `rounded-2xl`, `rounded-3xl`. O pedido deste projeto fixa o raio dos botões em 12px.

O JS usa `uppercase` 15 vezes e tracking `0.14em`, `0.16em`, `0.18em`, `0.2em`, `0.22em`, `tracking-wider` e `tracking-tight`. Não foi aplicado aqui.

## Gradientes que não são botão

No CSS, usados em texto animado e faixas:

- `linear-gradient(90deg,#38d6fd,#818cf8,#c084fc,#e879f9,#2575fc,#38d6fd)`
- `linear-gradient(135deg,#38d6fd,#6366f1,#a855f7,#e879f9,#6366f1,#38d6fd)`
- `linear-gradient(90deg,#7c3aed,#9333ea,#db2777,#e879f9,#7c3aed)`
- `linear-gradient(135deg,#4c1d95,#3a1f71,#6d28d9,#170a30,#4c1d95)`

No JS, cartões roxos: `#4c1d95 → #6d28d9 → #8b5cf6`, `#5b21b6 → #9333ea → #c026d3`, `#581c87 → #7e22ce → #d946ef`.

## Fontes (só relatório)

- Corpo: Manrope
- `h3` e `--font-vartek`: Inter
- O projeto continua com Montserrat Variable e Open Sans Variable

## Divergências em relação à tabela de capturas

| Item | Captura | CSS/JS do site | Decisão |
|---|---|---|---|
| Fundo da página | `#151724` | `#161724` | Vale o CSS |
| Rodapé | `#10101a` | `#0f1019` (`--flow-bg-deep`) | Vale o CSS |
| Vidro do hero | `#10121e` | `#10121e` no JS | Igual |
| Realce ciano | `#52bdfb` | `#38d6fd` | Vale o CSS |
| Gradiente do botão | `#df409f` / `#e577f9` / `#8f45ef` | `#38D6FD` / `#A855F7` / `#D633FF` | O pedido manda o gradiente AA da captura. O do JS fica registrado aqui e não é usado. O fiel da captura está em `--gradiente-botao-fiel`, sem uso |
