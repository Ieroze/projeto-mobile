import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { guideRepository } from '../services/guideRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { GuideArticle } from '../types/guide';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GuideArticle'>;

export function GuideArticleScreen({ route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [article, setArticle] = useState<GuideArticle | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setArticle(null);
    Promise.all([guideRepository.getArticleById(route.params.articleId), guideRepository.listCategories()])
      .then(([item, categories]) => {
        if (active) {
          setArticle(item ?? null);
          setCategoryName(categories.find((category) => category.id === item?.categoryId)?.name ?? 'Geral');
        }
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.articleId, reload]));

  if (loading) return <Screen withHeader><ActivityIndicator color={colors.primary} accessibilityLabel="Carregando artigo" /></Screen>;
  if (error) {
    return (
      <Screen withHeader>
        <Text style={styles.feedback}>Não foi possível carregar o artigo.</Text>
        <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
      </Screen>
    );
  }
  if (!article) return <Screen withHeader><Text style={styles.feedback}>Artigo não encontrado.</Text></Screen>;

  return (
    <Screen withHeader>
      <Text style={styles.category}>{categoryName}</Text>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.summary}>{article.summary}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{article.body}</Text>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  category: { alignSelf: 'flex-start', color: colors.primaryDark, fontWeight: '800', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900', marginTop: spacing.sm },
  summary: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  body: { color: colors.text, lineHeight: 24 },
  feedback: { color: colors.textMuted, marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
