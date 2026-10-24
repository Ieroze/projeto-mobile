import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../components/AppText';

import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { GuideArticle } from '../../types/guide';

interface Props {
  article: GuideArticle;
  categoryName: string;
  onPress: () => void;
}

export function GuideArticleCard({ article, categoryName, onPress }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ler artigo ${article.title}`}>
      <View style={styles.heading}><View style={styles.icon}><Ionicons name="book-outline" size={20} color={colors.primaryDark} /></View><Text style={styles.category}>{categoryName}</Text></View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.summary}>{article.summary}</Text>
      <View style={styles.linkRow}><Text style={styles.link}>Ler artigo</Text><Ionicons name="arrow-forward" size={18} color={colors.primary} /></View>
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), padding: spacing.lg, marginBottom: spacing.md },
  pressed: { opacity: 0.84 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  category: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
  title: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.md },
  summary: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  link: { color: colors.primary, fontWeight: '800' },
});
