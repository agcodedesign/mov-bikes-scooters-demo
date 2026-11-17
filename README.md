# MOV Bikes & Scooters — Landing Page em Astro

## Entrega atual — 16/11/2026

LP estática implementada a partir do **Vitrine Virtual** no Penpot, com imagens WebP e adaptação mobile/tablet. O escopo atual é somente a página inicial. Os documentos 01–03 abaixo registram o planejamento original da plataforma completa.

```powershell
npm ci
npm run dev
```

Para revisar o build:

```powershell
npm run check
npm run build
npm run preview -- --port 4321
# Em outro terminal, com preview ativo:
npx playwright install chromium
npm run qa
node scripts/qa-regressions.mjs
```

Node 22.12+ e npm. Componentes em `src/components/{sections,layout,ui}`, tokens e globais em `src/styles`, configuração comercial em `src/config/site.ts`, página em `src/pages/index.astro`.

17 originais foram preparados em **46 arquivos WebP** em `public/images/{brand,hero,products,editorial,lifestyle,newsletter}`. Originais preservados em `D:\AG-DESIGN\AG_OPERACOES\01_CLIENTES\BIKECELL\ASSETS`. Rode `npm run assets` para reproduzir; outra origem pode ser passada a `node scripts/prepare-assets.mjs 'D:\caminho\ASSETS'`.

Mais **12 variantes WebP ultrawide** e **9 variantes verticais para o hero mobile** foram geradas a partir das fotos existentes (67 WebP no total). Fontes em `assets/source/`; conversão com `npm run assets:ultrawide` e `npm run assets:mobile`. Prompts e dimensões reais em `docs/design/hero-*`.

Motion: abertura escalonada no hero, entradas ao rolar, respostas de botões e ícones e entrada de diálogos. CSS e Web Animations API, respeitando redução de movimento; conteúdo visível sem JavaScript. Validação específica: `node scripts/qa-motion.mjs`.

A direção cinematográfica usa **GSAP + ScrollTrigger** nos três tamanhos: abertura do produto em tela inteira, transições sobrepostas entre capítulos, profundidade e máscaras tipográficas. O hero aceita arraste por mouse e swipe por toque; `node scripts/qa-hero-gestures.mjs` testa eventos reais e preservação do pan vertical. `node scripts/qa-cinematic.mjs` valida cenas, mudanças de tamanho e redução de movimento. Vídeo: `artifacts/qa/mov-cinematic-preview.webm`.

Reenquadramento por transforms com compensação da foto, resposta mais direta no toque e movimento do hero durante o arraste. `node scripts/qa-fluidity.mjs` mede layouts no Chromium local, verifica proporções da foto e reversão da cena; não equivale a benchmark em aparelho físico.

Preloader com o SVG original em `assets/source/brand/preloader.svg`: letras M/O/V desenhadas e preenchidas em sequência, saída ligada à abertura do hero. Sem JS ou com redução de movimento, conteúdo liberado; limite independente de 5 s impede bloqueio por falha de bundle/recurso. `node scripts/qa-preloader.mjs` valida a abertura e os fallbacks. Direção e timings: `docs/design/preloader.md`.

A logo do preloader viaja até a posição da marca no header, onde permanece o WebP próprio fornecido pelo usuário. Footer inclui a assinatura AG original, discreta, de 88 px (72 px no mobile), ligada a https://agcodedesign.netlify.app em nova aba; alvo com 44 px de altura e foco visível.

Copie `.env.example` para `.env` e preencha somente canais oficiais. WhatsApp, Instagram e envio real de inscrição não foram fornecidos: a interface valida dados e informa indisponibilidade, sem confirmação fictícia nem armazenamento local. Refaça o build após alterar variáveis públicas. Não há deploy, banco, checkout ou admin nesta etapa.

- [Handoff e validação da implementação](docs/04-implementation-handoff.md)
- [Manifesto de mídia](docs/assets-manifest.json)
- [Snapshot do Penpot](docs/design/penpot-desktop.json)

## Planejamento inicial — histórico

Visão original de vitrine digital e gestão comercial; as fases futuras abaixo ainda não foram implementadas.

## Estado em 13/11/2026

- Briefing integral analisado; diretório inicialmente vazio, sem código, identidade, fotografias ou cadastro comercial.
- Arquitetura e roteiro de design preparados em `docs/`.
- Paleta informada: `#E7E7E7`, `#FFA300`. Boards Home desktop, tablet e mobile e início do sistema de ativos/tokens no Penpot; telas ainda não aprovadas.
- Frontend, backend e deploy não iniciados. O briefing exige aprovação do design antes dessas etapas.

## Documentação

- [Arquitetura, conteúdo e segurança](docs/01-arquitetura.md)
- [Direção visual e mapa de telas](docs/02-design-penpot.md)
- [Materiais e critérios de entrega](docs/03-entrega.md)

## Próxima etapa

Completar Home tablet/mobile e páginas internas no Penpot. As fotos podem ser importadas depois; fornecer também logo, dados dos modelos e canais oficiais disponíveis. Ausências ficam identificadas; nenhum dado comercial será apresentado como real sem fonte.
