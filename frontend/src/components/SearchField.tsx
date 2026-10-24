import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { TextInput } from './AppText';

import { ColorPalette, radius, spacing, useColors, useThemedStyles } from '../theme';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}

export function SearchField({ value, onChangeText, placeholder, accessibilityLabel }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={colors.textMuted} accessibilityElementsHidden importantForAccessibility="no" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={accessibilityLabel}
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  input: { flex: 1, minWidth: 0, color: colors.text, paddingVertical: spacing.md },
});
