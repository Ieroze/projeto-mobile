import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminField, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { catAdminRepository } from '../services/catAdminRepository';
import { catRepository } from '../services/catRepository';
import { ColorPalette, cardSurface, spacing, useColors, useThemedStyles } from '../theme';
import { CatHealthRecord, CatHealthRecordDraft } from '../types/catAdmin';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCatHealth'>;
const blank: CatHealthRecordDraft = { recordType: '', title: '', notes: '', occurredOn: '', nextDueOn: '' };
const validDate = (value: string) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join('-');
};

export function AdminCatHealthScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { catId } = route.params;
  const [catName, setCatName] = useState('');
  const [items, setItems] = useState<CatHealthRecord[]>([]);
  const [draft, setDraft] = useState<CatHealthRecordDraft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<CatHealthRecordDraft>(blank);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [reload, setReload] = useState(0);
  useUnsavedChanges(JSON.stringify(draft) !== JSON.stringify(initialDraft));
  const change = (patch: Partial<CatHealthRecordDraft>) => { setDraft((value) => ({ ...value, ...patch })); setShowValidation(false); setError(''); };

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setError('');
    Promise.all([catRepository.getById(catId), catAdminRepository.listRecords(catId)])
      .then(([cat, records]) => { if (active) { setCatName(cat?.name ?? ''); setItems(records); } })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [catId, reload]));

  function reset() { setEditingId(null); setDraft(blank); setInitialDraft(blank); setShowValidation(false); }
  async function save() {
    if (!draft.recordType.trim() || !draft.title.trim() || !validDate(draft.occurredOn.trim()) || !validDate(draft.nextDueOn.trim())) {
      setShowValidation(true);
      setError('Informe tipo, título e datas válidas no formato AAAA-MM-DD.'); return;
    }
    setBusy(true); setError('');
    const input = { recordType: draft.recordType.trim(), title: draft.title.trim(), notes: draft.notes.trim(), occurredOn: draft.occurredOn.trim(), nextDueOn: draft.nextDueOn.trim() };
    try {
      if (editingId) await catAdminRepository.updateRecord(catId, editingId, input);
      else await catAdminRepository.addRecord(catId, input);
      reset(); setReload((value) => value + 1);
    } catch { setError('Não foi possível salvar o registro.'); }
    finally { setBusy(false); }
  }
  function confirmRemove(id: string) {
    Alert.alert('Remover registro?', 'A remoção será apenas nesta simulação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { catAdminRepository.removeRecord(catId, id).then(() => { if (editingId === id) reset(); setReload((value) => value + 1); }).catch(() => setError('Não foi possível remover o registro.')); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title="Registros de saúde" subtitle={catName} onBack={() => navigation.goBack()} />
    <AdminNotice>Registros locais para testar o cadastro. Não representam prontuário real nem aparecem no perfil público nesta fase.</AdminNotice>
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar os registros." onRetry={() => setReload((value) => value + 1)} /> : !catName ? <Text>Gato não encontrado.</Text> : <>
      {items.length === 0 ? <Text style={styles.muted}>Nenhum registro nesta sessão.</Text> : items.map((item) => <View key={item.id} style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.muted}>{item.recordType}{item.occurredOn ? ` · ${item.occurredOn}` : ''}</Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        {item.nextDueOn ? <Text style={styles.muted}>Próxima data: {item.nextDueOn}</Text> : null}
        <AdminButton label="Editar" onPress={() => { const loaded = { recordType: item.recordType, title: item.title, notes: item.notes, occurredOn: item.occurredOn, nextDueOn: item.nextDueOn }; setEditingId(item.id); setDraft(loaded); setInitialDraft(loaded); }} />
        <AdminButton label="Remover" onPress={() => confirmRemove(item.id)} destructive />
      </View>)}
      <Text style={styles.title}>{editingId ? 'Editar registro' : 'Novo registro'}</Text>
      <AdminField label="Tipo *" value={draft.recordType} onChangeText={(recordType) => change({ recordType })} placeholder="Ex.: vacina" maxLength={60} error={showValidation && !draft.recordType.trim() ? 'Informe o tipo.' : undefined} />
      <AdminField label="Título *" value={draft.title} onChangeText={(title) => change({ title })} maxLength={160} error={showValidation && !draft.title.trim() ? 'Informe o título.' : undefined} />
      <AdminField label="Observações" value={draft.notes} onChangeText={(notes) => change({ notes })} multiline />
      <AdminField label="Data do evento" value={draft.occurredOn} onChangeText={(occurredOn) => change({ occurredOn: formatDateInput(occurredOn) })} keyboardType="number-pad" placeholder="AAAA-MM-DD" maxLength={10} hint="Opcional. Digite ano, mês e dia com números." error={showValidation && !validDate(draft.occurredOn.trim()) ? 'Use uma data válida no formato AAAA-MM-DD.' : undefined} />
      <AdminField label="Próxima data" value={draft.nextDueOn} onChangeText={(nextDueOn) => change({ nextDueOn: formatDateInput(nextDueOn) })} keyboardType="number-pad" placeholder="AAAA-MM-DD" maxLength={10} hint="Opcional. Digite ano, mês e dia com números." error={showValidation && !validDate(draft.nextDueOn.trim()) ? 'Use uma data válida no formato AAAA-MM-DD.' : undefined} />
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label={editingId ? 'Salvar registro' : 'Adicionar registro'} onPress={save} busy={busy} />
      {editingId ? <AdminButton label="Cancelar edição" onPress={reset} /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), padding: spacing.md, marginBottom: spacing.lg },
  title: { color: colors.text, fontWeight: '800', marginBottom: spacing.sm },
  muted: { color: colors.textMuted, marginBottom: spacing.sm },
  notes: { color: colors.text, lineHeight: 21, marginBottom: spacing.sm },
  error: { color: colors.dangerText, marginBottom: spacing.md },
});
