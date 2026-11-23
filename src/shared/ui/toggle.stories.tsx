import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Toggle } from './toggle';
import { space } from './remi-tokens';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

function Switch({ label, initial }: { label: string; initial: boolean }) {
  const [value, setValue] = useState(initial);
  return <Toggle label={label} onValueChange={setValue} value={value} />;
}

export const Default: Story = {
  args: {
    value: true,
    onValueChange: () => undefined,
    label: 'Zichtbaar in de winkel',
  },
  render: () => (
    <View style={{ gap: space[3], maxWidth: 360 }}>
      <Switch initial label="Zichtbaar in de winkel" />
      <Switch initial={false} label="Melding bij ophalen" />
      <Toggle disabled label="Niet beschikbaar" onValueChange={() => undefined} value={false} />
    </View>
  ),
};
