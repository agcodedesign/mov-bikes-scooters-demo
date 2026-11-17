# Materiais, sequência e critérios de entrega

## Inventário verificado

Em 13/11/2026, a pasta Mov-Mobile estava vazia. Foram fornecidos um briefing textual e uma imagem vertical de referência fitness. Não existem assets oficiais ou implementação local a preservar.

Penpot conectado nesta etapa. Home desktop, tablet e mobile foram criadas em páginas separadas. CTA final/footer atualizados em todas as versões conforme referência; exportações desktop e mobile conferidas. A página `Ativos & Tokens` documenta botões e mapa de estados; biblioteca local contém componentes e cores, com set de 15 tokens na aba Tokens. CTAs principais mobile/tablet navegam para boards de catálogo. As fotos continuam em slots cinza conforme solicitado. Telas de categoria, produto, contato e administração seguem pendentes.

## Materiais pendentes

| Material | Necessidade |
| --- | --- |
| Logo/identidade, se existentes fora da pasta | Preservar a marca antes de finalizar o visual |
| Fotos oficiais, nomes e categorias de modelos | Compor vitrine e detalhes fiéis |
| Descrições, especificações, preços e disponibilidade | Preencher só os campos confirmados; preço é opcional |
| Fotografias lifestyle autorizadas | Finalizar hero e editoriais |
| WhatsApp, Instagram e dados institucionais | Configurar canais reais antes da publicação |
| Depoimentos autorizados, se existentes | Habilitar a seção; ausência não impede lançamento |
| Projeto Supabase e hospedagem | Integração posterior à aprovação visual |

Organização futura: `public/images/brand`, `hero`, `products`, `categories`, `editorial`, `lifestyle`, `og`. Dados de catálogo vêm do banco e Storage, não de placeholders de demonstração publicados.

## Sequência e checkpoints

1. Inventário e arquitetura: documentação inicial preparada; materiais remotos ainda não inspecionados.
2. Design: criar sistema, estudos e telas completas no Penpot em desktop/tablet/mobile; revisar imagens e conteúdo.
3. Aprovação: apresentar link do arquivo, boards, exports e pendências concretas. O briefing exige aprovação antes do frontend.
4. Frontend: implementar fielmente os boards aprovados e seus estados.
5. Catálogo e admin: implementar modelos, formulários, rotas e fluxos previstos.
6. Supabase: migrations, Auth, Storage, RLS, provisionamento administrativo e integração.
7. QA: testar comportamento, segurança, acessibilidade, SEO e desempenho.
8. Entrega: registrar evidências e distinguir validação local de verificação remota.

## Critérios de aceitação

- Penpot: boards preenchidos e organizados, componentes reutilizáveis, estados, protótipos e exports inspecionados; confirmar persistência após reconexão.
- Conteúdo: nenhum dado comercial, imagem oficial, depoimento ou contato inventado. Campos ausentes têm regra explícita.
- Responsivo: 320–1920 px, tablet e ultrawide sem overflow; zoom 200%, navegação por teclado, foco visível e alvos de toque adequados.
- Catálogo: filtros combinados, URL compartilhável, paginação, preço ausente, categoria desativada, produto inexistente, erros e catálogo vazio.
- Contato: contexto correto, validação no servidor, prevenção de abuso, falha preserva campos; sucesso apenas com registro confirmado. WhatsApp não equivale a lead recebido.
- Admin: CRUD persistido após recarga, atualização de status, imagens ordenáveis, validação e exclusões confirmadas. Nenhuma operação depende apenas de proteção visual.
- Segurança: visitante, autenticado não administrador, administrador e membro revogado testados contra rotas, banco e Storage. Testar tentativas de ler contatos e alterar catálogo sem autorização.
- SEO: HTML indexável, títulos e descrições individuais, canonical, sitemap, OG, 404 correto, admin noindex e dados estruturados sem afirmações ausentes.
- Performance: medir com imagens finais e build estável; meta LCP ≤2,5 s, CLS ≤0,1 e INP ≤200 ms. Laboratório não prova Core Web Vitals de usuários reais.
- Entrega técnica: build/typecheck e testes relevantes aprovados, capturas desktop/mobile, manual de gestão, variáveis documentadas sem segredos e limitações registradas.

## Estado atual

Somente documentação inicial criada. Não há telas aprovadas, aplicação executável, autenticação configurada, banco provisionado ou testes de produção realizados.
