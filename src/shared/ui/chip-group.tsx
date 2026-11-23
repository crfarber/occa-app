import { StyleSheet, Text, View } from 'react-native';
import { Chip } from './chip';
import { colors, spacingX, spacingY, type } from './theme';

type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipGroupProps<T extends string> = {
  title: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  emptyLabel?: string;
};

/** Section title with a wrapping row of selectable chips. */
export function ChipGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
  emptyLabel,
}: ChipGroupProps<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.title}>{title}</Text>
      {options.length === 0 ? (
        emptyLabel !== undefined ? (
          <Text style={styles.empty}>{emptyLabel}</Text>
        ) : null
      ) : (
        <View style={styles.row}>
          {options.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={selected.includes(option.value)}
              onPress={() => onToggle(option.value)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacingY.sm },
  title: { ...type.header, color: colors.text },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacingX.sm,
    rowGap: spacingY.sm,
  },
  empty: { ...type.bodySm, color: colors.textMuted },
});
