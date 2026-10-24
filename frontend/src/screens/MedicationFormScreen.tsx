import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, TextInputProps, View } from 'react-native';

import { Text, TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';
import { AttachmentPicker } from '../features/medications/AttachmentPicker';
import { MedicationFormErrors, MedicationFormValues, validateMedicationForm } from '../features/medications/validation';
import { medicationRepository } from '../services/medicationRepository';
import { ColorPalette, cardSurface, radius, spacing, typography, useColors, useThemedStyles } from '../theme';
import { MedicationAttachment, MedicationUrgency } from '../types/medication';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicationForm'>;
type FieldProps = TextInputProps & { label: string; error?: string };
type TextField = Exclude<keyof MedicationFormValues, 'attachments' | 'urgency'>;

const urgencyOptions: Array<{ value: MedicationUrgency; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const initialValues: MedicationFormValues = {
  personName: '', personEmail: '', personPhoneWhatsApp: '',
  catName: '', catAge: '', requestReason: '', diagnosis: '', dosage: '',
  urgency: null, pickupAvailability: '', attachments: [],
};

function FormField({ label, error, multiline, ...props }: FieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={error}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function MedicationFormScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [values, setValues] = useState<MedicationFormValues>(initialValues);
  const [errors, setErrors] = useState<MedicationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateText(field: TextField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  }

  function updateAttachments(attachments: MedicationAttachment[]) {
    setValues((current) => ({ ...current, attachments }));
    setErrors((current) => ({ ...current, attachments: undefined }));
    setSubmitError('');
  }

  async function submit() {
    if (submitting) return;
    const result = validateMedicationForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      AccessibilityInfo.announceForAccessibility('Revise os campos destacados antes de continuar.');
      return;
    }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      const receipt = await medicationRepository.submit(result.input);
      navigation.replace('MedicationSuccess', receipt);
    } catch {
      setSubmitError('Não foi possível concluir a simulação. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <Screen withHeader>
      <Text style={styles.eyebrow}>CUIDADO COM OS GATOS</Text>
      <Text style={styles.title}>Solicitar medicamentos</Text>
      <Text style={styles.helper}>Preencha os dados da pessoa e do felino. Todos os campos são opcionais nesta fase de testes.</Text>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.noticeText}>Este formulário é uma simulação. Os dados e anexos selecionados não serão enviados à ONG nesta fase.</Text>
      </View>

      <Text style={styles.sectionTitle}>Dados da pessoa</Text>
      <FormField label="Nome" value={values.personName} onChangeText={(value) => updateText('personName', value)} error={errors.personName} placeholder="Nome completo" autoComplete="name" textContentType="name" maxLength={160} />
      <FormField label="E-mail" value={values.personEmail} onChangeText={(value) => updateText('personEmail', value)} error={errors.personEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={255} />
      <FormField label="Telefone / WhatsApp" value={values.personPhoneWhatsApp} onChangeText={(value) => updateText('personPhoneWhatsApp', value)} error={errors.personPhoneWhatsApp} placeholder="(00) 00000-0000" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={40} />

      <Text style={styles.sectionTitle}>Dados do felino</Text>
      <FormField label="Nome" value={values.catName} onChangeText={(value) => updateText('catName', value)} error={errors.catName} placeholder="Nome do gato" maxLength={120} />
      <FormField label="Idade" value={values.catAge} onChangeText={(value) => updateText('catAge', value)} error={errors.catAge} placeholder="Ex.: 2 anos" maxLength={80} />
      <FormField label="Motivo da solicitação" value={values.requestReason} onChangeText={(value) => updateText('requestReason', value)} error={errors.requestReason} placeholder="Conte por que o medicamento é necessário" maxLength={500} multiline numberOfLines={4} />
      <FormField label="Diagnóstico" value={values.diagnosis} onChangeText={(value) => updateText('diagnosis', value)} error={errors.diagnosis} placeholder="Se houver, descreva o diagnóstico" maxLength={500} multiline numberOfLines={4} />
      <FormField label="Dosagem" value={values.dosage} onChangeText={(value) => updateText('dosage', value)} error={errors.dosage} placeholder="Ex.: 1 comprimido a cada 12 horas" maxLength={160} />
      <Text style={styles.label}>Nível de urgência</Text>
      <View style={styles.urgencyOptions}>
        {urgencyOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.urgencyOption, values.urgency === option.value && styles.urgencySelected]}
            onPress={() => setValues((current) => ({ ...current, urgency: current.urgency === option.value ? null : option.value }))}
            accessibilityRole="button"
            accessibilityState={{ selected: values.urgency === option.value }}
            accessibilityLabel={`Urgência ${option.label}`}
          >
            <Text style={[styles.urgencyText, values.urgency === option.value && styles.urgencyTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Retirada de documentos</Text>
      <FormField label="Disponibilidade de retirada" value={values.pickupAvailability} onChangeText={(value) => updateText('pickupAvailability', value)} error={errors.pickupAvailability} placeholder="Ex.: dias úteis à tarde" maxLength={160} />

      <Text style={styles.sectionTitle}>Anexos</Text>
      <AttachmentPicker attachments={values.attachments} error={errors.attachments} onChange={updateAttachments} />
      {Object.values(errors).some(Boolean) ? <Text style={styles.errorSummary} accessibilityRole="alert">Revise os campos destacados antes de continuar.</Text> : null}
      {submitError ? <Text style={styles.errorSummary} accessibilityRole="alert">{submitError}</Text> : null}

      <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={submit} disabled={submitting} accessibilityRole="button">
        {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Simular solicitação</Text>}
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  eyebrow: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800', marginTop: spacing.xs },
  helper: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.lg },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl },
  noticeText: { flex: 1, color: colors.text, lineHeight: 20, fontSize: typography.caption },
  sectionTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  input: { ...cardSurface(colors), borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, minHeight: 50 },
  multilineInput: { minHeight: 106 },
  urgencyOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  urgencyOption: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  urgencySelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  urgencyText: { color: colors.text, fontWeight: '700' },
  urgencyTextSelected: { color: colors.onPrimary },
  inputError: { borderColor: colors.danger },
  error: { color: colors.dangerText, marginTop: spacing.xs },
  errorSummary: { color: colors.dangerText, fontWeight: '700', marginTop: spacing.lg },
  button: { backgroundColor: colors.primary, borderRadius: radius.lg, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
});
