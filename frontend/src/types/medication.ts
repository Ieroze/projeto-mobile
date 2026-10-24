export interface MedicationAttachment {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface MedicationRequestInput {
  personName?: string;
  personEmail?: string;
  personPhoneWhatsApp?: string;
  catName?: string;
  catAge?: string;
  requestReason?: string;
  diagnosis?: string;
  dosage?: string;
  urgency?: MedicationUrgency;
  pickupAvailability?: string;
  attachments: MedicationAttachment[];
}

export type MedicationUrgency = 'low' | 'medium' | 'high';

export interface MedicationRequestReceipt {
  protocol: string;
  attachmentCount: number;
}
