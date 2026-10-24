import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { adminPublicationRepository } from '../services/adminPublicationRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdminPublication } from '../types/adminPublication';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Publications'>;

export function PublicationsScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [items, setItems] = useState<AdminPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    adminPublicationRepository.listPublished()
      .then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <Screen withHeader>
    <Text style={styles.title}>Publicações do Admin</Text>
    <Text style={styles.subtitle}>Avisos e novidades da equipe do Gatos da Corte.</Text>
    {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando publicações" /> : error ? <View>
      <Text style={styles.feedback}>Não foi possível carregar as publicações.</Text>
      <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
    </View> : items.length === 0 ? <Text style={styles.feedback}>Nenhuma publicação disponível no momento.</Text> : items.map((item) =>
      <Pressable key={item.id} style={styles.card} onPress={() => navigation.navigate('PublicationDetails', { publicationId: item.id })} accessibilityRole="button" accessibilityLabel={`Ler publicação: ${item.title}`}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.preview} numberOfLines={2}>{item.body}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
      </Pressable>)}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  feedback: { color: colors.textMuted, marginTop: spacing.lg },
  retry: { color: colors.primaryDark, fontWeight: '700', marginTop: spacing.md },
  card: { ...cardSurface(colors), borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  cardText: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: typography.body },
  preview: { color: colors.textMuted, marginTop: spacing.xs, lineHeight: 21 },
});
