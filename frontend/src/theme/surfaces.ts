import { ViewStyle } from 'react-native';

import { ColorPalette } from './colors';
import { radius } from './radius';

export const cardSurface = (colors: ColorPalette): ViewStyle => ({
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: '#000000',
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
});
