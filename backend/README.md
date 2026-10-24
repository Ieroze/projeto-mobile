# Backend FastAPI — estado e guia de trabalho

Atualizado em 23/10/2026. Hoje existe somente `GET /health`. A aplicação FastAPI está em `app/main.py`; `sql/schema.sql` é uma **referência para discussão**, não uma migration aprovada nem sinal de que o banco esteja criado. Não há integração de domínio, autenticação, upload ou notificações com o app.

## Onde estão as propostas

- [Contrato de API e DTOs candidatos](../docs/API_CONTRACT_DRAFT.md): rotas públicas/admin, diferenças dos mocks, estados e decisões pendentes.
- [Mapa do schema](../docs/BACKEND_SCHEMA_PROPOSAL.md): tabelas existentes no SQL e estruturas candidatas ainda ausentes.
- [Mapa do frontend](../docs/FRONTEND_MAP.md): telas, repositories e mocks que futuramente consumirão a API.
- [Visão do admin](../docs/ADMIN_OVERVIEW.md): fluxos de gestão do produto.

As rotas e tabelas propostas precisam de alinhamento com o frontend, a ONG e a pessoa responsável pelo backend antes de virar contrato/migration. Não criar endpoints apenas para reproduzir IDs, exemplos fixos, login demonstrativo ou estados temporários dos mocks.

## Executar o que já existe

Com Python compatível com as dependências do projeto, a partir de `backend/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Depois, abrir `http://127.0.0.1:8000/health` (resposta esperada: `status: ok`), `http://127.0.0.1:8000/docs` (Swagger UI) ou `http://127.0.0.1:8000/openapi.json`. A configuração lê `.env` se existir; `database_url` é apenas configuração por enquanto. Não é preciso subir PostgreSQL para testar `/health`.

## Precisa de emulador?

**Não para desenvolver e testar a API.** Postman, curl ou o `/docs` do FastAPI servem para testar rotas HTTP, validação, login, permissões e upload quando essas funcionalidades existirem. Testes automatizados com `pytest` e `fastapi.testclient.TestClient` são recomendados para regras, erros, autorização e regressões; para persistência real, testar também com banco de teste e migrations. Postman sozinho ajuda na exploração manual, mas não substitui essa suíte.

**O emulador entra na integração ponta a ponta com o app**, para conferir navegação, formulários, autenticação no dispositivo, escolha/envio de fotos e anexos, rede e exibição dos erros. A pessoa do backend pode trabalhar sem ele; alguém da equipe deve executar esses testes de integração quando os repositories do mobile passarem a usar HTTP. O teste de notificação local em Mais → Configurações não depende do backend; push remoto é um assunto posterior.

Se a API rodar na mesma máquina do emulador Android, `127.0.0.1` dentro do Android aponta para o próprio emulador. O endereço do host é `http://10.0.2.2:8000` no emulador Android padrão. Em dispositivo físico, usar um endereço alcançável na rede ou ambiente de desenvolvimento; configurar HTTPS e regras de rede adequadas antes de produção. Isso só será necessário na fase de integração, não agora.

Referências oficiais: [FastAPI: documentação interativa](https://fastapi.tiangolo.com/tutorial/first-steps/), [FastAPI: TestClient](https://fastapi.tiangolo.com/tutorial/testing/), [FastAPI: arquivos](https://fastapi.tiangolo.com/tutorial/request-files/) e [Android: rede do emulador](https://developer.android.com/studio/run/emulator-networking-address).

## Ordem de implementação sugerida

1. Validar o contrato e as decisões de produto/privacidade: autenticação, dados pessoais, status, publicação, arquivos, Pix e conteúdo opcional. Separar tarefas que dependem da ONG.
2. Definir DTOs e erros públicos, migrations Alembic e fixtures de teste. `sql/schema.sql` deve ser tratado como insumo, não executado como migration de produção.
3. Implementar leitura pública e admin de gatos/campanhas/Guia/publicações, com testes de visibilidade; adicionar gestão privada conforme decisões aprovadas.
4. Implementar envio de adoção/medicamentos e filas administrativas com autenticação, autorização, retenção e auditoria definidas. Arquivos reais só após fechar armazenamento e acesso.
5. Publicar OpenAPI e exemplos de requests/responses; combinar a troca gradual dos `src/services` com o frontend; validar Postman/TestClient e depois no emulador.

As dependências atuais são sugestões iniciais. Para receber `multipart/form-data` com `UploadFile`, o FastAPI exige `python-multipart`; adicioná-lo apenas quando o fluxo de arquivos for aprovado. Para a suíte com `TestClient`, acrescentar `httpx` e `pytest` como dependências de desenvolvimento quando os testes forem criados.
