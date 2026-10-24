import { Pressable, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '../../components/AppText';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { AdoptionStatus, CareStatus, CatDraft, Sex } from '../../types/cat';

interface Props {
  draft: CatDraft;
  traitsText: string;
  onChange: (patch: Partial<CatDraft>) => void;
  onTraitsChange: (value: string) => void;
}

const adoptionOptions: Array<{ value: AdoptionStatus; label: string }> = [
  { value: 'available', label: 'Disponível' },
  { value: 'in_process', label: 'Em processo' },
  { value: 'adopted', label: 'Adotado' },
  { value: 'not_available', label: 'Indisponível' },
];
const careOptions: Array<{ value: CareStatus; label: string }> = [
  { value: 'healthy', label: 'Saudável' },
  { value: 'treatment', label: 'Em tratamento' },
  { value: 'temporary_home', label: 'Lar temporário' },
];
const sexOptions: Array<{ value: Sex; label: string }> = [
  { value: 'female', label: 'Fêmea' },
  { value: 'male', label: 'Macho' },
];

export function AdminCatFields({ draft, traitsText, onChange, onTraitsChange }: Props) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  return (
    <View>
      <Field label="Nome *" value={draft.name} onChangeText={(name) => onChange({ name })} maxLength={100} styles={styles} colors={colors} />
      <Field label="Idade exibida *" value={draft.ageLabel} onChangeText={(ageLabel) => onChange({ ageLabel })} placeholder="Ex.: 2 anos" styles={styles} colors={colors} />
      <ChoiceGroup label="Sexo" options={sexOptions} value={draft.sex} onSelect={(sex) => onChange({ sex })} styles={styles} />
      <Field label="Descrição curta *" value={draft.shortDescription} onChangeText={(shortDescription) => onChange({ shortDescription })} maxLength={280} multiline styles={styles} colors={colors} />
      <Field label="História do gato *" value={draft.description} onChangeText={(description) => onChange({ description })} multiline styles={styles} colors={colors} />
      <Field label="Características (separadas por vírgula)" value={traitsText} onChangeText={onTraitsChange} placeholder="Ex.: Carinhoso, Brincalhão" styles={styles} colors={colors} />
      <ChoiceGroup label="Situação de adoção" options={adoptionOptions} value={draft.adoptionStatus} onSelect={(adoptionStatus) => onChange({ adoptionStatus })} styles={styles} />
      <ChoiceGroup label="Situação de cuidado" options={careOptions} value={draft.careStatus} onSelect={(careStatus) => onChange({ careStatus })} styles={styles} />
      <ChoiceGroup label="Castrado" options={[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }]} value={draft.castrated} onSelect={(castrated) => onChange({ castrated })} styles={styles} />
      <ChoiceGroup label="Vacinado" options={[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }]} value={draft.vaccinated} onSelect={(vaccinated) => onChange({ vaccinated })} styles={styles} />
      <ChoiceGroup label="FIV/FeLV negativo" options={[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }, { value: undefined, label: 'Não informado' }]} value={draft.fivFelvNegative} onSelect={(fivFelvNegative) => onChange({ fivFelvNegative })} styles={styles} />
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, maxLength, multiline, styles, colors }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; maxLength?: number; multiline?: boolean;
  styles: ReturnType<typeof createStyles>; colors: ColorPalette;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.multiline]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textSubtle} maxLength={maxLength} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} accessibilityLabel={label} />
    </View>
  );
}

function ChoiceGroup<T extends string | boolean | undefined>({ label, options, value, onSelect, styles }: {
  label: string; options: Array<{ value: T; label: string }>; value: T; onSelect: (value: T) => void; styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => (
          <Pressable key={option.label} style={[styles.choice, value === option.value && styles.choiceSelected]} onPress={() => onSelect(option.value)} accessibilityRole="radio" accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{ selected: value === option.value }}>
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: { color: colors.text, fontSize: typography.body, fontWeight: '700', marginBottom: spacing.sm },
  input: { minHeight: 48, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  multiline: { minHeight: 94 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
  choiceTextSelected: { color: colors.primaryDark },
});
