import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AdminSessionProvider } from './src/features/admin/AdminSessionContext';
import { ThemeProvider, useAppTheme } from './src/theme';

function AppContent() {
  const { theme, colors } = useAppTheme();
  return (
    <NavigationContainer theme={{ dark: theme === 'dark', colors: { primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.danger }, fonts: { regular: { fontFamily: 'PlusJakartaSans-Regular', fontWeight: '400' }, medium: { fontFamily: 'PlusJakartaSans-Medium', fontWeight: '500' }, bold: { fontFamily: 'PlusJakartaSans-Bold', fontWeight: '700' }, heavy: { fontFamily: 'PlusJakartaSans-ExtraBold', fontWeight: '800' } } }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('./assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider><AdminSessionProvider><AppContent /></AdminSessionProvider></ThemeProvider>
    </SafeAreaProvider>
  );
}
