import { AdminReceiptItem, ReceiptKind } from '../types/adminReceipt';

// Exemplos fixos de interface. Não representam formulários enviados nesta sessão.
const examples: Record<ReceiptKind, AdminReceiptItem> = {
  adoption: {
    protocol: 'EX-ADOC-0001', kind: 'adoption', source: 'example', status: 'pending',
    summary: 'Exemplo de manifestação preenchida',
    sections: [
      { title: 'Gato de interesse', fields: [{ label: 'Gato', value: 'Luna (exemplo)' }, { label: 'ID do gato', value: 'luna (exemplo)' }] },
      { title: 'Contato', fields: [
        { label: 'Nome', value: 'Pessoa de exemplo' },
        { label: 'Telefone', value: '(00) 00000-0000' },
        { label: 'E-mail', value: 'pessoa@exemplo.com' },
        { label: 'Cidade', value: 'Cidade de exemplo' },
      ] },
      { title: 'Interesse', fields: [
        { label: 'Moradia', value: 'Apartamento' },
        { label: 'Outros animais', value: 'Sim' },
        { label: 'Motivos', value: 'Gostaria de oferecer um lar seguro e acompanhar a adaptação do gato.' },
        { label: 'Consentimento', value: 'Informado no formulário de exemplo' },
      ] },
    ],
  },
  medication: {
    protocol: 'EX-MED-0001', kind: 'medication', source: 'example', status: 'pending',
    summary: 'Exemplo de solicitação preenchida',
    sections: [
      { title: 'Pessoa', fields: [
        { label: 'Nome', value: 'Pessoa de exemplo' },
        { label: 'E-mail', value: 'pessoa@exemplo.com' },
        { label: 'Telefone / WhatsApp', value: '(00) 00000-0000' },
      ] },
      { title: 'Felino e pedido', fields: [
        { label: 'Gato', value: 'Gato de exemplo' },
        { label: 'Idade', value: '2 anos' },
        { label: 'Motivo', value: 'Necessidade de continuidade de um tratamento (exemplo).' },
        { label: 'Diagnóstico', value: 'Descrição demonstrativa, sem prontuário real.' },
        { label: 'Dosagem', value: 'Conforme orientação veterinária (exemplo).' },
        { label: 'Urgência', value: 'Média' },
      ] },
      { title: 'Retirada e anexos', fields: [
        { label: 'Disponibilidade', value: 'Dias úteis à tarde' },
        { label: 'Anexos', value: '2 arquivos de exemplo; nenhum arquivo armazenado' },
      ] },
    ],
  },
};

export function getAdminReceiptExample(kind: ReceiptKind): AdminReceiptItem {
  return examples[kind];
}
