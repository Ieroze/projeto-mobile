# AGENTS.md - Gatos da Corte V2

## Objetivo

Este repositorio e o starter oficial do aplicativo Gatos da Corte.

## Regras para agentes (Codex)

1. Nao migrar JSX web do prototipo Figma de forma mecanica.
2. Usar componentes React Native (`View`, `Text`, `Pressable`, `FlatList`, etc.).
3. Preservar a separacao por features e o design system em `src/theme`.
4. Enquanto a API nao estiver pronta, manter os dados em `src/mocks`.
5. Isolar o acesso a dados em `src/services` para que os mocks possam ser trocados pela API depois.
6. Nao conectar o app diretamente ao PostgreSQL. O fluxo futuro sera React Native -> FastAPI -> PostgreSQL.
7. Evitar arquivos de tela gigantes. Se uma tela passar de ~250 linhas, extrair componentes.
8. Tipar navegacao, DTOs e estados com TypeScript. Evitar `any`.
9. Nao adicionar bibliotecas sem necessidade. Prefira APIs nativas do React Native/Expo.
10. Alteracoes de schema devem ser discutidas com o responsavel pelo backend.

## Escopo inicial do mobile

- Home
- Catalogo de gatos
- Perfil do gato
- Manifestacao de interesse/adocao (mock)
- Campanhas
- Guia do Felino
- Mais/Informacoes

## Fora do starter

- Autenticacao real
- Push notifications
- Pagamentos
- Upload real de imagens
- CRUD administrativo mobile
- Integracao real com FastAPI

## Planejado apos o starter

- Area administrativa no proprio app mobile, separada da navegacao publica.
- Telas de gestao para gatos, manifestacoes de adocao, campanhas e Guia; usar mocks ate a API estar pronta.
- Autenticacao e autorizacao reais via FastAPI, em alinhamento com o responsavel pelo backend.

Os itens acima continuam fora do starter inicial, mas fazem parte do produto planejado.
