import { AdoptionApplicationInput } from '../types/adoption';
import { MedicationRequestInput } from '../types/medication';

type DemoSubmission =
  | { kind: 'adoption'; protocol: string; input: AdoptionApplicationInput }
  | { kind: 'medication'; protocol: string; input: MedicationRequestInput };

const adoptionBase: AdoptionApplicationInput = {
  catId: 'thor',
  applicantName: 'Marina Exemplo',
  applicantPhone: '11999990000',
  applicantEmail: 'marina.exemplo@example.com',
  city: 'São Paulo',
  housingType: 'apartment',
  hasOtherAnimals: true,
  adoptionReasons: 'Tenho um ambiente seguro e gostaria de acompanhar a adaptação do gato.',
  consentPrivacy: true,
};

const medicationBase: MedicationRequestInput = {
  personName: 'Joana Exemplo',
  personEmail: 'joana.exemplo@example.com',
  personPhoneWhatsApp: '11988880000',
  catName: 'Mingau (exemplo)',
  catAge: '2 anos',
  requestReason: 'Continuidade de tratamento informado no formulário de demonstração.',
  diagnosis: 'Descrição fictícia para avaliar a tela administrativa.',
  dosage: 'Conforme orientação veterinária (exemplo).',
  urgency: 'medium',
  pickupAvailability: 'Dias úteis à tarde',
  attachments: [
    { uri: 'mock://receita-exemplo', name: 'receita-exemplo.pdf', mimeType: 'application/pdf' },
    { uri: 'mock://exame-exemplo', name: 'exame-exemplo.pdf', mimeType: 'application/pdf' },
  ],
};

const submissions: DemoSubmission[] = [
  { kind: 'adoption', protocol: 'GDC-ADOC-DEMO-0001', input: { ...adoptionBase } },
  { kind: 'adoption', protocol: 'GDC-ADOC-DEMO-0002', input: {
    ...adoptionBase, applicantName: 'Bruno Exemplo', applicantEmail: 'bruno.exemplo@example.com',
    housingType: 'house', hasOtherAnimals: false, city: 'Osasco',
    adoptionReasons: 'Quero oferecer um lar tranquilo e tempo para a adaptação.',
  } },
  { kind: 'adoption', protocol: 'GDC-ADOC-DEMO-0003', input: {
    ...adoptionBase, applicantName: 'Carla Exemplo', applicantEmail: 'carla.exemplo@example.com',
    housingType: 'apartment', hasOtherAnimals: false, city: 'Santo André',
    adoptionReasons: 'Já preparei o apartamento com telas e espaços para o gato.',
  } },
  { kind: 'adoption', protocol: 'GDC-ADOC-DEMO-0004', input: {
    ...adoptionBase, applicantName: 'Diego Exemplo', applicantEmail: 'diego.exemplo@example.com',
    housingType: 'other', city: 'Guarulhos',
    adoptionReasons: 'Gostaria de conhecer o processo de adoção responsável.',
  } },
  { kind: 'medication', protocol: 'GDC-MED-DEMO-0001', input: { ...medicationBase } },
  { kind: 'medication', protocol: 'GDC-MED-DEMO-0002', input: {
    ...medicationBase, personName: 'Paulo Exemplo', personEmail: 'paulo.exemplo@example.com',
    catName: 'Nina (exemplo)', catAge: '6 meses', urgency: 'high',
    requestReason: 'Avaliar necessidade de medicamento para tratamento fictício.',
    pickupAvailability: 'Qualquer dia pela manhã', attachments: medicationBase.attachments.slice(0, 1),
  } },
  { kind: 'medication', protocol: 'GDC-MED-DEMO-0003', input: {
    ...medicationBase, personName: 'Rita Exemplo', personEmail: 'rita.exemplo@example.com',
    catName: 'Bento (exemplo)', catAge: '4 anos', urgency: 'low',
    requestReason: 'Acompanhamento de tratamento de demonstração.',
    attachments: [],
  } },
  { kind: 'medication', protocol: 'GDC-MED-DEMO-0004', input: {
    ...medicationBase, personName: 'Tiago Exemplo', personEmail: 'tiago.exemplo@example.com',
    catName: 'Pipoca (exemplo)', catAge: '1 ano', urgency: 'medium',
    requestReason: 'Solicitação fictícia para conferir o estado reprovado.',
    attachments: medicationBase.attachments.slice(0, 1),
  } },
];

export const mockAdminDemoSubmissions = {
  adoptionInput(catId: string): AdoptionApplicationInput {
    return { ...adoptionBase, catId };
  },
  medicationInput(): MedicationRequestInput {
    return { ...medicationBase, attachments: [...medicationBase.attachments] };
  },
  add(submission: DemoSubmission): void { submissions.push(submission); },
  find(protocol: string): DemoSubmission | undefined { return submissions.find((item) => item.protocol === protocol); },
};
