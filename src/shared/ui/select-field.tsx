import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from './bottom-sheet';
import { RadioButton } from './radio-button';
import { colors, radius, size, spacingX, spacingY, type } from './theme';

export type SelectOption = {
  value: string;
  label: string;
  group?: string;
  groupLabel?: string;
};

type SelectFieldProps = {
  label: string;
  value: string | null;
  options: readonly SelectOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Allow clearing the selection. */
  clearable?: boolean;
  searchable?: boolean;
};

/**
 * Looks like a TextField; opens a bottom sheet with radio choices.
 * Options may carry `group` / `groupLabel` for section headers (categories).
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  clearable = false,
  searchable = true,
}: SelectFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = options.find((option) => option.value === value)?.label ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; options: SelectOption[] }>();
    for (const option of filtered) {
      const key = option.group ?? '';
      const existing = map.get(key);
      if (existing !== undefined) {
        existing.options.push(option);
      } else {
        map.set(key, { label: option.groupLabel ?? key, options: [option] });
      }
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.input,
          disabled && styles.inputDisabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text
          style={[styles.value, selectedLabel === null && styles.placeholder]}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder ?? label}
        </Text>
      </Pressable>

      <BottomSheet
        visible={open}
        title={label}
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
        height="80%"
      >
        {searchable ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('common.search')}
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            autoCorrect={false}
            autoCapitalize="none"
          />
        ) : null}
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
          {clearable ? (
            <RadioButton
              selected={value === null}
              label={t('common.none')}
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              style={styles.option}
            />
          ) : null}
          {groups.map(([groupKey, group]) => (
            <View key={groupKey === '' ? '_all' : groupKey}>
              {group.label !== '' ? <Text style={styles.group}>{group.label}</Text> : null}
              {group.options.map((option) => (
                <RadioButton
                  key={option.value}
                  selected={value === option.value}
                  label={option.label}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={styles.option}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacingY.xs },
  label: { ...type.label, color: colors.text },
  input: {
    minHeight: size.touchMin,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacingX.md,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  inputDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  value: { ...type.body, color: colors.text },
  placeholder: { color: colors.textMuted },
  search: {
    minHeight: size.control,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacingX.md,
    marginBottom: spacingY.sm,
    ...type.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  list: { maxHeight: 420 },
  group: {
    ...type.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacingY.md,
    marginBottom: spacingY.xs,
  },
  option: { paddingVertical: spacingY.sm },
});
