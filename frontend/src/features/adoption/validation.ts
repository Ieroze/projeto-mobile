import { AdoptionApplicationInput, HousingType } from '../../types/adoption';

export interface AdoptionFormValues {
  name: string;
  phone: string;
  email: string;
  city: string;
  housingType: HousingType | null;
  hasOtherAnimals: boolean | null;
  adoptionReasons: string;
  consentPrivacy: boolean;
}

export type AdoptionFormErrors = Partial<Record<keyof AdoptionFormValues, string>>;

type ValidationResult =
  | { valid: true; input: AdoptionApplicationInput }
  | { valid: false; errors: AdoptionFormErrors };

export function validateAdoptionForm(values: AdoptionFormValues, catId: string): ValidationResult {
  const errors: AdoptionFormErrors = {};
  const name = values.name.trim().replace(/\s+/g, ' ');
  const phone = values.phone.replace(/\D/g, '');
  const email = values.email.trim().toLowerCase();
  const city = values.city.trim().replace(/\s+/g, ' ');
  const adoptionReasons = values.adoptionReasons.trim();

  if (name.length < 2) errors.name = 'Informe seu nome.';
  else if (name.length > 160) errors.name = 'O nome deve ter até 160 caracteres.';

  if (!/^[1-9]\d{9,10}$/.test(phone)) errors.phone = 'Informe um telefone com DDD e 10 ou 11 dígitos.';
  if (email && (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = 'Informe um e-mail válido com até 255 caracteres.';
  }
  if (city && (city.length < 2 || city.length > 120)) errors.city = 'A cidade deve ter de 2 a 120 caracteres.';
  if (adoptionReasons.length > 500) errors.adoptionReasons = 'Use até 500 caracteres.';
  if (!values.consentPrivacy) errors.consentPrivacy = 'É necessário autorizar o contato para continuar.';

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    input: {
      catId,
      applicantName: name,
      applicantPhone: phone,
      ...(email ? { applicantEmail: email } : {}),
      ...(city ? { city } : {}),
      ...(values.housingType ? { housingType: values.housingType } : {}),
      ...(values.hasOtherAnimals !== null ? { hasOtherAnimals: values.hasOtherAnimals } : {}),
      ...(adoptionReasons ? { adoptionReasons } : {}),
      consentPrivacy: true,
    },
  };
}
