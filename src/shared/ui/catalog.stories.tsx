import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { fn } from 'storybook/test';
import { Button } from './button';
import { Pill } from './pill';
import { RadioButton } from './radio-button';
import { color, fontFamily, space, spaceX, text } from './remi-tokens';
import { Screen } from './screen';
import { SegmentedControl } from './segmented-control';
import { TextField } from './text-field';
import { Toggle } from './toggle';

const meta = {
  title: 'UI/Catalog',
  parameters: {
    docs: {
      description: {
        component:
          'Samenstelling van de gedeelde UI, op telefoonformaat. Dit is de look-and-feel om over te nemen, via de tokens.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const handoff = [
  { id: 'pickup', label: 'Ophalen' },
  { id: 'dropoff', label: 'Brengen' },
] as const;

type Handoff = (typeof handoff)[number]['id'];

function CatalogScreen() {
  const [title, setTitle] = useState('Linnen blouse');
  const [mode, setMode] = useState<Handoff>('pickup');
  const [visible, setVisible] = useState(true);

  return (
    <View
      style={{
        height: 720,
        width: 390,
        overflow: 'hidden',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: color.line,
      }}
    >
      <Screen footer={<Button label="Publiceren" onPress={fn()} variant="primary" />}>
        <Text style={{ ...text.title, fontFamily: fontFamily.sansRN[500], color: color.ink }}>
          Item
        </Text>
        <View style={{ flexDirection: 'row', gap: spaceX[2] }}>
          <Pill label="Concept" tone="brand" />
          <Pill label="Bevestigd" tone="success" />
        </View>
        <TextField label="Titel" onChangeText={setTitle} value={title} />
        <SegmentedControl onChange={setMode} options={handoff} value={mode} />
        <View style={{ gap: space[2] }}>
          <RadioButton
            label="Ophalen in de winkel"
            onPress={() => setMode('pickup')}
            selected={mode === 'pickup'}
          />
          <RadioButton
            label="Langsbrengen"
            onPress={() => setMode('dropoff')}
            selected={mode === 'dropoff'}
          />
        </View>
        <Toggle label="Zichtbaar in de winkel" onValueChange={setVisible} value={visible} />
      </Screen>
    </View>
  );
}

export const ItemForm: Story = {
  render: () => <CatalogScreen />,
};
