import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './AppText';
import { ColorPalette, spacing, typography, useColors, useThemedStyles } from '../theme';

type Props = { title: string; action?: string; onActionPress?: () => void };

export function SectionTitle({ title, action, onActionPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && onActionPress ? (
        <Pressable style={styles.actionButton} onPress={onActionPress} accessibilityRole="button" accessibilityLabel={action}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { color: colors.text, fontSize: typography.subheading, fontWeight: '700', flexShrink: 1 },
  actionButton: { minHeight: 44, paddingHorizontal: spacing.sm, justifyContent: 'center', marginLeft: 'auto' },
  action: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
});
