import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminChoices, AdminFeedback, AdminField, AdminHeading } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { adminPublicationRepository } from '../services/adminPublicationRepository';
import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';
import { AdminPublication } from '../types/adminPublication';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminPublicationForm'>;
type Status = AdminPublication['status'];
const statusOptions: Array<{ value: Status; label: string }> = [
  { value: 'draft', label: 'Rascunho' }, { value: 'published', label: 'Publicado' },
];

export function AdminPublicationFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const id = route.params.publicationId;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('draft');
  const [initialValue, setInitialValue] = useState(JSON.stringify({ title: '', body: '', status: 'draft' }));
  const [loading, setLoading] = useState(Boolean(id));
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string; save?: string }>({});
  const leaveAfterSave = useUnsavedChanges(JSON.stringify({ title, body, status }) !== initialValue);

  useEffect(() => {
    if (!id) return;
    let active = true;
    adminPublicationRepository.getForAdmin(id).then((item) => {
      if (!active) return;
      if (!item) { setMissing(true); return; }
      setMissing(false);
      setTitle(item.title); setBody(item.body); setStatus(item.status);
      setInitialValue(JSON.stringify({ title: item.title, body: item.body, status: item.status }));
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  async function save() {
    const nextErrors = {
      title: title.trim() ? undefined : 'Informe o título.',
      body: body.trim() ? undefined : 'Informe o texto do aviso.',
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.body) return;
    setBusy(true);
    try {
      const input = { title: title.trim(), body: body.trim(), status };
      if (id) await adminPublicationRepository.update(id, input);
      else await adminPublicationRepository.create(input);
      leaveAfterSave();
    } catch { setErrors({ save: 'Não foi possível salvar a publicação.' }); }
    finally { setBusy(false); }
  }

  function confirmRemove() {
    if (!id) return;
    Alert.alert('Remover publicação?', 'A publicação deixará de aparecer também na área pública desta simulação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => {
        setBusy(true);
        adminPublicationRepository.remove(id).then(leaveAfterSave)
          .catch(() => setErrors({ save: 'Não foi possível remover a publicação.' }))
          .finally(() => setBusy(false));
      } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title={id ? 'Editar publicação' : 'Nova publicação'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar a publicação." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <AdminFeedback message="Publicação não encontrada." /> : <>
      <AdminField label="Título *" value={title} onChangeText={setTitle} maxLength={120} error={errors.title} />
      <AdminField label="Texto do aviso *" value={body} onChangeText={setBody} multiline maxLength={3000} error={errors.body} />
      <AdminChoices label="Visibilidade" value={status} options={statusOptions} onChange={setStatus} />
      {errors.save ? <Text style={styles.error} accessibilityRole="alert">{errors.save}</Text> : null}
      <AdminButton label="Salvar publicação" onPress={save} busy={busy} />
      {id ? <AdminButton label="Remover publicação" onPress={confirmRemove} busy={busy} destructive /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({ error: { color: colors.dangerText, marginBottom: spacing.md } });
