import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AlertBanner } from './alert-banner';
import { space } from './remi-tokens';

const meta = {
  title: 'UI/AlertBanner',
  component: AlertBanner,
  args: {
    message: 'Opslaan is mislukt. Probeer het opnieuw.',
  },
} satisfies Meta<typeof AlertBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Danger: Story = {};

export const Warning: Story = {
  args: {
    tone: 'warning',
    message: 'Dit item is nog niet zichtbaar in de winkel.',
  },
};

export const Both: Story = {
  render: () => (
    <View style={{ gap: space[3], maxWidth: 420 }}>
      <AlertBanner message="Opslaan is mislukt. Probeer het opnieuw." />
      <AlertBanner message="Dit item is nog niet zichtbaar in de winkel." tone="warning" />
    </View>
  ),
};
