import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Chip } from './chip';
import { ChipGroup } from './chip-group';
import { space, spaceX } from './remi-tokens';

const meta = {
  title: 'UI/Chip',
  component: Chip,
  args: {
    label: 'Medium',
    selected: false,
    onPress: () => undefined,
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Group: Story = {
  render: function GroupStory() {
    const [selected, setSelected] = useState<string[]>(['M']);
    return (
      <View style={{ paddingHorizontal: spaceX[4], paddingVertical: space[4] }}>
        <ChipGroup
          title="Maat"
          options={[
            { value: 'XS', label: 'Extra Small' },
            { value: 'S', label: 'Small' },
            { value: 'M', label: 'Medium' },
            { value: 'L', label: 'Large' },
            { value: 'XL', label: 'Extra Large' },
          ]}
          selected={selected}
          onToggle={(value) => {
            setSelected((current) =>
              current.includes(value)
                ? current.filter((entry) => entry !== value)
                : [...current, value],
            );
          }}
          emptyLabel="Geen opties"
        />
      </View>
    );
  },
};
