import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminHeading, AdminNotice, AdminRow } from '../features/admin/AdminUi';
import { formatBrl } from '../features/campaigns/formatCampaign';
import { campaignRepository } from '../services/campaignRepository';
import { useColors } from '../theme';
import { Campaign } from '../types/campaign';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCampaigns'>;

export function AdminCampaignsScreen({ navigation }: Props) {
  const colors = useColors();
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    campaignRepository.list().then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <Screen withHeader>
    <AdminHeading title="Campanhas" subtitle="Gerencie as campanhas desta simulação." onBack={() => navigation.goBack()} />
    <AdminNotice>Valores e alterações são locais. O fluxo real de arrecadação será definido com a ONG e o backend.</AdminNotice>
    <AdminButton label="Nova campanha" onPress={() => navigation.navigate('AdminCampaignForm', {})} />
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar as campanhas." onRetry={() => setReload((value) => value + 1)} /> : items.length === 0 ? <AdminFeedback message="Nenhuma campanha cadastrada." /> : items.map((item) => <AdminRow key={item.id} title={item.title} subtitle={`${formatBrl(item.raisedCents)} de ${formatBrl(item.goalCents)}`} onPress={() => navigation.navigate('AdminCampaignForm', { campaignId: item.id })} />)}
  </Screen>;
}
