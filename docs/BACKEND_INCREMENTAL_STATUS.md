# Entrega incremental do backend — 12/11/2026

## Incluído

- CRUD administrativo de fotos em `/api/v1/admin/cats/{catId}/photos`. São armazenados URL e metadados; upload de arquivo não está incluído.
- CRUD administrativo de registros de saúde em `/api/v1/admin/cats/{catId}/health-records`. Os registros não são expostos publicamente.
- PUT de substituição completa nos CRUDs de gatos, parceiros, campanhas, categorias e artigos do Guia, fotos e registros de saúde. Campos omitidos assumem os padrões do schema. PATCH continua parcial.
- Adoção: PATCH de status valida transições, aceita `internalNotes` e registra histórico consultável em `/api/v1/admin/adoption-applications/{id}/history`. Não há PUT ou exclusão de solicitações.
- Medicação: POST textual em `/api/v1/medication-requests`, administração com listagem, detalhe e PATCH de status em `/api/v1/admin/medication-requests`. Exige consentimento, um contato e detalhes do pedido. Não aceita anexos. Não há PUT ou exclusão de solicitações.
- Rotas de medicação e adoção (públicas e administrativas) ficam disponíveis somente quando `APP_ENV=development`, até decidir retenção e políticas de dados e autenticação.

## Transições de atendimento

`submitted -> under_review|cancelled`; `under_review -> needs_information|approved|rejected|cancelled`; `needs_information -> under_review|approved|rejected|cancelled`; `approved -> completed|cancelled`. Rejeitada, concluída e cancelada são finais.

## Aplicação de schema e itens adiados

Aplicar `alembic upgrade head` na pasta `backend/` para criar histórico de adoção e tabelas/enums de medicação. Ainda ficam para a próxima rodada: CRUD de publicações, API de seções informativas e autenticação real. As rotas administrativas sem autenticação não devem ser expostas em ambiente público.
