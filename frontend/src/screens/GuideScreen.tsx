import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { SearchField } from '../components/SearchField';

import { GuideArticleCard } from '../features/guide/GuideArticleCard';
import { guideRepository } from '../services/guideRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { GuideArticle, GuideCategory } from '../types/guide';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Guide'>,
  NativeStackScreenProps<RootStackParamList>
>;

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function GuideScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [articles, setArticles] = useState<GuideArticle[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([guideRepository.listArticles(), guideRepository.listCategories()])
      .then(([items, groups]) => {
        if (active) {
          setArticles(items);
          setCategories(groups);
        }
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const visibleArticles = useMemo(() => {
    const search = normalize(query);
    return articles.filter((article) =>
      (selectedCategory === 'all' || article.categoryId === selectedCategory) &&
      (!search || normalize(`${article.title} ${article.summary} ${categoryNames.get(article.categoryId) ?? ''}`).includes(search))
    );
  }, [articles, categoryNames, query, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={loading || error ? [] : visibleArticles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Guia do Felino</Text>
            <Text style={styles.subtitle}>Encontre conteúdos sobre cuidado responsável.</Text>
            <SearchField value={query} onChangeText={setQuery} placeholder="Buscar artigos" accessibilityLabel="Buscar artigos do Guia" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              <Pressable style={[styles.category, selectedCategory === 'all' && styles.categoryActive]} onPress={() => setSelectedCategory('all')} accessibilityRole="button" accessibilityState={{ selected: selectedCategory === 'all' }}>
                <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>Todos</Text>
              </Pressable>
              {categories.map((category) => (
                <Pressable key={category.id} style={[styles.category, selectedCategory === category.id && styles.categoryActive]} onPress={() => setSelectedCategory(category.id)} accessibilityRole="button" accessibilityState={{ selected: selectedCategory === category.id }}>
                  <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>{category.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {!loading && !error ? <Text style={styles.count}>{visibleArticles.length} {visibleArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}</Text> : null}
          </View>
        }
        ListEmptyComponent={loading ? (
          <ActivityIndicator style={styles.feedback} color={colors.primary} accessibilityLabel="Carregando artigos" />
        ) : error ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Não foi possível carregar o Guia.</Text>
            <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
          </View>
        ) : <Text style={styles.feedbackText}>Nenhum artigo corresponde à busca. Tente outra palavra ou categoria.</Text>}
        renderItem={({ item }) => (
          <GuideArticleCard article={item} categoryName={categoryNames.get(item.categoryId) ?? 'Geral'} onPress={() => navigation.navigate('GuideArticle', { articleId: item.id })} />
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, padding: spacing.lg },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  categories: { gap: spacing.sm, paddingVertical: spacing.md },
  category: { minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  categoryActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { color: colors.text, fontWeight: '700' },
  categoryTextActive: { color: colors.onPrimary },
  count: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  feedback: { marginTop: spacing.xl, alignItems: 'center' },
  feedbackText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
