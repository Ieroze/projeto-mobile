import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminHeading, AdminNotice, AdminRow } from '../features/admin/AdminUi';
import { partnerRepository } from '../services/partnerRepository';
import { useColors } from '../theme';
import { Partner } from '../types/partner';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminPartners'>;
const labels = { accounting: 'Contabilidade', veterinary: 'Veterinária', photography: 'Fotografia' };

export function AdminPartnersScreen({ navigation }: Props) {
  const colors = useColors();
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(false);
    partnerRepository.list().then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <Screen withHeader>
    <AdminHeading title="Parceiros" subtitle="Nomes, categorias e redes desta demonstração." onBack={() => navigation.goBack()} />
    <AdminNotice>Os parceiros atuais são exemplos. A ONG precisa confirmar nomes e links antes da publicação real.</AdminNotice>
    <AdminButton label="Novo parceiro" onPress={() => navigation.navigate('AdminPartnerForm', {})} />
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar os parceiros." onRetry={() => setReload((value) => value + 1)} /> : items.length === 0 ? <AdminFeedback message="Nenhum parceiro cadastrado." /> : items.map((item) => <AdminRow key={item.id} title={item.name} subtitle={labels[item.category]} onPress={() => navigation.navigate('AdminPartnerForm', { partnerId: item.id })} />)}
  </Screen>;
}
