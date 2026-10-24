import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet } from 'react-native';

import { Text } from '../../components/AppText';
import { ColorPalette, radius, spacing, useColors, useThemedStyles } from '../../theme';

export function ShareButton({ title, message }: { title: string; message: string }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [busy, setBusy] = useState(false);

  async function share() {
    if (busy) return;
    setBusy(true);
    try { await Share.share({ title, message }, { dialogTitle: `Compartilhar ${title}` }); }
    catch { Alert.alert('Não foi possível compartilhar', 'Tente novamente.'); }
    finally { setBusy(false); }
  }

  return <Pressable style={styles.button} onPress={share} disabled={busy} accessibilityRole="button" accessibilityLabel={`Compartilhar ${title}`} accessibilityState={{ disabled: busy, busy }}>
    <Ionicons name="share-social-outline" size={21} color={colors.primaryDark} />
    <Text style={styles.text}>Compartilhar</Text>
  </Pressable>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  button: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md },
  text: { color: colors.primaryDark, fontWeight: '800' },
});
