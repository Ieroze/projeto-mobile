import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Screen } from '../components/Screen';
import { AdminButton, AdminFeedback, AdminHeading, AdminNotice, AdminRow } from '../features/admin/AdminUi';
import { adminPublicationRepository } from '../services/adminPublicationRepository';
import { useColors } from '../theme';
import { AdminPublication } from '../types/adminPublication';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminPublications'>;

export function AdminPublicationsScreen({ navigation }: Props) {
  const colors = useColors();
  const [items, setItems] = useState<AdminPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    adminPublicationRepository.listForAdmin()
      .then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <Screen withHeader>
    <AdminHeading title="Publicações do Admin" subtitle="Crie avisos para a área pública." onBack={() => navigation.goBack()} />
    <AdminNotice>Somente publicações marcadas como Publicado aparecem para o público. As alterações desta demonstração são locais.</AdminNotice>
    <AdminButton label="Nova publicação" onPress={() => navigation.navigate('AdminPublicationForm', {})} />
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar as publicações." onRetry={() => setReload((value) => value + 1)} /> : items.length === 0 ? <AdminFeedback message="Nenhuma publicação cadastrada." /> : items.map((item) =>
      <AdminRow key={item.id} title={item.title} subtitle={item.status === 'published' ? 'Publicado' : 'Rascunho'} onPress={() => navigation.navigate('AdminPublicationForm', { publicationId: item.id })} />)}
  </Screen>;
}
