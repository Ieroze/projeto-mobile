# Área administrativa mobile — visão de produto

Atualizado em 23/10/2026. Este documento planeja o frontend administrativo do Gatos da Corte. Não declara funcionalidades de backend já implementadas: atualmente existe apenas `GET /health`.

## Direção

A gestão ficará no mesmo aplicativo React Native, em navegação separada das telas públicas. O frontend será construído primeiro com mocks em `frontend/src/mocks`, acessados por repositories em `frontend/src/services`. A futura comunicação será React Native → FastAPI (`/api/v1`) → PostgreSQL. A definição final de contratos, regras e schema cabe ao alinhamento com o responsável pelo backend.

O login e a home administrativa iniciais são **demonstrações locais**. Qualquer e-mail válido com uma senha preenchida abre o painel. A senha não é enviada nem salva. A sessão dura somente enquanto o app está aberto. Isso não representa autenticação nem controle de acesso real.

A lista e o formulário de gatos estão implementados com criação, edição e remoção em memória. Gatos com protocolos de adoção gerados nesta sessão não podem ser removidos no mock. O cadastro inicial permite escolher uma foto de capa da galeria. A gestão de fotos permite selecionar mais imagens da galeria ou usar URLs HTTPS, editar, definir capa e remover; também há CRUD local de registros de saúde. A foto de capa aparece no perfil público; os registros de saúde ainda não aparecem nele. Imagens escolhidas ficam apenas na sessão, sem upload real. Publicação e regras definitivas de exclusão continuam pendentes.

As áreas de campanhas, artigos e categorias do Guia e parceiros possuem lista, formulário e remoção local. Informações institucionais permitem editar os textos existentes de “Mais”; o texto de privacidade permanece fora desse editor. Adoções e medicamentos já abrem com quatro protocolos fictícios completos por área, um em cada andamento, para avaliar listas, detalhes e filtros. As adoções fictícias estão vinculadas a Thor, que não pode ser removido neste mock. Formulários preenchidos manualmente continuam aparecendo apenas como **protocolos resumidos**, sem guardar seus dados pessoais. Cada área também oferece um **exemplo visual fictício** com ID próprio e um botão para gerar mais um envio simulado completo com dados inventados e protocolo local. O administrador pode simular os estados Pendente, Em análise, Aprovado e Reprovado; a escolha fica somente em memória. As listas podem ser filtradas por estado. O painel mantém atalhos para Adoções e Medicamentos, sem blocos de contagem por estado. Os exemplos fixos ficam fora das contagens. Não são filas reais de atendimento. Dados e edições locais voltam aos valores iniciais ao reiniciar o aplicativo.

A home pública inclui um atalho para **Publicações do Admin**. A gestão tem um CRUD local de avisos com título, texto e visibilidade Rascunho/Publicado. Apenas publicações marcadas como Publicado aparecem na lista e no detalhe públicos. O painel administrativo mantém atalhos para Adoções e Medicamentos, sem os blocos de andamento por estado.

As campanhas públicas têm um botão para mostrar a chave Pix cadastrada e um QR Code estático gerado localmente. As chaves atuais e as três publicações visíveis são exemplos fictícios; há também um rascunho disponível apenas na gestão. Dados oficiais de doação dependem de confirmação da ONG.

## Telas previstas

| Área | Telas | Ações esperadas |
| --- | --- | --- |
| Acesso | Login; recuperação de acesso se necessária | Iniciar/encerrar sessão e consultar perfil |
| Painel | Home administrativa | Resumo e atalhos para as áreas de gestão |
| Gatos | Lista, cadastro/edição, prévia; fotos; registros de saúde | Filtrar, criar, editar, publicar/ocultar, gerir fotos e saúde |
| Adoções | Lista e detalhe de manifestação | Consultar protocolos e simular andamento; filtros, notas e regras reais pendentes |
| Medicamentos | Lista e detalhe de solicitação | Consultar protocolos e simular andamento; atendimento real após definição do fluxo |
| Publicações do Admin | Lista e formulário de avisos | Criar, editar, publicar como rascunho ou publicado e remover avisos locais |
| Campanhas | Lista, cadastro/edição, prévia | Criar, editar, publicar/ocultar e gerir progresso conforme regra acordada |
| Guia | Lista/editor de artigos; categorias | Criar, editar, ordenar e publicar conteúdo |
| Conteúdo institucional | Parceiros e informações de “Mais” | Opcional, após confirmação da ONG |

Cadastro e edição podem compartilhar uma tela por domínio. Configurações de tema e preferências de notificações pertencem ao dispositivo; não exigem CRUD administrativo. Os textos legais atualmente são provisórios e precisam de aprovação da ONG antes de uma eventual gestão pelo app.

## Ordem de construção sugerida

1. Entrada e navegação administrativa, com sessão simulada, seguida de home com indicadores locais.
2. Gatos: lista, formulário, fotos locais da galeria ou por URL e registros de saúde prontos; publicação e upload real pendentes.
3. Manifestações de adoção: consulta de protocolos locais pronta; análise real depende de contrato e dados persistidos.
4. Solicitações de medicamentos: consulta de protocolos locais pronta; atendimento real depende de contrato, anexos e privacidade.
5. Campanhas: telas CRUD locais prontas; publicação e origem dos valores pendentes.
6. Guia do Felino: telas CRUD locais de artigos/categorias prontas; publicação/revisão pendentes.
7. Parceiros e informações institucionais: telas locais prontas; confirmar com a ONG se terão API e gestão definitiva.

Cada tela deve manter tema global, estados de carregamento/erro/vazio, navegação tipada e componentes menores. Dados completos nos mocks administrativos são apenas inventados para demonstração; envios manuais de adoção e medicamentos guardam somente recibos resumidos em memória. Quando houver integração, listagens administrativas de dados pessoais exigirão autenticação e autorização no backend.

## Decisões para validar com o backend e a ONG

- Modelo de sessão, permissões por operação e eventual recuperação de acesso.
- Visibilidade pública, publicação, arquivamento/exclusão e transições permitidas de status.
- Paginação, filtros e busca nas listagens administrativas, inclusive rascunhos.
- Armazenamento e envio de fotos e anexos; limites e acesso aos arquivos.
- Dados pessoais necessários para adoção e medicamentos, retenção, acesso e auditoria.
- Origem do valor arrecadado nas campanhas; o app não possui pagamentos nem conciliação.
- Quais textos, parceiros e links serão editáveis pelo administrador.
- Campos, validações e alterações de schema, sempre em conjunto com o responsável pelo backend.

As rotas candidatas e pontos em aberto estão em [API_CONTRACT_DRAFT.md](API_CONTRACT_DRAFT.md); as tabelas existentes e candidatas estão em [BACKEND_SCHEMA_PROPOSAL.md](BACKEND_SCHEMA_PROPOSAL.md). O desenvolvimento da API pode ser testado com `/docs`, Postman e testes automatizados sem emulador; o [guia do backend](../backend/README.md) indica quando usá-lo na integração mobile.
