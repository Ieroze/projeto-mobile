import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../components/AppText';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { ReceiptStatus, ReceiptStatusCounts } from '../../types/adminReceipt';
import { ReceiptStatusBadge, receiptStatusOptions } from './ReceiptStatus';

export function ReceiptStatusSummary({ title, icon, counts, onSelect }: {
  title: string;
  icon: 'heart-outline' | 'medkit-outline';
  counts: ReceiptStatusCounts;
  onSelect: (status: ReceiptStatus) => void;
}) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerIcon}><Ionicons name={icon} size={21} color={colors.primaryDark} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.total}>{total}</Text>
    </View>
    {receiptStatusOptions.map((option) => <Pressable key={option.value} style={styles.row} onPress={() => onSelect(option.value)} accessibilityRole="button" accessibilityLabel={`${title}: ${option.label}, ${counts[option.value]}. Abrir lista filtrada`}>
      <ReceiptStatusBadge status={option.value} />
      <Text style={styles.count}>{counts[option.value]}</Text>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </Pressable>)}
  </View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), padding: spacing.md, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.text, fontSize: typography.body, fontWeight: '800' },
  total: { color: colors.primaryDark, fontSize: typography.subheading, fontWeight: '900' },
  row: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.sm },
  count: { flex: 1, color: colors.text, fontWeight: '800', textAlign: 'right' },
});
