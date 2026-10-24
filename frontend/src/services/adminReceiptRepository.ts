import { adoptionRepository } from './adoptionRepository';
import { catRepository } from './catRepository';
import { medicationRepository } from './medicationRepository';
import { getAdminReceiptExample } from '../mocks/adminReceiptExamples';
import { mockAdminDemoSubmissions } from '../mocks/adminDemoSubmissions';
import { mockAdminReceiptStatuses } from '../mocks/adminReceiptStatuses';
import { AdminReceiptItem, ReceiptKind, ReceiptStatus } from '../types/adminReceipt';

export type { AdminReceiptItem, ReceiptKind } from '../types/adminReceipt';

const housingNames = { house: 'Casa', apartment: 'Apartamento', other: 'Outro' };
const urgencyNames = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const shown = (value?: string) => value?.trim() || 'Não informado';

function demoItem(kind: ReceiptKind, protocol: string, catName?: string): AdminReceiptItem | undefined {
  const demo = mockAdminDemoSubmissions.find(protocol);
  if (!demo || demo.kind !== kind) return undefined;
  const base = { protocol, kind, source: 'demo' as const, status: mockAdminReceiptStatuses.get(kind, protocol) };
  if (demo.kind === 'adoption') {
    const input = demo.input;
    return { ...base, summary: `${input.applicantName} · ${catName ?? input.catId}`, sections: [
      { title: 'Gato de interesse', fields: [{ label: 'Gato', value: catName ?? input.catId }, { label: 'ID do gato', value: input.catId }] },
      { title: 'Contato', fields: [
        { label: 'Nome', value: input.applicantName }, { label: 'Telefone', value: input.applicantPhone },
        { label: 'E-mail', value: shown(input.applicantEmail) }, { label: 'Cidade', value: shown(input.city) },
      ] },
      { title: 'Interesse', fields: [
        { label: 'Moradia', value: input.housingType ? housingNames[input.housingType] : 'Não informado' },
        { label: 'Outros animais', value: input.hasOtherAnimals === undefined ? 'Não informado' : input.hasOtherAnimals ? 'Sim' : 'Não' },
        { label: 'Motivos', value: shown(input.adoptionReasons) },
        { label: 'Consentimento', value: input.consentPrivacy ? 'Sim' : 'Não' },
      ] },
    ] };
  }
  const input = demo.input;
  return { ...base, summary: `${shown(input.personName)} · ${shown(input.catName)}`, sections: [
    { title: 'Pessoa', fields: [
      { label: 'Nome', value: shown(input.personName) }, { label: 'E-mail', value: shown(input.personEmail) },
      { label: 'Telefone / WhatsApp', value: shown(input.personPhoneWhatsApp) },
    ] },
    { title: 'Felino e pedido', fields: [
      { label: 'Gato', value: shown(input.catName) }, { label: 'Idade', value: shown(input.catAge) },
      { label: 'Motivo', value: shown(input.requestReason) }, { label: 'Diagnóstico', value: shown(input.diagnosis) },
      { label: 'Dosagem', value: shown(input.dosage) }, { label: 'Urgência', value: input.urgency ? urgencyNames[input.urgency] : 'Não informada' },
    ] },
    { title: 'Retirada e anexos', fields: [
      { label: 'Disponibilidade', value: shown(input.pickupAvailability) },
      { label: 'Anexos', value: `${input.attachments.length} arquivos fictícios; nenhum arquivo real armazenado` },
      { label: 'Nomes de exemplo', value: input.attachments.map((file) => file.name).join(', ') || 'Nenhum' },
    ] },
  ] };
}

export const receiptRepository = {
  async list(kind: ReceiptKind): Promise<AdminReceiptItem[]> {
    if (kind === 'medication') {
      const receipts = await medicationRepository.listReceipts();
      const items: AdminReceiptItem[] = receipts.map((item) => demoItem(kind, item.protocol) ?? ({
        protocol: item.protocol, kind, source: 'session', status: mockAdminReceiptStatuses.get(kind, item.protocol),
        summary: `${item.attachmentCount} ${item.attachmentCount === 1 ? 'anexo selecionado' : 'anexos selecionados'}`,
        sections: [{ title: 'Resumo da simulação', fields: [
          { label: 'Anexos selecionados', value: String(item.attachmentCount) },
          { label: 'Dados do pedido', value: 'Não armazenados nesta fase' },
          { label: 'Arquivos', value: 'Não armazenados nem enviados' },
        ] }],
      }));
      const example = getAdminReceiptExample(kind);
      return [...items, { ...example, status: mockAdminReceiptStatuses.get(kind, example.protocol) }];
    }
    const [receipts, cats] = await Promise.all([adoptionRepository.listReceipts(), catRepository.list()]);
    const names = new Map(cats.map((cat) => [cat.id, cat.name]));
    const items: AdminReceiptItem[] = receipts.map((item) => demoItem(kind, item.protocol, names.get(item.catId)) ?? ({
      protocol: item.protocol, kind, source: 'session', status: mockAdminReceiptStatuses.get(kind, item.protocol),
      summary: `Gato: ${names.get(item.catId) ?? item.catId}`,
      sections: [{ title: 'Resumo da simulação', fields: [
        { label: 'Gato de interesse', value: names.get(item.catId) ?? item.catId },
        { label: 'ID do gato', value: item.catId },
        { label: 'Dados da pessoa', value: 'Não armazenados nesta fase' },
      ] }],
    }));
    const example = getAdminReceiptExample(kind);
    return [...items, { ...example, status: mockAdminReceiptStatuses.get(kind, example.protocol) }];
  },
  async updateStatus(kind: ReceiptKind, protocol: string, status: ReceiptStatus): Promise<void> {
    const items = await receiptRepository.list(kind);
    if (!items.some((item) => item.protocol === protocol)) throw new Error('RECEIPT_NOT_FOUND');
    mockAdminReceiptStatuses.set(kind, protocol, status);
  },
  async createDemo(kind: ReceiptKind): Promise<string> {
    if (kind === 'adoption') {
      const cats = await catRepository.list();
      const cat = cats.find((item) => item.adoptionStatus === 'available');
      if (!cat) throw new Error('NO_AVAILABLE_CAT');
      const input = mockAdminDemoSubmissions.adoptionInput(cat.id);
      const receipt = await adoptionRepository.submit(input);
      mockAdminDemoSubmissions.add({ kind, protocol: receipt.protocol, input });
      return receipt.protocol;
    }
    const input = mockAdminDemoSubmissions.medicationInput();
    const receipt = await medicationRepository.submit(input);
    mockAdminDemoSubmissions.add({ kind, protocol: receipt.protocol, input });
    return receipt.protocol;
  },
};
