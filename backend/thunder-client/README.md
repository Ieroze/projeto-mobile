# Thunder Client

## Importar a coleção

1. Inicie a API local na pasta `backend`.
2. No VS Code, abra a aba Thunder Client e escolha **Collections → Import**.
3. Selecione `Gatos-da-Corte.postman_collection.json` (formato Postman Collection v2.1, aceito pelo Thunder Client).
4. Execute `Sistema → Health`; a resposta esperada é `{"status":"ok"}`.

A coleção usa `http://127.0.0.1:8000` como `baseUrl`. Se a API estiver em outra URL, edite a variável da coleção `baseUrl`.

## Fluxo CRUD

Para cada recurso, execute primeiro **Criar ... de exemplo**. Copie o campo `id` da resposta e substitua o valor de `catId` ou `partnerId` nas variáveis da coleção. Em seguida, use as requisições de detalhe e PATCH. DELETE retorna `204 No Content` e remove permanentemente o registro.

Os exemplos são criados com `published: true`, então também aparecem nas listagens públicas. Faça os testes em banco local e apague os registros de exemplo quando terminar.

As rotas administrativas sem autenticação só ficam disponíveis quando a API roda com `APP_ENV=development`. Elas não devem ser expostas assim fora do ambiente local de teste.

## Rotas incluídas

- `GET /health`
- Gatos públicos: `GET /api/v1/cats`, `GET /api/v1/cats/{id}`
- Gatos administrativos: `GET|POST /api/v1/admin/cats`, `GET|PATCH|DELETE /api/v1/admin/cats/{id}`
- Parceiros públicos: `GET /api/v1/partners`, `GET /api/v1/partners/{id}`
- Parceiros administrativos: `GET|POST /api/v1/admin/partners`, `GET|PATCH|DELETE /api/v1/admin/partners/{id}`

## Campanhas e Guia do Felino

A coleção inclui leitura pública e rotas administrativas para campanhas, categorias e artigos. As rotas administrativas funcionam sem autenticação somente quando a API está em `APP_ENV=development`.

### Fluxo sugerido

1. Em **Campanhas administrativas**, execute **Criar campanha de exemplo** e copie o `id` para `campaignId`.
2. Execute **Publicar e atualizar campanha (PATCH)** para torná-la visível na pasta **Campanhas públicas**. Teste detalhe/lista pública antes de usar **Excluir campanha**.
3. Em **Guia: categorias administrativas**, execute **Criar categoria de exemplo** e copie o `id` para `guideCategoryId`.
4. Use esse ID no POST de artigo. Copie o `id` retornado para `guideArticleId`; execute o PATCH de publicação para vê-lo nas requisições públicas.
5. Ao limpar os dados, exclua primeiro o artigo e depois a categoria. A exclusão da categoria retorna `409` enquanto houver artigos vinculados.

Os slugs de categoria e artigo precisam ser únicos. Se repetir a criação após já ter usado os slugs do exemplo, altere-os no corpo do POST antes de executar. DELETE remove permanentemente os registros; use dados locais de teste.

Se a extensão não resolver `{{baseUrl}}`, `{{campaignId}}`, `{{guideCategoryId}}` ou `{{guideArticleId}}`, configure as variáveis da coleção ou substitua pelos valores literais. O corpo do artigo usa `guideCategoryId`; detalhe e PATCH usam `guideArticleId`.

### Rotas incluídas

- Campanhas públicas: `GET /api/v1/campaigns`, `GET /api/v1/campaigns/{id}`
- Campanhas administrativas: `GET|POST /api/v1/admin/campaigns`, `GET|PATCH|DELETE /api/v1/admin/campaigns/{id}`
- Guia público: `GET /api/v1/guide/categories`, `GET /api/v1/guide/articles`, `GET /api/v1/guide/articles/{id}`
- Categorias administrativas: `GET|POST /api/v1/admin/guide/categories`, `GET|PATCH|DELETE /api/v1/admin/guide/categories/{id}`
- Artigos administrativos: `GET|POST /api/v1/admin/guide/articles`, `GET|PATCH|DELETE /api/v1/admin/guide/articles/{id}`


## Exemplos JSON adicionados

A cole??o agora cont?m tr?s requisi??es POST de exemplo para cada recurso que aceita cria??o: gatos, parceiros, campanhas, categorias do Guia, artigos do Guia, fotos, registros de sa?de, solicita??es de ado??o e pedidos de medica??o. Os dados s?o fict?cios; os slugs dos tr?s artigos e categorias s?o diferentes para permitir criar todos no mesmo banco.

### Ordem para testar recursos vinculados

1. Crie um gato publicado e dispon?vel em **Gatos administrativos** e copie o `id` retornado para `catId`.
2. Use `catId` para criar fotos, registros de sa?de e solicita??es de ado??o. A ado??o exige um gato publicado com status `available`.
3. Crie uma categoria em **Guia: categorias administrativas** e copie o ID para `guideCategoryId` antes de criar os artigos.
4. Copie os IDs retornados para `catPhotoId`, `catHealthRecordId`, `adoptionApplicationId` e `medicationRequestId` para usar detalhe, atualiza??o e hist?rico.
5. Os exemplos incluem PATCH, PUT onde existe substitui??o completa, e DELETE para fotos e registros de sa?de. Use DELETE somente nos registros locais de teste.

A cole??o inclui tamb?m os fluxos de status de ado??o e medica??o. Esses pedidos n?o t?m PUT ou DELETE. Todos os endpoints de ado??o e medica??o continuam restritos a `APP_ENV=development`.
