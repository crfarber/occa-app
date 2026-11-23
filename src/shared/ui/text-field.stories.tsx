import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { TextField } from './text-field';
import { space } from './remi-tokens';

const meta = {
  title: 'UI/TextField',
  component: TextField,
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Field({ label, error, initial }: { label: string; error?: string; initial: string }) {
  const [value, setValue] = useState(initial);
  return <TextField error={error} label={label} onChangeText={setValue} value={value} />;
}

export const Default: Story = {
  render: () => (
    <View style={{ maxWidth: 360, gap: space[4] }}>
      <Field initial="Linnen blouse" label="Titel" />
      <Field error="Vul een titel in" initial="" label="Titel" />
    </View>
  ),
};
