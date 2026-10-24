import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminChoices, AdminFeedback, AdminField, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { useUnsavedChanges } from '../features/admin/useUnsavedChanges';
import { partnerRepository } from '../services/partnerRepository';
import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';
import { Partner, PartnerCategory, PartnerSocialPlatform } from '../types/partner';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminPartnerForm'>;
type SocialUrls = Record<PartnerSocialPlatform, string>;
const platforms: PartnerSocialPlatform[] = ['instagram', 'facebook', 'whatsapp', 'website'];
const platformLabels: Record<PartnerSocialPlatform, string> = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', website: 'Site' };
const blankUrls: SocialUrls = { instagram: '', facebook: '', whatsapp: '', website: '' };
const categories: Array<{ value: PartnerCategory; label: string }> = [
  { value: 'accounting', label: 'Contabilidade' }, { value: 'veterinary', label: 'Veterinária' }, { value: 'photography', label: 'Fotografia' },
];

export function AdminPartnerFormScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const id = route.params?.partnerId;
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PartnerCategory>('veterinary');
  const [description, setDescription] = useState('');
  const [urls, setUrls] = useState<SocialUrls>(blankUrls);
  const [initialValue, setInitialValue] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const leaveAfterSave = useUnsavedChanges(JSON.stringify({ name, category, description, urls }) !== initialValue && initialValue !== '');

  useEffect(() => {
    if (!id) setInitialValue(JSON.stringify({ name: '', category: 'veterinary', description: '', urls: blankUrls }));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    partnerRepository.getById(id).then((item) => {
      if (!active) return;
      if (!item) { setMissing(true); return; }
      const loadedUrls = { ...blankUrls, ...Object.fromEntries(item.socials.map((social) => [social.platform, social.url ?? ''])) };
      setName(item.name); setCategory(item.category); setDescription(item.description);
      setUrls(loadedUrls);
      setInitialValue(JSON.stringify({ name: item.name, category: item.category, description: item.description, urls: loadedUrls }));
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  async function save() {
    if (!name.trim() || !description.trim()) { setError('Informe nome e descrição.'); return; }
    if (platforms.some((platform) => urls[platform].trim() && !/^https:\/\//i.test(urls[platform].trim()))) { setError('Os links devem começar com https://.'); return; }
    const input: Omit<Partner, 'id'> = {
      name: name.trim(), category, description: description.trim(), isDemo: true,
      socials: platforms.filter((platform) => urls[platform].trim()).map((platform) => ({ platform, label: platformLabels[platform], url: urls[platform].trim() })),
    };
    setBusy(true); setError('');
    try {
      if (id) await partnerRepository.update(id, input);
      else await partnerRepository.create(input);
      leaveAfterSave();
    } catch { setError('Não foi possível salvar o parceiro.'); }
    finally { setBusy(false); }
  }

  function confirmRemove() {
    if (!id) return;
    Alert.alert('Remover parceiro?', 'A remoção será apenas nesta simulação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { setBusy(true); partnerRepository.remove(id).then(leaveAfterSave).catch(() => setError('Não foi possível remover o parceiro.')).finally(() => setBusy(false)); } },
    ]);
  }

  return <Screen withHeader>
    <AdminHeading title={id ? 'Editar parceiro' : 'Novo parceiro'} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? <AdminFeedback message="Não foi possível carregar o parceiro." onRetry={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }} /> : missing ? <Text>Parceiro não encontrado.</Text> : <>
      <AdminNotice>Cadastro local para testar a interface. Confirme os dados com a ONG antes de publicar.</AdminNotice>
      <AdminField label="Nome *" value={name} onChangeText={setName} />
      <AdminChoices label="Categoria" value={category} options={categories} onChange={setCategory} />
      <AdminField label="Descrição *" value={description} onChangeText={setDescription} multiline />
      {platforms.map((platform) => <AdminField key={platform} label={`Link ${platformLabels[platform]}`} value={urls[platform]} onChangeText={(value) => setUrls((current) => ({ ...current, [platform]: value }))} keyboardType="url" placeholder="https://" />)}
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <AdminButton label="Salvar parceiro" onPress={save} busy={busy} />
      {id ? <AdminButton label="Remover da simulação" onPress={confirmRemove} busy={busy} destructive /> : null}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({ error: { color: colors.dangerText, marginBottom: spacing.md } });
