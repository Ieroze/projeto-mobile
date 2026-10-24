import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../components/AppText';
import { ColorPalette, radius, spacing, typography, useColors, useThemedStyles } from '../../theme';
import { MedicationAttachment } from '../../types/medication';
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_SIZE } from './validation';

interface Props {
  attachments: MedicationAttachment[];
  error?: string;
  onChange: (attachments: MedicationAttachment[]) => void;
}

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

function isSupportedFile(file: MedicationAttachment) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(file.mimeType ?? '') || ['pdf', 'jpg', 'jpeg', 'png'].includes(extension ?? '');
}

function formatSize(size?: number) {
  if (size === undefined) return '';
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPicker({ attachments, error, onChange }: Props) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [picking, setPicking] = useState(false);
  const [pickerError, setPickerError] = useState('');

  async function pickFiles() {
    if (picking) return;
    setPicking(true);
    setPickerError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple: true,
        copyToCacheDirectory: false,
      });
      if (result.canceled) return;

      const selected = result.assets.map(({ uri, name, size, mimeType }) => ({ uri, name, size, mimeType }));
      const next = [...attachments, ...selected.filter((file) => !attachments.some((current) => current.uri === file.uri))];
      if (next.length > MAX_ATTACHMENTS) {
        setPickerError(`Selecione no máximo ${MAX_ATTACHMENTS} arquivos.`);
      } else if (selected.some((file) => !isSupportedFile(file))) {
        setPickerError('Use apenas arquivos PDF, JPG ou PNG.');
      } else if (selected.some((file) => file.size !== undefined && file.size > MAX_ATTACHMENT_SIZE)) {
        setPickerError('Cada arquivo deve ter no máximo 10 MB.');
      } else {
        onChange(next);
      }
    } catch {
      setPickerError('Não foi possível abrir os arquivos. Tente novamente.');
    } finally {
      setPicking(false);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Requisição ou receita médica (opcional)</Text>
      <Text style={styles.helper}>Se tiver, anexe até 3 arquivos PDF, JPG ou PNG, com no máximo 10 MB cada.</Text>
      <Pressable style={styles.pickButton} onPress={pickFiles} disabled={picking || attachments.length >= MAX_ATTACHMENTS} accessibilityRole="button" accessibilityState={{ disabled: picking || attachments.length >= MAX_ATTACHMENTS }}>
        {picking ? <ActivityIndicator color={colors.primaryDark} /> : <Ionicons name="cloud-upload-outline" size={23} color={colors.primaryDark} />}
        <Text style={styles.pickText}>{attachments.length > 0 ? 'Adicionar outro arquivo' : 'Selecionar arquivo'}</Text>
      </Pressable>
      {attachments.map((file) => (
        <View key={file.uri} style={styles.fileRow}>
          <Ionicons name="document-text-outline" size={21} color={colors.primaryDark} />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            {file.size !== undefined ? <Text style={styles.fileSize}>{formatSize(file.size)}</Text> : null}
          </View>
          <Pressable onPress={() => { onChange(attachments.filter((item) => item.uri !== file.uri)); setPickerError(''); }} accessibilityRole="button" accessibilityLabel={`Remover ${file.name}`} hitSlop={10}>
            <Ionicons name="close-circle-outline" size={23} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      {error || pickerError ? <Text style={styles.error} accessibilityRole="alert">{pickerError || error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  section: { marginTop: spacing.sm },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  helper: { color: colors.textMuted, lineHeight: 20, fontSize: typography.caption, marginBottom: spacing.md },
  pickButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, padding: spacing.md },
  pickText: { color: colors.primaryDark, fontWeight: '800' },
  fileRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  fileInfo: { flex: 1 },
  fileName: { color: colors.text, fontWeight: '700' },
  fileSize: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  error: { color: colors.dangerText, marginTop: spacing.sm },
});
