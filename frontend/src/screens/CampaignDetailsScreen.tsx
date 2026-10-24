import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { CampaignPix } from '../features/campaigns/CampaignPix';
import { formatBrl, getCampaignProgress } from '../features/campaigns/formatCampaign';
import { ShareButton } from '../features/sharing/ShareButton';
import { campaignRepository } from '../services/campaignRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { Campaign } from '../types/campaign';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CampaignDetails'>;

export function CampaignDetailsScreen({ route }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setCampaign(null);
    campaignRepository.getById(route.params.campaignId)
      .then((item) => { if (active) setCampaign(item ?? null); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.campaignId, reload]));

  if (loading) return <Screen withHeader><ActivityIndicator color={colors.primary} accessibilityLabel="Carregando campanha" /></Screen>;
  if (error) {
    return (
      <Screen withHeader>
        <Text style={styles.feedback}>Não foi possível carregar esta campanha.</Text>
        <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button"><Text style={styles.retry}>Tentar novamente</Text></Pressable>
      </Screen>
    );
  }
  if (!campaign) return <Screen withHeader><Text style={styles.feedback}>Campanha não encontrada.</Text></Screen>;

  const progress = getCampaignProgress(campaign);
  const remaining = Math.max(0, campaign.goalCents - campaign.raisedCents);

  return (
    <Screen withHeader>
      <Text style={styles.title}>{campaign.title}</Text>
      <Text style={styles.description}>{campaign.description}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Arrecadado</Text>
        <Text style={styles.amount}>{formatBrl(campaign.raisedCents)}</Text>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progress}>{progress}% da meta de {formatBrl(campaign.goalCents)}</Text>
        <Text style={styles.remaining}>{remaining > 0 ? `Faltam ${formatBrl(remaining)} para atingir a meta.` : 'Meta atingida!'}</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Como apoiar</Text>
        <Text style={styles.noticeText}>Esta é uma campanha de demonstração. Confira os dados oficiais da ONG antes de fazer uma doação.</Text>
      </View>
      <CampaignPix pixKey={campaign.pixKey} />
      <ShareButton title={`a campanha ${campaign.title}`} message={`Conheça a campanha ${campaign.title} do Gatos da Corte. ${campaign.description}`} />
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900' },
  description: { color: colors.textMuted, fontSize: typography.body, lineHeight: 23, marginTop: spacing.md },
  card: { ...cardSurface(colors), borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.xl },
  label: { color: colors.textMuted, fontWeight: '700' },
  amount: { color: colors.primaryDark, fontSize: typography.title, fontWeight: '900', marginTop: spacing.xs },
  track: { height: 10, backgroundColor: colors.primarySoft, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.lg },
  fill: { height: '100%', backgroundColor: colors.primary },
  progress: { color: colors.text, fontWeight: '700', marginTop: spacing.md },
  remaining: { color: colors.textMuted, marginTop: spacing.sm },
  notice: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  noticeTitle: { color: colors.primaryDark, fontWeight: '800' },
  noticeText: { color: colors.text, lineHeight: 21, marginTop: spacing.sm },
  feedback: { color: colors.textMuted, marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
});
