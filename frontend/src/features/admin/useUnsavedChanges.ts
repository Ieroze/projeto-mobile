import { NavigationProp, ParamListBase, useNavigation, usePreventRemove } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export function useUnsavedChanges(isDirty: boolean) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [allowExit, setAllowExit] = useState(false);
  const pendingExit = useRef<(() => void) | null>(null);

  usePreventRemove(isDirty && !allowExit, ({ data }) => {
    Alert.alert('Descartar alterações?', 'As alterações não salvas serão perdidas.', [
      { text: 'Continuar editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => {
        pendingExit.current = () => navigation.dispatch(data.action);
        setAllowExit(true);
      } },
    ]);
  });

  useEffect(() => {
    if (!allowExit || !pendingExit.current) return;
    const exit = pendingExit.current;
    pendingExit.current = null;
    exit();
  }, [allowExit]);

  return () => {
    pendingExit.current = () => navigation.goBack();
    setAllowExit(true);
  };
}
