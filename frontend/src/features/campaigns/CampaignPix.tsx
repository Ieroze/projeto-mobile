import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import qrcode from 'qrcode-generator';

import { Text } from '../../components/AppText';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { buildStaticPixPayload } from './pixPayload';

export function CampaignPix({ pixKey }: { pixKey?: string }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [expanded, setExpanded] = useState(false);
  const key = pixKey?.trim();
  const matrix = useMemo(() => {
    if (!key) return null;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(buildStaticPixPayload(key));
      qr.make();
      return Array.from({ length: qr.getModuleCount() }, (_, row) =>
        Array.from({ length: qr.getModuleCount() }, (_, column) => qr.isDark(row, column)));
    } catch { return null; }
  }, [key]);

  if (!key) return <View style={styles.empty}><Text style={styles.emptyText}>Chave Pix não cadastrada nesta campanha.</Text></View>;

  const cellSize = matrix ? Math.floor(232 / matrix.length) : 0;
  return <View style={styles.container}>
    <Pressable style={styles.button} onPress={() => setExpanded((value) => !value)} accessibilityRole="button" accessibilityLabel="Mostrar chave Pix e QR Code" accessibilityState={{ expanded }}>
      <Ionicons name="qr-code-outline" size={21} color={colors.onPrimary} />
      <Text style={styles.buttonText}>{expanded ? 'Ocultar chave Pix e QR Code' : 'Ver chave Pix e QR Code'}</Text>
    </Pressable>
    {expanded ? <View style={styles.panel}>
      <Text style={styles.label}>Chave Pix de exemplo</Text>
      <Text style={styles.key} selectable>{key}</Text>
      {matrix ? <View style={styles.qrFrame} accessible accessibilityLabel={`QR Code Pix de demonstração para a chave ${key}`}>
        {matrix.map((row, rowIndex) => <View key={rowIndex} style={styles.qrRow}>
          {row.map((dark, columnIndex) => <View key={columnIndex} style={{ width: cellSize, height: cellSize, backgroundColor: dark ? '#111111' : '#FFFFFF' }} />)}
        </View>)}
      </View> : <Text style={styles.warning}>Não foi possível gerar o QR Code para esta chave. Confira o cadastro da campanha.</Text>}
      <Text style={styles.hint}>Dados demonstrativos. Confirme a chave oficial com a ONG antes de qualquer doação.</Text>
    </View> : null}
  </View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { marginTop: spacing.lg },
  button: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md },
  buttonText: { color: colors.onPrimary, fontWeight: '800', textAlign: 'center' },
  panel: { ...cardSurface(colors), marginTop: spacing.md, padding: spacing.lg, alignItems: 'center' },
  label: { color: colors.textMuted, fontWeight: '700' },
  key: { color: colors.text, fontSize: typography.body, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm },
  qrFrame: { backgroundColor: '#FFFFFF', padding: 16, marginTop: spacing.lg, borderRadius: radius.sm },
  qrRow: { flexDirection: 'row' },
  hint: { color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: spacing.lg },
  warning: { color: colors.dangerText, textAlign: 'center', marginTop: spacing.lg },
  empty: { marginTop: spacing.lg },
  emptyText: { color: colors.textMuted },
});
