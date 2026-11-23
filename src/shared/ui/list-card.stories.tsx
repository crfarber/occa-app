import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import { ListCard } from './list-card';
import { Pill } from './pill';
import { space } from './remi-tokens';

const meta = {
  title: 'UI/ListCard',
  component: ListCard,
  args: {
    title: 'Adidas blauwe trui',
    subtitle: 'M · € 12,50 · A1',
    onPress: fn(),
  },
} satisfies Meta<typeof ListCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <View style={{ paddingVertical: space[4], backgroundColor: '#F3F0F5' }}>
      <ListCard {...args} accessory={<Pill label="Concept" tone="brand" />} />
    </View>
  ),
};
