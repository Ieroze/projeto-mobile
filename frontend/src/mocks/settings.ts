import { NotificationPreferences } from '../types/settings';

export const initialNotificationPreferences: NotificationPreferences = {
  campaigns: true,
  adoption: true,
};

export const legalDocuments = {
  terms: {
    title: 'Termos de uso',
    body: 'Este aplicativo está em fase de demonstração. As solicitações de adoção e medicamentos são simulações e não são enviadas à ONG. As informações exibidas podem mudar antes do lançamento. Os termos oficiais serão publicados pela Gatos da Corte quando o serviço estiver disponível.',
  },
  privacy: {
    title: 'Privacidade',
    body: 'Nesta fase, os formulários são simulados. Os dados digitados e anexos escolhidos não são enviados à ONG. As preferências de notificações são mantidas somente durante esta sessão. A política de privacidade oficial será publicada antes da ativação dos serviços.',
  },
};
