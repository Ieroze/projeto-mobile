# Arquitetura - Gatos da Corte V2

## 1. Visao geral

O aplicativo mobile e independente do backend nesta primeira fase. O objetivo e permitir que o time de frontend evolua UX, navegacao, componentes e estados usando dados mockados.

```text
+----------------------+       futuro       +---------------------+
| React Native / Expo  |  ----------------> | FastAPI / Python    |
| TypeScript           |      REST/JSON     | API versionada      |
+----------------------+                    +----------+----------+
                                                       |
                                                       v
                                            +---------------------+
                                            | PostgreSQL          |
                                            +---------------------+
```

## 2. Frontend

Organizacao orientada a features:

- `components`: componentes genericos reutilizaveis.
- `features`: logica e componentes especificos de dominio.
- `screens`: composicao de telas.
- `navigation`: stacks e tabs.
- `mocks`: dados temporarios.
- `services`: camada que futuramente fara HTTP.
- `theme`: tokens visuais.
- `types`: tipos de dominio e navegacao.

Para localizar os arquivos do mobile e seguir o fluxo de adoções/medicamentos, consulte `FRONTEND_MAP.md`.

## 3. Backend

O backend iniciou com:

- bootstrap FastAPI;
- endpoints `GET /health`, `GET /api/v1/cats` e `GET /api/v1/cats/{id}`;
- configuracao por variaveis de ambiente;
- schema SQL de referencia;
- contrato de API em documento.

A pessoa responsavel pelo backend podera escolher SQLAlchemy + Alembic mantendo o contrato de dominio.

As rotas e DTOs candidatos estão em [API_CONTRACT_DRAFT.md](API_CONTRACT_DRAFT.md); as tabelas existentes e propostas estão em [BACKEND_SCHEMA_PROPOSAL.md](BACKEND_SCHEMA_PROPOSAL.md). O SQL não é uma migration aprovada. O [guia do backend](../backend/README.md) explica execução e testes sem emulador.

## 4. Banco

O schema inicial separa:

- gatos;
- fotos;
- registros de saude;
- manifestacoes de adocao;
- campanhas;
- categorias e artigos do guia;
- administradores.

Solicitações de medicamentos, publicações administrativas, parceiros e informações institucionais existem apenas como mocks no frontend e não têm tabelas no SQL de referência. Sessões/revogação e auditoria também dependem de decisão. Alterações de schema exigem alinhamento com a pessoa responsável pelo backend e a ONG.

Status de adocao e status de cuidado sao separados para evitar modelagem ambigua.

## 5. Area administrativa planejada

A area administrativa tambem fara parte do aplicativo React Native, com navegacao separada da area publica. As telas poderao ser construidas com mocks enquanto a API evolui. Login real, autorizacao e operacoes de escrita deverao passar pelo FastAPI; o mobile nao acessara o PostgreSQL diretamente.

O escopo previsto inclui cadastro e edicao de gatos e seus dados relacionados, analise de manifestacoes de adocao, campanhas e conteudo do Guia. Operacoes, permissoes, regras de publicacao e de mudanca de status precisam ser alinhadas com o responsavel pelo backend antes da integracao. Um eventual painel web separado continua como decisao futura.

O mapa de telas e a ordem sugerida estao em `ADMIN_OVERVIEW.md`. A entrada e a home administrativas atuais usam uma sessao somente em memoria; a navegacao condicionada a essa sessao e apenas demonstrativa. Protecao real depende da autenticacao e autorizacao em cada rota privada da API. Os repositories administrativos devem continuar isolando dados e operacoes para a futura troca de mocks por HTTP.
