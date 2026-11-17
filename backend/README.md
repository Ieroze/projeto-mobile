# Backend — Gatos da Corte

API REST em FastAPI, SQLAlchemy e PostgreSQL. O aplicativo mobile deve acessar os dados pela API; não se conecta diretamente ao banco.

## Mapa do código

O arquivo [`backend.map`](backend.map) resume os módulos, o fluxo de uma requisição e os domínios da API.

```text
app/
  main.py                 criação da aplicação FastAPI
  api/                    registro de rotas e validação HTTP
  controllers/            tradução entre HTTP, schemas e services
  services/               regras de negócio e consultas SQLAlchemy
  schemas/                DTOs Pydantic de entrada e saída
  models/                 entidades SQLAlchemy e enums
  db/                     engine, sessão e dados de demonstração
app/core/                 configuração por ambiente
alembic/                  configuração e histórico de migrations
sql/                      schema SQL de referência da baseline
thunder-client/           collections Postman importáveis pelo Thunder Client
```

Fluxo normal: `api → controller → service → model/database`; a resposta percorre o caminho de volta por schemas Pydantic. Controllers não devem concentrar SQL ou regras de negócio.

## Configuração local

Requisitos: Python compatível com as dependências em `requirements.txt` e PostgreSQL.

Na pasta `backend/`, crie o ambiente e instale as dependências:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

No macOS/Linux, ative com `source .venv/bin/activate`. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para o banco local. Não versione nem compartilhe `.env` ou credenciais. `APP_ENV=development` habilita as rotas de administração locais sem autenticação.

Inicie a API localmente:

```bash
uvicorn app.main:app --reload
```

- Health check: `GET http://127.0.0.1:8000/health`
- OpenAPI/Swagger: `http://127.0.0.1:8000/docs`
- Prefixo das rotas versionadas: `/api/v1`

## Banco e migrations

Execute os comandos a partir de `backend/`, com o ambiente virtual ativado:

```bash
alembic current
alembic history
alembic upgrade head
```

Em um banco novo, `alembic upgrade head` aplica a baseline e as migrations seguintes. Se o banco já recebeu `sql/schema.sql`, confira que ele corresponde à baseline antes de registrá-lo com `alembic stamp 0001_initial_schema`; depois aplique as revisions posteriores com `alembic upgrade head`. `stamp` só registra uma revisão: não cria nem valida as tabelas.

Histórico de schema:

| Revision | Conteúdo |
| --- | --- |
| `0001_initial_schema` | Schema inicial de gatos, adoções, campanhas e Guia do Felino, entre outras tabelas base. |
| `0002_partners` | Parceiros, links sociais e enums correspondentes. |
| `0003_cat_delete_cascade` | Exclusão de gatos também exclui solicitações de adoção vinculadas. |
| `0004_adoption_history_medications` | Histórico de status de adoção e tabela/enums de pedidos de medicação. |

Confira com o responsável pelo backend as alterações de schema antes de aplicá-las. A existência de uma migration no repositório não significa que ela já foi aplicada ao banco. A migration 0004 precisa estar aplicada para usar o histórico de adoção e os pedidos de medicação.

Não há criação automática de tabelas ao iniciar a aplicação. O seeder opcional é `python -m app.db.seed`; execute-o apenas em banco local após as migrations. Ele cria ou redefine dados de demonstração com IDs estáveis para gatos e parceiros específicos, não é uma limpeza genérica do banco.

## Rotas

As listas aceitam `limit` e `offset`, salvo indicação contrária. Rotas administrativas e fluxos de atendimento sem autenticação respondem 404 fora de `APP_ENV=development`. Não exponha esse modo em rede pública.

### Gatos

- Público: `GET /api/v1/cats` e `GET /api/v1/cats/{catId}`. A listagem mostra apenas gatos publicados e aceita `adoptionStatus` e `careStatus` como filtros.
- Administração local: `GET|POST /api/v1/admin/cats` e `GET|PATCH|PUT|DELETE /api/v1/admin/cats/{catId}`.
- `PATCH` altera somente os campos enviados; `PUT` substitui os campos do recurso usando os defaults do schema para omissões.

### Fotos e saúde

- Fotos: `GET|POST /api/v1/admin/cats/{catId}/photos` e `GET|PATCH|PUT|DELETE /api/v1/admin/cats/{catId}/photos/{photoId}`.
- Saúde: `GET|POST /api/v1/admin/cats/{catId}/health-records` e `GET|PATCH|PUT|DELETE /api/v1/admin/cats/{catId}/health-records/{recordId}`.
- Fotos armazenam URLs e metadados; não há upload de arquivos. Registros de saúde são privados e não aparecem nas rotas públicas.

### Parceiros

- Público: `GET /api/v1/partners` e `GET /api/v1/partners/{partnerId}`; somente publicados. A listagem aceita filtro `category`.
- Administração local: `GET|POST /api/v1/admin/partners` e `GET|PATCH|PUT|DELETE /api/v1/admin/partners/{partnerId}`.

### Campanhas

- Público: `GET /api/v1/campaigns` e `GET /api/v1/campaigns/{campaignId}`; somente campanhas publicadas.
- Administração local: `GET|POST /api/v1/admin/campaigns` e `GET|PATCH|PUT|DELETE /api/v1/admin/campaigns/{campaignId}`.
- A API armazena `raisedCents` e `pixKey`; confirme com a organização a origem do total arrecadado e a chave oficial antes do uso real.

### Guia do Felino

- Público: `GET /api/v1/guide/categories`, `GET /api/v1/guide/articles` e `GET /api/v1/guide/articles/{articleId}`. Artigos públicos precisam estar publicados e pertencer a uma categoria publicada. A listagem aceita `categoryId`.
- Administração local: CRUD completo com `GET|POST /api/v1/admin/guide/categories`, `GET|PATCH|PUT|DELETE /api/v1/admin/guide/categories/{categoryId}`, `GET|POST /api/v1/admin/guide/articles` e `GET|PATCH|PUT|DELETE /api/v1/admin/guide/articles/{articleId}`.
- Categoria não pode ser excluída enquanto houver artigos vinculados (409). Reassocie ou exclua os artigos antes. Slugs usam letras minúsculas, números e hífens.

### Adoção

- Envio: `POST /api/v1/adoption-applications`. No estado atual, essa rota também está restrita a `APP_ENV=development`. Exige consentimento, telefone brasileiro válido e gato publicado com status `available`.
- Administração local: `GET /api/v1/admin/adoption-applications`, `GET /api/v1/admin/adoption-applications/{applicationId}`, `PATCH /api/v1/admin/adoption-applications/{applicationId}/status` e `GET /api/v1/admin/adoption-applications/{applicationId}/history`.
- Status tem transições permitidas; status finais não podem ser reabertos. Não há PUT ou DELETE de solicitações. A consulta pública por protocolo não está habilitada.

### Pedidos de medicação

- Envio: `POST /api/v1/medication-requests` — somente em `APP_ENV=development`. Exige consentimento, ao menos um contato e algum detalhe do pedido. O endpoint é textual e não aceita anexos.
- Administração local: `GET /api/v1/admin/medication-requests`, `GET /api/v1/admin/medication-requests/{requestId}` e `PATCH /api/v1/admin/medication-requests/{requestId}/status`.
- Não há PUT ou DELETE de pedidos. A tabela e os enums dependem da migration 0004.

## Collections Thunder Client

Importe os arquivos da pasta `thunder-client/` pelo menu **Collections → Import**. As duas partes foram divididas no limite de pastas para manter menos de 50 requisições por collection:

- `Gatos-da-Corte-parte-1.postman_collection.json`
- `Gatos-da-Corte-parte-2.postman_collection.json`

`Gatos-da-Corte.postman_collection.json` contém a collection completa de referência. Use os exemplos em banco local; fluxos vinculados exigem criar primeiro os recursos pai e copiar os IDs retornados para as variáveis.

## Limites atuais

- O aplicativo mobile continua usando mocks e não está conectado à API.
- Autenticação/autorização reais, CRUD administrativo no mobile, upload de imagens e integrações de pagamento não estão implementados.
- Políticas de privacidade, retenção e anonimização de dados pessoais precisam ser definidas antes de disponibilizar adoção ou medicação fora do desenvolvimento local.
