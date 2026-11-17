# Mapa de dados para revisão do backend

Atualizado em 23/10/2026. Este é um **inventário e proposta**, não uma migration. `backend/sql/schema.sql` continua como referência e **não foi alterado**. Mudanças de tabelas/colunas dependem de alinhamento com a pessoa responsável pelo backend e a ONG; depois devem virar migrations versionadas.

## Já existe no SQL de referência

| Tabela | Uso previsto | Pontos a revisar |
| --- | --- | --- |
| `admins` | Identidade administrativa | Papéis/permissões, sessão, recuperação e auditoria; nunca expor `password_hash`. |
| `cats` | Perfil, adoção, cuidado e publicação | Idade por `birth_date`/`approximate_age_months`; exclusão e estados. |
| `cat_photos` | Fotos ordenadas e capa | Uma capa por gato; armazenamento real, acesso e remoção. URI do emulador não serve como `url`. |
| `cat_health_records` | Histórico de saúde | Visibilidade, edição e exclusão. |
| `adoption_applications` | Protocolo, contato, respostas e andamento | `answers` JSONB para campos a acordar; retenção; enum difere da UI. `cat_id` usa `ON DELETE RESTRICT`. |
| `campaigns` | Metas, total, Pix e publicação | Fonte do total, Pix oficial, datas versus `daysRemaining`. |
| `guide_categories` | Categorias, ordem e publicação | Regra de remoção quando houver artigos. |
| `guide_articles` | Conteúdo e publicação | Slug, revisão e referências. |

O SQL também contém os tipos `adoption_status`, `care_status` e `application_status`. O backend já implementa leitura pública de gatos. A migration `0002_partners` acrescenta as tabelas de parceiros descritas abaixo e suas rotas de leitura pública e administração para teste.

## Candidatas ausentes do SQL

| Estrutura | Dados a discutir | Condição/decisão |
| --- | --- | --- |
| `medication_requests` | `id`, protocolo único, contato, dados do gato/pedido, urgência, retirada, status e datas | Definir campos obrigatórios, estados, privacidade e retenção antes do DDL. |
| `medication_attachments` | `id`, `request_id`, referência de armazenamento, nome, MIME, tamanho e datas | Só com anexos reais. Guardar metadados/referência; acesso protegido. |
| `admin_publications` | `id`, título, corpo, status, `published_at` e datas | CRUD local já existe; público vê só publicados. |
| `partners` | `id`, `name`, `category`, `description`, `position`, `published`, `created_at`, `updated_at` | Aprovado para gestão via API. Categorias seguem o mock atual: `accounting`, `veterinary`, `photography`. `isDemo` não é coluna. |
| `partner_socials` | `id`, `partner_id`, `platform`, `label`, `url`, `position` | Aprovado como tabela normalizada, com exclusão em cascata do parceiro. Plataformas: `instagram`, `facebook`, `whatsapp`, `website`. |
| `info_sections` | `id`, título, corpo, ordem/visibilidade | Só se editável via API; ações internas podem ficar no app. |
| `admin_sessions` ou lista de revogação | Administrador, expiração e revogação | Depende do modelo de autenticação; não é obrigatório para todo modelo de token. |
| `audit_events` | Ator, operação, recurso, data e resumo sem segredo | Considerar para status, publicação e acesso a dados pessoais. |

## Invariantes para discutir

- Protocolos únicos gerados no servidor, sem dados pessoais embutidos; índices para protocolo, filtros de status/data e filas paginadas.
- Garantir no banco ou em transação no máximo uma capa por gato; definir remoção da capa. Fotos/anexos precisam de validação de tipo/tamanho, armazenamento aprovado e exclusão segura.
- A migration `0003_cat_delete_cascade` altera a FK de adoções para `ON DELETE CASCADE`, conforme decisão de 06/11/2026: excluir um gato apaga suas manifestações, fotos e registros de saúde. Categoria usada por artigo continua com `ON DELETE RESTRICT`.
- `campaigns.raised_cents` não deve ser atualizado a partir do Pix demonstrativo do app sem fonte confirmada. Chave e recebedor dependem da ONG.
- Padronizar `created_at`, `updated_at`, autoria, histórico de status e publicação. Acordar retenção/exclusão/anonimização de dados pessoais.

## Diferenças entre UI e SQL

| UI/mock | SQL atual | Decisão |
| --- | --- | --- |
| `pending`, `in_review`, `approved`, `rejected` | Adoção: `submitted`, `under_review`, `needs_information`, `approved`, `rejected`, `completed`, `cancelled` | Vocabulário/transições; medicamentos sem enum/tabela. |
| `Cat.ageLabel`, `imageUrl` | Idade estruturada e `cat_photos` | Derivação de idade/capa. |
| `Campaign.daysRemaining` | `starts_on`, `ends_on` | Cálculo e fuso/dia de referência. |
| `Publication.status` | Sem tabela | Publicação, datas e arquivamento. |
| `Partner.socials[]`, `InfoSection.actions[]` | Sem tabelas | Persistir conteúdo ou mantê-lo estático. |
| `MedicationAttachment.uri` | Sem tabela | Upload real; URI local não atravessa sessões/dispositivos. |

Ordem: fechar [o contrato](API_CONTRACT_DRAFT.md), criar migrations pelo backend, implementar rotas/testes e só então trocar os repositories mock por HTTP.
