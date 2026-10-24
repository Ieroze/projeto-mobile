import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminChoices, AdminFeedback, AdminField, AdminHeading } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { guideRepository } from '../services/guideRepository';
import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';
import { GuideArticle, GuideCategory } from '../types/guide';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminArticleForm'>;
type Draft = Omit<GuideArticle, 'id'>;
const blank: Draft = { categoryId: '', title: '', summary: '', body: '' };

export function AdminArticleFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const id = route.params?.articleId;
  const [draft, setDraft] = useState<Draft>(blank);
  const [initialDraft, setInitialDraft] = useState<Draft>(blank);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (patch: Partial<Draft>) => setDraft((value) => ({ ...value, ...patch }));
  const leaveAfterSave = useUnsavedChanges(JSON.stringify(draft) !== JSON.stringify(initialDraft));

  useEffect(() => {
    let active = true;
    Promise.all([guideRepository.listCategories(), id ? guideRepository.getArticleById(id) : Promise.resolve(undefined)])
      .then(([groups, article]) => {
        if (!active) return;
        setCategories(groups);
        if (id && !article) setMissing(true);
        else if (article) {
          const loaded = { categoryId: article.categoryId, title: article.title, summary: article.summary, body: article.body };
          setDraft(loaded); setInitialDraft(loaded);
        } else if (groups.length) {
          const loaded = { ...blank, categoryId: groups[0].id };
          setDraft(loaded); setInitialDraft(loaded);
        }
      }).catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  function preparedDraft(): Draft | null {
    if (!draft.title.trim() || !draft.body.trim() || !categories.some((item) => item.id === draft.categoryId)) {
      setError('Informe título, conteúdo e uma categoria válida.'); return null;
    }
    setError('');
    return { categoryId: draft.categoryId, title: draft.title.trim(), summary: draft.summary.trim(), body: draft.body.trim() };
  }

  function preview() {
    const input = preparedDraft();
    if (input) navigation.navigate('AdminPreview', { kind: 'article', draft: input, categoryName: categories.find((item) => item.id === input.categoryId)?.name ?? 'Geral' });
  }

  async function save() {
    if (busy) return;
    const input = preparedDraft();
    if (!input) return;
    setBusy(true); setError('');
    try {
      if (id) await guideRepository.updateArticle(id, input);
      else await guideRepository.createArticle(input);
      leaveAfterSave();
    } catch { setError('Não foi possível salvar o artigo.'); }
    finally { setBusy(false); }
  }

  function confirmRemove() {
    if (!id) return;
    Alert.alert('Remover artigo?', 'A remoção será apenas nesta simulação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { setBusy(true); guideRepository.removeArticle(id).then(leaveAfterSave).catch(() => setError('Não foi possível remover o artigo.')).finally(() => setBusy(false)); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title={id ? 'Editar artigo' : 'Novo artigo'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar o artigo." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <Text>Artigo não encontrado.</Text> : <>
      {categories.length ? <AdminChoices label="Categoria *" value={draft.categoryId} options={categories.map((item) => ({ value: item.id, label: item.name }))} onChange={(categoryId) => change({ categoryId })} /> : <Text style={styles.error}>Cadastre uma categoria antes de criar artigos.</Text>}
      <AdminField label="Título *" value={draft.title} onChangeText={(title) => change({ title })} maxLength={180} />
      <AdminField label="Resumo" value={draft.summary} onChangeText={(summary) => change({ summary })} maxLength={320} multiline />
      <AdminField label="Conteúdo *" value={draft.body} onChangeText={(body) => change({ body })} multiline />
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label="Prévia antes de salvar" onPress={preview} busy={busy} />
      <AdminButton label="Salvar artigo" onPress={save} busy={busy} />
      {id ? <AdminButton label="Remover da simulação" onPress={confirmRemove} busy={busy} destructive /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({ error: { color: colors.dangerText, marginBottom: spacing.md } });
