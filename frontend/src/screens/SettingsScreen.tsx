import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import { legalDocuments } from '../mocks/settings';
import { localNotificationService } from '../services/localNotificationService';
import { settingsRepository } from '../services/settingsRepository';
import { AppTheme, ColorPalette, cardSurface, radius, spacing, typography, useAppTheme, useThemedStyles } from '../theme';
import { LegalDocument, NotificationPreferences } from '../types/settings';

export function SettingsScreen() {
  const { theme, setTheme, colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [notifications, setNotifications] = useState(settingsRepository.getNotifications);
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  function updateNotification(key: keyof NotificationPreferences, enabled: boolean) {
    setNotifications((current) => settingsRepository.setNotifications({ ...current, [key]: enabled }));
  }

  async function testNotification() {
    if (testBusy) return;
    setTestBusy(true);
    setTestMessage('');
    try {
      const result = await localNotificationService.scheduleTest();
      setTestMessage(result === 'scheduled' ? 'Aviso agendado para aparecer em cerca de 5 segundos.' : 'Permissão de notificações negada. Ative-a nas configurações do Android para testar.');
    } catch (error) {
      console.warn('Falha ao agendar notificação local', error);
      setTestMessage('Não foi possível agendar o aviso de teste. Tente novamente.');
    }
    finally { setTestBusy(false); }
  }

  return (
    <Screen withHeader>
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Ajuste a aparência e suas preferências.</Text>

      <Text style={styles.sectionTitle}>Aparência</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tema do aplicativo</Text>
        <Text style={styles.cardHint}>A mudança vale para todas as telas agora.</Text>
        <View style={styles.themeOptions}>
          {([{ key: 'light', label: 'Claro', icon: 'sunny-outline' }, { key: 'dark', label: 'Escuro', icon: 'moon-outline' }] as const).map((option) => (
            <Pressable key={option.key} style={[styles.themeOption, theme === option.key && styles.themeSelected]} onPress={() => setTheme(option.key as AppTheme)} accessibilityRole="radio" accessibilityState={{ selected: theme === option.key }} accessibilityLabel={`Tema ${option.label}`}>
              <Ionicons name={option.icon} size={20} color={theme === option.key ? colors.onPrimary : colors.text} />
              <Text style={[styles.themeLabel, theme === option.key && styles.themeLabelSelected]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Notificações</Text>
      <View style={styles.card}>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceText}><Text style={styles.cardTitle}>Campanhas</Text><Text style={styles.cardHint}>Novidades sobre campanhas da ONG</Text></View>
          <Switch value={notifications.campaigns} onValueChange={(value) => updateNotification('campaigns', value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.text} accessibilityLabel="Notificações de campanhas" />
        </View>
        <View style={styles.divider} />
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceText}><Text style={styles.cardTitle}>Adoção</Text><Text style={styles.cardHint}>Atualizações de manifestações de interesse</Text></View>
          <Switch value={notifications.adoption} onValueChange={(value) => updateNotification('adoption', value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.text} accessibilityLabel="Notificações de adoção" />
        </View>
      </View>
      <Text style={styles.note}>As preferências ainda são demonstrativas e valem somente nesta sessão. O botão abaixo agenda um aviso local de teste, independente delas.</Text>
      <Pressable style={[styles.testButton, testBusy && styles.testButtonBusy]} onPress={testNotification} disabled={testBusy} accessibilityRole="button" accessibilityState={{ disabled: testBusy, busy: testBusy }}>
        <Ionicons name="notifications-outline" size={20} color={colors.onPrimary} />
        <Text style={styles.testButtonText}>{testBusy ? 'Agendando aviso…' : 'Testar notificação local'}</Text>
      </Pressable>
      {testMessage ? <Text style={styles.testMessage} accessibilityRole="alert">{testMessage}</Text> : null}

      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.card}>
        {(['terms', 'privacy'] as const).map((key) => (
          <Pressable key={key} style={styles.documentRow} onPress={() => setDocument(key)} accessibilityRole="button" accessibilityLabel={`Ver ${legalDocuments[key].title}`}>
            <Ionicons name={key === 'terms' ? 'document-text-outline' : 'shield-checkmark-outline'} size={21} color={colors.primaryDark} />
            <Text style={styles.documentTitle}>{legalDocuments[key].title}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Modal visible={document !== null} transparent animationType="fade" onRequestClose={() => setDocument(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{document ? legalDocuments[document].title : ''}</Text>
              <Pressable onPress={() => setDocument(null)} accessibilityRole="button" accessibilityLabel="Fechar janela"><Ionicons name="close" size={25} color={colors.text} /></Pressable>
            </View>
            <ScrollView style={styles.modalBody}><Text style={styles.modalText}>{document ? legalDocuments[document].body : ''}</Text></ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setDocument(null)} accessibilityRole="button"><Text style={styles.closeText}>Fechar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.md },
  card: { ...cardSurface(colors), padding: spacing.lg },
  cardTitle: { color: colors.text, fontWeight: '700' },
  cardHint: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18, marginTop: spacing.xs },
  themeOptions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  themeOption: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  themeSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeLabel: { color: colors.text, fontWeight: '700' },
  themeLabelSelected: { color: colors.onPrimary },
  preferenceRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  preferenceText: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  note: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 19, marginTop: spacing.sm },
  testButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  testButtonBusy: { opacity: 0.7 },
  testButtonText: { color: colors.onPrimary, fontWeight: '800' },
  testMessage: { color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  documentRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  documentTitle: { flex: 1, color: colors.text, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: '#00000099', padding: spacing.lg },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  modalTitle: { flex: 1, color: colors.text, fontSize: typography.subheading, fontWeight: '800' },
  modalBody: { marginVertical: spacing.lg },
  modalText: { color: colors.text, lineHeight: 23 },
  closeButton: { backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.onPrimary, fontWeight: '800' },
});
