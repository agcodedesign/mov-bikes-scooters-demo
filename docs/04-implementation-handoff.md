# Handoff — LP MOV em Astro

Data: 16/11/2026. Implementação local concluída e revisada. Sem publicação ou integração comercial real.

## Fonte e escopo

O usuário aprovou o Penpot e autorizou somente a LP Astro com imagens WebP. Informou que mobile/tablet ainda não estavam perfeitamente ajustados e autorizou usá-los como guia de hierarquia. O desktop final determina a identidade, copy e fotografias.

[Vitrine Virtual no Penpot](https://design.penpot.app/?screen=workspace&team-id=da05d154-084a-817e-8008-d1e957adb1c1&file-id=124ca123-b2be-80ce-8008-e7cf8fe4b54e&page-id=124ca123-b2be-80ce-8008-e7cf8fe4b54f). Snapshot MCP: `docs/design/penpot-desktop.json`. A exportação desktop foi inspecionada antes de implementar; mobile/tablet foram lidos para estrutura e hierarquia. Os boards não foram editados nesta etapa. Uma consulta adicional ao MCP após implementação encontrou heartbeat suspenso; o snapshot inicial e a exportação completa já haviam sido obtidos.

Uma rota `/`, com Header, Hero, marca, benefícios, vitrine V8 Pro S, editorial, experiência, avaliações, newsletter e footer. Categorias navegam pela própria LP; diálogos mostram o modelo e os estados de contato. Não foram criados painel, banco, checkout ou páginas internas.

## Decisões registradas

- Astro estático, TypeScript e CSS por componente. Botão e imagem responsiva reutilizáveis. JavaScript nativo para menu, diálogos e formulário; GSAP + ScrollTrigger para a direção cinematográfica, sem hidratação React. Cenas e evidência em `docs/design/motion.md`.
- Manrope variável local e logos originais preservados. Corrigidos “Inicio” e “Sooters” para “Início” e “Scooters”. Notas técnicas sobre slots de imagem foram retiradas do produto.
- A área de avaliações permanece no estado vazio aprovado, sem pessoas ou relatos fictícios.
- Apoio de texto em fundo claro usa `#955900` para legibilidade; laranja principal e logos preservados. Citação sobre fotografia recebe escurecimento local para contraste.
- Abaixo de 900 px, composições editoriais passam a uma coluna. O hero mobile integra texto sobre fotos verticais próprias (941 × 1672 px); tablet usa expansão ultrawide com enquadramento à direita. São três imagens a cada 5 s, com pausa, indicadores, arraste por mouse e swipe horizontal; rolagem vertical preservada. Hover não pausa mais o carrossel. Desktop mantém 690 px. Abertura do produto em tela inteira, pin e transições entre capítulos funcionam em mobile, tablet e desktop. Reduced motion inicia pausado e remove pins. Editorial usa container de 1296 px.
- Não havia Git no diretório: nenhum commit/PR criado.

## Assets

17 originais preparados em 46 WebP, mais 12 variantes ultrawide e 9 variantes dos heros verticais (67 WebP no total). Logos e originais preservados. Fontes em `assets/source/`; heros desktop 2089 × 753 px, mobile 941 × 1672 px, CTA 2172 × 724 px, sem upscale. O CTA permite recorte central 1920 × 380 mantendo os sujeitos completos. Prompts e manifestos em `docs/design/*ultrawide*` e `docs/design/hero-mobile-*`.

Rastreabilidade em `docs/assets-manifest.json`: nome original, função no Penpot, dimensões e saídas. Imagens em HTML têm dimensões explícitas, `srcset`, `sizes`, prioridade no hero e lazy loading nas demais. Assets de reserva também foram preparados, sem substituir fotos escolhidas.

## Interações e integrações

Header preserva seu WebP próprio; o preloader usa o SVG atualizado com subtítulo e viaja para a área da marca no header, compensando margens da imagem. Assinatura AG: logoag.webp, derivadas 176/264 px com alpha preservado, exibida em 88 px desktop e 72 px mobile no canto inferior direito, link https://agcodedesign.netlify.app com noopener/noreferrer e label indicando nova aba. Capturas footer-ag-1440.png e footer-ag-390.png.

Preloader: SVG original fornecido em `BIKECELL/ASSETS/preloader.svg`, preservado em `assets/source/brand/preloader.svg`. Contornos M/O/V desenhados e preenchidos em sequência; saída inicia a coreografia e o relógio do hero. Redução de movimento e ausência de JS dispensam a abertura; watchdog independente de 5 s, Escape e limpeza no pagehide evitam bloqueio. Testes específicos e evidência em `docs/design/preloader.md` e `artifacts/qa/preloader-report.json`.

Newsletter: campo branco, botão laranja integrado e seta circular. Label real, input de e-mail a 16 px, autocomplete, validação inline, estado ocupado e tratamento de timeout/falha. Sem endpoint configurado, informa que inscrições não estão abertas e não envia/persiste e-mail. Sem JavaScript, submit fica desabilitado para impedir GET com e-mail na URL.

`.env.example` documenta `PUBLIC_WHATSAPP`, `PUBLIC_INSTAGRAM_URL` e `PUBLIC_NEWSLETTER_ENDPOINT`. O serviço deve receber POST JSON `{ "email": "..." }`, permitir a origem da página e retornar 2xx somente após receber a inscrição. Integração real, provedor, consentimento e política completa ainda dependem de configuração. A política da prévia descreve apenas o estado atual.

Sem canais confirmados, botões de atendimento/redes abrem mensagens informativas. Sem domínio confirmado, não foi inventado canonical; completar URLs absolutas de compartilhamento antes de publicar.

## Evidência de QA local

| Verificação | Resultado |
| --- | --- |
| `npm run check` | 0 erros, 0 avisos, 0 hints |
| `npm run build` | 1 página estática gerada |
| `npm run qa` | Passou em 320, 390, 768, 1024, 1440, 1920 px |
| Axe WCAG A/AA automatizado | 0 ocorrências nos seis tamanhos |
| Layout/recursos | Sem overflow horizontal, imagens quebradas, erros JS ou HTTP de recursos |
| Menu | Abrir/fechar, Escape, retorno de foco e seleção de âncora |
| Diálogos | Produto/privacidade, cadeia de interesse e retorno ao controle visível |
| Inscrição | Vazio, inválido e válido sem endpoint; sem falso sucesso |
| Texto a 200% | Sem overflow; citação inteira em 320 px |
| Sem JavaScript | E-mail não aparece na URL; envio desabilitado |

Capturas: `artifacts/qa/home-{320,390,768,1024,1440,1920}.png` e `home-text-200-percent.png`. Relatórios: `report.json`, `regressions-before.json` e `regressions.json`. Revisão independente encontrou falhas de foco e fallback de formulário; os testes reproduziram os problemas e passaram após correção.

Desktop, tablet e mobile foram vistos renderizados. Desktop tem 5407 px de altura contra 5400 px do board, como evidência de composição, sem afirmar comparação pixel a pixel automática. Laboratório local não prova Core Web Vitals de produção.

Não verificados: envio real da newsletter, canais comerciais, dispositivos físicos, Safari, leitor de tela manual ou ambiente publicado.

## Skills e colaboração

`ag-workflow-os`: escopo, fonte de verdade e handoff. `ag-frontend-design`: fidelidade, tokens e QA. Superpowers: plano e execução verificada. `parallel-agents`: inventário independente, implementação delimitada de quatro seções e revisão de código. `better-writing`, `better-layout`, `better-typography` e `better-accessibility`: mensagens, reflow, fonte/inputs e semântica/foco/labels.

Referências técnicas: [Imagens Astro](https://docs.astro.build/en/guides/images/) e [Scripts e eventos Astro](https://docs.astro.build/en/guides/client-side-scripts/).
