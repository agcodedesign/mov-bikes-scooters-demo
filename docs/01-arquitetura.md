# Arquitetura proposta

Status: especificação para revisão, não implementação ou prova de segurança.

## Objetivo e conteúdo

Ajudar visitantes a comparar bicicletas e scooters elétricas e iniciar atendimento sobre o modelo escolhido. A conversão é compra assistida, sem checkout ou pagamento online.

Público de trabalho: pessoas avaliando mobilidade elétrica para deslocamentos cotidianos. Hipótese derivada do briefing, sem pesquisa de público realizada.

Fontes confirmadas: briefing e referência visual anexados. Não há informações oficiais de modelos, preços, serviços, endereço, contatos ou avaliações na pasta. Textos institucionais sugeridos pelo briefing podem ser usados; alegações comerciais dependem de confirmação.

## Sitemap

| Rota | Responsabilidade |
| --- | --- |
| `/` | Marca, categorias, destaques, editorial e entrada no catálogo |
| `/catalogo` | Busca, filtros, ordenação e paginação |
| `/categoria/[slug]` | Contexto e seleção de uma categoria ativa |
| `/produto/[slug]` | Galeria, informações cadastradas e contato contextual |
| `/contato` | Canais oficiais e formulário de interesse |
| `/privacidade` | Política aprovada a partir do tratamento de dados efetivo |
| `/admin/login` | Login, recuperação e estados de autenticação |
| `/admin/redefinir-senha` | Recuperação por link válido |
| `/admin` | Indicadores e últimos registros |
| `/admin/produtos` | Listagem e ações de gestão |
| `/admin/produtos/novo`, `/admin/produtos/[id]` | Formulário e galeria |
| `/admin/categorias` | Gestão, ativação e ordem |
| `/admin/contatos`, `/admin/contatos/[id]` | Lista, contexto e evolução do atendimento |
| `/admin/configuracoes` | Canais comerciais, institucional e conteúdo da Home |

Rotas auxiliares: 404, acesso negado, sessão expirada e falha de serviço. Produto desativado retorna 404 no público; indisponível permanece visível se ativo, com indicação correspondente.

## Stack e responsabilidades

Proposta: Astro com renderização no servidor para conteúdo gerenciável, React para filtros e gestão, TypeScript e Tailwind CSS. Supabase para PostgreSQL, Auth e Storage. Escolha de hospedagem e adaptador SSR pendente; confirmar compatibilidade na implementação.

Estrutura futura: `src/pages`, `src/components/public`, `src/components/admin`, `src/layouts`, `src/services`, `src/schemas`, `src/types`, `src/styles` e `supabase/migrations`. Validações compartilhadas, autorização sempre no servidor e RLS como segunda camada. React não precisa hidratar seções editoriais estáticas.

Conteúdo público indexável deve chegar em HTML. Metadados individuais, canonical, sitemap apenas de registros públicos, Open Graph com imagem autorizada e páginas administrativas com noindex. Não emitir preço, disponibilidade ou avaliações em dados estruturados quando ausentes.

## Modelo de dados

Todos os registros mutáveis têm UUID e timestamps; slugs únicos e estáveis.

| Entidade | Campos e regras principais |
| --- | --- |
| categories | name, slug, description, image_path opcional, active, sort_order |
| products | category_id, name, slug, summary, description, price_cents nullable e não negativo, currency BRL, active, featured, is_new, availability |
| product_images | product_id, storage_path, alt, sort_order; primeira imagem define capa |
| product_specifications | product_id, label, value, unit opcional, sort_order; somente dados oficiais |
| product_features | product_id, text, sort_order |
| contacts | name, phone, product_id opcional, product_name_snapshot, message opcional, source, status, privacy_version |
| contact_events | contact_id, actor_id, previous_status, next_status, created_at |
| site_settings | canais, descrição institucional, logo_path e conteúdo editorial público; sem segredos |
| testimonials | texto autorizado, nome autorizado, produto opcional, foto opcional, active, sort_order |
| admin_memberships | user_id único, active; gerenciamento restrito, sem autoinscrição |

Disponibilidade: `available`, `unavailable`, `on_request`, `unspecified`. O último não gera badge público. Status de contato: `new`, `in_service`, `negotiating`, `completed`. Destaques e novidades são flags editoriais, não categorias duplicadas.

Categoria inativa oculta os produtos vinculados da vitrine. Não excluir categoria com produtos vinculados sem antes reatribuí-los. Exclusão de produto exige confirmação e preserva snapshot dos contatos, com referência anulável. Indicadores respeitam os mesmos critérios de ativação documentados na interface.

## Catálogo e contato

Busca por nome/modelo, categoria, destaques e novidades refletidos na URL. Ordenações: seleção editorial, nome e preço crescente/decrescente; sem preço sempre ao final. Limitar paginação e consultas. Preço ausente exibe “Consulte condições”; nenhuma ficha técnica é preenchida automaticamente.

CTA de produto leva ao WhatsApp oficial com mensagem codificada contendo nome e URL canônica do modelo. Se o canal não estiver configurado, usar formulário de contato funcional; se nenhum canal estiver operacional, não simular envio bem-sucedido. Formulário exige nome, telefone e ciência da política de privacidade; produto vem do contexto.

Clique no WhatsApp não comprova conversa recebida. Dashboard “Contatos recebidos” conta somente registros persistidos pelo formulário. Não capturar nome/telefone de um clique nem contar esse clique como lead identificado.

## Segurança planejada

- Sessão validada no servidor em todas as rotas e ações administrativas. Guard no cliente serve apenas à experiência.
- Supabase Auth sem cadastro público de administradores; provisionamento inicial controlado. Usuário autenticado sem membership ativo não administra.
- RLS em todas as tabelas. Público lê somente produtos/categorias ativos, imagens e especificações associadas, conteúdo público e avaliações autorizadas ativas.
- Contatos e histórico não têm leitura pública. Visitantes não recebem permissão genérica de INSERT: endpoint dedicado valida, limita volume e persiste somente os campos permitidos.
- Apenas membros administrativos ativos alteram catálogo, conteúdo e contatos. Memberships não são editáveis pelo próprio usuário.
- Chaves privadas exclusivamente no servidor, fora do repositório e do bundle. Uso de credencial privilegiada limitado ao endpoint que realmente precisa dela.
- Cookies e proteção contra CSRF nas mutações administrativas; validação de origem e sessão conforme a implantação. Sanitização de conteúdo e validação de URLs de mídia e links comerciais.
- Upload limitado a tipos de imagem aprovados, tamanho e dimensões controlados, nomes gerados e sem SVG arbitrário. Escrita no Storage restrita a administradores. Não colocar dados de contatos em bucket público.
- Retenção, exclusão de contatos, política de privacidade e responsáveis pelo tratamento dependem de decisão comercial antes da produção.

Esses requisitos precisarão de migrations, testes com papéis diferentes e verificação no projeto Supabase real. Este documento não configura RLS nem autenticação.
