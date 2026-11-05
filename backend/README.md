# Backend FastAPI

## Estrutura

O backend usa uma separacao MVC adaptada a uma API REST:

- `models/`: entidades SQLAlchemy que mapeiam PostgreSQL.
- `schemas/`: DTOs Pydantic de entrada e saida da API.
- `api/`: registro e agrupamento de rotas FastAPI.
- `controllers/`: adaptacao HTTP e coordenacao dos services.
- `services/`: regras de negocio.
- `db/`: engine, base ORM e dependencia de sessao por request.
- `alembic/`: migrations versionadas do schema.

Controllers nao devem conter SQL. Services coordenam as regras e a camada de dados; models representam persistencia. O app nao cria tabelas automaticamente: use Alembic.

## Configuracao local

Crie `.env` nesta pasta a partir de `.env.example` e configure `DATABASE_URL`. Nao coloque credenciais reais no arquivo de exemplo nem as versione. O banco inicial e `gatos_da_corte`.

## Comandos

A partir de `backend/`, com o ambiente virtual ativado:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
alembic current
alembic upgrade head
```

O banco que ja recebeu `sql/schema.sql` deve ser registrado com a baseline uma unica vez:

```bash
alembic stamp 0001_initial_schema
```

Em um banco novo, use `alembic upgrade head`. A primeira migration reproduz o schema inicial de `sql/schema.sql`; trate esse arquivo e a migration inicial como baseline congelada. Mudancas futuras devem ser novas revisions Alembic.

O endpoint de disponibilidade segue em `GET /health`; a documentacao interativa do FastAPI fica em `/docs`.
