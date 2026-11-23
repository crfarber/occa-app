import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';
import { mergeConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      modulesToTranspile: ['react-native-reanimated', 'react-native-worklets'],
      pluginReactOptions: {
        babel: {
          plugins: ['react-native-reanimated/plugin'],
        },
      },
    },
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          'react-native-keyboard-controller': path.resolve(
            rootDir,
            'shims/react-native-keyboard-controller.tsx',
          ),
        },
      },
    });
  },
} satisfies StorybookConfig;

export default config;
