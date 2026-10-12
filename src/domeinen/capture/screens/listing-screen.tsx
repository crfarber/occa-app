import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { colors, radius, spacing, type } from '@/shared/ui/theme';
import type { ListingField } from '../domain/listing';
import { primaryPhotoUri } from '../domain/scan-photos';
import { useScan, useUpdateListing } from '../hooks/capture-context';

type FieldLabelKey =
  | 'listing.brand'
  | 'listing.price'
  | 'listing.description'
  | 'listing.category'
  | 'listing.subcategory'
  | 'listing.color'
  | 'listing.audience'
  | 'listing.size'
  | 'listing.shopSpot'
  | 'listing.number';

const FIELDS: readonly {
  field: ListingField;
  label: FieldLabelKey;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}[] = [
  { field: 'brand', label: 'listing.brand', autoCapitalize: 'words' },
  { field: 'price', label: 'listing.price', autoCapitalize: 'none' },
  {
    field: 'description',
    label: 'listing.description',
    multiline: true,
    autoCapitalize: 'sentences',
  },
  { field: 'category', label: 'listing.category', autoCapitalize: 'sentences' },
  {
    field: 'subcategory',
    label: 'listing.subcategory',
    autoCapitalize: 'none',
  },
  { field: 'color', label: 'listing.color', autoCapitalize: 'none' },
  { field: 'audience', label: 'listing.audience', autoCapitalize: 'words' },
  { field: 'size', label: 'listing.size', autoCapitalize: 'characters' },
  { field: 'shopSpot', label: 'listing.shopSpot', autoCapitalize: 'none' },
  { field: 'number', label: 'listing.number', autoCapitalize: 'none' },
];

const CATEGORY_LABEL = {
  top: 'capture.category.top',
  broek: 'capture.category.broek',
  schoenen: 'capture.category.schoenen',
  tas: 'capture.category.tas',
  jas: 'capture.category.jas',
  rok: 'capture.category.rok',
  jurk: 'capture.category.jurk',
  trui_vest: 'capture.category.trui_vest',
} as const;

/** Website fields for one scan. The photo stays as context; these values are typed in. */
export function ListingScreen({ itemId }: { itemId: string }) {
  const { t } = useTranslation();
  const item = useScan(itemId);
  const updateListing = useUpdateListing();

  if (item === null) {
    return (
      <Screen>
        <Text style={styles.body}>{t('listing.missing')}</Text>
      </Screen>
    );
  }

  const category = item.result.category;

  return (
    <Screen>
      <Image
        source={{ uri: primaryPhotoUri(item.photos) ?? '' }}
        style={styles.photo}
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.body}>{t('listing.hint')}</Text>
      <Text style={styles.recognition}>
        {category.kind === 'known'
          ? t('listing.recognition', {
              category: t(CATEGORY_LABEL[category.category]),
              score: Math.round(category.score * 100),
            })
          : t('listing.recognitionUnknown')}
      </Text>
      <Text style={styles.section}>{t('listing.section')}</Text>
      <View style={styles.fields}>
        {FIELDS.map((field) => (
          <TextField
            key={field.field}
            label={t(field.label)}
            value={item.listing[field.field]}
            multiline={field.multiline}
            autoCapitalize={field.autoCapitalize}
            onChangeText={(text) => updateListing(item.id, { [field.field]: text })}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  body: { ...type.body, color: colors.textMuted },
  recognition: { ...type.label, color: colors.text },
  section: { ...type.label, color: colors.text, marginTop: spacing.sm },
  fields: { gap: spacing.md },
});
