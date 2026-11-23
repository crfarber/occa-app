import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Pill, pillTones, type PillTone } from './pill';
import { space, spaceX } from './remi-tokens';

const tones = Object.keys(pillTones) as PillTone[];

const meta = {
  title: 'UI/Pill',
  component: Pill,
  args: {
    label: 'Bevestigd',
  },
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Tones: Story = {
  render: () => (
    <View
      style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spaceX[2], rowGap: space[2] }}
    >
      {tones.map((tone) => (
        <Pill key={tone} label={tone} tone={tone} />
      ))}
    </View>
  ),
};
