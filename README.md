# Gatos da Corte - V2 Starter

Starter para o projeto mobile da ONG **Gatos da Corte**.

## Stack definida

- Frontend mobile: React Native + TypeScript + Expo SDK 57
- Navegação: React Navigation
- Backend: Python + FastAPI (estrutura inicial apenas)
- Banco de dados: PostgreSQL
- Dados do app nesta fase: mocks locais no frontend
- Docker: nao utilizado

## Estrutura

```text
gatos-da-corte/
├── frontend/        # aplicativo React Native/Expo
├── backend/         # esqueleto FastAPI + schema PostgreSQL
├── docs/            # arquitetura, contrato inicial e PDF
├── imgs_app/        # capturas JPG das telas do app
├── AGENTS.md        # instrucoes para Codex/agentes
└── CODEX_START_HERE.md
```

## Comeco rapido - frontend

```bash
cd frontend
npm install
npx expo install --fix
npm start
```

O projeto foi preparado para Expo SDK 57 (estavel em setembro de 2026). Se voce criar um projeto novo com `create-expo-app`, use a versao estavel atual e depois rode `npx expo install --fix` para alinhar dependencias.

As capturas das telas atuais estão organizadas em [imgs_app/README.md](imgs_app/README.md).

## Backend

O backend foi deixado propositalmente minimo, pois sera desenvolvido por outra pessoa.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Nesta fase o frontend **nao depende do backend**. Os dados estao em `frontend/src/mocks`.

## Banco

O schema inicial esta em:

```text
backend/sql/schema.sql
```

Ele e um ponto de partida e deve ser refinado junto com o backend antes das migrations definitivas.

## Para continuar no Codex

Leia primeiro:

1. `CODEX_START_HERE.md`
2. `AGENTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/API_CONTRACT_DRAFT.md`

Depois trabalhe incrementalmente, tela por tela, sem reescrever a arquitetura inteira.
