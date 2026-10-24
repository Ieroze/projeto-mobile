import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ComponentProps, useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { partnerRepository } from '../services/partnerRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { Partner, PartnerCategory, PartnerSocialPlatform } from '../types/partner';

type IconName = ComponentProps<typeof Ionicons>['name'];

const categoryIcons: Record<PartnerCategory, IconName> = {
  accounting: 'calculator-outline',
  veterinary: 'medkit-outline',
  photography: 'camera-outline',
};

const categoryLabels: Record<PartnerCategory, string> = {
  accounting: 'CONTABILIDADE',
  veterinary: 'VETERINÁRIA',
  photography: 'FOTOGRAFIA',
};

const socialIcons: Record<PartnerSocialPlatform, IconName> = {
  instagram: 'logo-instagram',
  facebook: 'logo-facebook',
  whatsapp: 'logo-whatsapp',
  website: 'globe-outline',
};

export function PartnersScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    partnerRepository.list()
      .then((items) => { if (active) setPartners(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  function openSocial(url: string) {
    setLinkError(false);
    Linking.openURL(url).catch(() => setLinkError(true));
  }

  return (
    <Screen withHeader>
      <Text style={styles.eyebrow}>QUEM CAMINHA COM A GENTE</Text>
      <Text style={styles.title}>Nossos parceiros</Text>
      <Text style={styles.subtitle}>Conheça quem contribui com o cuidado e a adoção responsável dos gatos.</Text>

      {partners.some((partner) => partner.isDemo) ? (
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
          <Text style={styles.noticeText}>Parceiros e perfis abaixo são exemplos de layout. A ONG ainda precisa confirmar os nomes e links oficiais.</Text>
        </View>
      ) : null}

      {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando parceiros" /> : null}
      {error ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>Não foi possível carregar os parceiros.</Text>
          <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button">
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !error && partners.length === 0 ? <Text style={styles.feedbackText}>Ainda não há parceiros cadastrados.</Text> : null}
      {linkError ? <Text style={styles.linkError} accessibilityRole="alert">Não foi possível abrir este link.</Text> : null}

      {!loading && !error ? partners.map((partner) => (
        <View key={partner.id} style={styles.card}>
          <View style={styles.heading}>
            <View style={styles.iconBox}>
              <Ionicons name={categoryIcons[partner.category]} size={26} color={colors.primaryDark} />
            </View>
            <View style={styles.headingText}>
              <Text style={styles.category}>{categoryLabels[partner.category]}</Text>
              <Text style={styles.name}>{partner.name}</Text>
            </View>
          </View>
          <Text style={styles.description}>{partner.description}</Text>
          <View style={styles.socials}>
            {partner.socials.map((social, index) => (
              <Pressable
                key={`${social.platform}-${index}`}
                style={[styles.social, !social.url && styles.socialPending]}
                disabled={!social.url}
                onPress={() => social.url && openSocial(social.url)}
                accessibilityRole="link"
                accessibilityState={{ disabled: !social.url }}
                accessibilityLabel={`${social.label} de ${partner.name}`}
              >
                <Ionicons name={socialIcons[social.platform]} size={19} color={social.url ? colors.primaryDark : colors.textMuted} />
                <Text style={[styles.socialText, !social.url && styles.pendingText]}>{social.label}</Text>
                {social.url ? <Ionicons name="open-outline" size={16} color={colors.primaryDark} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      )) : null}
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  eyebrow: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.xl },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl },
  noticeText: { flex: 1, color: colors.text, lineHeight: 20, fontSize: typography.caption },
  card: { ...cardSurface(colors), padding: spacing.lg, marginBottom: spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primarySoft },
  headingText: { flex: 1 },
  category: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.7 },
  name: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.xs },
  description: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.md },
  socials: { gap: spacing.sm, marginTop: spacing.lg },
  social: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySurface },
  socialPending: { backgroundColor: colors.background },
  socialText: { flex: 1, color: colors.primaryDark, fontWeight: '700' },
  pendingText: { color: colors.textMuted },
  feedback: { alignItems: 'center', marginTop: spacing.xl },
  feedbackText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  retry: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
  linkError: { color: colors.dangerText, marginBottom: spacing.md },
});
