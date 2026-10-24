import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { SearchField } from '../components/SearchField';

import { CatCard } from '../features/cats/CatCard';
import { catRepository } from '../services/catRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { Cat } from '../types/cat';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Cats'>,
  NativeStackScreenProps<RootStackParamList>
>;
type Filter = 'available' | 'all';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function CatsScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [cats, setCats] = useState<Cat[]>([]);
  const [filter, setFilter] = useState<Filter>('available');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    catRepository.list()
      .then((items) => { if (active) setCats(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const visibleCats = useMemo(() => {
    const search = normalize(query);
    return cats.filter((cat) =>
      (filter === 'all' || cat.adoptionStatus === 'available') &&
      (!search || normalize(`${cat.name} ${cat.traits.join(' ')}`).includes(search))
    );
  }, [cats, filter, query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={loading || error ? [] : visibleCats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Conheça os gatos</Text>
            <Text style={styles.subtitle}>Encontre um companheiro e conheça sua história.</Text>
            <SearchField value={query} onChangeText={setQuery} placeholder="Buscar por nome ou característica" accessibilityLabel="Buscar gatos por nome ou característica" />
            <View style={styles.filters}>
              <Pressable style={[styles.filter, filter === 'available' && styles.filterActive]} onPress={() => setFilter('available')} accessibilityRole="button" accessibilityState={{ selected: filter === 'available' }}>
                <Text style={[styles.filterText, filter === 'available' && styles.filterTextActive]}>Disponíveis</Text>
              </Pressable>
              <Pressable style={[styles.filter, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')} accessibilityRole="button" accessibilityState={{ selected: filter === 'all' }}>
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
              </Pressable>
            </View>
            {!loading && !error ? <Text style={styles.count}>{visibleCats.length} {visibleCats.length === 1 ? 'gato encontrado' : 'gatos encontrados'}</Text> : null}
          </View>
        }
        ListEmptyComponent={loading ? (
          <ActivityIndicator style={styles.feedback} color={colors.primary} accessibilityLabel="Carregando gatos" />
        ) : error ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Não foi possível carregar os gatos.</Text>
            <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button" hitSlop={12}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.feedbackText}>Nenhum gato corresponde à busca. Tente outro nome ou filtro.</Text>
        )}
        renderItem={({ item }) => <CatCard cat={item} onPress={() => navigation.navigate('CatDetails', { catId: item.id })} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, padding: spacing.lg },
  title: { fontSize: typography.heading, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  filters: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  filter: { minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontWeight: '700' },
  filterTextActive: { color: colors.onPrimary },
  count: { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.md },
  feedback: { marginTop: spacing.xl, alignItems: 'center' },
  feedbackText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
