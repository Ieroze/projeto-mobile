import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';
import { useAdminSession } from '../features/admin/AdminSessionContext';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';

export function AdminLoginScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { signIn } = useAdminSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await signIn({ email, password });
      setPassword('');
    } catch {
      setError('Informe um e-mail válido e uma senha preenchida para entrar na demonstração.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen withHeader contentStyle={styles.content}>
      <View style={styles.icon}><Ionicons name="shield-checkmark-outline" size={34} color={colors.primaryDark} /></View>
      <Text style={styles.eyebrow}>ÁREA ADMINISTRATIVA</Text>
      <Text style={styles.title}>Acesso do administrador</Text>
      <Text style={styles.subtitle}>Visualize o painel de gestão do Gatos da Corte.</Text>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.noticeText}>Demonstração local: qualquer e-mail válido e senha preenchida liberam a visualização. Não use uma senha real.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="admin@exemplo.com"
          placeholderTextColor={colors.textSubtle}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          accessibilityLabel="E-mail do administrador"
        />
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite uma senha de teste"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!visible}
            autoComplete="off"
            textContentType="none"
            accessibilityLabel="Senha de teste"
            onSubmitEditing={handleSignIn}
          />
          <Pressable onPress={() => setVisible((value) => !value)} accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} hitSlop={10}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
          </Pressable>
        </View>
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleSignIn} disabled={busy} accessibilityRole="button" accessibilityLabel="Entrar na demonstração administrativa">
          {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Entrar na demonstração</Text>}
        </Pressable>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  content: { justifyContent: 'center', paddingVertical: spacing.xxl },
  icon: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  eyebrow: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl },
  noticeText: { color: colors.text, flex: 1, lineHeight: 20, fontSize: typography.caption },
  form: { ...cardSurface(colors), padding: spacing.lg, marginTop: spacing.xl },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  input: { minHeight: 48, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  passwordRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md },
  passwordInput: { flex: 1, minHeight: 46, color: colors.text },
  error: { color: colors.dangerText, marginTop: spacing.md, lineHeight: 20 },
  button: { minHeight: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.xl },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
  pressed: { opacity: 0.84 },
});
