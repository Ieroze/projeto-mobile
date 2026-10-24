import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { CatImage } from '../features/cats/CatImage';
import { ShareButton } from '../features/sharing/ShareButton';
import { catRepository } from '../services/catRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdoptionStatus, CareStatus, Cat } from '../types/cat';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CatDetails'>;

const adoptionLabels: Record<AdoptionStatus, string> = {
  available: 'Disponível para adoção',
  in_process: 'Adoção em andamento',
  adopted: 'Adotado',
  not_available: 'Indisponível para adoção',
};
const careLabels: Record<CareStatus, string> = {
  healthy: 'Saudável',
  treatment: 'Em tratamento',
  temporary_home: 'Em lar temporário',
};

export function CatDetailsScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setCat(null);
    catRepository.getById(route.params.catId)
      .then((item) => { if (active) setCat(item ?? null); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.catId, reload]));

  if (loading) return <Screen withHeader><ActivityIndicator color={colors.primary} accessibilityLabel="Carregando perfil do gato" /></Screen>;
  if (error) {
    return (
      <Screen withHeader>
        <Text style={styles.feedback}>Não foi possível carregar o perfil.</Text>
        <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.retry}>Tentar novamente</Text>
        </Pressable>
      </Screen>
    );
  }
  if (!cat) return <Screen withHeader><Text style={styles.feedback}>Gato não encontrado.</Text></Screen>;

  return (
    <Screen withHeader>
      <CatImage cat={cat} style={styles.image} iconSize={52} />
      <Text style={styles.name}>{cat.name}</Text>
      <Text style={styles.meta}>{cat.ageLabel} · {cat.sex === 'female' ? 'Fêmea' : 'Macho'}</Text>
      <View style={styles.statusRow}>
        <Text style={[styles.status, cat.adoptionStatus === 'available' ? styles.availableStatus : styles.pendingStatus]}>{adoptionLabels[cat.adoptionStatus]}</Text>
        <Text style={[styles.status, cat.careStatus === 'healthy' ? styles.availableStatus : styles.pendingStatus]}>{careLabels[cat.careStatus]}</Text>
      </View>
      <Text style={styles.description}>{cat.description}</Text>

      {cat.traits.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalidade</Text>
          <View style={styles.tags}>
            {cat.traits.map((trait) => <Text key={trait} style={styles.tag}>{trait}</Text>)}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuidados</Text>
        <Text style={styles.health}>Castrado(a): {cat.castrated ? 'Sim' : 'Não'}</Text>
        <Text style={styles.health}>Vacinado(a): {cat.vaccinated ? 'Sim' : 'Não'}</Text>
        {cat.fivFelvNegative !== undefined ? (
          <Text style={styles.health}>Teste FIV/FeLV negativo: {cat.fivFelvNegative ? 'Sim' : 'Não'}</Text>
        ) : null}
      </View>

      {cat.adoptionStatus === 'available' ? (
        <Pressable style={styles.button} onPress={() => navigation.navigate('AdoptionForm', { catId: cat.id })} accessibilityRole="button">
          <Text style={styles.buttonText}>Tenho interesse em adotar</Text>
        </Pressable>
      ) : <Text style={styles.feedback}>Este gato não está recebendo manifestações de adoção no momento.</Text>}
      <ShareButton title={`o gato ${cat.name}`} message={`Conheça ${cat.name} no Gatos da Corte. ${cat.shortDescription}\n${adoptionLabels[cat.adoptionStatus]}.`} />
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  image: { width: '100%', height: 280, borderRadius: radius.xl, backgroundColor: colors.primarySoft },
  name: { fontSize: typography.title, color: colors.text, fontWeight: '900', marginTop: spacing.lg },
  meta: { color: colors.textMuted, marginTop: spacing.xs },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  status: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontWeight: '700' },
  availableStatus: { backgroundColor: colors.successSoft, color: colors.successText },
  pendingStatus: { backgroundColor: colors.warningSoft, color: colors.warningText },
  description: { color: colors.text, lineHeight: 22, marginTop: spacing.lg },
  section: { marginTop: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tag: { backgroundColor: colors.primarySoft, color: colors.primaryDark, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  health: { color: colors.text, marginTop: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
  feedback: { color: colors.textMuted, marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
