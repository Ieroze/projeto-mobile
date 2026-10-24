import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ColorPalette, colors as lightColors, darkColors } from './colors';

export type AppTheme = 'light' | 'dark';
type ThemeContextValue = { theme: AppTheme; setTheme: (theme: AppTheme) => void; colors: ColorPalette };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<AppTheme>('light');
  const value = useMemo(() => ({ theme, setTheme, colors: theme === 'dark' ? darkColors : lightColors }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider não encontrado');
  return value;
}

export function useColors() { return useAppTheme().colors; }

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(createStyles: (colors: ColorPalette) => T) {
  const colors = useColors();
  return useMemo(() => StyleSheet.create(createStyles(colors)), [colors, createStyles]);
}
