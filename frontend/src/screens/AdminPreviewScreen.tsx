import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { CatImage } from '../features/cats/CatImage';
import { AdminButton, AdminHeading, AdminNotice } from '../features/admin/AdminUi';
import { formatBrl, getCampaignProgress } from '../features/campaigns/formatCampaign';
import { ColorPalette, cardSurface, radius, spacing, typography, useThemedStyles } from '../theme';
import { AdoptionStatus, CareStatus } from '../types/cat';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminPreview'>;

const adoptionLabels: Record<AdoptionStatus, string> = {
  available: 'Disponível para adoção', in_process: 'Adoção em andamento',
  adopted: 'Adotado', not_available: 'Indisponível para adoção',
};
const careLabels: Record<CareStatus, string> = {
  healthy: 'Saudável', treatment: 'Em tratamento', temporary_home: 'Em lar temporário',
};

export function AdminPreviewScreen({ route, navigation }: Props) {
  const styles = useThemedStyles(createStyles);
  const preview = route.params;

  return <Screen withHeader>
    <AdminHeading title="Prévia do conteúdo" onBack={() => navigation.goBack()} />
    <AdminNotice>Prévia do rascunho. Volte ao formulário e salve para atualizar os dados locais e as telas públicas.</AdminNotice>
    {preview.kind === 'cat' ? <>
      <CatImage cat={{ ...preview.draft, id: 'preview' }} style={styles.image} iconSize={52} />
      <Text style={styles.title}>{preview.draft.name}</Text>
      <Text style={styles.meta}>{preview.draft.ageLabel} · {preview.draft.sex === 'female' ? 'Fêmea' : 'Macho'}</Text>
      <View style={styles.statusRow}>
        <Text style={[styles.status, preview.draft.adoptionStatus === 'available' ? styles.availableStatus : styles.pendingStatus]}>{adoptionLabels[preview.draft.adoptionStatus]}</Text>
        <Text style={[styles.status, preview.draft.careStatus === 'healthy' ? styles.availableStatus : styles.pendingStatus]}>{careLabels[preview.draft.careStatus]}</Text>
      </View>
      <Text style={styles.description}>{preview.draft.description}</Text>
      {preview.draft.traits.length > 0 ? <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalidade</Text>
        <View style={styles.tags}>{preview.draft.traits.map((trait) => <Text key={trait} style={styles.tag}>{trait}</Text>)}</View>
      </View> : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuidados</Text>
        <Text style={styles.health}>Castrado(a): {preview.draft.castrated ? 'Sim' : 'Não'}</Text>
        <Text style={styles.health}>Vacinado(a): {preview.draft.vaccinated ? 'Sim' : 'Não'}</Text>
        {preview.draft.fivFelvNegative !== undefined ? <Text style={styles.health}>Teste FIV/FeLV negativo: {preview.draft.fivFelvNegative ? 'Sim' : 'Não'}</Text> : null}
      </View>
      <Text style={styles.meta}>{preview.draft.adoptionStatus === 'available' ? 'No perfil público, o botão de interesse aparece aqui.' : 'No perfil público, aparece o aviso de indisponibilidade para adoção.'}</Text>
    </> : null}
    {preview.kind === 'campaign' ? <>
      <Text style={styles.title}>{preview.draft.title}</Text>
      <Text style={styles.description}>{preview.draft.description}</Text>
      <View style={styles.campaignCard}>
        <Text style={styles.meta}>Arrecadado</Text>
        <Text style={styles.amount}>{formatBrl(preview.draft.raisedCents)}</Text>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: getCampaignProgress({ ...preview.draft, id: 'preview' }) }}>
          <View style={[styles.fill, { width: `${getCampaignProgress({ ...preview.draft, id: 'preview' })}%` }]} />
        </View>
        <Text style={styles.progress}>{getCampaignProgress({ ...preview.draft, id: 'preview' })}% da meta de {formatBrl(preview.draft.goalCents)}</Text>
        <Text style={styles.meta}>{preview.draft.raisedCents >= preview.draft.goalCents ? 'Meta atingida!' : `Faltam ${formatBrl(preview.draft.goalCents - preview.draft.raisedCents)} para atingir a meta.`}</Text>
      </View>
      <Text style={styles.meta}>O público verá o aviso de que os dados para doação ainda não foram confirmados pela ONG.</Text>
    </> : null}
    {preview.kind === 'article' ? <>
      <Text style={styles.category}>{preview.categoryName}</Text>
      <Text style={styles.title}>{preview.draft.title}</Text>
      <Text style={styles.summary}>{preview.draft.summary}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{preview.draft.body}</Text>
    </> : null}
    <View style={styles.returnButton}><AdminButton label="Voltar ao formulário" onPress={() => navigation.goBack()} /></View>
  </Screen>;
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  image: { width: '100%', height: 280, borderRadius: radius.xl, backgroundColor: colors.primarySoft },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900', marginTop: spacing.sm },
  meta: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 21 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  status: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontWeight: '700' },
  availableStatus: { backgroundColor: colors.successSoft, color: colors.successText },
  pendingStatus: { backgroundColor: colors.warningSoft, color: colors.warningText },
  description: { color: colors.text, lineHeight: 22, marginTop: spacing.lg },
  section: { marginTop: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tag: { backgroundColor: colors.primarySoft, color: colors.primaryDark, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  health: { color: colors.text, marginTop: spacing.md },
  campaignCard: { ...cardSurface(colors), borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.xl },
  amount: { color: colors.primaryDark, fontSize: typography.title, fontWeight: '900', marginTop: spacing.xs },
  track: { height: 10, backgroundColor: colors.primarySoft, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.lg },
  fill: { height: '100%', backgroundColor: colors.primary },
  progress: { color: colors.text, fontWeight: '700', marginTop: spacing.md },
  category: { alignSelf: 'flex-start', color: colors.primaryDark, fontWeight: '800', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  summary: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  body: { color: colors.text, lineHeight: 24 },
  returnButton: { marginTop: spacing.xl },
});
