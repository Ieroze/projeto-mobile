import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminField, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { guideRepository } from '../services/guideRepository';
import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCategoryForm'>;

export function AdminCategoryFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const id = route.params?.categoryId;
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const leaveAfterSave = useUnsavedChanges(name !== initialName);

  useEffect(() => {
    if (!id) return;
    let active = true;
    guideRepository.getCategoryById(id).then((item) => { if (active) { if (item) { setName(item.name); setInitialName(item.name); } else setMissing(true); } })
      .catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  async function save() {
    const cleaned = name.trim();
    if (!cleaned) { setError('Informe o nome da categoria.'); return; }
    setBusy(true); setError('');
    try {
      if (id) await guideRepository.updateCategory(id, cleaned);
      else await guideRepository.createCategory(cleaned);
      leaveAfterSave();
    } catch { setError('Não foi possível salvar. Confira se já existe uma categoria com este nome.'); }
    finally { setBusy(false); }
  }

  function confirmRemove() {
    if (!id) return;
    Alert.alert('Remover categoria?', 'Categorias com artigos vinculados não podem ser removidas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { setBusy(true); guideRepository.removeCategory(id).then(leaveAfterSave).catch(() => setError('Remova ou transfira os artigos desta categoria antes de excluí-la.')).finally(() => setBusy(false)); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title={id ? 'Editar categoria' : 'Nova categoria'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar a categoria." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <Text>Categoria não encontrada.</Text> : <>
      <AdminNotice>Alterações locais para testar a organização do Guia.</AdminNotice>
      <AdminField label="Nome *" value={name} onChangeText={setName} maxLength={120} />
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label="Salvar categoria" onPress={save} busy={busy} />
      {id ? <AdminButton label="Remover da simulação" onPress={confirmRemove} busy={busy} destructive /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({ error: { color: colors.dangerText, marginBottom: spacing.md } });
