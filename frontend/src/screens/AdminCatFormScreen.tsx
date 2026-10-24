import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminCatFields } from '../features/admin/AdminCatFields';
import { CatImage } from '../features/cats/CatImage';
import { AdminButton, AdminFeedback } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { catRepository } from '../services/catRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { CatDraft } from '../types/cat';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCatForm'>;

const emptyDraft: CatDraft = {
  name: '',
  ageLabel: '',
  sex: 'female',
  shortDescription: '',
  description: '',
  adoptionStatus: 'not_available',
  careStatus: 'healthy',
  castrated: false,
  vaccinated: false,
  traits: [],
};

export function AdminCatFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const catId = route.params?.catId;
  const [draft, setDraft] = useState<CatDraft>(emptyDraft);
  const [initialDraft, setInitialDraft] = useState<CatDraft>(emptyDraft);
  const [traitsText, setTraitsText] = useState('');
  const [initialTraitsText, setInitialTraitsText] = useState('');
  const [loading, setLoading] = useState(Boolean(catId));
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [error, setError] = useState('');
  const { imageUrl: _currentImage, ...draftFields } = draft;
  const { imageUrl: _initialImage, ...initialFields } = initialDraft;
  const leaveAfterSave = useUnsavedChanges(JSON.stringify(draftFields) !== JSON.stringify(initialFields) || traitsText !== initialTraitsText || (!catId && Boolean(draft.imageUrl)));

  useEffect(() => {
    if (!catId) return;
    let active = true;
    catRepository.getById(catId).then((cat) => {
      if (!active) return;
      if (!cat) setMissing(true);
      else {
        setDraft(cat); setInitialDraft(cat);
        setTraitsText(cat.traits.join(', ')); setInitialTraitsText(cat.traits.join(', '));
      }
    }).catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [catId, reload]);

  useFocusEffect(useCallback(() => {
    if (!catId) return;
    let active = true;
    catRepository.getById(catId).then((cat) => {
      if (active && cat) setDraft((value) => ({ ...value, imageUrl: cat.imageUrl }));
    }).catch(() => { if (active) setError('Não foi possível atualizar a foto de capa.'); });
    return () => { active = false; };
  }, [catId]));

  function preparedDraft(): CatDraft | null {
    const input: CatDraft = {
      ...draft,
      name: draft.name.trim(),
      ageLabel: draft.ageLabel.trim(),
      shortDescription: draft.shortDescription.trim(),
      description: draft.description.trim(),
      traits: [...new Set(traitsText.split(',').map((trait) => trait.trim()).filter(Boolean))],
    };
    if (!input.name || !input.ageLabel || !input.shortDescription || !input.description) {
      setError('Preencha nome, idade exibida, descrição curta e história do gato.');
      return null;
    }
    setError('');
    return input;
  }

  function preview() {
    const input = preparedDraft();
    if (input) navigation.navigate('AdminPreview', { kind: 'cat', draft: input });
  }

  async function selectPhoto() {
    if (pickingPhoto || saving) return;
    setPickingPhoto(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (!result.canceled && result.assets[0]) setDraft((value) => ({ ...value, imageUrl: result.assets[0].uri }));
    } catch { setError('Não foi possível selecionar a foto. Tente novamente.'); }
    finally { setPickingPhoto(false); }
  }

  async function save() {
    if (saving || pickingPhoto) return;
    const input = preparedDraft();
    if (!input) return;
    setSaving(true);
    try {
      if (catId) await catRepository.update(catId, input);
      else await catRepository.create(input);
      leaveAfterSave();
    } catch {
      setError('Não foi possível salvar o gato. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove() {
    if (!catId) return;
    Alert.alert('Remover gato?', 'A remoção será apenas nesta simulação. Gatos com protocolos de adoção nesta sessão não podem ser removidos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { setSaving(true); catRepository.remove(catId).then(leaveAfterSave).catch(() => setError('Não foi possível remover. Confira se há protocolos de adoção vinculados.')).finally(() => setSaving(false)); } },
    ]);
  }

  return (
    <Screen withHeader>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Voltar para gatos</Text></Pressable>
      <Text style={styles.title}>{catId ? 'Editar gato' : 'Cadastrar gato'}</Text>
      <Text style={styles.subtitle}>Alterações locais de demonstração. Os dados reiniciam ao fechar o app.</Text>
      {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando gato" /> : loadError ? <AdminFeedback message="Não foi possível carregar o gato." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? (
        <Text style={styles.error}>Gato não encontrado.</Text>
      ) : (
        <View>
          {catId ? <>
            <AdminButton label="Gerenciar fotos" onPress={() => navigation.navigate('AdminCatPhotos', { catId })} />
            <AdminButton label="Registros de saúde" onPress={() => navigation.navigate('AdminCatHealth', { catId })} />
          </> : null}
          {!catId ? <View style={styles.photoSection}>
            <Text style={styles.photoTitle}>Foto de capa (opcional)</Text>
            <Text style={styles.note}>Selecione uma imagem da galeria para visualizar o cadastro. Ela ficará apenas nesta sessão.</Text>
            <AdminButton label="Selecionar foto da galeria" onPress={selectPhoto} busy={pickingPhoto} />
            {draft.imageUrl ? <>
              <CatImage cat={{ ...draft, id: 'preview', name: draft.name || 'gato' }} style={styles.photoPreview} iconSize={36} />
              <AdminButton label="Remover foto selecionada" onPress={() => setDraft((value) => ({ ...value, imageUrl: undefined }))} />
            </> : null}
          </View> : null}
          <AdminCatFields draft={draft} traitsText={traitsText} onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))} onTraitsChange={setTraitsText} />
          {catId ? <Text style={styles.note}>A foto atual é preservada. Use “Gerenciar fotos” para trocar a capa ou adicionar outras imagens.</Text> : <Text style={styles.note}>Depois de cadastrar, use “Gerenciar fotos” para adicionar outras imagens.</Text>}
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <AdminButton label="Prévia antes de salvar" onPress={preview} busy={saving || pickingPhoto} />
          <Pressable style={[styles.save, (saving || pickingPhoto) && styles.disabled]} onPress={save} disabled={saving || pickingPhoto} accessibilityRole="button">
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.saveText}>{catId ? 'Salvar alterações' : 'Cadastrar gato'}</Text>}
          </Pressable>
          {catId ? <AdminButton label="Remover da simulação" onPress={confirmRemove} busy={saving} destructive /> : null}
        </View>
      )}
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: spacing.sm },
  backText: { color: colors.primaryDark, fontWeight: '700' },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  subtitle: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.xs, marginBottom: spacing.xl },
  note: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18, marginBottom: spacing.lg },
  photoSection: { marginBottom: spacing.lg },
  photoTitle: { color: colors.text, fontWeight: '800', fontSize: typography.subheading, marginBottom: spacing.sm },
  photoPreview: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: spacing.md },
  error: { color: colors.dangerText, marginBottom: spacing.md, lineHeight: 20 },
  save: { minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  saveText: { color: colors.onPrimary, fontWeight: '800' },
  disabled: { opacity: 0.7 },
});
