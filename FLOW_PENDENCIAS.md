# Flow Residencial — pendências

O que falta fornecer antes de publicar. Nada disto foi inventado nem copiado do Bellavista.

## Coordenada — A CONFIRMAR

Serviço: **Nominatim** (OpenStreetMap), consulta em 16/10/2026.

Consulta: `Rua João Batista Vaz 165, Nossa Senhora de Fátima, Teresópolis, RJ, 25961-355, Brazil`.

Resultado: um único ponto, `addresstype: road`, via OSM `way/524971078`, nome "Rua João Batista Vaz".

| | Valor |
|---|---|
| Latitude usada no mapa e no JSON-LD | `-22.433223` |
| Longitude usada no mapa e no JSON-LD | `-42.9759936` |
| Precisão | Centro da rua, não o número 165 |
| CEP devolvido pelo OSM | `25961-110` |
| CEP do empreendimento | `25961-355` |

Não há nó de número predial nesse retorno. O Overpass, usado para procurar `addr:housenumber`, respondeu 502. O mapa e o JSON-LD usam esse centro de rua até você confirmar o ponto do 165.

## Textos legais removidos (eram do Bellavista)

Parágrafo que estava no rodapé e foi retirado, exceto o crédito do projeto, que o documento do Flow confirma:

> Todas as imagens são meramente ilustrativas. O projeto arquitetônico, as numerações das unidades, as cores, os detalhes da fachada e as ilustrações artísticas poderão sofrer alterações. A decoração, os equipamentos da varanda, a mobília e o paisagismo são meras sugestões e não fazem parte das obrigações de entrega do imóvel. As unidades entregues e suas características, bem como o padrão de acabamento, estão discriminados no memorial descritivo arquivado no memorial de incorporação devidamente registrado na matrícula 14.706 no Cartório do 1° Ofício - Registro do Imóveis da comarca de Teresópolis - RJ.

Falta o texto do Flow para: aviso de imagens meramente ilustrativas, memorial descritivo, registro de incorporação e matrícula, condições de venda. Não havia CRECI no código do Bellavista.

O crédito mantido, porque o documento do Flow o publica: Renata Pessôa de Rezende, CAU/RJ A33148-1.

## Item omitido

- **Estacionamento** (lazer): está na lista confirmada, mas não há foto correspondente na galeria. O card não entrou.

## Campos ocultos por SEM DADO

- Descrição dos 3 destaques.
- Metragem, quartos, banheiros, vagas e disponibilidade das 4 plantas. O botão "Consultar disponibilidade" saiu. O botão "Tenho interesse nesta planta" permanece, porque abre o formulário e não afirma disponibilidade.
- Pontos de interesse e distâncias. O mapa mostra só o empreendimento. O painel da lista foi ocultado; o endereço e o link do Google Maps ficam.
- No desktop (a partir de 1024px) a altura do mapa é 100% da linha, e a linha acompanha a altura do painel. Sem os cards, o mapa fica baixo. O CSS não foi alterado. Se quiser a altura de antes, diga como prefere resolver.

## Não aplicados (desenho do site antigo do Flow)

- `SR-GN-Email-Banner-Interno-732-x-90-px.png` (faixa Gênesis e Caixa)
- `GN-Flow-Plantas.png`
- `gen.svg`
- `selo-00.svg`
- `BG-LP-Flow.svg`
- `iso-9001.png` e `nivel-A.png` do WordPress do Flow (o projeto já usa os selos comuns da Gênesis)

## Outros dados que o documento não traz

- Metragem, quartos, banheiros, vagas, preço, número de unidades, torres, estágio da obra.
- `SITE_KEY` do tracker: ficou vazio, a pedido. A tag sai com `data-site-key` sem valor; o `tracker.js` retorna antes de registrar visita.
- Paleta do documento do Flow era provisória. O tema escuro aplicado usa o CSS público do site (`--flow-bg` e afins), não aquela paleta. As fontes do projeto não foram trocadas (continuam Montserrat e Open Sans).

## Visual do Flow ainda não aplicado

Medido no CSS e no JS publicados em 16/10/2026 (`assets/index-CM8F1Yvz.css` e `assets/index-BVQDyK7T.js`). Não entrou neste tema, a pedido.

- Cartões roxos. Gradientes no JS: `linear-gradient(135deg, #4c1d95 0%, #6d28d9 48%, #8b5cf6 100%)`, `linear-gradient(135deg, #5b21b6 0%, #9333ea 45%, #c026d3 100%)`, `linear-gradient(135deg, #581c87 0%, #7e22ce 40%, #d946ef 100%)`. Na tabela de capturas: destaques `#501d9c` a `#5a22b3`, plantas `#431d82` a `#3b1f73`.
- Palavras dos títulos com gradiente animado. No CSS: `linear-gradient(90deg,#38d6fd,#818cf8,#c084fc,#e879f9,#2575fc,#38d6fd)` e `linear-gradient(135deg,#38d6fd,#6366f1,#a855f7,#e879f9,#6366f1,#38d6fd)`.
- Ondas de fundo `BG-LP-Flow.svg`. No CSS: `--flow-page-bg-image: url(/BG-LP-Flow.svg)`, repetição `no-repeat`, tamanho `100vw`, deslocamento `--flow-page-bg-second-shift-y: calc(-1 * min(48vw, 580px))`.
- Caixa alta e espaçamento de letras dos botões do Flow (`uppercase` 15 vezes no JS; `tracking-[0.14em]`, `tracking-[0.22em]`, `tracking-wider`). Não aplicados: tamanho, peso e caixa do texto dos botões deste projeto ficaram como estavam.
- Gradiente de botão que o JS do Flow realmente usa: `linear-gradient(90deg, #38D6FD 0%, #A855F7 50%, #D633FF 100%)`. O botão deste projeto usa o gradiente AA pedido (`--gradiente-botao`). O gradiente fiel da captura está só no token `--gradiente-botao-fiel`, sem uso.
