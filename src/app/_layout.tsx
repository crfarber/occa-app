import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { createNativeContainer } from '@/bootstrap/native';
import { AppProviders } from '@/bootstrap/providers';
import { LoginScreen, useSession } from '@/domeinen/auth/ui';
import { KeyboardToolbarProvider } from '@/shared/ui/keyboard-toolbar-context';
import { KeyboardToolbarHost } from '@/shared/ui/keyboard-toolbar-host';
import { SplashScreenView } from '@/shared/ui/splash-screen';
import { StatusOverlayHost } from '@/shared/ui/status-overlay-host';
import { colors } from '@/shared/ui/theme';
import { ToastHost } from '@/shared/ui/toast-host';

void SplashScreen.preventAutoHideAsync();

/** After sign-in, open Home — not the camera (`(scan)` used to own `/` via its index). */
export const unstable_settings = {
  initialRouteName: '(app)',
};

// Built once, when the app loads. A wrong configuration fails here, with a readable message.
const container = createNativeContainer();

// Screens must stay opaque: a transparent screen shows the previous one during the push animation.
const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.canvas },
};

/**
 * Splash while fonts/session load; login when signed out; Home (app) when signed in.
 */
function Navigator({ fontsReady }: { fontsReady: boolean }) {
  const status = useSession((state) => state.status);

  useEffect(() => {
    if (status !== 'unknown' && fontsReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, status]);

  if (!fontsReady || status === 'unknown') {
    // Hide the native splash once this view is laid out, so there is no blank frame while the
    // session is still being restored.
    return (
      <SplashScreenView
        onLayout={() => {
          void SplashScreen.hideAsync();
        }}
      />
    );
  }

  if (status === 'signed-out') {
    return <LoginScreen />;
  }

  return (
    <Stack initialRouteName="(app)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(scan)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    void container.start();
    return () => container.stop();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <StatusBar style="dark" />
        <AppProviders container={container}>
          <KeyboardToolbarProvider>
            <ThemeProvider value={navigationTheme}>
              <Navigator fontsReady={fontsReady} />
            </ThemeProvider>
            <ToastHost />
            <StatusOverlayHost />
            <KeyboardToolbarHost />
          </KeyboardToolbarProvider>
        </AppProviders>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
