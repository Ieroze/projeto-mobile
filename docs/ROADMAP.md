# Roadmap incremental

## Fase 1 - Starter (este pacote)
- Expo + TypeScript
- Navegacao
- Theme
- Tipos
- Mocks
- Telas iniciais
- Schema PostgreSQL basico

## Fase 2 - Refinamento visual
- Home conforme wireframe
- CatCard definitivo
- Perfil do gato
- estados vazios/erro/loading
- acessibilidade

## Fase 3 - Fluxo de adocao
- formulario dividido em etapas
- validacao local
- confirmacao/protocolo mock
- politica de privacidade/consentimento

## Fase 4 - Campanhas e Guia
- cards de campanha
- detalhes e Pix demonstrativo com QR Code local, sem pagamento real
- categorias/artigos do Guia
- pesquisa local

## Fase 5 - Contrato e area administrativa no mobile
- entrada, navegacao separada e home administrativa com sessao e indicadores simulados (implementados)
- gestao de gatos: cadastro, edicao, remocao, fotos da galeria ou por URL e registros de saude locais implementados; publicacao e upload real pendentes
- protocolos locais de adocao e medicamentos: lista/detalhe, envios ficticios completos, andamento local e filtros por estado implementados; painel com atalhos, sem blocos de contagem por estado; analise e status reais pendentes
- campanhas, artigos/categorias do Guia e parceiros: CRUD local implementado; regras de publicacao pendentes
- informacoes institucionais: edicao local dos textos existentes implementada; textos legais fora do editor
- publicacoes do Admin: CRUD local com rascunho/publicado; home e detalhe publicos exibem apenas publicados
- compartilhamento nativo de gatos/campanhas e teste de notificacao local em Configuracoes implementados; push remoto fora do escopo atual
- avaliar com a ONG se parceiros e informacoes institucionais terao API e gestao definitiva
- alinhar com o backend autenticacao, autorizacao, sessao, erros e contratos `/api/v1`
- validar campos, publicacao e transicoes de status com o responsavel pelo backend antes dos CRUDs reais
- consultar `ADMIN_OVERVIEW.md` para o mapa de telas e as decisoes pendentes
- consultar `API_CONTRACT_DRAFT.md` e `BACKEND_SCHEMA_PROPOSAL.md` para rotas, DTOs e tabelas candidatas; SQL continua referencia, nao migration aprovada

## Fase 6 - Integracao API
- substituir repositories mock por HTTP
- loading/error/retry
- schemas compartilhados via contrato
- autenticacao administrativa no backend
- testar API via `/docs`, cliente HTTP e testes automatizados; emulador na verificacao da integracao mobile

## Fase 7 - Qualidade
- testes unitarios
- testes de componentes
- testes E2E
- analytics e observabilidade se necessario
- preparacao de build Android/iOS
