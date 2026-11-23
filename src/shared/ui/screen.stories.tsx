import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { fn } from 'storybook/test';
import { Button } from './button';
import { color, fontFamily, text } from './remi-tokens';
import { Screen } from './screen';

const meta = {
  title: 'UI/Screen',
  component: Screen,
} satisfies Meta<typeof Screen>;

export default meta;

type Story = StoryObj<typeof meta>;

function Phone({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        height: 640,
        width: 390,
        overflow: 'hidden',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: color.line,
        backgroundColor: color.canvas,
      }}
    >
      {children}
    </View>
  );
}

export const WithFooter: Story = {
  args: { children: null },
  render: () => (
    <Phone>
      <Screen footer={<Button label="Doorgaan" onPress={fn()} />}>
        <Text style={{ ...text.title, fontFamily: fontFamily.sansRN[500], color: color.ink }}>
          Nieuw item
        </Text>
        <Text style={{ ...text.body, fontFamily: fontFamily.sansRN[400], color: color.inkMuted }}>
          Controleer de gegevens voordat je het item publiceert.
        </Text>
      </Screen>
    </Phone>
  ),
};
