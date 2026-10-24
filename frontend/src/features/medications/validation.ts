import { MedicationAttachment, MedicationRequestInput, MedicationUrgency } from '../../types/medication';

export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export interface MedicationFormValues {
  personName: string;
  personEmail: string;
  personPhoneWhatsApp: string;
  catName: string;
  catAge: string;
  requestReason: string;
  diagnosis: string;
  dosage: string;
  urgency: MedicationUrgency | null;
  pickupAvailability: string;
  attachments: MedicationAttachment[];
}

export type MedicationFormErrors = Partial<Record<keyof MedicationFormValues, string>>;

type ValidationResult =
  | { valid: true; input: MedicationRequestInput }
  | { valid: false; errors: MedicationFormErrors };

export function validateMedicationForm(values: MedicationFormValues): ValidationResult {
  const errors: MedicationFormErrors = {};
  const personName = values.personName.trim().replace(/\s+/g, ' ');
  const personEmail = values.personEmail.trim().toLowerCase();
  const personPhoneWhatsApp = values.personPhoneWhatsApp.replace(/\D/g, '');
  const catName = values.catName.trim().replace(/\s+/g, ' ');
  const catAge = values.catAge.trim().replace(/\s+/g, ' ');
  const requestReason = values.requestReason.trim();
  const diagnosis = values.diagnosis.trim();
  const dosage = values.dosage.trim().replace(/\s+/g, ' ');
  const pickupAvailability = values.pickupAvailability.trim().replace(/\s+/g, ' ');

  if (personName && (personName.length < 2 || personName.length > 160)) errors.personName = 'Use de 2 a 160 caracteres.';
  if (personEmail && (personEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personEmail))) errors.personEmail = 'Informe um e-mail válido com até 255 caracteres.';
  if (personPhoneWhatsApp && !/^[1-9]\d{9,10}$/.test(personPhoneWhatsApp)) errors.personPhoneWhatsApp = 'Informe um telefone com DDD e 10 ou 11 dígitos.';
  if (catName && (catName.length < 2 || catName.length > 120)) errors.catName = 'Use de 2 a 120 caracteres.';
  if (catAge.length > 80) errors.catAge = 'Use até 80 caracteres.';
  if (requestReason.length > 500) errors.requestReason = 'Use até 500 caracteres.';
  if (diagnosis.length > 500) errors.diagnosis = 'Use até 500 caracteres.';
  if (dosage.length > 160) errors.dosage = 'Use até 160 caracteres.';
  if (pickupAvailability.length > 160) errors.pickupAvailability = 'Use até 160 caracteres.';
  if (values.attachments.length > MAX_ATTACHMENTS) errors.attachments = `Selecione até ${MAX_ATTACHMENTS} arquivos.`;

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    input: {
      ...(personName ? { personName } : {}),
      ...(personEmail ? { personEmail } : {}),
      ...(personPhoneWhatsApp ? { personPhoneWhatsApp } : {}),
      ...(catName ? { catName } : {}),
      ...(catAge ? { catAge } : {}),
      ...(requestReason ? { requestReason } : {}),
      ...(diagnosis ? { diagnosis } : {}),
      ...(dosage ? { dosage } : {}),
      ...(values.urgency ? { urgency: values.urgency } : {}),
      ...(pickupAvailability ? { pickupAvailability } : {}),
      attachments: values.attachments,
    },
  };
}
