# Mapa de dados — Bellavista copiado → Flow Residencial

Inventário feito antes da troca, sobre o código copiado. "Linha" é a posição nessa leitura. Valores do Flow vêm de `FLOW_DOCUMENTACAO.md` ou dos parâmetros desta tarefa.

Parâmetros usados: Pixel `1223545735802817`; WhatsApp `https://link.genesisempreendimentos.com.br/flow-whatsapp-lp`; `SITE_KEY` vazio (`depois`); imagens `wp`. Coordenada geocodificada, precisão de rua, marcada A CONFIRMAR em `FLOW_PENDENCIAS.md`.

## Identidade

| Arquivo | Linha | Bellavista | Flow |
|---|---|---|---|
| `package.json` | 2 | `solar-bellavista` | `flow-residencial` |
| `src/data/leadForm.ts` | 1 | `EMPREENDIMENTO = Solar Bellavista` | `Flow Residencial` |
| `src/pages/api/leads.ts` | 65 | `origem_detalhe` literal `'SIE'` (os docs do repo citavam `landing-solar-bellavista`) | `landing-flow-residencial` |
| `src/components/sections/FloorPlans.tsx` | 91 | `sessionStorage` `bellavista-selected-plan` | `flow-selected-plan` |
| `astro.config.mjs` | 39 | `https://solarbellavista.com.br` | `https://flowresidencial.com.br` |
| `src/data/site.ts` | 5 | `TRACKING_SITE_KEY` `7fc802850e514adebbcff882c27f5976` | vazio |

Não havia `localStorage` com o nome do empreendimento. A política de privacidade permanece `https://genesisempreendimentos.com.br/politicas/`.

## SEO

| Arquivo | Linha | Bellavista | Flow |
|---|---|---|---|
| `src/layouts/BaseLayout.astro` | 17 | title `Solar Bellavista \| Teresópolis` | `Flow Residencial em Teresópolis \| Plantas e Lazer \| Gênesis` |
| mesmo | 18 | description de conforto e lazer | meta sugerida do documento |
| mesmo | 24–26 | canonical e `og:image` `og-solar-bellavista.jpg` | `https://flowresidencial.com.br/` e `og-flow-residencial.jpg` |
| mesmo | 131–139 | alt e `og:site_name` Solar Bellavista | Flow Residencial |
| mesmo | 32–56 | JSON-LD `ApartmentComplex` + `Organization` | nome, endereço e telefone da Gênesis; geo A CONFIRMAR |
| `public/robots.txt` | 4 | sitemap solarbellavista | flowresidencial.com.br |
| `public/sitemap.xml` | 4 | loc solarbellavista | flowresidencial.com.br |

## Pixel, WhatsApp, endereço

| Arquivo | Linha | Bellavista | Flow |
|---|---|---|---|
| `src/lib/metaPixel.ts` | 1 | `1297671708798854` | `1223545735802817` |
| `src/components/sections/ConversionCTA.tsx` | 305, 394 | `content_name: Solar Bellavista` | `Flow Residencial` |
| `src/scripts/formulario-global.ts` | 37, 45 | idem | idem |
| `ConversionCTA.tsx` | 681 | `solar-bellavista-whatsapp` | `flow-whatsapp-lp` |
| `src/data/pointsOfInterest.ts` | 20–27 | Av. Melvin Jones, 1000, Meudon, CEP 25954-220, `-22.4128`, `-42.9659` | Rua João Batista Vaz, 165, N. S. de Fátima, CEP 25961-355; lat/lng A CONFIRMAR |
| mesmo | 29–86 | 7 pontos de interesse | `[]` SEM DADO |

## Textos nos componentes

| Arquivo | O que era | Flow |
|---|---|---|
| `Hero.tsx` | título "Um lugar para viver bem todos os dias.", eyebrow Solar Bellavista, botão "Quero conhecer" | chamada e texto confirmados; botão "Receber condições"; segundo botão "Ver plantas" mantido (não havia texto do Bellavista nele) |
| `Benefits.tsx` | "O Bellavista", heading e parágrafo próprios, 4 cards com descrição | eyebrow "Flow Residencial", h2 "Destaques" (rótulo confirmado no menu; o documento não tem outro título de seção), descrições ocultas |
| `FloorPlans.tsx` | "Conheça as tipologias do Bellavista." | título e texto de apoio confirmados; metragem, quartos, banheiros e disponibilidade ocultos |
| `Gallery.tsx` | "Veja como é viver no Bellavista." e "Áreas internas" | "Conheça cada ambiente do Flow" e a instrução da faixa; rótulo "Áreas internas" oculto (SEM DADO) |
| `Amenities.tsx` | "Benfeitorias e lazer" e parágrafo que cita piscina | "Seu condomínio com lazer e infraestrutura"; parágrafo oculto (a coluna "Comunicação sugerida" não é texto do site) |
| `Location.tsx` | texto de Meudon | chamada e descrição confirmadas; link do Google Maps do documento |
| `ConversionCTA.tsx` | já tinha "Fale com um especialista", "Pronto para realizar o seu sonho?" e "Receber condições exclusivas" | nome do empreendimento trocado dentro do modal, do WhatsApp e do agradecimento |
| `AboutGenesis.tsx` | texto, selos e números da Gênesis | mantidos; só o alt da foto |
| `Footer.tsx` | Instagram/Facebook MeuApeSolar; parágrafo legal com matrícula 14.706 | assinatura confirmada; redes e telefone da Gênesis; crédito Renata Pessôa de Rezende; legal do Bellavista removido |
| `Header.tsx` | "Benefícios", "Tenho interesse", logo `solar-bellavista` | "Destaques", "Receber condições", logo `flow-logo`. Âncoras iguais |

## Constantes `src/data`

| Arquivo | Bellavista | Flow |
|---|---|---|
| `benefits.ts` | 4 itens com descrição | 3 títulos, `description: null` |
| `floorPlans.ts` | Ponta, Meio, PCD, Garden, com m² | Estúdio, Double Suíte, Cobertura Double Suíte, Dois Quartos (PCD); números `null` |
| `gallery.ts` | 5 fotos (cozinha, sala, quarto, quarto infantil, varanda) | 18 ambientes, na ordem do documento |
| `amenities.ts` | 8 (gourmet, fitness, quadra, piscina, salão, playground, petplace, praça de jogos) | 9 (Estacionamento omitido) |
| `pointsOfInterest.ts` | 7 lugares | nenhum |
| `certifications.ts`, `genesisStats.ts` | Gênesis | iguais |

## Imagens

Grupo A, específico do Bellavista, apagado e regerado: fachada, fachada-dois, galeria, lazer, plantas, logo `solar-bellavista`, Open Graph, favicons.

Grupo B, mantido: `iso-9001`, `nivel-a`, `pbqp-h`, `caixa`, `genesis-logo`.

Hero continua apontando para `/img/fachada-1200` e `/img/fachada-1680`, agora gerados de `main-flow-2.png`. Destaques e Sobre usam `fachada-dois`, gerado de `03.-Fachada-Letreiro-Flow.png`. A mesma foto entra na galeria como "Fachada Letreiro".

## Quantidades e layout

| Seção | Bellavista | Flow | O layout comporta? |
|---|---|---|---|
| Destaques | 4 | 3 | O grid de 4 colunas a partir de 1024px deixa uma célula vazia. Não quebra; a fileira fica incompleta. O CSS não foi mudado. |
| Plantas | 4 | 4 | Igual. As abas já eram 3+1. |
| Lazer | 8 | 9 (10 menos Estacionamento) | Grid de 4 colunas: duas fileiras completas e um card na terceira. Não quebra. |
| Galeria | 5 | 18 | A faixa repete o conjunto 4 vezes (`MARQUEE_FILL`) e duplica para o loop. Com 18 fotos a faixa fica longa e o ciclo mais lento. O lightbox usa o tamanho do array. Não quebra. |
| Pontos de interesse | 7 | 0 | A lista foi ocultada. No desktop a altura do mapa depende da altura do painel, então o mapa fica baixo. Ver `FLOW_PENDENCIAS.md`. |

## Textos legais

Só havia o parágrafo do rodapé (`Footer.tsx`, por volta da linha 184), com a matrícula 14.706 e o aviso de imagens ilustrativas, junto com o crédito da Renata Pessôa de Rezende. Não havia CRECI em outro arquivo. O crédito permanece. O restante está em `FLOW_PENDENCIAS.md`.
