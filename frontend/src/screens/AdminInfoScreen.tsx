import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Screen } from '../components/Screen';
import { AdminFeedback, AdminHeading, AdminNotice, AdminRow } from '../features/admin/AdminUi';
import { infoRepository } from '../services/infoRepository';
import { useColors } from '../theme';
import { InfoSection } from '../types/info';
import { AdminStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminInfo'>;

export function AdminInfoScreen({ navigation }: Props) {
  const colors = useColors();
  const [items, setItems] = useState<InfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(false);
    infoRepository.list().then((data) => { if (active) setItems(data.filter((item) => item.id !== 'privacy')); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <Screen withHeader>
    <AdminHeading title="Informações" subtitle="Textos das seções públicas de Mais." onBack={() => navigation.goBack()} />
    <AdminNotice>A edição é local. Os textos legais e de privacidade permanecem provisórios e fora desta tela até aprovação da ONG.</AdminNotice>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <AdminFeedback message="Não foi possível carregar as informações." onRetry={() => setReload((value) => value + 1)} /> : items.map((item) => <AdminRow key={item.id} title={item.title} subtitle={item.body.slice(0, 85)} onPress={() => navigation.navigate('AdminInfoForm', { sectionId: item.id })} />)}
  </Screen>;
}
