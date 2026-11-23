import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { fn } from 'storybook/test';
import { InlineSelectField } from './inline-select-field';
import { space, spaceX } from './remi-tokens';

const meta = {
  title: 'UI/InlineSelectField',
  component: InlineSelectField,
  args: {
    label: 'Kleur',
    value: null,
    placeholder: 'Alle kleuren',
    allLabel: 'Alle kleuren',
    options: [
      { value: 'zwart', label: 'Zwart' },
      { value: 'blauw', label: 'Blauw' },
      { value: 'rood', label: 'Rood' },
    ],
    onSelect: fn(),
  },
} satisfies Meta<typeof InlineSelectField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [value, setValue] = useState<string | null>(args.value);
    return (
      <View style={{ paddingHorizontal: spaceX[4], paddingVertical: space[4] }}>
        <InlineSelectField {...args} value={value} onSelect={setValue} />
      </View>
    );
  },
};
