import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminField, AdminHeading } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { infoRepository } from '../services/infoRepository';
import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminInfoForm'>;

export function AdminInfoFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { sectionId } = route.params;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [initialBody, setInitialBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const leaveAfterSave = useUnsavedChanges(body !== initialBody);

  useEffect(() => {
    let active = true;
    infoRepository.getById(sectionId).then((item) => {
      if (!active) return;
      if (!item || item.id === 'privacy') setMissing(true);
      else { setTitle(item.title); setBody(item.body); setInitialBody(item.body); }
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sectionId, reload]);

  async function save() {
    if (!body.trim()) { setError('Informe o texto desta seção.'); return; }
    setBusy(true); setError('');
    try { await infoRepository.update(sectionId, body.trim()); leaveAfterSave(); }
    catch { setError('Não foi possível salvar o texto.'); }
    finally { setBusy(false); }
  }

  return <Screen withHeader>
    <AdminHeading title={title || 'Editar informação'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar esta seção." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <Text>Seção indisponível.</Text> : <>
      <AdminField label="Texto público *" value={body} onChangeText={setBody} multiline />
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label="Salvar texto" onPress={save} busy={busy} />
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({ error: { color: colors.dangerText, marginBottom: spacing.md } });
