import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '../../components/AppText';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function AdminHeading({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.heading}>
    <Pressable onPress={onBack} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Voltar</Text></Pressable>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}

export function AdminNotice({ children }: PropsWithChildren) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.notice}><Ionicons name="information-circle-outline" size={21} color={colors.primaryDark} /><Text style={styles.noticeText}>{children}</Text></View>;
}

export function AdminButton({ label, onPress, busy = false, destructive = false }: { label: string; onPress: () => void; busy?: boolean; destructive?: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <Pressable style={[styles.button, destructive && styles.dangerButton, busy && styles.disabled]} onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy, busy }}>
    {busy ? <ActivityIndicator color={destructive ? colors.dangerText : colors.onPrimary} /> : <Text style={[styles.buttonText, destructive && styles.dangerText]}>{label}</Text>}
  </Pressable>;
}

export function AdminField({ label, value, onChangeText, multiline = false, keyboardType, placeholder, maxLength, hint, error }: {
  label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad' | 'url' | 'email-address'; placeholder?: string; maxLength?: number; hint?: string; error?: string;
}) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={[styles.input, multiline && styles.multiline, error && styles.inputError]} value={value} onChangeText={onChangeText} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} keyboardType={keyboardType} autoCapitalize={keyboardType === 'url' || keyboardType === 'email-address' ? 'none' : 'sentences'} autoCorrect={keyboardType !== 'url' && keyboardType !== 'email-address'} placeholder={placeholder} placeholderTextColor={colors.textSubtle} maxLength={maxLength} accessibilityLabel={label} accessibilityHint={error || hint} />
    {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    {error ? <Text style={styles.fieldError} accessibilityRole="alert">{error}</Text> : null}
  </View>;
}

export function AdminChoices<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void;
}) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.choices}>{options.map((option) => <Pressable key={option.value} style={[styles.choice, value === option.value && styles.choiceActive]} onPress={() => onChange(option.value)} accessibilityRole="radio" accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{ selected: value === option.value }}><Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>{option.label}</Text></Pressable>)}</View>
  </View>;
}

export function AdminRow({ title, subtitle, onPress, icon = 'chevron-forward' }: { title: string; subtitle?: string; onPress: () => void; icon?: IconName }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
    <View style={styles.rowText}><Text style={styles.rowTitle}>{title}</Text>{subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}</View>
    <Ionicons name={icon} size={20} color={colors.primaryDark} />
  </Pressable>;
}

export function AdminFeedback({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.feedback}><Text style={styles.feedbackText}>{message}</Text>{onRetry ? <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retryButton}><Text style={styles.retry}>Tentar novamente</Text></Pressable> : null}</View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  heading: { marginBottom: spacing.xl },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: spacing.sm },
  backText: { color: colors.primaryDark, fontWeight: '700' },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  subtitle: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.xs },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xl },
  noticeText: { flex: 1, color: colors.text, fontSize: typography.caption, lineHeight: 20 },
  button: { minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md },
  buttonText: { color: colors.onPrimary, fontWeight: '800', textAlign: 'center' },
  dangerButton: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  dangerText: { color: colors.dangerText },
  disabled: { opacity: 0.7 },
  field: { marginBottom: spacing.lg },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  input: { minHeight: 48, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  inputError: { borderColor: colors.danger },
  hint: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  fieldError: { color: colors.dangerText, fontSize: typography.caption, marginTop: spacing.xs },
  multiline: { minHeight: 96 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minHeight: 44, justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.md },
  choiceActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
  choiceTextActive: { color: colors.primaryDark },
  row: { ...cardSurface(colors), minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '800' },
  rowSubtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  feedback: { alignItems: 'center', marginVertical: spacing.xl },
  feedbackText: { color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  retry: { color: colors.primaryDark, fontWeight: '700', marginTop: spacing.sm },
  retryButton: { minHeight: 44, justifyContent: 'center' },
});
