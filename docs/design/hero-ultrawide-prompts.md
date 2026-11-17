# Hero ultrawide — geração v1

Ferramenta: `image_gen` integrada (edição das três fotos existentes, sem CLI/API externa). Saída nativa: **2089 × 753 px**, proporção aproximada 2,774:1. Não foi feito upscale para simular 4K. Variantes WebP em 1280, 1920 e 2089 px.

Origens preservadas: `hero 1.jpg`, `hero 2.jpg`, `hero 3.jpg` em `D:/AG-DESIGN/AG_OPERACOES/01_CLIENTES/BIKECELL/ASSETS`.

Fontes geradas em `assets/source/hero-ultrawide/`, saídas em `public/images/hero/*-ultrawide-v1-*.webp`. Reproduzir conversão: `node scripts/prepare-ultrawide.mjs`. Manifesto: `hero-ultrawide-manifest.json`.

Desktop a partir de 1100 px usa as expansões; tablet/mobile preservam fontes originais via picture/source. A altura desktop permanece 690 px. O objetivo é deixar capacete e ambas as rodas dentro do frame, com área livre para a copy à esquerda. As versões são expansões por IA e foram inspecionadas visualmente.

## Prompt aplicado separadamente às imagens 1, 2 e 3

O marcador `{n}` corresponde ao número da foto fornecida como edit target.

```text
Edit/outpaint the single supplied MOV lifestyle photo, image {n}. This is an EDIT TARGET, not merely inspiration. Create a photorealistic ultra-wide website hero banner, desired canvas 3840 x 1380 pixels, aspect ratio 64:23 (about 2.78:1), for display at 1920 x 690. EXPAND THE SCENERY HORIZONTALLY, mainly toward the LEFT. Preserve the SAME original rider, face, helmet, body, clothing, exact pose, and the SAME vehicle with exact existing frame geometry, wheels, tires, handlebars, headlamp, seat, mirrors, colors and visible lettering. Do not redesign or invent technical vehicle details. Keep BOTH wheels and the ENTIRE helmet in frame with generous clearance above the head and below the tires. Rider and vehicle together should occupy the rightmost 35-40% of the final canvas, between x=60% and x=90%, with at least 5% margin to all relevant edges. The full subject height should be no more than 82% of the banner height. Extend the existing road/cycleway/promenade, water/trees/buildings and sky naturally to fill the rest, matching the photograph's existing perspective, light, shadows, color grading, depth and texture. Left half is calm natural scenery reserved for HTML headline overlay, NOT empty solid-color background and NOT blurred padding. Preserve the existing location and time of day. No added people, no added vehicles, no typography, no UI, no vignette or dark graphic overlay, no borders, no watermarks. The final result must be a genuinely wide horizontal photograph, not a cropped 16:9 picture.
```
