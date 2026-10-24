import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, TextInputProps, TextProps } from 'react-native';

import { fontFamilyForWeight } from '../theme';

export const Text = forwardRef<NativeText, TextProps>(function AppText({ style, ...props }, ref) {
  const flattened = StyleSheet.flatten(style);
  return <NativeText ref={ref} style={[style, { fontFamily: flattened?.fontFamily ?? fontFamilyForWeight(flattened?.fontWeight), fontWeight: 'normal' }]} {...props} />;
});

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function AppTextInput({ style, ...props }, ref) {
  const flattened = StyleSheet.flatten(style);
  return <NativeTextInput ref={ref} style={[style, { fontFamily: flattened?.fontFamily ?? fontFamilyForWeight(flattened?.fontWeight), fontWeight: 'normal' }]} {...props} />;
});
