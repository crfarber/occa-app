import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { color, fontFamily, space, spaceX, text } from './remi-tokens';

const meta = {
  title: 'UI/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Bron van kleur, maat en typografie. Een Next.js-project neemt deze waarden over en bouwt eigen componenten. De React Native-componenten zelf niet.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const flatColors = Object.fromEntries(
  Object.entries(color).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
);

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={{ width: 150 }}>
      <View
        style={{
          height: 56,
          borderRadius: 8,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: color.line,
        }}
      />
      <Text
        style={{
          marginTop: space[2],
          ...text.caption,
          fontFamily: fontFamily.sansRN[500],
          color: color.ink,
        }}
      >
        {name}
      </Text>
      <Text style={{ ...text.caption, fontFamily: fontFamily.sansRN[400], color: color.inkMuted }}>
        {value}
      </Text>
    </View>
  );
}

function SwatchRow({ group }: { group: Record<string, string> }) {
  return (
    <View
      style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spaceX[3], rowGap: space[3] }}
    >
      {Object.entries(group).map(([name, value]) => (
        <Swatch key={name} name={name} value={value} />
      ))}
    </View>
  );
}

export const Colors: Story = {
  render: () => (
    <View style={{ gap: space[6] }}>
      <SwatchRow group={flatColors} />
      <SwatchRow group={color.accent} />
      {(Object.keys(color.status) as (keyof typeof color.status)[]).map((status) => (
        <View key={status} style={{ gap: space[2] }}>
          <Text
            style={{ ...text.label, fontFamily: fontFamily.sansRN[500], color: color.inkMuted }}
          >
            {status}
          </Text>
          <SwatchRow group={color.status[status]} />
        </View>
      ))}
    </View>
  ),
};

const fontForWeight = {
  400: fontFamily.sansRN[400],
  500: fontFamily.sansRN[500],
  700: fontFamily.sansRN[700],
} as const;

export const Type: Story = {
  render: () => (
    <View
      style={{
        gap: space[4],
        backgroundColor: color.surface,
        paddingHorizontal: spaceX[4],
        paddingVertical: space[5],
        borderRadius: 16,
      }}
    >
      {(Object.keys(text) as (keyof typeof text)[]).map((name) => {
        const style = text[name];
        return (
          <Text
            key={name}
            style={{
              ...style,
              fontFamily: fontForWeight[style.fontWeight],
              color: color.ink,
            }}
          >
            {name} — De snelle bruine vos
          </Text>
        );
      })}
    </View>
  ),
};

const captionStyle = { ...text.caption, fontFamily: fontFamily.sansRN[500], color: color.ink };

function ScaleColumn({
  title,
  steps,
  axis,
}: {
  title: string;
  steps: Record<string, number>;
  axis: 'width' | 'height';
}) {
  return (
    <View style={{ gap: space[2] }}>
      <Text style={{ ...text.label, fontFamily: fontFamily.sansRN[500], color: color.inkMuted }}>
        {title}
      </Text>
      {Object.entries(steps).map(([name, value]) => (
        <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: spaceX[3] }}>
          <Text style={{ ...captionStyle, width: spaceX[10] }}>{`${name} · ${value}`}</Text>
          <View
            style={{
              backgroundColor: color.plum,
              borderRadius: 2,
              width: axis === 'width' ? value : spaceX[4],
              height: axis === 'height' ? value : space[1],
            }}
          />
        </View>
      ))}
    </View>
  );
}

/** ADR 0020: widths step by 5, heights are 2 or step by 4. */
export const Spacing: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: spaceX[10] }}>
      <ScaleColumn title="spaceX — breedte per 5" steps={spaceX} axis="width" />
      <ScaleColumn title="space — hoogte 2 of per 4" steps={space} axis="height" />
    </View>
  ),
};
