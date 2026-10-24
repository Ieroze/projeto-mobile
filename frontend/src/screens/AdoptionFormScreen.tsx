import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, TextInputProps, View } from 'react-native';

import { Text, TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AdoptionFormErrors, AdoptionFormValues, validateAdoptionForm } from '../features/adoption/validation';
import { adoptionRepository } from '../services/adoptionRepository';
import { catRepository } from '../services/catRepository';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { HousingType } from '../types/adoption';
import { Cat } from '../types/cat';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AdoptionForm'>;
type FieldProps = TextInputProps & { label: string; error?: string };

const initialValues: AdoptionFormValues = {
  name: '', phone: '', email: '', city: '',
  housingType: null, hasOtherAnimals: null, adoptionReasons: '', consentPrivacy: false,
};

const housingOptions: Array<{ value: HousingType; label: string }> = [
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'other', label: 'Outro' },
];

function FormField({ label, error, multiline, ...props }: FieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]} placeholderTextColor={colors.textMuted} accessibilityLabel={label} accessibilityHint={error} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} {...props} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function AdoptionFormScreen({ route, navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [cat, setCat] = useState<Cat | null>(null);
  const [loadingCat, setLoadingCat] = useState(true);
  const [catError, setCatError] = useState(false);
  const [reload, setReload] = useState(0);
  const [values, setValues] = useState<AdoptionFormValues>(initialValues);
  const [errors, setErrors] = useState<AdoptionFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingCat(true);
    setCatError(false);
    catRepository.getById(route.params.catId)
      .then((item) => { if (active) setCat(item ?? null); })
      .catch(() => { if (active) setCatError(true); })
      .finally(() => { if (active) setLoadingCat(false); });
    return () => { active = false; };
  }, [route.params.catId, reload]);

  function updateText(field: 'name' | 'phone' | 'email' | 'city' | 'adoptionReasons', value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  }

  async function submit() {
    if (submitting || !cat || cat.adoptionStatus !== 'available') return;
    const result = validateAdoptionForm(values, cat.id);
    if (!result.valid) {
      setErrors(result.errors);
      AccessibilityInfo.announceForAccessibility('Revise os campos destacados antes de continuar.');
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError('');
    try {
      const receipt = await adoptionRepository.submit(result.input);
      navigation.replace('AdoptionSuccess', { ...receipt, catName: cat.name });
    } catch {
      setSubmitError('Não foi possível registrar a simulação. Confira se o gato ainda está disponível e tente novamente.');
      setSubmitting(false);
    }
  }

  if (loadingCat) return <Screen withHeader><ActivityIndicator color={colors.primary} accessibilityLabel="Carregando formulário" /></Screen>;
  if (catError) {
    return (
      <Screen withHeader>
        <Text style={styles.helper}>Não foi possível carregar os dados do gato.</Text>
        <Pressable onPress={() => setReload((value) => value + 1)} accessibilityRole="button" hitSlop={12}><Text style={styles.retry}>Tentar novamente</Text></Pressable>
      </Screen>
    );
  }
  if (!cat || cat.adoptionStatus !== 'available') {
    return <Screen withHeader><Text style={styles.helper}>Este gato não está disponível para receber manifestações de adoção.</Text></Screen>;
  }

  return (
    <Screen withHeader>
      <Text style={styles.title}>Interesse em adotar {cat.name}</Text>
      <Text style={styles.helper}>Preencha seus dados para simular uma manifestação de interesse. Nenhum dado será enviado à ONG nesta fase.</Text>

      <FormField label="Nome completo *" value={values.name} onChangeText={(value) => updateText('name', value)} error={errors.name} placeholder="Seu nome" autoComplete="name" textContentType="name" maxLength={160} />
      <FormField label="Telefone com DDD *" value={values.phone} onChangeText={(value) => updateText('phone', value)} error={errors.phone} placeholder="(00) 00000-0000" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={40} />
      <FormField label="E-mail (opcional)" value={values.email} onChangeText={(value) => updateText('email', value)} error={errors.email} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={255} />
      <FormField label="Cidade (opcional)" value={values.city} onChangeText={(value) => updateText('city', value)} error={errors.city} placeholder="Sua cidade" maxLength={120} />

      <Text style={styles.sectionTitle}>Sobre o seu interesse</Text>
      <Text style={styles.label}>Tipo de moradia</Text>
      <View style={styles.optionsRow}>
        {housingOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.option, values.housingType === option.value && styles.optionSelected]}
            onPress={() => setValues((current) => ({ ...current, housingType: current.housingType === option.value ? null : option.value }))}
            accessibilityRole="button"
            accessibilityState={{ selected: values.housingType === option.value }}
            accessibilityLabel={`Moradia: ${option.label}`}
          >
            <Text style={[styles.optionText, values.housingType === option.value && styles.optionTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Já tem outros animais?</Text>
      <View style={styles.optionsRow}>
        {([{ value: true, label: 'Sim' }, { value: false, label: 'Não' }] as const).map((option) => (
          <Pressable
            key={option.label}
            style={[styles.option, values.hasOtherAnimals === option.value && styles.optionSelected]}
            onPress={() => setValues((current) => ({ ...current, hasOtherAnimals: current.hasOtherAnimals === option.value ? null : option.value }))}
            accessibilityRole="button"
            accessibilityState={{ selected: values.hasOtherAnimals === option.value }}
            accessibilityLabel={`Já tem outros animais: ${option.label}`}
          >
            <Text style={[styles.optionText, values.hasOtherAnimals === option.value && styles.optionTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <FormField label="Motivos para adotar" value={values.adoptionReasons} onChangeText={(value) => updateText('adoptionReasons', value)} error={errors.adoptionReasons} placeholder="Conte por que deseja adotar" maxLength={500} multiline numberOfLines={4} />

      <Pressable
        style={styles.consentRow}
        onPress={() => {
          setValues((current) => ({ ...current, consentPrivacy: !current.consentPrivacy }));
          setErrors((current) => ({ ...current, consentPrivacy: undefined }));
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: values.consentPrivacy }}
        accessibilityLabel="Autorizo o uso dos meus dados para contato sobre esta adoção"
        accessibilityHint={errors.consentPrivacy}
      >
        <View style={[styles.checkbox, values.consentPrivacy && styles.checkboxChecked]}>
          {values.consentPrivacy ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.consentText}>Autorizo o uso dos meus dados para contato sobre esta adoção. *</Text>
      </Pressable>
      {errors.consentPrivacy ? <Text style={styles.error}>{errors.consentPrivacy}</Text> : null}
      {Object.values(errors).some(Boolean) ? (
        <Text style={styles.errorSummary} accessibilityRole="alert">Revise os campos destacados antes de continuar.</Text>
      ) : null}
      {submitError ? <Text style={styles.error} accessibilityRole="alert">{submitError}</Text> : null}

      <Pressable style={[styles.button, submitting && styles.buttonDisabled]} disabled={submitting} onPress={submit} accessibilityRole="button">
        {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Simular envio de interesse</Text>}
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: { fontSize: typography.heading, fontWeight: '800', color: colors.text },
  helper: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.lg },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg, color: colors.text },
  multilineInput: { minHeight: 108 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  option: { minHeight: 44, justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.lg },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.text, fontWeight: '700' },
  optionTextSelected: { color: colors.onPrimary },
  inputError: { borderColor: colors.danger },
  error: { color: colors.dangerText, marginTop: spacing.xs },
  errorSummary: { color: colors.dangerText, fontWeight: '700', marginTop: spacing.lg },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginTop: spacing.sm },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: colors.primary, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary },
  checkmark: { color: colors.onPrimary, fontWeight: '900' },
  consentText: { flex: 1, color: colors.text, lineHeight: 21 },
  button: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
  retry: { color: colors.primary, fontWeight: '700' },
});
