import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { CatCard } from '../features/cats/CatCard';
import { catRepository } from '../services/catRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { Cat } from '../types/cat';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [featuredCats, setFeaturedCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    catRepository.list()
      .then((cats) => {
        if (active) setFeaturedCats(cats.filter((cat) => cat.adoptionStatus === 'available').slice(0, 2));
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [reload]));

  return (
    <Screen>
      <Text style={styles.hello}>OLÁ, QUE BOM TER VOCÊ AQUI</Text>
      <Text style={styles.brand}>Gatos da Corte</Text>
      <Text style={styles.subtitle}>Apoio à gestão e à adoção responsável de gatos.</Text>

      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name="paw" size={25} color={colors.primaryDark} /></View>
        <Text style={styles.heroTitle}>Transforme uma vida</Text>
        <Text style={styles.heroText}>Conheça os gatos que estão esperando por um lar.</Text>
        <Pressable style={styles.heroButton} onPress={() => navigation.navigate('Cats')} accessibilityRole="button">
          <Text style={styles.heroButtonText}>Conhecer os gatos</Text><Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>

      <Pressable style={({ pressed }) => [styles.medicationBanner, pressed && styles.pressed]} onPress={() => navigation.navigate('MedicationForm')} accessibilityRole="button" accessibilityLabel="Abrir solicitação de medicamentos">
        <View style={styles.medicationIcon}><Ionicons name="medkit-outline" size={25} color={colors.primaryDark} /></View>
        <View style={styles.medicationContent}>
          <Text style={styles.medicationTitle}>Precisa solicitar medicamentos?</Text>
          <Text style={styles.medicationText}>Preencha o formulário. O anexo é opcional.</Text>
          <Text style={styles.medicationAction}>Abrir formulário <Ionicons name="arrow-forward" size={15} color={colors.primaryDark} /></Text>
        </View>
      </Pressable>

      <SectionTitle title="Gatinhos em destaque" action="Ver todos" onActionPress={() => navigation.navigate('Cats')} />
      {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando gatos em destaque" /> : null}
      {loadError ? (
        <View style={styles.feedbackGroup}>
          <Text style={styles.feedback}>Não foi possível carregar os gatos em destaque.</Text>
          <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !loadError && featuredCats.length === 0 ? <Text style={styles.feedback}>Nenhum gato disponível no momento.</Text> : null}
      {!loading && !loadError ? featuredCats.map((cat) => (
        <CatCard key={cat.id} cat={cat} onPress={() => navigation.navigate('CatDetails', { catId: cat.id })} />
      )) : null}

      <Text style={styles.exploreTitle}>Explore o projeto</Text>
      <Pressable style={({ pressed }) => [styles.publicationLink, pressed && styles.pressed]} onPress={() => navigation.navigate('Publications')} accessibilityRole="button" accessibilityLabel="Ver Publicações do Admin">
        <View style={styles.quickIcon}><Ionicons name="newspaper-outline" size={23} color={colors.primaryDark} /></View>
        <View style={styles.publicationText}>
          <Text style={styles.quickTitle}>Publicações do Admin</Text>
          <Text style={styles.quickText}>Avisos e novidades da equipe</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
      </Pressable>
      <View style={styles.quickLinks}>
        <Pressable style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]} onPress={() => navigation.navigate('Campaigns')} accessibilityRole="button" accessibilityLabel="Ver campanhas">
          <View style={styles.quickIcon}><Ionicons name="heart-outline" size={23} color={colors.primaryDark} /></View>
          <Text style={styles.quickTitle}>Campanhas</Text>
          <Text style={styles.quickText}>Conheça as iniciativas</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} style={styles.quickArrow} />
        </Pressable>
        <Pressable style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]} onPress={() => navigation.navigate('Guide')} accessibilityRole="button" accessibilityLabel="Abrir Guia do Felino">
          <View style={styles.quickIcon}><Ionicons name="book-outline" size={23} color={colors.primaryDark} /></View>
          <Text style={styles.quickTitle}>Guia do Felino</Text>
          <Text style={styles.quickText}>Aprenda sobre cuidados</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} style={styles.quickArrow} />
        </Pressable>
      </View>
      <Pressable style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]} onPress={() => navigation.navigate('More')} accessibilityRole="button">
        <Text style={styles.helpButtonText}>Como ajudar a ONG</Text><Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  hello: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1 },
  brand: { color: colors.primaryDark, fontSize: typography.title, fontWeight: '900', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  hero: { backgroundColor: colors.primarySoft, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: '#DDD6FE' },
  heroIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  heroTitle: { color: colors.primaryDark, fontSize: typography.heading, fontWeight: '800' },
  heroText: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 21 },
  heroButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.lg },
  heroButtonText: { color: colors.onPrimary, fontWeight: '800' },
  medicationBanner: { ...cardSurface(colors), flexDirection: 'row', gap: spacing.md, padding: spacing.lg, marginBottom: spacing.xl },
  medicationIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  medicationContent: { flex: 1 },
  medicationTitle: { color: colors.text, fontWeight: '800', fontSize: typography.body },
  medicationText: { color: colors.textMuted, marginTop: spacing.xs, lineHeight: 20 },
  medicationAction: { color: colors.primaryDark, fontWeight: '800', marginTop: spacing.md },
  feedback: { color: colors.textMuted, marginBottom: spacing.md },
  feedbackGroup: { marginBottom: spacing.md },
  retry: { color: colors.primary, fontWeight: '700' },
  exploreTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.md },
  quickLinks: { flexDirection: 'row', gap: spacing.md },
  publicationLink: { ...cardSurface(colors), flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.md },
  publicationText: { flex: 1 },
  quickLink: { ...cardSurface(colors), flex: 1, minWidth: 0, padding: spacing.md },
  quickIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  quickTitle: { color: colors.text, fontWeight: '800' },
  quickText: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  quickArrow: { alignSelf: 'flex-end', marginTop: spacing.sm },
  pressed: { opacity: 0.84 },
  helpButton: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  helpButtonText: { color: colors.onPrimary, fontWeight: '800' },
});
