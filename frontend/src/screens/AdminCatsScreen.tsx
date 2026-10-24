import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { SearchField } from '../components/SearchField';
import { CatImage } from '../features/cats/CatImage';
import { catRepository } from '../services/catRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdoptionStatus, Cat } from '../types/cat';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCats'>;
type Filter = 'all' | AdoptionStatus;

const statusLabels: Record<AdoptionStatus, string> = {
  available: 'Disponível',
  in_process: 'Em processo',
  adopted: 'Adotado',
  not_available: 'Indisponível',
};

const filterOptions: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'in_process', label: 'Em processo' },
  { value: 'adopted', label: 'Adotados' },
  { value: 'not_available', label: 'Indisponíveis' },
];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function AdminCatsScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [cats, setCats] = useState<Cat[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
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
    return cats.filter((cat) => (filter === 'all' || cat.adoptionStatus === filter) && (!search || normalize(`${cat.name} ${cat.traits.join(' ')}`).includes(search)));
  }, [cats, filter, query]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={loading || error ? [] : visibleCats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" style={styles.back}><Text style={styles.backText}>‹ Voltar ao painel</Text></Pressable>
            <Text style={styles.title}>Gestão de gatos</Text>
            <Text style={styles.subtitle}>Cadastre e edite os perfis usados na demonstração.</Text>
            <Pressable style={styles.create} onPress={() => navigation.navigate('AdminCatForm', {})} accessibilityRole="button">
              <Ionicons name="add" size={20} color={colors.onPrimary} /><Text style={styles.createText}>Cadastrar gato</Text>
            </Pressable>
            <SearchField value={query} onChangeText={setQuery} placeholder="Buscar gato" accessibilityLabel="Buscar gato para administrar" />
            <View style={styles.filters}>
              {filterOptions.map((option) => (
                <Pressable key={option.value} style={[styles.filter, filter === option.value && styles.filterActive]} onPress={() => setFilter(option.value)} accessibilityRole="button" accessibilityState={{ selected: filter === option.value }}>
                  <Text style={[styles.filterText, filter === option.value && styles.filterTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            {!loading && !error ? <Text style={styles.count}>{visibleCats.length} {visibleCats.length === 1 ? 'gato' : 'gatos'}</Text> : null}
          </View>
        }
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} style={styles.feedback} accessibilityLabel="Carregando gatos" /> : error ? (
          <View style={styles.feedback}><Text style={styles.muted}>Não foi possível carregar os gatos.</Text><Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable></View>
        ) : <Text style={styles.feedback}>Nenhum gato corresponde à busca ou ao filtro.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('AdminCatForm', { catId: item.id })} accessibilityRole="button" accessibilityLabel={`Editar ${item.name}`}>
            <CatImage cat={item} style={styles.photo} iconSize={24} />
            <View style={styles.cardContent}>
              <Text style={styles.catName}>{item.name}</Text>
              <Text style={styles.muted}>{item.ageLabel} · {item.sex === 'female' ? 'Fêmea' : 'Macho'}</Text>
              <Text style={styles.status}>{statusLabels[item.adoptionStatus]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, padding: spacing.lg },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: spacing.sm },
  backText: { color: colors.primaryDark, fontWeight: '700' },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 21 },
  create: { minHeight: 50, backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  createText: { color: colors.onPrimary, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  filter: { minHeight: 40, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
  filterTextActive: { color: colors.onPrimary },
  count: { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.md },
  card: { ...cardSurface(colors), flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm },
  photo: { width: 66, height: 66, borderRadius: radius.md },
  cardContent: { flex: 1 },
  catName: { color: colors.text, fontWeight: '800', fontSize: typography.body },
  muted: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  status: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '700', marginTop: spacing.xs },
  feedback: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  retry: { color: colors.primaryDark, fontWeight: '700', marginTop: spacing.sm },
});
