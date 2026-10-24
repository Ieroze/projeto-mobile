import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ComponentProps, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { ReceiptStatusBadge, ReceiptStatusChoices } from '../features/admin/ReceiptStatus';
import { receiptRepository } from '../services/adminReceiptRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdminReceiptItem, ReceiptSection, ReceiptStatus } from '../types/adminReceipt';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReceiptDetails'>;

export function AdminReceiptDetailsScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { kind, protocol } = route.params;
  const [item, setItem] = useState<AdminReceiptItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    receiptRepository.list(kind).then((items) => { if (active) setItem(items.find((value) => value.protocol === protocol) ?? null); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, protocol, reload]);

  const icon = kind === 'adoption' ? 'heart-outline' : 'medkit-outline';
  const title = kind === 'adoption' ? 'Manifestação de adoção' : 'Solicitação de medicamento';

  async function changeStatus(status: ReceiptStatus) {
    if (!item || savingStatus) return;
    setSavingStatus(true); setStatusError('');
    try {
      await receiptRepository.updateStatus(kind, protocol, status);
      setItem((current) => current ? { ...current, status } : current);
    } catch {
      setStatusError('Não foi possível atualizar o andamento local. Tente novamente.');
    } finally {
      setSavingStatus(false);
    }
  }

  return <Screen withHeader>
    <AdminHeading title={title} onBack={() => navigation.goBack()} />
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <View>
      <Text style={styles.feedback}>Não foi possível carregar este protocolo.</Text>
      <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
    </View> : item ? <>
      <AdminNotice>{item.source === 'example' ? 'Exemplo fictício para avaliar a interface. Estes dados não vieram de um formulário nem foram recebidos pela ONG.' : item.source === 'demo' ? 'Envio simulado com dados fictícios preenchidos automaticamente. Nenhuma pessoa real ou arquivo foi enviado à ONG.' : 'Protocolo gerado localmente nesta sessão. Os dados preenchidos no formulário não foram guardados nem enviados à ONG.'}</AdminNotice>
      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name={icon} size={28} color={colors.primaryDark} /></View>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>{item.source === 'example' ? 'EXEMPLO DE TELA' : item.source === 'demo' ? 'ENVIO SIMULADO' : 'PROTOCOLO LOCAL'}</Text>
          <Text style={styles.heroTitle}>{item.protocol}</Text>
          <Text style={styles.heroSubtitle}>{item.summary}</Text>
          <View style={styles.heroStatus}><ReceiptStatusBadge status={item.status} /></View>
        </View>
      </View>
      {item.sections.map((section) => <ReceiptSectionCard key={section.title} section={section} />)}
      <View style={styles.statusCard}>
        <View style={styles.sectionHeader}><Ionicons name="swap-horizontal-outline" size={20} color={colors.primaryDark} /><Text style={styles.sectionTitle}>Andamento local</Text></View>
        <Text style={styles.statusHint}>Selecione um estado para testar a gestão desta {kind === 'adoption' ? 'manifestação' : 'solicitação'}.</Text>
        <ReceiptStatusChoices value={item.status} onChange={(status) => { void changeStatus(status); }} busy={savingStatus} />
        {savingStatus ? <ActivityIndicator color={colors.primary} style={styles.statusLoading} /> : null}
        {statusError ? <Text style={styles.statusError} accessibilityRole="alert">{statusError}</Text> : null}
      </View>
      <View style={styles.footer}><Ionicons name="information-circle-outline" size={19} color={colors.textMuted} /><Text style={styles.footerText}>O andamento reinicia ao fechar o app. Regras reais de análise, aprovação e contato ainda dependem do backend.</Text></View>
    </> : <Text style={styles.feedback}>Protocolo não encontrado nesta sessão.</Text>}
  </Screen>;
}

const sectionIcons: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  'Gato de interesse': 'paw-outline',
  Contato: 'person-outline',
  Interesse: 'heart-outline',
  Pessoa: 'person-outline',
  'Felino e pedido': 'medkit-outline',
  'Retirada e anexos': 'attach-outline',
  'Resumo da simulação': 'receipt-outline',
};

function ReceiptSectionCard({ section }: { section: ReceiptSection }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={sectionIcons[section.title] ?? 'document-text-outline'} size={20} color={colors.primaryDark} />
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    {section.fields.map((field) => <View key={field.label} style={styles.field}>
      <Text style={styles.fieldLabel}>{field.label}</Text>
      <Text style={styles.fieldValue}>{field.value}</Text>
    </View>)}
  </View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  hero: { ...cardSurface(colors), flexDirection: 'row', gap: spacing.md, padding: spacing.lg, marginBottom: spacing.lg },
  heroIcon: { width: 54, height: 54, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  eyebrow: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  heroTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.xs },
  heroSubtitle: { color: colors.textMuted, lineHeight: 20, marginTop: spacing.xs },
  heroStatus: { marginTop: spacing.md },
  section: { ...cardSurface(colors), padding: spacing.lg, marginBottom: spacing.md },
  statusCard: { ...cardSurface(colors), padding: spacing.lg, marginTop: spacing.sm },
  statusHint: { color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  statusLoading: { marginTop: spacing.md },
  statusError: { color: colors.dangerText, marginTop: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  field: { borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: spacing.md },
  fieldLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', marginBottom: spacing.xs },
  fieldValue: { color: colors.text, lineHeight: 21 },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
  footerText: { flex: 1, color: colors.textMuted, fontSize: typography.caption, lineHeight: 19 },
  feedback: { color: colors.textMuted, lineHeight: 21 },
  retry: { color: colors.primaryDark, fontWeight: '800', marginTop: spacing.sm },
});
