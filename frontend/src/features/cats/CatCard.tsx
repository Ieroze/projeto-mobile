import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '../../components/AppText';

import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { AdoptionStatus, Cat } from '../../types/cat';
import { CatImage } from './CatImage';

const adoptionLabels: Record<AdoptionStatus, string> = {
  available: 'Disponível para adoção',
  in_process: 'Adoção em andamento',
  adopted: 'Adotado',
  not_available: 'Indisponível no momento',
};

export function CatCard({ cat, onPress }: { cat: Cat; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 375 || fontScale >= 1.3;
  const sex = cat.sex === 'female' ? 'Fêmea' : 'Macho';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, stacked && styles.cardStacked, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${cat.name}, ${cat.ageLabel}, ${sex}, ${adoptionLabels[cat.adoptionStatus]}. Ver perfil`}
    >
      <CatImage cat={cat} style={[styles.image, stacked && styles.imageStacked]} />
      <View style={[styles.body, stacked && styles.bodyStacked]}>
        <Text style={styles.name}>{cat.name}</Text>
        <Text style={styles.meta}>{cat.ageLabel} · {sex}</Text>
        <Text style={styles.description} numberOfLines={stacked ? 3 : 2}>{cat.shortDescription}</Text>
        <View style={[styles.badge, cat.adoptionStatus !== 'available' && styles.badgeMuted]}>
          <Text style={[styles.badgeText, cat.adoptionStatus !== 'available' && styles.badgeTextMuted]}>{adoptionLabels[cat.adoptionStatus]}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), flexDirection: 'row', padding: spacing.sm, marginBottom: spacing.md },
  pressed: { opacity: 0.84 },
  cardStacked: { flexDirection: 'column' },
  image: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  imageStacked: { width: '100%', height: 160 },
  body: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  bodyStacked: { marginLeft: 0, marginTop: spacing.md },
  name: { color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  meta: { color: colors.textMuted, marginTop: 2 },
  description: { color: colors.textMuted, marginTop: spacing.xs },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.successSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4, marginTop: spacing.sm },
  badgeMuted: { backgroundColor: colors.warningSoft },
  badgeText: { color: colors.successText, fontSize: typography.caption, fontWeight: '700' },
  badgeTextMuted: { color: colors.warningText },
});
