import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { fn } from 'storybook/test';
import { IconButton } from './icon-button';
import { color, fontFamily, spaceX, text } from './remi-tokens';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  args: {
    accessibilityLabel: 'Sluiten',
    onPress: fn(),
    icon: (
      <Text style={{ ...text.heading, fontFamily: fontFamily.sansRN[500], color: color.ink }}>
        ×
      </Text>
    ),
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', gap: spaceX[3] }}>
      <IconButton {...args} />
      <IconButton {...args} transparent />
      <IconButton {...args} disabled />
    </View>
  ),
};
