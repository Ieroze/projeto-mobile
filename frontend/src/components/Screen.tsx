import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorPalette, spacing, useColors, useThemedStyles } from '../theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
  withHeader?: boolean;
}

export function Screen({ children, scroll = true, contentStyle, withHeader = false }: ScreenProps) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const edges: Array<'top' | 'bottom'> = withHeader ? ['bottom'] : ['top'];
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={[styles.safeArea, styles.content, contentStyle]} edges={edges}>{children}</SafeAreaView>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg },
});
