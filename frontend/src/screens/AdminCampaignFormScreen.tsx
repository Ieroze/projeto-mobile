import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminField, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { campaignRepository } from '../services/campaignRepository';
import { useColors } from '../theme';
import { Campaign } from '../types/campaign';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCampaignForm'>;
type Draft = { title: string; description: string; goal: string; raised: string; days: string; pixKey: string };
const blank: Draft = { title: '', description: '', goal: '', raised: '0', days: '', pixKey: '' };
const toCents = (value: string) => {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimals = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
};
const fromCents = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

export function AdminCampaignFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const id = route.params?.campaignId;
  const [draft, setDraft] = useState<Draft>(blank);
  const [initialDraft, setInitialDraft] = useState<Draft>(blank);
  const [loading, setLoading] = useState(Boolean(id));
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (patch: Partial<Draft>) => setDraft((value) => ({ ...value, ...patch }));
  const leaveAfterSave = useUnsavedChanges(JSON.stringify(draft) !== JSON.stringify(initialDraft));

  useEffect(() => {
    if (!id) return;
    let active = true;
    campaignRepository.getById(id).then((item) => {
      if (!active) return;
      if (!item) setMissing(true);
      else {
        const loaded = { title: item.title, description: item.description, goal: fromCents(item.goalCents), raised: fromCents(item.raisedCents), days: item.daysRemaining?.toString() ?? '', pixKey: item.pixKey ?? '' };
        setDraft(loaded); setInitialDraft(loaded);
      }
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  function preparedDraft(): Omit<Campaign, 'id'> | null {
    const goalCents = toCents(draft.goal);
    const raisedCents = toCents(draft.raised);
    const daysRemaining = draft.days.trim() ? Number(draft.days.trim()) : undefined;
    if (!draft.title.trim() || !draft.description.trim() || goalCents === null || goalCents <= 0 || raisedCents === null || (daysRemaining !== undefined && (!Number.isInteger(daysRemaining) || daysRemaining < 0))) {
      setError('Preencha título, descrição e meta positiva. Use valores válidos em reais e dias inteiros não negativos.');
      return null;
    }
    if (draft.pixKey.trim() && (draft.pixKey.trim().length > 77 || !/^[\x20-\x7E]+$/.test(draft.pixKey.trim()))) {
      setError('Use uma chave Pix de até 77 caracteres, sem acentos, para gerar o QR Code.');
      return null;
    }
    setError('');
    return { title: draft.title.trim(), description: draft.description.trim(), goalCents, raisedCents, daysRemaining, pixKey: draft.pixKey.trim() || undefined };
  }

  function preview() {
    const input = preparedDraft();
    if (input) navigation.navigate('AdminPreview', { kind: 'campaign', draft: input });
  }

  async function save() {
    if (busy) return;
    const input = preparedDraft();
    if (!input) return;
    setBusy(true); setError('');
    try {
      if (id) await campaignRepository.update(id, input);
      else await campaignRepository.create(input);
      leaveAfterSave();
    } catch { setError('Não foi possível salvar a campanha.'); }
    finally { setBusy(false); }
  }

  function confirmRemove() {
    if (!id) return;
    Alert.alert('Remover campanha?', 'A remoção será apenas nesta simulação e reiniciará com o app.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { setBusy(true); campaignRepository.remove(id).then(leaveAfterSave).catch(() => setError('Não foi possível remover a campanha.')).finally(() => setBusy(false)); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title={id ? 'Editar campanha' : 'Nova campanha'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar a campanha." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <Text>Campanha não encontrada.</Text> : <>
      <AdminNotice>O valor arrecadado é editável somente para testar a interface. Não representa doações reais.</AdminNotice>
      <AdminField label="Título *" value={draft.title} onChangeText={(title) => change({ title })} maxLength={160} />
      <AdminField label="Descrição *" value={draft.description} onChangeText={(description) => change({ description })} multiline />
      <AdminField label="Meta em reais *" value={draft.goal} onChangeText={(goal) => change({ goal })} keyboardType="decimal-pad" placeholder="1500,00" />
      <AdminField label="Arrecadado em reais *" value={draft.raised} onChangeText={(raised) => change({ raised })} keyboardType="decimal-pad" />
      <AdminField label="Dias restantes" value={draft.days} onChangeText={(days) => change({ days })} keyboardType="number-pad" />
      <AdminField label="Chave Pix demonstrativa" value={draft.pixKey} onChangeText={(pixKey) => change({ pixKey })} maxLength={77} hint="A chave aparece com um QR Code na campanha pública. Use somente dados fictícios nesta simulação." />
      {error ? <Text accessibilityRole="alert" style={{ color: colors.dangerText, marginBottom: 16 }}>{error}</Text> : null}
      <AdminButton label="Prévia antes de salvar" onPress={preview} busy={busy} />
      <AdminButton label="Salvar campanha" onPress={save} busy={busy} />
      {id ? <AdminButton label="Remover da simulação" onPress={confirmRemove} busy={busy} destructive /> : null}
    </>}
  </Screen>;
}
