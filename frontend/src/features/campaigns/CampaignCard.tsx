import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../components/AppText';

import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { Campaign } from '../../types/campaign';
import { formatBrl, getCampaignProgress } from './formatCampaign';

export function CampaignCard({ campaign, onPress }: { campaign: Campaign; onPress: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const progress = getCampaignProgress(campaign);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver campanha ${campaign.title}`}>
      <View style={styles.heading}>
        <View style={styles.icon}><Ionicons name="heart-outline" size={22} color={colors.primaryDark} /></View>
        <Text style={styles.title}>{campaign.title}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{campaign.description}</Text>
      <Text style={styles.amount}>{formatBrl(campaign.raisedCents)} arrecadados</Text>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.goal}>Meta: {formatBrl(campaign.goalCents)}</Text>
        <Text style={styles.progress}>{progress}%</Text>
      </View>
      <View style={styles.linkRow}><Text style={styles.link}>Ver campanha</Text><Ionicons name="arrow-forward" size={18} color={colors.primary} /></View>
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { ...cardSurface(colors), padding: spacing.lg, marginBottom: spacing.md },
  pressed: { opacity: 0.84 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  description: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  amount: { color: colors.text, fontWeight: '700', marginTop: spacing.lg },
  track: { height: 8, backgroundColor: colors.primarySoft, borderRadius: radius.pill, marginTop: spacing.sm, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  goal: { color: colors.textMuted },
  progress: { color: colors.primaryDark, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '800' },
});
