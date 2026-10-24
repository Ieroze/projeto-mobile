import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { CampaignCard } from '../features/campaigns/CampaignCard';
import { campaignRepository } from '../services/campaignRepository';
import { ColorPalette, spacing, typography, useColors, useThemedStyles } from '../theme';
import { Campaign } from '../types/campaign';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Campaigns'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function CampaignsScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    campaignRepository.list()
      .then((items) => { if (active) setCampaigns(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={loading || error ? [] : campaigns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Campanhas</Text>
            <Text style={styles.subtitle}>Conheça as iniciativas de cuidado com os gatos.</Text>
          </View>
        }
        ListEmptyComponent={loading ? (
          <ActivityIndicator style={styles.feedback} color={colors.primary} accessibilityLabel="Carregando campanhas" />
        ) : error ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Não foi possível carregar as campanhas.</Text>
            <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button">
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : <Text style={styles.feedbackText}>Nenhuma campanha disponível no momento.</Text>}
        renderItem={({ item }) => <CampaignCard campaign={item} onPress={() => navigation.navigate('CampaignDetails', { campaignId: item.id })} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flexGrow: 1, padding: spacing.lg },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  feedback: { marginTop: spacing.xl, alignItems: 'center' },
  feedbackText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
