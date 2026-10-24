import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../components/AppText';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { ReceiptStatus } from '../../types/adminReceipt';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const receiptStatusOptions: Array<{ value: ReceiptStatus; label: string; icon: IconName }> = [
  { value: 'pending', label: 'Pendente', icon: 'time-outline' },
  { value: 'in_review', label: 'Em análise', icon: 'search-outline' },
  { value: 'approved', label: 'Aprovado', icon: 'checkmark-circle-outline' },
  { value: 'rejected', label: 'Reprovado', icon: 'close-circle-outline' },
];

const statusStyles = (colors: ColorPalette): Record<ReceiptStatus, { backgroundColor: string; color: string }> => ({
  pending: { backgroundColor: colors.warningSoft, color: colors.warningText },
  in_review: { backgroundColor: colors.primarySoft, color: colors.primaryDark },
  approved: { backgroundColor: colors.successSoft, color: colors.successText },
  rejected: { backgroundColor: colors.dangerSoft, color: colors.dangerText },
});

export function ReceiptStatusBadge({ status }: { status: ReceiptStatus }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const option = receiptStatusOptions.find((item) => item.value === status)!;
  const palette = statusStyles(colors)[status];
  return <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
    <Ionicons name={option.icon} size={15} color={palette.color} />
    <Text style={[styles.badgeText, { color: palette.color }]}>{option.label}</Text>
  </View>;
}

export function ReceiptStatusChoices({ value, onChange, busy }: { value: ReceiptStatus; onChange: (status: ReceiptStatus) => void; busy: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const palettes = statusStyles(colors);
  return <View style={styles.choices}>
    {receiptStatusOptions.map((option) => {
      const selected = value === option.value;
      const palette = palettes[option.value];
      return <Pressable key={option.value} style={[styles.choice, selected && { backgroundColor: palette.backgroundColor, borderColor: palette.color }]} onPress={() => onChange(option.value)} disabled={busy || selected} accessibilityRole="button" accessibilityState={{ selected, disabled: busy || selected }}>
        <Ionicons name={option.icon} size={18} color={selected ? palette.color : colors.textMuted} />
        <Text style={[styles.choiceText, selected && { color: palette.color }]}>{option.label}</Text>
      </Pressable>;
    })}
  </View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badgeText: { fontSize: typography.caption, fontWeight: '800' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  choiceText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
});
