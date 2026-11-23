import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SegmentedControl } from './segmented-control';

const options = [
  { id: 'open', label: 'Open' },
  { id: 'done', label: 'Klaar' },
] as const;

type SegmentId = (typeof options)[number]['id'];

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo() {
  const [value, setValue] = useState<SegmentId>('open');
  return (
    <ViewWidth>
      <SegmentedControl onChange={setValue} options={options} value={value} />
    </ViewWidth>
  );
}

function ViewWidth({ children }: { children: ReactNode }) {
  return <View style={{ width: 360 }}>{children}</View>;
}

export const Default: Story = {
  args: {
    options: [...options],
    value: 'open',
    onChange: () => undefined,
  },
  render: () => <Demo />,
};
