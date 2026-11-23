import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { RadioButton } from './radio-button';
import { space } from './remi-tokens';

const options = ['Ophalen', 'Langsbrengen', 'Versturen'] as const;

const meta = {
  title: 'UI/RadioButton',
  component: RadioButton,
} satisfies Meta<typeof RadioButton>;

export default meta;

type Story = StoryObj<typeof meta>;

function Group() {
  const [selected, setSelected] = useState<(typeof options)[number]>('Ophalen');
  return (
    <View style={{ gap: space[2] }}>
      {options.map((option) => (
        <RadioButton
          key={option}
          label={option}
          onPress={() => setSelected(option)}
          selected={selected === option}
        />
      ))}
    </View>
  );
}

export const Default: Story = {
  args: { selected: true, label: 'Ophalen' },
  render: () => <Group />,
};
