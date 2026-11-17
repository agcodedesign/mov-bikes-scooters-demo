# Direção visual e roteiro do Penpot

Status: Home desktop, tablet e mobile criadas em páginas separadas. Biblioteca de componentes e tokens iniciada. Direção ainda não aprovada.

## Tese

“Sua cidade. Seu ritmo. Seu caminho.” O veículo real protagoniza a experiência; tipografia expressiva e fotografia urbana conectam catálogo e rotina. Compra assistida permanece clara, mesmo nos blocos mais editoriais.

A referência fornecida orienta o ritmo: hero amplo, alternância de fotografia e texto, benefícios compactos, vitrine assimétrica, pausa editorial e encerramento vibrante. Não copiar conteúdo fitness, preços, depoimentos, métricas ou imagens da referência como materiais da MOV.

## Sistema proposto, sujeito a materiais oficiais

MOV informou as cores `#E7E7E7` e `#FFA300`. O board usa o cinza como superfície de imagem reservada, o laranja como destaque e ações, texto escuro para contraste e fundo claro para leitura. Falta saber se há paleta institucional complementar. Verificar contraste dos estados e usos pequenos antes da aprovação.

Tipografia de estudo: Manrope para títulos e interface, com pesos contrastantes, sujeita à disponibilidade e licença dos arquivos. Título desktop 80–96 px, tablet 56–64 px, mobile 44–48 px; corpo 16–18 px. Evitar peso leve em texto pequeno. Logotipo não será redesenhado: enquanto ausente, usar apenas identificação textual provisória e anotar essa condição fora da interface comercial.

Grid desktop de 12 colunas com conteúdo limitado a 1280 px; tablet de 8; mobile de 4. Gaps 24/20/16 px, margens 64/32/20 px. Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Botões com área mínima de 44 px, altura preferida 48 px. Raios 12 px em controles e 24 px em mídia; sem envolver cada parágrafo em cards.

## Home — composição e conteúdo

| Cena | Composição desktop | Adaptação mobile |
| --- | --- | --- |
| Header | Logo, Catálogo, Bicicletas, Scooters, A MOV e contato | Logo, botão Menu; painel com fechar e ordem de foco |
| Hero | Copy à esquerda, veículo e pessoa à direita, fundo suave; dois CTAs | Texto antes da mídia, foto com enquadramento próprio e veículo inteiro |
| Marca | Título e texto em colunas, fotografia cotidiana e mensagem institucional | Sequência texto, foto, mensagem sem sobreposição |
| Benefícios | Três blocos: Mobilidade elétrica, Diferentes caminhos, Praticidade na rotina | Uma coluna; descrições curtas e ícones discretos |
| Destaques | Um produto principal e cards de apoio; nome, categoria e dados cadastrados | Cards completos em uma coluna, sem esconder informação em hover |
| Editorial | Foto ampla e “Mais do que chegar. Aproveitar o caminho.” | Mídia e texto empilhados |
| Experiência | Produto amplo, categoria, mensagem e imagem complementar em proporções distintas | Ordem de leitura preservada; sem carrossel obrigatório |
| Avaliações | Cards apenas de relatos autorizados | Cards empilhados; sem avaliações reais, seção omitida do público |
| CTA final | Fundo de destaque e foto; “Sua próxima forma de se movimentar começa aqui.” | Copy e CTAs antes da foto, sem recorte do veículo |
| Footer | Marca, navegação, categorias e canais confirmados | Grupos curtos e legíveis; campos ausentes não geram links fictícios |

Hero: eyebrow “MOBILIDADE PARA O SEU DIA.”; título “Sua cidade. Seu ritmo. Seu caminho.”; descrição e CTAs conforme briefing. A marca usa “O caminho muda quando você escolhe como ir.”. A vitrine usa “Encontre o modelo ideal para você.”.

Atendimento especializado só vira diferencial factual após confirmação. Não usar porcentagens de economia, alcance, potência, sustentabilidade quantificada ou promessas de serviço sem evidências.

## Arquivo Penpot

Boards criados: `MOV • Home desktop / 1440`, `MOV • Home tablet / 768` e `MOV • Home mobile / 390`, cada um em página separada. As versões tablet e mobile recoreografam o hero e empilham conteúdo; tablet apresenta hero em duas colunas e mobile usa menu compacto. Slots cinza descrevem qual imagem oficial será inserida depois. Também existem quadros de catálogo tablet/mobile ligados pelo CTA principal. Páginas internas restantes incluem categoria, detalhe do produto e fluxos administrativos.

CTA final e footer ajustados para aproveitar a composição completa da referência: faixa fotográfica horizontal com headline, descrição e botão cápsula sobre a imagem; abaixo, lettering MOV laranja em grande escala e na horizontal, seguido de texto de CTA e botão à esquerda, com navegação em colunas à direita. Tablet e mobile mantêm o texto sobre a imagem, adaptam a escala da marca e empilham o CTA e os links. O fundo temporário da foto usa cinza escuro para manter o texto branco legível até a imagem ser inserida.

Biblioteca local do Penpot: componentes `MOV Button Primary` e `MOV Button Secondary`; cores `Cinza`, `Laranja`, `Principal`, `Secundário`, `Base`; tipografia `Corpo`. Aba Tokens: set `MOV`, ativo, com 15 tokens de cor, espaço, raio e tamanho tipográfico. Página `Ativos & Tokens` documenta variantes visuais, tamanhos e mapa de interação. Protótipo conectado: CTA primário das Homes tablet/mobile navega para o catálogo respectivo. Interações de hover/foco/loading/disabled estão especificadas visualmente; no Penpot, hover e foco são estados para handoff, sem simular lógica de runtime.

Organizar páginas: `00 — Contexto e pendências`, `01 — Sistema visual`, `02 — Público`, `03 — Administração`, `04 — Estados e protótipo`, `05 — Handoff`.

Criar primeiro estudos de hero desktop/mobile, tipografia, produto, editorial e CTA. Depois expandir o mesmo sistema para todas as telas; aprovação de frontend somente com o conjunto completo revisável.

### Matriz de telas

Cada tela abaixo precisa de composição desktop 1440, tablet 768 e mobile 390. Validar ainda 320, 360, 1024 e 1920, zoom 200% e texto longo.

| Grupo | Telas e estados |
| --- | --- |
| Público | Home completa; catálogo; categoria; detalhe; contato; privacidade; 404 |
| Catálogo | Inicial, filtrado, busca sem resultado, catálogo vazio, carregando, falha e tentar novamente |
| Produto | Galeria, ampliada, preço ausente, disponível, indisponível, dados parciais e mídia ausente |
| Contato | Padrão, validação, enviando, sucesso após persistência, falha com preservação dos campos |
| Autenticação | Login, credenciais inválidas, recuperação solicitada, link inválido, nova senha, sessão expirada e acesso negado |
| Dashboard | Zero registros e dados reais; totais e últimos contatos |
| Produtos admin | Lista, busca, novo, editar, erro de campo, upload em andamento/falha, confirmação de exclusão |
| Categorias admin | Lista ordenável, criar/editar, ativação e impedimento de exclusão com vínculos |
| Contatos admin | Lista, detalhe, alteração de status, histórico, vazio e falha de atualização |
| Configurações | Canais, institucional, conteúdo Home, sucesso e falha ao salvar |

No tablet, listagens administrativas reduzem colunas secundárias com detalhe acessível. No mobile, usam cartões informativos e ações explícitas. Sidebar vira navegação recolhível. Formulários longos usam grupos com labels permanentes e resumo de erros.

### Componentes e interação

Biblioteca com botões primário/secundário/textual; links; campos; select; checkbox; busca; filtro; badge; card de produto; galeria; paginação; navegação; diálogo; alerta; skeleton; vazio e upload. Estados default, hover, focus-visible, disabled, loading e error onde pertinentes.

Protótipo: Home → catálogo → categoria/filtro → produto → contato; login → produtos → criar/editar → salvar; categorias → ordenar; contatos → atualizar status; configurações → editar canal. Desenhar retorno, cancelamento e falha, não apenas caminho feliz.

Movimento: transições discretas de 160–240 ms; sem scroll obrigatório, parallax ou autoplay. Reduced motion elimina deslocamentos; foco e confirmação permanecem perceptíveis. Navegação e CTAs não dependem de animação.

## Política de imagens

O CTA sobre a imagem é um formulário de inscrição: campo branco de e-mail em cápsula, botão laranja integrado e seta em círculo branco. Criado nas três versões e publicado como componente `MOV Newsletter Subscribe` nos Ativos. Subtítulos do CTA e footer ampliados conforme solicitado. O desenho prepara a inscrição; o serviço de envio e a persistência de assinantes serão definidos na implementação.

Fotos oficiais de produtos são a fonte principal. Sem materiais, slots anotados no arquivo de design, sem veículos gerados ou modelos inventados. Imagens de estudo, se autorizadas posteriormente, ficam explicitamente identificadas como referências, sem representar estoque real.

Hero requer variantes desktop e mobile. Fotografias devem preservar rodas, guidão e proporção do produto; safe area para títulos e controles. Detalhes de produto usam contain em fundo neutro; lifestyle admite crop somente sem alterar entendimento do veículo.

Cada asset precisa de origem, autorização, papel, dimensões, crop, alt e status. Fotografias finais em WebP, logo vetorial original em SVG; imagens abaixo da dobra com lazy loading, hero prioritário e dimensões explícitas.
