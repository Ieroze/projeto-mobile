import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { infoRepository } from '../services/infoRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { InfoSection } from '../types/info';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'More'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MoreScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [sections, setSections] = useState<InfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    infoRepository.list()
      .then((items) => { if (active) setSections(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return (
    <Screen>
      <Text style={styles.title}>Mais</Text>
      <Text style={styles.subtitle}>Informações e caminhos para conhecer o projeto.</Text>

      <Pressable style={styles.partnersLink} onPress={() => navigation.navigate('Partners')} accessibilityRole="button" accessibilityLabel="Conhecer os parceiros da ONG">
        <View style={styles.partnersIcon}><Ionicons name="people-outline" size={24} color={colors.primaryDark} /></View>
        <View style={styles.partnersText}>
          <Text style={styles.partnersTitle}>Parceiros</Text>
          <Text style={styles.partnersDescription}>Quem apoia a Gatos da Corte</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
      </Pressable>

      <Pressable style={styles.settingsLink} onPress={() => navigation.navigate('Settings')} accessibilityRole="button" accessibilityLabel="Abrir configurações do aplicativo">
        <View style={styles.partnersIcon}><Ionicons name="settings-outline" size={24} color={colors.primaryDark} /></View>
        <View style={styles.partnersText}>
          <Text style={styles.partnersTitle}>Configurações</Text>
          <Text style={styles.partnersDescription}>Tema, notificações e informações legais</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
      </Pressable>

      <Pressable style={styles.adminLink} onPress={() => navigation.navigate('AdminArea')} accessibilityRole="button" accessibilityLabel="Abrir demonstração da área administrativa">
        <View style={styles.partnersIcon}><Ionicons name="shield-checkmark-outline" size={24} color={colors.primaryDark} /></View>
        <View style={styles.partnersText}>
          <Text style={styles.partnersTitle}>Área administrativa</Text>
          <Text style={styles.partnersDescription}>Acesso demonstrativo à gestão</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
      </Pressable>

      {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando informações" /> : null}
      {error ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>Não foi possível carregar as informações.</Text>
          <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
        </View>
      ) : null}
      {!loading && !error && sections.length === 0 ? <Text style={styles.feedbackText}>Nenhuma informação disponível no momento.</Text> : null}

      {!loading && !error ? sections.map((section) => (
        <View key={section.id} style={styles.card}>
          <View style={styles.cardHeading}>
            <View style={styles.cardIcon}><Ionicons name={section.id === 'help' ? 'heart-outline' : section.id === 'about' ? 'information-circle-outline' : section.id === 'contact' ? 'chatbubble-ellipses-outline' : 'shield-checkmark-outline'} size={22} color={colors.primaryDark} /></View>
            <Text style={styles.cardTitle}>{section.title}</Text>
          </View>
          <Text style={styles.body}>{section.body}</Text>
          {section.actions ? (
            <View style={styles.actions}>
              {section.actions.map((action) => (
                <Pressable key={action.route} style={styles.action} onPress={() => navigation.navigate(action.route)} accessibilityRole="button">
                  <Text style={styles.actionText}>{action.label}</Text><Ionicons name="arrow-forward" size={16} color={colors.primaryDark} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      )) : null}
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { fontSize: typography.heading, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  partnersLink: { ...cardSurface(colors), minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.md },
  settingsLink: { ...cardSurface(colors), minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.xl },
  adminLink: { ...cardSurface(colors), minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.xl },
  partnersIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  partnersText: { flex: 1 },
  partnersTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  partnersDescription: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  card: { ...cardSurface(colors), padding: spacing.lg, marginBottom: spacing.md },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  body: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  action: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  actionText: { color: colors.primaryDark, fontWeight: '800' },
  feedback: { alignItems: 'center' },
  feedbackText: { color: colors.textMuted, textAlign: 'center' },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
