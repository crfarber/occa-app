import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ShopItemFilters } from '../api/shop-items';
import type { InventoryFilter } from '../domain/inventory-filter';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { ChipGroup } from '@/shared/ui/chip-group';
import { InlineSelectField } from '@/shared/ui/inline-select-field';
import { colors, spacingX, spacingY, type } from '@/shared/ui/theme';

type FilterSheetProps = {
  visible: boolean;
  draft: InventoryFilter;
  facets: ShopItemFilters | undefined;
  loading: boolean;
  failed: boolean;
  onClose: () => void;
  onToggleSize: (value: string) => void;
  onSelectColour: (value: string | null) => void;
  onToggleCategory: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
};

/** Presentational filter sheet: chips and colour select driven by the browse reducer. */
export function FilterSheet({
  visible,
  draft,
  facets,
  loading,
  failed,
  onClose,
  onToggleSize,
  onSelectColour,
  onToggleCategory,
  onClear,
  onApply,
}: FilterSheetProps) {
  const { t } = useTranslation();

  const sizeOptions = mergeSelectedOptions(facets?.sizes ?? [], draft.sizes);
  const colourOptions = facets?.colours ?? [];
  const categoryOptions = mergeSelectedOptions(facets?.categories ?? [], draft.categories);

  return (
    <BottomSheet
      visible={visible}
      title={t('inventory.filters.title')}
      closeLabel={t('inventory.filters.close')}
      onClose={onClose}
      showHandle
      closeIcon
      height="80%"
      footer={
        <View style={styles.footer}>
          <Button
            label={t('inventory.filters.clear')}
            variant="secondary"
            onPress={onClear}
            style={styles.footerButton}
          />
          <Button
            label={t('inventory.filters.apply')}
            onPress={onApply}
            style={styles.footerButton}
          />
        </View>
      }
    >
      {loading ? <ActivityIndicator color={colors.brand} style={styles.center} /> : null}
      {failed ? <Text style={styles.error}>{t('inventory.filters.loadFailed')}</Text> : null}
      {!loading && !failed ? (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <ChipGroup
            title={t('inventory.filters.size')}
            options={sizeOptions}
            selected={draft.sizes}
            onToggle={onToggleSize}
            emptyLabel={t('inventory.filters.none')}
          />
          <InlineSelectField
            label={t('inventory.filters.colour')}
            value={draft.colour}
            options={colourOptions}
            placeholder={t('inventory.filters.allColours')}
            allLabel={t('inventory.filters.allColours')}
            onSelect={onSelectColour}
          />
          <ChipGroup
            title={t('inventory.filters.category')}
            options={categoryOptions}
            selected={draft.categories}
            onToggle={onToggleCategory}
            emptyLabel={t('inventory.filters.none')}
          />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

function mergeSelectedOptions(
  options: readonly { value: string; label: string }[],
  selected: readonly string[],
): { value: string; label: string }[] {
  const known = new Map(options.map((option) => [option.value, option.label]));
  const merged = options.map((option) => ({ value: option.value, label: option.label }));
  for (const value of selected) {
    if (!known.has(value)) {
      merged.push({ value, label: value });
    }
  }
  return merged;
}

const styles = StyleSheet.create({
  body: { gap: spacingY.lg, paddingBottom: spacingY.md },
  footer: { flexDirection: 'row', gap: spacingX.sm },
  footerButton: { flex: 1 },
  center: { marginVertical: spacingY.lg },
  error: { ...type.body, color: colors.danger, paddingVertical: spacingY.md },
});
