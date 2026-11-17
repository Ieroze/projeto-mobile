# Contrato de API — proposta para alinhamento

Atualizado em 06/11/2026. Implementados: `GET /health`, leitura pública de gatos e parceiros, e CRUD administrativo de gatos e parceiros para testes. As demais rotas abaixo seguem como propostas sob `/api/v1`. O mobile segue usando mocks via `src/services`. Validar autenticação, permissões, privacidade, publicação e dados com a pessoa responsável pelo backend e a ONG antes de integrar. Ver também [o mapa do schema](BACKEND_SCHEMA_PROPOSAL.md).

## Convenções candidatas

- JSON em `camelCase` para o mobile, com conversão explícita para `snake_case` nos modelos Python/SQL. IDs UUID no backend; IDs dos mocks não são IDs reais. Datas ISO 8601 e dinheiro em centavos inteiros.
- Listas paginadas (`limit`/`offset` ou cursor, a decidir) com `items` e metadados. Definir busca, filtros e ordenação por recurso. Nunca retornar dados pessoais nas rotas públicas de listagem.
- Rotas privadas exigem autenticação e autorização no servidor por operação. Exceção temporária: rotas `/admin/partners` e `/admin/cats` sem autenticação quando `APP_ENV=development`, conforme decisão de 06/11/2026; em outros ambientes respondem 404. Não exponha o backend de desenvolvimento publicamente. O login demonstrativo do app não é controle de acesso. Definir token/sessão, expiração, renovação e revogação antes de integrar.
- Padronizar erros e códigos HTTP (`400/422`, `401`, `403`, `404`, `409`, `429`). O formato abaixo é sugestão; o FastAPI usa outro formato de validação por padrão.
- `DELETE` é candidato onde o mock remove itens. Decidir arquivamento, vínculos, histórico e auditoria primeiro. Regras de status e publicação devem ser aplicadas no backend.

```json
{"error":{"code":"VALIDATION_ERROR","message":"Dados inválidos","details":[{"field":"applicantPhone","message":"Telefone inválido"}]}}
```

## Público

| Área | Rotas candidatas | Regras/pendências |
| --- | --- | --- |
| Gatos | `GET /cats`, `GET /cats/{id}` | Implementado: apenas publicados, paginação `limit`/`offset`, filtros `adoptionStatus`/`careStatus`, resposta com `items`/`total` e perfil com capa/fotos. Gato não publicado retorna 404. Registros de saúde não são expostos. |
| Adoção | `POST /adoption-applications` | Implementado: valida dados e consentimento, aceita apenas gatos publicados disponíveis, gera protocolo e devolve recibo mínimo. |
| Protocolo | `GET /adoption-applications/{protocol}` | **Condicional** a um método de verificação: saber o protocolo não autoriza acesso a dados pessoais. |
| Campanhas | `GET /campaigns`, `GET /campaigns/{id}` | Implementado: apenas publicadas, paginação `limit`/`offset`. Chave/recebedor Pix oficiais e origem de `raisedCents` dependem da ONG. |
| Guia | `GET /guide/categories`, `GET /guide/articles`, `GET /guide/articles/{id}` | Implementado: apenas categorias e artigos publicados, paginação e filtro opcional `categoryId`. Busca ainda a definir. |
| Publicações | `GET /publications`, `GET /publications/{id}` | Apenas `published`; rascunho deve retornar 404 ao público. |
| Parceiros | `GET /partners`, `GET /partners/{id}` | Implementado: somente publicados, ordenados por `position` e `name`, com paginação `limit`/`offset` e filtro opcional `category`. Detalhe não publicado retorna 404. |
| Informações | `GET /info-sections`, `GET /info-sections/{id}` | Condicional; ações de navegação podem permanecer no app. Texto legal não faz parte do editor atual. |
| Medicamentos | `POST /medication-requests` | Condicional à definição de campos, consentimento, anexos e atendimento. Retornar recibo mínimo. |

## Administração

Todas as rotas a seguir são privadas e usam o prefixo `/api/v1`. Listas e detalhes administrativos podem incluir rascunhos e ocultos conforme permissão.

| Área | Rotas candidatas | Observação |
| --- | --- | --- |
| Sessão | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | Definir papéis, recuperação, revogação e guarda segura de credenciais/tokens. |
| Painel | `GET /admin/overview` | Opcional; definir totais e origem dos indicadores. |
| Gatos | `GET /admin/cats`, `POST /admin/cats`, `GET /admin/cats/{id}`, `PATCH /admin/cats/{id}`, `DELETE /admin/cats/{id}` | Implementado sem autenticação somente em `APP_ENV=development`, conforme decisão de 06/11/2026; outros ambientes retornam 404. Exclusão física apaga também fotos, registros de saúde e manifestações de adoção vinculadas. |
| Fotos | `GET /admin/cats/{id}/photos`, `POST /admin/cats/{id}/photos`, `PATCH /admin/cats/{id}/photos/{photoId}`, `DELETE /admin/cats/{id}/photos/{photoId}` | Upload real separado dos metadados; uma capa por gato; tipo, tamanho e armazenamento pendentes. |
| Saúde | `GET /admin/cats/{id}/health-records`, `POST /admin/cats/{id}/health-records`, `PATCH /admin/cats/{id}/health-records/{recordId}`, `DELETE /admin/cats/{id}/health-records/{recordId}` | Visibilidade e exclusão/arquivamento pendentes. |
| Adoções | `GET /admin/adoption-applications`, `GET /admin/adoption-applications/{id}`, `PATCH /admin/adoption-applications/{id}/status` | Implementado para testes em `APP_ENV=development`, com filtros `catId`/`status`; transições, notas e auditoria ainda precisam ser definidas. Não há consulta pública por protocolo até definir verificação de identidade. |
| Medicamentos | `GET /admin/medication-requests`, `GET /admin/medication-requests/{id}`, `PATCH /admin/medication-requests/{id}/status` | Anexos protegidos em rota a definir. |
| Campanhas | `GET /admin/campaigns`, `POST /admin/campaigns`, `GET /admin/campaigns/{id}`, `PATCH /admin/campaigns/{id}`, `DELETE /admin/campaigns/{id}` | Implementado para testes apenas em `APP_ENV=development`; publicação e remoção física disponíveis. Origem de `raisedCents` e chave Pix oficiais precisam de validação da ONG. |
| Guia: categorias | `GET /admin/guide/categories`, `POST /admin/guide/categories`, `GET /admin/guide/categories/{id}`, `PATCH /admin/guide/categories/{id}`, `DELETE /admin/guide/categories/{id}` | Implementado para testes apenas em `APP_ENV=development`; bloqueia remoção com artigos vinculados (409). Nome e slug devem ser únicos. |
| Guia: artigos | `GET /admin/guide/articles`, `POST /admin/guide/articles`, `GET /admin/guide/articles/{id}`, `PATCH /admin/guide/articles/{id}`, `DELETE /admin/guide/articles/{id}` | Implementado para testes apenas em `APP_ENV=development`; suporta rascunho/publicação e define `publishedAt` na primeira publicação. Slug único. |
| Publicações | `GET /admin/publications`, `POST /admin/publications`, `GET /admin/publications/{id}`, `PATCH /admin/publications/{id}`, `DELETE /admin/publications/{id}` | `draft`/`published`; decidir arquivamento e data de publicação. |
| Parceiros | `GET /admin/partners`, `POST /admin/partners`, `GET /admin/partners/{id}`, `PATCH /admin/partners/{id}`, `DELETE /admin/partners/{id}` | Implementado para testes sem autenticação em `APP_ENV=development`, conforme decisão de 06/11/2026. Em outros ambientes retorna 404. No `PATCH`, `socials` substitui a lista inteira quando enviado e fica preservado quando omitido. Exclusão física remove também os links sociais. |
| Informações | `GET /admin/info-sections`, `GET /admin/info-sections/{id}`, `PATCH /admin/info-sections/{id}` | Condicional; editor atual altera só o corpo. |

**Não criar rotas de produção** para os exemplos fixos nem para o botão “Gerar envio simulado” dos mocks.

## DTOs a fechar

| Recurso | Campos candidatos | Diferença do mock / decisão |
| --- | --- | --- |
| `Cat` | `id`, `name`, `sex`, `birthDate?`, `approximateAgeMonths?`, `shortDescription`, `description`, `adoptionStatus`, `careStatus`, `castrated`, `vaccinated`, `fivFelvNegative?`, `traits`, `published`, `coverPhoto?`, `photos?` | `ageLabel` e `imageUrl` são apresentação; idade e capa vêm de dados estruturados. |
| `Campaign` | `id`, `title`, `description`, `goalCents`, `raisedCents`, `pixKey?`, `startsOn?`, `endsOn?`, `published` | `daysRemaining` é derivado; recebedor e origem de valor precisam de aprovação. |
| `GuideCategory` / `GuideArticle` | Categoria: `id`, `name`, `slug`, `position`, `published`. Artigo: `id`, `categoryId`, `title`, `slug`, `summary`, `body`, `referencesText?`, `published`, `publishedAt?`. | O app usa um subconjunto; SQL já prevê publicação. |
| `Publication` | `id`, `title`, `body`, `status: draft|published`, `publishedAt?`, `createdAt`, `updatedAt` | Tabela ainda não existe. |
| `Partner` | `id`, `name`, `category`, `description`, `position`, `published`, `socials[]`, `createdAt`, `updatedAt` | Categorias e plataformas seguem os enums do app; `isDemo` é apenas mock. |
| `InfoSection` | `id`, `title`, `body`, `position?` | `actions` são rotas internas e podem ficar no app. |
| `AdminReceipt` | `id`, `protocol`, `kind`, `status`, `submittedAt`, `summary`; detalhes só a usuários autorizados | `source: session/demo/example` e `sections[]` são formatos de apresentação, não contrato. |

### Adoção

O formulário mockado propõe `catId`, `applicantName` (2–160 caracteres), `applicantPhone` (DDD brasileiro, 10–11 dígitos), `applicantEmail?` (até 255), `city?` (2–120), `housingType?` (`house|apartment|other`), `hasOtherAnimals?`, `adoptionReasons?` (até 500), `consentPrivacy: true`. O servidor precisa validar novamente, verificar disponibilidade e gerar o protocolo. Os três campos de interesse podem ser guardados em `answers` JSONB, após acordo. Recibo mínimo candidato: `{ "protocol": "...", "catId": "..." }`. Definir finalidade, aviso e retenção dos dados pessoais.

### Medicamentos

O app coleta `personName?`, `personEmail?`, `personPhoneWhatsApp?`, `catName?`, `catAge?`, `requestReason?`, `diagnosis?`, `dosage?`, `urgency?` (`low|medium|high`), `pickupAvailability?` e até **3 anexos de 10 MiB cada**. Hoje esses campos são opcionais no tipo e o mock não guarda o conteúdo. A ONG precisa definir obrigatoriedade, consentimento, tipos aceitos, acesso e retenção. Para arquivos reais, decidir `multipart/form-data` ou upload separado; URI local `file://`/`content://` não é URL persistente. Recibo mínimo candidato: `{ "protocol": "...", "attachmentCount": 0 }`.

### Estados e publicação

O admin simula `pending`, `in_review`, `approved`, `rejected` para adoções e medicamentos. O SQL de adoção usa `submitted`, `under_review`, `needs_information`, `approved`, `rejected`, `completed`, `cancelled`. **Não mapear automaticamente**: decidir vocabulário, transições e estados finais por fluxo. `cats.adoption_status` e `cats.care_status` são dimensões diferentes. Gatos, campanhas, categorias e artigos têm `published` no SQL; publicações usam `draft|published` no mock.

## Decisões prioritárias

1. Autenticação/autorização, recuperação, revogação e auditoria.
2. Dados pessoais mínimos, consulta por protocolo, privacidade e retenção em adoção/medicamentos.
3. Armazenamento e entrega de fotos/anexos, limites, remoção e acesso protegido.
4. Estados/transições, publicação/ocultação, arquivamento/exclusão e vínculos.
5. Origem de `raisedCents` e Pix oficial; o app não processa pagamentos.
6. Conteúdo de parceiros/institucional via API, paginação, filtros e erros.

Guia de implementação/testes: [`backend/README.md`](../backend/README.md).
