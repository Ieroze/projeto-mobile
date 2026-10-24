import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { ReceiptStatusBadge, receiptStatusOptions } from '../features/admin/ReceiptStatus';
import { receiptRepository } from '../services/adminReceiptRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdminReceiptItem, ReceiptStatus } from '../types/adminReceipt';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReceipts'>;
type StatusFilter = ReceiptStatus | 'all';

export function AdminReceiptsScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const kind = route.params.kind;
  const [items, setItems] = useState<AdminReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(route.params.initialStatus ?? 'all');

  useEffect(() => { setStatusFilter(route.params.initialStatus ?? 'all'); }, [kind, route.params.initialStatus]);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(false);
    receiptRepository.list(kind).then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, reload]));

  const title = kind === 'adoption' ? 'Manifestações de adoção' : 'Solicitações de medicamentos';
  const sessionItems = items.filter((item) => item.source !== 'example');
  const visibleItems = sessionItems.filter((item) => statusFilter === 'all' || item.status === statusFilter);
  const example = items.find((item) => item.source === 'example');
  const icon = kind === 'adoption' ? 'heart-outline' : 'medkit-outline';

  async function createDemo() {
    if (creatingDemo) return;
    setCreatingDemo(true); setDemoError('');
    try {
      const protocol = await receiptRepository.createDemo(kind);
      navigation.navigate('AdminReceiptDetails', { kind, protocol });
    } catch (error) {
      setDemoError(error instanceof Error && error.message === 'NO_AVAILABLE_CAT'
        ? 'Cadastre ou disponibilize um gato para simular uma manifestação.'
        : 'Não foi possível gerar o envio simulado. Tente novamente.');
    } finally {
      setCreatingDemo(false);
    }
  }

  return <Screen withHeader>
    <AdminHeading title={title} subtitle="Veja como um formulário preenchido aparece para o admin." onBack={() => navigation.goBack()} />
    <AdminNotice>A lista já contém quatro envios fictícios, um por andamento. Você também pode gerar outro abaixo. Formulários preenchidos manualmente guardam apenas o resumo local; nada é enviado à ONG.</AdminNotice>
    <AdminButton label="Simular preenchimento e envio" onPress={() => { void createDemo(); }} busy={creatingDemo} />
    {demoError ? <Text style={styles.demoError} accessibilityRole="alert">{demoError}</Text> : null}
    <Text style={styles.filterLabel}>Filtrar por andamento</Text>
    <View style={styles.filters}>
      <StatusFilterButton label={`Todos (${sessionItems.length})`} selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} styles={styles} />
      {receiptStatusOptions.map((option) => <StatusFilterButton key={option.value} label={`${option.label} (${sessionItems.filter((item) => item.status === option.value).length})`} selected={statusFilter === option.value} onPress={() => setStatusFilter(option.value)} styles={styles} />)}
    </View>
    <Text style={styles.filterHint}>O filtro se aplica aos protocolos da sessão; o exemplo fixo aparece abaixo.</Text>
    <View style={styles.sectionHeading}>
      <Ionicons name="receipt-outline" size={21} color={colors.primaryDark} />
      <Text style={styles.sectionTitle}>Nesta sessão</Text>
      {!loading && !error ? <Text style={styles.count}>{visibleItems.length}</Text> : null}
    </View>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar os protocolos." onRetry={() => setReload((value) => value + 1)} /> : <>
      {visibleItems.length === 0 ? <View style={styles.empty}><Ionicons name="file-tray-outline" size={28} color={colors.textMuted} /><Text style={styles.emptyText}>{sessionItems.length === 0 ? 'Nenhum protocolo gerado. Use a simulação acima ou preencha o formulário público.' : 'Nenhum protocolo com este andamento.'}</Text></View> : visibleItems.map((item) =>
        <ReceiptCard key={item.protocol} item={item} icon={icon} onPress={() => navigation.navigate('AdminReceiptDetails', { kind, protocol: item.protocol })} />)}
      <View style={[styles.sectionHeading, styles.exampleHeading]}>
        <Ionicons name="eye-outline" size={21} color={colors.primaryDark} />
        <Text style={styles.sectionTitle}>Exemplo de tela preenchida</Text>
      </View>
      {example ? <ReceiptCard item={example} icon={icon} onPress={() => navigation.navigate('AdminReceiptDetails', { kind, protocol: example.protocol })} /> : null}
      <Text style={styles.footnote}>Dados fictícios para avaliar a interface. Não correspondem a um pedido recebido.</Text>
    </>}
  </Screen>;
}

function StatusFilterButton({ label, selected, onPress, styles }: { label: string; selected: boolean; onPress: () => void; styles: ReturnType<typeof createStyles> }) {
  return <Pressable style={[styles.filter, selected && styles.filterSelected]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Filtrar por andamento: ${label}`} accessibilityState={{ selected }}>
    <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text>
  </Pressable>;
}

function ReceiptCard({ item, icon, onPress }: { item: AdminReceiptItem; icon: 'heart-outline' | 'medkit-outline'; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <Pressable style={styles.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Abrir ${item.source === 'example' ? 'exemplo' : 'protocolo'} ${item.protocol}`}>
    <View style={styles.iconBox}><Ionicons name={icon} size={23} color={colors.primaryDark} /></View>
    <View style={styles.cardBody}>
      <Text style={styles.badge}>{item.source === 'example' ? 'EXEMPLO FICTÍCIO' : item.source === 'demo' ? 'ENVIO SIMULADO' : 'PROTOCOLO LOCAL'}</Text>
      <Text style={styles.cardTitle}>{item.protocol}</Text>
      <Text style={styles.cardSummary}>{item.summary}</Text>
      <View style={styles.cardStatus}><ReceiptStatusBadge status={item.status} /></View>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
  </Pressable>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  filterLabel: { color: colors.text, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  filter: { minHeight: 42, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  filterSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  filterText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  filterTextSelected: { color: colors.primaryDark },
  filterHint: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18, marginTop: -spacing.md, marginBottom: spacing.lg },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  exampleHeading: { marginTop: spacing.xl },
  sectionTitle: { flex: 1, color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  count: { color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: radius.pill, minWidth: 28, textAlign: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontWeight: '800' },
  card: { ...cardSurface(colors), flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm, minHeight: 92 },
  iconBox: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  badge: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  cardTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.xs },
  cardSummary: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs, lineHeight: 18 },
  cardStatus: { marginTop: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  footnote: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 19, marginTop: spacing.sm },
  demoError: { color: colors.dangerText, marginBottom: spacing.md, lineHeight: 20 },
});
