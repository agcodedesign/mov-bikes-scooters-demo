# Movimento MOV — 16/11/2026

## Revisão cinematográfica

### Fluidez — revisão final

O reenquadramento do produto usa transformações no frame e contratransformações na imagem, preservando escala uniforme em espaço de tela. Medidas de viewport/card e dimensões da imagem são calculadas apenas no setup/refresh. quickSetter atualiza posição, escala e raio compensado; não há animação de width/height durante scroll. will-change fica restrito ao frame ativo. A distância de rolagem é 2,05 alturas no desktop e 1,65 no mobile/tablet; scrub de .48 s / .22 s respectivamente. ignoreMobileResize evita refresh por pequenas mudanças da barra do navegador móvel. Rolagem permanece nativa.

Hero acompanha a pressão horizontal até 24 px antes da troca e retorna com desaceleração; wipe respeita a direção. Esse movimento pertence ao picture, separado do transform de recuo da cena, evitando conflito com GSAP. A fotografia recua como plano inteiro sob a marca. Editorial usa perspectiva suave de duas folhas; os três blocos de experiência se acomodam em profundidade. Staggers menores e timelines compartilhadas reduzem os movimentos que terminavam separados.

Validação local por CDP/Chromium, sem simular aparelho físico: 1,5 s de rolagem dentro da cena geraram 3, 2 e 3 layouts em 390/768/1920 px, respectivamente. O teste verifica escala X/Y equivalente na foto e reconstrução da abertura ao inverter a rolagem. Não é comparação de FPS antes/depois, nem promessa de 60 fps em hardware real. Relatório em artifacts/qa/fluidity-report.json; reproduzir com node scripts/qa-fluidity.mjs. Testes de gesto também verificam deslocamento da foto antes de soltar mouse/toque.

Referência técnica: [configuração ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/).

A revisão anterior de entradas e microinterações ficou aquém da direção imersiva solicitada. A camada principal passou a GSAP + ScrollTrigger, em Cinematic.astro; Motion.astro conserva somente a abertura tipográfica do hero, benefícios e gestos, evitando concorrência no mesmo transform.

Conceito: a cidade abre o percurso e a rolagem conduz o olhar para o produto. Hero abre por máscara horizontal de 1200 ms; título sai de máscaras por linha. A marca sobe como um plano claro sobre o hero fixado; depois recebe dois planos com velocidades distintas. A vitrine fixa uma cena de 100svh em todos os tamanhos: 2,2 alturas de scroll no desktop e 1,8 no mobile/tablet. A fotografia começa em tela inteira, recua para o card e revela os detalhes. O layout final compacto mantém título, produto e detalhes no enquadramento móvel. Ao voltar a rolagem, a composição se reconstrói em sentido inverso.

O capítulo editorial avança sobre a borda inferior da vitrine, ligando as duas cenas; seus planos entram em direções opostas. Experiência organiza três peças em sequência e títulos se revelam palavra por palavra. CTA move o plano de texto/formulário; rodapé sobe como plano claro com logo em profundidade. Não há interceptação da rolagem vertical. O hero aceita arraste de mouse e swipe horizontal por Pointer Events, captura do ponteiro e touch-action pan-y pinch-zoom, com validação de direção e cancelamento. Autoplay continua durante hover e pausa por botão, foco, documento oculto ou hero fora da tela. A imagem anterior permanece atrás da nova durante o wipe, evitando um quadro escuro.

Hero mobile: três edições verticais próprias por image_gen integrado, 941 × 1672 px. Veículos inteiros na metade inferior e espaço para texto no topo, sem recorte de foto desktop. Fontes em assets/source/hero-mobile; conversão npm run assets:mobile. Overlay móvel neutro com queda gradual e reforço leve junto aos indicadores; sem placa opaca entre texto e foto. Originais preservados. Fontes desktop/tablet continuam ultrawide. Prompts completos em hero-mobile-prompts.json.

Skills aplicadas nesta revisão: gsap e gsap-performance. Consultadas as referências oficiais de ScrollTrigger e matchMedia. Não foram executados ou alegados gates de filme da motionmaxxing: esta entrega é uma página interativa, sem produção de filme promocional.

Evidência: qa-cinematic.mjs verifica deslocamento real da foto entre fases, ausência de overflow nas cenas em quatro larguras, desmontagem da cena ao reduzir movimento e reconstrução ao alternar desktop/tablet. Capturas intermediárias cinema-product-*.png foram vistas e comparadas. Vídeo de demonstração em artifacts/qa/mov-cinematic-preview.webm; gravação reproduzível com node scripts/record-cinematic.mjs. Sem alegação de FPS ou benchmark em dispositivos físicos.

## Camada de interação

Abertura de produto: camada decorativa em 100% da cena, pausa inicial, reenquadramento para o card, passagem para a imagem semântica e entrada dos detalhes. O frame e a imagem compensam suas escalas para mudar o enquadramento sem distorção e sem animar dimensões de layout. A camada decorativa não recebe foco/interação; teclado completa a cena. Asset frontal em WebP 1920 px do original v8front.jpg, sem upscale. QA verifica cobertura, encaixe, proporções, carregamento e desmontagem responsiva.

Skills aplicadas: motion-design, motion-principles e microinteractions. Personalidade premium: movimento controlado, sem bounce; easing cubic-bezier(.2,.7,.2,1).

- Hero: título entra linha por linha em 620 ms, com intervalo de 90 ms; eyebrow, descrição e ações completam a sequência. Fotos em crossfade de 700 ms a cada 5 s, com pausa e indicadores que interpolam por transform, sem animar largura.
- Rolagem: perfis próprios para copy (18 px/480 ms), fotografia (28 px/760 ms) e cards (26 px, escala .975, acomodação de 2 px/600 ms). Stagger por seção de até 255 ms. Uma entrada por elemento, sem transformar simultaneamente bloco e título.
- Botões: elevação de 2 px, pressão em .965 por 100 ms e retorno por mola amortecida de 360 ms, amostrada em keyframes. Retorno parte da escala atual, inclusive ao interromper a pressão. Ponteiro, toque e teclado atendidos. Seta desloca 3 px; ícones respondem ao hover; navegação tem sublinhado animado.
- Menu: links em sequência de 35 ms, entrada 260 ms, cancelamento ao fechar. Diálogos entram em 260 ms e saem em 160 ms; Escape e clique fora usam a mesma saída, mantendo modalidade até encerrar e restaurando foco.
- Sem zoom contínuo das fotos para preservar os enquadramentos. A camada de gestos usa WAAPI/CSS; a direção de cenas usa GSAP. Transform e opacity predominam, com clip-path nas máscaras do hero e overflow nas máscaras tipográficas.
- O conteúdo não recebe estilo oculto permanente. Sem JavaScript continua visível. Redução de movimento cancela entradas e transições espaciais e pausa o carrossel; foco encerra a entrada do bloco para manter controles visíveis. Nenhum movimento automático adicional contínuo.

Diagnóstico de microinterações, escala interna 0–2 por critério (ausente/parcial/coberto): trigger 2→2, regras 2→2, feedback 1→2, loops/modos 1→2. Total 6→8/8 no escopo local: feedback visual adicionado, preferência de movimento observada em tempo real. Não é nota de usabilidade medida com usuários.

Validação: check sem diagnósticos, build estático, QA em seis larguras de 320 a 1920 com zero ocorrências Axe A/AA; carrossel testado; entradas reais, scroll reveal, redução dinâmica e ausência de overflow em 320/768/1920. Conteúdo visível sem JS. Evidências: artifacts/qa/motion-report.json, report.json e newsletter-ultrawide.png. Testes locais Chromium; sem validação em dispositivos físicos/Safari.

Refinamento solicitado com swiftui-motion, compose-motion e framer-motion: aplicados princípios de mola, fases coordenadas, estados estáveis e interrupção. Implementação web em Astro com WAAPI/CSS; não foram introduzidos runtimes SwiftUI/Compose/React. Acrescentados testes de pressão interrompida, abertura/fechamento do menu e fechamento de diálogo durante a entrada.
