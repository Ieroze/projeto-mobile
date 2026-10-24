// BR Code estático sem valor definido. Os dados atuais da campanha são fictícios.
function field(id: string, value: string): string {
  if (value.length > 99) throw new Error('PIX_FIELD_TOO_LONG');
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildStaticPixPayload(key: string, name = 'GATOS DA CORTE', city = 'SAO PAULO'): string {
  if (!key || key.length > 77 || !/^[\x20-\x7E]+$/.test(key)) throw new Error('INVALID_PIX_KEY');
  const merchant = field('00', 'br.gov.bcb.pix') + field('01', key);
  const payload = field('00', '01') + field('26', merchant) + field('52', '0000') +
    field('53', '986') + field('58', 'BR') + field('59', name) + field('60', city) +
    field('62', field('05', '***')) + '6304';
  return payload + crc16(payload);
}
