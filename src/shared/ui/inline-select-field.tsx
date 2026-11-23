import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RadioButton } from './radio-button';
import { colors, radius, size, spacingX, spacingY, type } from './theme';

type SelectOption = {
  value: string;
  label: string;
};

type InlineSelectFieldProps = {
  label: string;
  value: string | null;
  options: readonly SelectOption[];
  placeholder: string;
  allLabel: string;
  onSelect: (value: string | null) => void;
};

/**
 * Pill dropdown that unfolds its options inline (no nested modal). Open/closed
 * is a single boolean, so it stays as local useState. Prefer `SelectField` when
 * a full bottom sheet is fine.
 */
export function InlineSelectField({
  label,
  value,
  options,
  placeholder,
  allLabel,
  onSelect,
}: InlineSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    value === null ? allLabel : (options.find((option) => option.value === value)?.label ?? value);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}: ${selectedLabel}`}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={[styles.value, value === null && styles.placeholder]} numberOfLines={1}>
          {value === null ? placeholder : selectedLabel}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>
      {open ? (
        <View style={styles.options}>
          <RadioButton
            label={allLabel}
            selected={value === null}
            onPress={() => {
              onSelect(null);
              setOpen(false);
            }}
          />
          {options.map((option) => (
            <RadioButton
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacingY.sm },
  label: { ...type.header, color: colors.text },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.sm,
    minHeight: size.touchMin,
    paddingHorizontal: spacingX.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  value: { ...type.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  options: { gap: spacingY.xs },
});
