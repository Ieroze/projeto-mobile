# Mapa do frontend mobile

O aplicativo Expo/React Native fica em `frontend/`. A entrada é `frontend/App.tsx`; a navegação tipada está em `src/navigation/RootNavigator.tsx` e seus parâmetros em `src/types/navigation.ts`.

## Onde editar

| O que mudar | Local |
| --- | --- |
| Tela pública ou administrativa | `frontend/src/screens/` (`Admin*Screen.tsx` para o admin) |
| Rotas, abas e separação pública/admin | `frontend/src/navigation/RootNavigator.tsx` e `frontend/src/types/navigation.ts` |
| Componente reutilizado por uma feature | `frontend/src/features/` |
| Componentes genéricos de tela e texto | `frontend/src/components/` |
| Cores, espaçamento, tipografia e tema claro/escuro | `frontend/src/theme/` |
| Tipos dos dados | `frontend/src/types/` |
| Dados e estado de demonstração em memória | `frontend/src/mocks/` |
| Leitura/escrita dos dados pelas telas | `frontend/src/services/` |

## Recursos nativos de demonstração

`SettingsScreen.tsx` oferece **Testar notificação local**. `services/localNotificationService.ts` pede permissão quando necessário e agenda um aviso para cerca de cinco segundos depois, usando o canal padrão do Android; nenhum push remoto ou token é usado. `features/sharing/ShareButton.tsx` abre o menu nativo de compartilhamento nos detalhes de gato e campanha com texto de demonstração, sem depender de links públicos.

No Expo Go 57.0.9 para Android, a importação de `expo-notifications` tenta carregar um módulo nativo de tópicos de push ausente. `frontend/metro.config.js` redireciona somente esse import para o substituto fornecido pelo próprio pacote. O app não usa tópicos; notificações locais continuam disponíveis. Reinicie o Metro após alterar essa configuração.

O Expo Go ainda mostra dois avisos gerais de limitações de `expo-notifications`. A criação de canal personalizado causava uma falha nativa nesse ambiente; o teste local usa o canal padrão e foi confirmado na barra de notificações do emulador.

O cadastro inicial de gato permite selecionar uma foto de capa da galeria com `expo-image-picker`. `AdminCatPhotosScreen.tsx` permite selecionar outras fotos ou manter o fluxo por URL HTTPS. O URI local é guardado apenas nos mocks, por `catRepository.ts` e `catAdminRepository.ts`, e aparece no perfil público enquanto a sessão estiver ativa. Não há upload, armazenamento persistente nem contrato de arquivos com o backend.

## Publicações do Admin

O atalho da home pública abre `PublicationsScreen.tsx`; `PublicationDetailsScreen.tsx` mostra o aviso completo. O público vê apenas itens com estado **Publicado**. A área de gestão tem `AdminPublicationsScreen.tsx` e `AdminPublicationFormScreen.tsx` para criar, editar, alternar entre Rascunho e Publicado e remover. Os dados ficam em `mocks/adminPublications.ts` e são acessados por `services/adminPublicationRepository.ts`; reiniciam com o aplicativo. Há três exemplos publicados e um rascunho fictício para conferir ambas as visões. O painel admin mantém os atalhos de Adoções e Medicamentos, sem os blocos de andamento por estado.

## Pix demonstrativo nas campanhas

`CampaignDetailsScreen.tsx` mostra um botão que abre a chave Pix cadastrada na campanha e um QR Code gerado localmente. `features/campaigns/pixPayload.ts` monta um BR Code estático sem valor definido; `CampaignPix.tsx` desenha o QR com `qrcode-generator`, sem serviço externo. As chaves atuais em `mocks/campaigns.ts` são fictícias. O campo do formulário administrativo aceita até 77 caracteres ASCII para manter a geração do código; chave vazia mostra aviso de ausência. Antes de aceitar doações reais, a ONG precisa confirmar chave, identificação do recebedor e fluxo financeiro.

## Fluxo de adoções e medicamentos

Os formulários públicos estão em `AdoptionFormScreen.tsx` e `MedicationFormScreen.tsx`. Eles chamam `adoptionRepository.ts` e `medicationRepository.ts`, que geram protocolos nos mocks `adoptionApplications.ts` e `medicationRequests.ts`. Esses mocks guardam somente protocolo + ID do gato ou quantidade de anexos, respectivamente.

No admin, `AdminReceiptsScreen.tsx` lista e filtra os protocolos por andamento, permite gerar envios simulados com dados fictícios e mostra os exemplos fixos de `mocks/adminReceiptExamples.ts`. Há quatro protocolos fictícios pré-carregados para adoções e quatro para medicamentos, um em cada estado, definidos em `mocks/adoptionApplications.ts`, `mocks/medicationRequests.ts`, `mocks/adminDemoSubmissions.ts` e `mocks/adminReceiptStatuses.ts`. As adoções de demonstração apontam para Thor; por isso, o mock impede sua remoção. Os envios simulados pelo botão usam os repositories públicos para gerar um protocolo e guardam apenas seus próprios dados inventados em `mocks/adminDemoSubmissions.ts`; formulários preenchidos manualmente continuam sendo resumidos. `AdminReceiptDetailsScreen.tsx` mostra os campos e os controles de andamento. `services/adminReceiptRepository.ts` monta os dados para essas telas; `mocks/adminReceiptStatuses.ts` guarda o estado local escolhido. Cores e botões dos estados ficam em `features/admin/ReceiptStatus.tsx`, e os tipos em `types/adminReceipt.ts`. O painel usa `services/adminOverviewRepository.ts` para mostrar totais de protocolos; os filtros por estado ficam nas listas administrativas. Os exemplos fixos não entram nessas contagens.

As quatro opções de andamento são apenas uma simulação de interface. O backend ainda implementa somente `/health`; contrato, permissões, transições e persistência precisam de alinhamento antes da integração. Nenhum dado pessoal ou arquivo dos formulários preenchidos manualmente é exposto ao admin nesta fase; os detalhes completos dos envios simulados contêm somente dados fictícios.
