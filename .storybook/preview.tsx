import type { Preview } from '@storybook/react-native-web-vite';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import bold from '@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf';
import medium from '@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf';
import regular from '@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf';
import ionicons from '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf';
import { color } from '../src/shared/ui/remi-tokens';

function face(family: string, src: string, weight: number): string {
  return `@font-face { font-family: '${family}'; src: url('${src}') format('truetype'); font-weight: ${weight}; font-style: normal; font-display: swap; }`;
}

function installFonts(): void {
  if (typeof document === 'undefined' || document.getElementById('occa-storybook-fonts')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'occa-storybook-fonts';
  style.textContent = [
    face('PlusJakartaSans_400Regular', regular, 400),
    face('PlusJakartaSans_500Medium', medium, 500),
    face('PlusJakartaSans_700Bold', bold, 700),
    face('ionicons', ionicons, 400),
  ].join('\n');
  document.head.appendChild(style);
}

installFonts();

function Canvas({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <View style={{ backgroundColor: color.canvas, padding: 24 }}>{children}</View>
    </SafeAreaProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <Canvas>
        <Story />
      </Canvas>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
