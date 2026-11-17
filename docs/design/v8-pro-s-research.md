# V8 Pro S — pesquisa e direção

Consulta em 16/11/2026. Página de produto baseada na LP MOV, sem Penpot.

## Fontes primárias

- OUXI.BR, https://ouxiebikes.com.br/products/v8-pro-s-bicicleta-eletrica-1000w-com-2-baterias : 1000 W, duas baterias 48 V/15 Ah, pneus 20×4, freios hidráulicos, suspensão dianteira/traseira, Shimano 7 velocidades, NFC. Anuncia 32 km/h, 100–120 km elétrico e até 150 km assistido. IP54 na página. Há referências internas a V8 Pro no diagrama; medidas não devem ser tratadas como engenharia validada da unidade MOV.
- Gotrix, https://gotrixoficial.com.br/veiculos/bike-v8-s-2-baterias/ : 1000 W, 32 km/h, duas baterias removíveis, recarga 6–8 h, Shimano 7 marchas, LED, NFC, Bluetooth. Autonomia até 100 km e IP64, divergentes da outra fonte.

## Critério editorial

Usar especificações concordantes e atribuí-las à configuração pesquisada. Autonomia como faixa anunciada de 100–120 km no elétrico, até 150 km assistido segundo OUXI.BR, com condições de uso e confirmação da configuração junto à MOV. Não usar preço, garantia, frete ou contato de terceiros. Não afirmar IP como dado confirmado, nem dispensa de CNH/emplacamento: dependem da configuração e regras aplicáveis. Não adicionar promessas de segurança absolutas.

As fotografias mostram inscrições V8 Pro, duas caixas de bateria, quadro preto, banco preto texturizado, rodas de liga escuras, pneus Kenda largos, freios a disco, farol circular com grade, garfo e dois amortecedores traseiros. São base visual, não levantamento fotogramétrico calibrado. O modelo 3D é uma reconstrução editorial aproximada; partes ocultas não podem ser certificadas pelas fotos. Essa limitação deve aparecer de forma breve junto à experiência.

## Experiência

Rota /produtos/v8-pro-s/. Estúdio escuro com acento laranja, Manrope e componentes existentes. Modelo GLB feito no Blender via MCP, materiais PBR pretos (metal, borracha, banco) e detalhes claros/âmbar conforme fotos. Órbita e pontos clicáveis, câmera que aproxima cada componente ao rolar, botões equivalentes de teclado, modo de exploração livre e voltar à vista geral. Mobile/touch com rolagem vertical livre e controles explícitos. Fallback de fotografia se WebGL/modelo falhar. Render sob demanda, DPR limitado e pausa fora da tela. Specs, fotos, descrição, perguntas e atendimento MOV sem inventar integração.

Implementação Three.js direta: a skill threejs-r3f recomenda essa opção quando a base não usa React. Não introduzir React apenas para o canvas. Não criar física, game loop contínuo ou shaders caros sem necessidade.
