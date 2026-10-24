import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { useAdminSession } from '../features/admin/AdminSessionContext';
import { adminOverviewRepository } from '../services/adminOverviewRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdminOverview } from '../types/admin';
import { AdminStackParamList } from '../types/navigation';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHome'>;
type StatTone = 'primary' | 'success' | 'warning';

type SectionTarget = 'cats' | 'adoption' | 'medication' | 'campaigns' | 'guide' | 'partners' | 'info' | 'publications';
const sections: Array<{ label: string; icon: IconName; description: string; target: SectionTarget }> = [
  { label: 'Gatos', icon: 'paw-outline', description: 'Cadastro e edição', target: 'cats' },
  { label: 'Adoções', icon: 'heart-outline', description: 'Protocolos locais de interesse', target: 'adoption' },
  { label: 'Medicamentos', icon: 'medkit-outline', description: 'Protocolos locais de solicitação', target: 'medication' },
  { label: 'Campanhas', icon: 'megaphone-outline', description: 'Cadastro e edição', target: 'campaigns' },
  { label: 'Publicações do Admin', icon: 'newspaper-outline', description: 'Avisos para a área pública', target: 'publications' },
  { label: 'Guia do Felino', icon: 'book-outline', description: 'Artigos e categorias', target: 'guide' },
  { label: 'Parceiros', icon: 'people-outline', description: 'Nomes, categorias e links', target: 'partners' },
  { label: 'Informações', icon: 'information-circle-outline', description: 'Textos públicos de Mais', target: 'info' },
];

export function AdminHomeScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { session, signOut } = useAdminSession();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    adminOverviewRepository.get()
      .then((data) => { if (active) setOverview(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const handleSignOut = useCallback(() => { void signOut(); }, [signOut]);

  function openSection(target: SectionTarget) {
    switch (target) {
      case 'cats': navigation.navigate('AdminCats'); break;
      case 'adoption': navigation.navigate('AdminReceipts', { kind: 'adoption' }); break;
      case 'medication': navigation.navigate('AdminReceipts', { kind: 'medication' }); break;
      case 'campaigns': navigation.navigate('AdminCampaigns'); break;
      case 'publications': navigation.navigate('AdminPublications'); break;
      case 'guide': navigation.navigate('AdminGuide'); break;
      case 'partners': navigation.navigate('AdminPartners'); break;
      case 'info': navigation.navigate('AdminInfo'); break;
    }
  }

  return (
    <Screen withHeader>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>PAINEL ADMINISTRATIVO</Text>
          <Text style={styles.title}>Olá, {session?.name}</Text>
          <Text style={styles.subtitle}>Acompanhe o conteúdo do aplicativo.</Text>
        </View>
        <Pressable style={styles.signOut} onPress={handleSignOut} accessibilityRole="button" accessibilityLabel="Sair da área administrativa">
          <Ionicons name="log-out-outline" size={22} color={colors.primaryDark} />
        </Pressable>
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.noticeText}>Painel demonstrativo. Os números vêm dos mocks locais; nenhum pedido foi recebido pelo backend.</Text>
      </View>

      <Text style={styles.sectionTitle}>Visão geral</Text>
      {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando resumo administrativo" /> : null}
      {error ? (
        <View style={styles.feedback}>
          <Text style={styles.muted}>Não foi possível carregar o resumo.</Text>
          <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
        </View>
      ) : null}
      {!loading && !error && overview ? (
        <View style={styles.stats}>
          <Stat label="Gatos" value={overview.cats} icon="paw-outline" tone="primary" styles={styles} colors={colors} />
          <Stat label="Disponíveis" value={overview.availableCats} icon="heart-circle-outline" tone="success" styles={styles} colors={colors} />
          <Stat label="Campanhas" value={overview.campaigns} icon="megaphone-outline" tone="warning" styles={styles} colors={colors} />
          <Stat label="Artigos" value={overview.articles} icon="book-outline" tone="primary" styles={styles} colors={colors} />
          <Stat label="Adoções*" value={overview.adoptionReceipts} icon="receipt-outline" tone="success" styles={styles} colors={colors} />
          <Stat label="Medicamentos*" value={overview.medicationReceipts} icon="medkit-outline" tone="warning" styles={styles} colors={colors} />
        </View>
      ) : null}
      <Text style={styles.footnote}>* Protocolos locais desta sessão, inclusive envios fictícios. Nenhum pedido chegou ao backend.</Text>

      <Text style={styles.sectionTitle}>Áreas de gestão</Text>
      {sections.map((section) => (
        <Pressable key={section.label} style={styles.area} onPress={() => openSection(section.target)} accessibilityRole="button" accessibilityLabel={`Abrir ${section.label}`}>
          <View style={styles.areaIcon}><Ionicons name={section.icon} size={23} color={colors.primaryDark} /></View>
          <View style={styles.areaText}>
            <Text style={styles.areaLabel}>{section.label}</Text>
            <Text style={styles.muted}>{section.description}</Text>
          </View>
          <Text style={styles.soon}>Abrir</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

function Stat({ label, value, icon, tone, styles, colors }: {
  label: string; value: number; icon: IconName; tone: StatTone;
  styles: ReturnType<typeof createStyles>; colors: ColorPalette;
}) {
  const tones = {
    primary: { background: colors.primarySoft, foreground: colors.primaryDark },
    success: { background: colors.successSoft, foreground: colors.successText },
    warning: { background: colors.warningSoft, foreground: colors.warningText },
  };
  return <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
    <View style={styles.statTop}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={[styles.statIcon, { backgroundColor: tones[tone].background }]}>
        <Ionicons name={icon} size={22} color={tones[tone].foreground} />
      </View>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headingText: { flex: 1 },
  eyebrow: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  signOut: { minWidth: 48, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl },
  noticeText: { flex: 1, color: colors.text, fontSize: typography.caption, lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { ...cardSurface(colors), width: '48%', flexGrow: 1, minHeight: 112, padding: spacing.md, justifyContent: 'space-between' },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  statIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.text, fontSize: typography.title, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', marginTop: spacing.sm },
  footnote: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.sm, lineHeight: 18 },
  feedback: { paddingVertical: spacing.md },
  retry: { color: colors.primaryDark, fontWeight: '800', marginTop: spacing.sm },
  area: { ...cardSurface(colors), flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm },
  areaIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  areaText: { flex: 1 },
  areaLabel: { color: colors.text, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  soon: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '700' },
});
