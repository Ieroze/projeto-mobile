import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AdoptionSuccess'>;

export function AdoptionSuccessScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Screen withHeader contentStyle={styles.content}>
      <View style={styles.successIcon}><Ionicons name="checkmark" size={38} color={colors.primaryDark} /></View>
      <Text style={styles.title}>Simulação concluída</Text>
      <Text style={styles.subtitle}>Interesse em adotar {route.params.catName}</Text>
      <View style={styles.protocolCard}>
        <View style={styles.protocolHeading}>
          <Ionicons name="receipt-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.protocolLabel}>NÚMERO DE PROTOCOLO</Text>
        </View>
        <Text style={styles.protocol} selectable>{route.params.protocol}</Text>
        <Text style={styles.protocolHint}>Guarde esta referência como comprovante da simulação.</Text>
      </View>
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.noticeText}>Este protocolo é local e demonstrativo. A ONG ainda não recebeu sua solicitação nem seus dados. O envio real terá um protocolo gerado pela API para consulta da equipe administrativa.</Text>
      </View>
      <Pressable style={styles.button} onPress={() => navigation.navigate('MainTabs')} accessibilityRole="button">
        <Text style={styles.buttonText}>Voltar ao app</Text>
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  content: { justifyContent: 'center' },
  successIcon: { width: 78, height: 78, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  protocolCard: { ...cardSurface(colors), alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  protocolHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  protocolLabel: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.6 },
  protocol: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.lg, textAlign: 'center' },
  protocolHint: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '900', textAlign: 'center', marginTop: spacing.lg },
  subtitle: { color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  noticeText: { flex: 1, color: colors.text, lineHeight: 21 },
  button: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
});
