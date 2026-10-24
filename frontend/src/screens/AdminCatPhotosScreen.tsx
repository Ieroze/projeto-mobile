import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminField, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { CatImage } from '../features/cats/CatImage';
import { catAdminRepository } from '../services/catAdminRepository';
import { catRepository } from '../services/catRepository';
import { ColorPalette, cardSurface, radius, spacing, useColors, useThemedStyles } from '../theme';
import { Cat } from '../types/cat';
import { CatPhoto } from '../types/catAdmin';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCatPhotos'>;

export function AdminCatPhotosScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { catId } = route.params;
  const [cat, setCat] = useState<Cat | null>(null);
  const [photos, setPhotos] = useState<CatPhoto[]>([]);
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialPhoto, setInitialPhoto] = useState<{ url: string; altText: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const showingLocalPhoto = /^(file|content):\/\//.test(url);
  useUnsavedChanges(editingId ? url !== initialPhoto?.url || altText !== initialPhoto?.altText : Boolean(url || altText));

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setError('');
    Promise.all([catRepository.getById(catId), catAdminRepository.listPhotos(catId)])
      .then(([item, items]) => { if (active) { setCat(item ?? null); setPhotos(items); } })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [catId, reload]));

  function reset() { setEditingId(null); setInitialPhoto(null); setUrl(''); setAltText(''); setPickedUri(null); }
  async function pickPhoto() {
    if (picking || busy) return;
    setPicking(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (!result.canceled && result.assets[0]) {
        setPickedUri(result.assets[0].uri);
        setUrl(result.assets[0].uri);
      }
    } catch { setError('Não foi possível selecionar a imagem. Tente novamente.'); }
    finally { setPicking(false); }
  }
  async function save() {
    const validRemote = /^https:\/\//i.test(url.trim());
    const validLocal = showingLocalPhoto && (url === pickedUri || url === initialPhoto?.url);
    if (!validRemote && !validLocal) { setError('Selecione uma imagem da galeria ou informe uma URL HTTPS.'); return; }
    setBusy(true); setError('');
    try {
      const draft = { url: url.trim(), altText: altText.trim() || `Foto de ${cat?.name ?? 'gato'}` };
      if (editingId) await catAdminRepository.updatePhoto(catId, editingId, draft);
      else await catAdminRepository.addPhoto(catId, draft);
      reset(); setReload((value) => value + 1);
    } catch { setError('Não foi possível salvar a foto.'); }
    finally { setBusy(false); }
  }
  async function setCover(id: string) {
    try { await catAdminRepository.setCover(catId, id); setReload((value) => value + 1); }
    catch { setError('Não foi possível alterar a capa.'); }
  }
  function confirmRemove(id: string) {
    Alert.alert('Remover foto?', 'A remoção será apenas nesta simulação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { catAdminRepository.removePhoto(catId, id).then(() => { if (editingId === id) reset(); setReload((value) => value + 1); }).catch(() => setError('Não foi possível remover a foto.')); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title="Fotos do gato" subtitle={cat?.name} onBack={() => navigation.goBack()} />
    <AdminNotice>Selecione uma imagem da galeria ou use uma URL HTTPS. A seleção fica apenas na memória desta sessão; nenhum arquivo é enviado ao backend.</AdminNotice>
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar as fotos." onRetry={() => setReload((value) => value + 1)} /> : !cat ? <Text>Gato não encontrado.</Text> : <>
      {photos.length === 0 ? <Text style={styles.muted}>Nenhuma foto cadastrada.</Text> : photos.map((photo) => <View key={photo.id} style={styles.card}>
        <CatImage cat={{ ...cat, imageUrl: photo.url }} style={styles.image} iconSize={28} />
        <Text style={styles.name}>{photo.altText}</Text>
        <Text style={styles.muted}>{photo.isCover ? 'Foto de capa' : 'Foto adicional'}</Text>
        <View style={styles.actions}>
          <AdminButton label="Editar" onPress={() => { setEditingId(photo.id); setInitialPhoto({ url: photo.url, altText: photo.altText }); setUrl(photo.url); setAltText(photo.altText); setPickedUri(null); }} />
          {!photo.isCover ? <AdminButton label="Definir capa" onPress={() => { void setCover(photo.id); }} /> : null}
          <AdminButton label="Remover" onPress={() => confirmRemove(photo.id)} destructive />
        </View>
      </View>)}
      <Text style={styles.name}>{editingId ? 'Editar foto' : 'Adicionar foto'}</Text>
      <AdminButton label="Selecionar foto da galeria" onPress={pickPhoto} busy={picking} />
      <AdminField label="Ou URL HTTPS" value={showingLocalPhoto ? '' : url} onChangeText={(value) => { setUrl(value); setPickedUri(null); setError(''); }} keyboardType="url" placeholder="https://" hint="A imagem escolhida na galeria substitui a URL ao salvar." error={error.startsWith('Selecione uma imagem') ? error : undefined} />
      {showingLocalPhoto ? <>
        <Text style={styles.muted}>Imagem selecionada da galeria</Text>
        <CatImage cat={{ ...cat, imageUrl: url }} style={styles.image} iconSize={28} />
      </> : null}
      <AdminField label="Descrição da foto" value={altText} onChangeText={(value) => { setAltText(value); setError(''); }} maxLength={180} />
      {error && !error.startsWith('Selecione uma imagem') ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label={editingId ? 'Salvar foto' : 'Adicionar foto'} onPress={save} busy={busy || picking} />
      {editingId ? <AdminButton label="Cancelar edição" onPress={reset} /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), padding: spacing.md, marginBottom: spacing.lg },
  image: { width: '100%', height: 160, borderRadius: radius.md, marginBottom: spacing.md },
  name: { color: colors.text, fontWeight: '800', marginBottom: spacing.sm },
  muted: { color: colors.textMuted, marginBottom: spacing.md },
  actions: { marginTop: spacing.md },
  error: { color: colors.dangerText, marginBottom: spacing.md },
});
