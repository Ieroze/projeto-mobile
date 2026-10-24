import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminHeading, AdminNotice, AdminRow } from '../features/admin/AdminUi';
import { guideRepository } from '../services/guideRepository';
import { ColorPalette, spacing, typography, useColors, useThemedStyles } from '../theme';
import { GuideArticle, GuideCategory } from '../types/guide';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminGuide'>;

export function AdminGuideScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [articles, setArticles] = useState<GuideArticle[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(false);
    Promise.all([guideRepository.listArticles(), guideRepository.listCategories()])
      .then(([items, groups]) => { if (active) { setArticles(items); setCategories(groups); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  return <Screen withHeader>
    <AdminHeading title="Guia do Felino" subtitle="Artigos e categorias da demonstração." onBack={() => navigation.goBack()} />
    <AdminNotice>O conteúdo público usa estes mocks locais. A publicação real e a revisão dos textos ainda precisam ser definidas.</AdminNotice>
    <Text style={styles.section}>Artigos</Text>
    <AdminButton label="Novo artigo" onPress={() => navigation.navigate('AdminArticleForm', {})} />
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar o Guia." onRetry={() => setReload((value) => value + 1)} /> : <>
      {articles.length === 0 ? <AdminFeedback message="Nenhum artigo cadastrado." /> : articles.map((item) => <AdminRow key={item.id} title={item.title} subtitle={categoryNames.get(item.categoryId) ?? 'Categoria indisponível'} onPress={() => navigation.navigate('AdminArticleForm', { articleId: item.id })} />)}
      <View style={styles.categoryHeading}><Text style={styles.section}>Categorias</Text></View>
      <AdminButton label="Nova categoria" onPress={() => navigation.navigate('AdminCategoryForm', {})} />
      {categories.map((item) => <AdminRow key={item.id} title={item.name} subtitle={`${articles.filter((article) => article.categoryId === item.id).length} artigo(s)`} onPress={() => navigation.navigate('AdminCategoryForm', { categoryId: item.id })} />)}
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  section: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginBottom: spacing.md },
  categoryHeading: { marginTop: spacing.xl },
});
