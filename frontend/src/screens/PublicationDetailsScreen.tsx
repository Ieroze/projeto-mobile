import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { adminPublicationRepository } from '../services/adminPublicationRepository';
import { ColorPalette, spacing, typography, useColors, useThemedStyles } from '../theme';
import { AdminPublication } from '../types/adminPublication';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicationDetails'>;

export function PublicationDetailsScreen({ route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [item, setItem] = useState<AdminPublication | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    adminPublicationRepository.getPublished(route.params.publicationId)
      .then((data) => { if (active) setItem(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.publicationId, reload]));

  return <Screen withHeader>
    {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando publicação" /> : error ? <>
      <Text style={styles.feedback}>Não foi possível carregar a publicação.</Text>
      <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
    </> : !item ? <Text style={styles.feedback}>Publicação indisponível.</Text> : <>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </>}
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800', marginBottom: spacing.lg },
  body: { color: colors.text, fontSize: typography.body, lineHeight: 25 },
  feedback: { color: colors.textMuted },
  retry: { color: colors.primaryDark, fontWeight: '700', marginTop: spacing.md },
});
