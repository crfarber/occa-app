import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import { Button } from './button';
import { space } from './remi-tokens';

const variants = ['primary', 'secondary', 'action', 'danger', 'light', 'ghost', 'text'] as const;

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    label: 'Opslaan',
    onPress: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: (args) => (
    <View style={{ gap: space[3], maxWidth: 360 }}>
      {variants.map((variant) => (
        <Button key={variant} {...args} label={variant} variant={variant} />
      ))}
    </View>
  ),
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
