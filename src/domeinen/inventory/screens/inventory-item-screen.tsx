import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelectedStoreId } from '@/domeinen/shops/ui';
import { AlertBanner } from '@/shared/ui/alert-banner';
import { Button } from '@/shared/ui/button';
import { Pill } from '@/shared/ui/pill';
import { Screen } from '@/shared/ui/screen';
import { SelectField, type SelectOption } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { Toggle } from '@/shared/ui/toggle';
import { useFeedback } from '@/shared/ui/toast-host';
import { useFieldChain } from '@/shared/ui/use-field-chain';
import { colors, radius, spacingX, spacingY, type } from '@/shared/ui/theme';
import { ItemPatchError } from '../api/shop-item-detail';
import type { ShopItemStatus, ShopPhotoStatus } from '../api/shop-items';
import {
  photoStillProcessing,
  reviewPhotosOf,
  type ReviewPhotoKind,
} from '../domain/review-photos';
import {
  useInventoryItem,
  useItemOptions,
  useUpdateInventoryItem,
} from '../hooks/inventory-context';
import { useItemForm } from '../hooks/use-item-form';

type StatusLabelKey =
  | 'inventory.status.concept'
  | 'inventory.status.gepubliceerd'
  | 'inventory.status.aangevraagd'
  | 'inventory.status.bevestigd'
  | 'inventory.status.terughangen'
  | 'inventory.status.verkocht'
  | 'inventory.status.verwijderd';

const STATUS_LABEL = {
  concept: 'inventory.status.concept',
  gepubliceerd: 'inventory.status.gepubliceerd',
  aangevraagd: 'inventory.status.aangevraagd',
  bevestigd: 'inventory.status.bevestigd',
  terughangen: 'inventory.status.terughangen',
  verkocht: 'inventory.status.verkocht',
  verwijderd: 'inventory.status.verwijderd',
} as const satisfies Record<ShopItemStatus, StatusLabelKey>;

type PhotoStatusLabelKey =
  | 'inventory.photoStatus.wachtend'
  | 'inventory.photoStatus.bezig'
  | 'inventory.photoStatus.klaar'
  | 'inventory.photoStatus.mislukt';

const PHOTO_STATUS_LABEL = {
  wachtend: 'inventory.photoStatus.wachtend',
  bezig: 'inventory.photoStatus.bezig',
  klaar: 'inventory.photoStatus.klaar',
  mislukt: 'inventory.photoStatus.mislukt',
} as const satisfies Record<ShopPhotoStatus, PhotoStatusLabelKey>;

const REVIEW_LABEL = {
  background: 'inventoryItem.review.background',
  original: 'inventoryItem.review.original',
  cutout: 'inventoryItem.review.cutout',
} as const satisfies Record<ReviewPhotoKind, string>;

/** Detail + edit form for one stock item. */
export function InventoryItemScreen({ itemId }: { itemId: string }) {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const storeId = useSelectedStoreId();
  const detailQuery = useInventoryItem(storeId, itemId);
  const update = useUpdateInventoryItem(storeId, itemId);
  const { state, setField, beginSave, markSaved, markSaveFailed } = useItemForm(detailQuery.data);

  useFocusEffect(
    useCallback(() => {
      void detailQuery.refetch();
    }, [detailQuery.refetch]),
  );

  const form = state.form;
  const optionsQuery = useItemOptions(form?.category ?? null, form?.doelgroep ?? null);
  const chain = useFieldChain(5, {
    onSubmit: () => {
      void onSave();
    },
  });

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      (optionsQuery.data?.categories ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        group: option.group,
        groupLabel: option.groupLabel,
      })),
    [optionsQuery.data],
  );
  const colourOptions: SelectOption[] = useMemo(
    () =>
      (optionsQuery.data?.colours ?? []).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [optionsQuery.data],
  );
  const doelgroepOptions: SelectOption[] = useMemo(
    () =>
      (optionsQuery.data?.doelgroepen ?? []).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [optionsQuery.data],
  );
  const sizeOptions: SelectOption[] = useMemo(() => {
    const scales = optionsQuery.data?.sizes ?? [];
    const rows: SelectOption[] = [];
    for (const scale of scales) {
      for (const value of scale.values) {
        rows.push({ value, label: value, group: scale.scale, groupLabel: scale.title });
      }
    }
    return rows;
  }, [optionsQuery.data]);

  const onSave = async () => {
    if (detailQuery.data === undefined) return;
    const patch = beginSave(detailQuery.data);
    if (patch === null) return;
    if (Object.keys(patch).length === 0) {
      feedback.show({ tone: 'info', message: t('inventoryItem.noChanges') });
      return;
    }
    try {
      const saved = await update.mutateAsync(patch);
      markSaved(saved);
      feedback.show({ tone: 'success', message: t('inventoryItem.saved') });
    } catch (error) {
      if (error instanceof ItemPatchError) {
        markSaveFailed(error.key);
        if (error.code === 'changed_meanwhile') {
          void detailQuery.refetch();
        }
        return;
      }
      markSaveFailed('inventoryItem.errors.saveFailed');
    }
  };

  if (detailQuery.isPending || form === null) {
    return (
      <Screen>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  if (detailQuery.isError || detailQuery.data === undefined) {
    return (
      <Screen>
        <Text style={styles.error}>{t('inventoryItem.loadFailed')}</Text>
      </Screen>
    );
  }

  const detail = detailQuery.data;
  const editable = detail.editable;
  const priceLocked = detail.priceLocked;
  const review = reviewPhotosOf(detail.photos);
  const otherPhotos = [
    ...(review.length === 0 && detail.photos.main !== null ? [detail.photos.main] : []),
    ...detail.photos.extra,
    detail.photos.label,
  ].filter((url): url is string => url !== null);
  const hasPhotos = review.length > 0 || otherPhotos.length > 0;
  const photoStatus = detail.photoStatus ?? null;
  const processing = photoStillProcessing(photoStatus);

  return (
    <Screen
      footer={
        editable ? (
          <Button
            label={t('inventoryItem.save')}
            onPress={() => void onSave()}
            loading={update.isPending}
          />
        ) : undefined
      }
    >
      {!editable ? <AlertBanner message={t('inventoryItem.readOnly')} tone="warning" /> : null}
      {state.errorKey !== null ? <AlertBanner message={t(state.errorKey)} /> : null}
      {processing ? (
        <AlertBanner message={t('inventoryItem.review.processing')} tone="warning" />
      ) : null}

      {hasPhotos ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photos}>
          {review.map((photo) => (
            <View key={`${photo.kind}:${photo.uri}`} style={styles.reviewTile}>
              <Image
                source={{ uri: photo.uri }}
                style={styles.reviewPhoto}
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.reviewLabel}>{t(REVIEW_LABEL[photo.kind])}</Text>
            </View>
          ))}
          {otherPhotos.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={styles.photo}
              accessibilityIgnoresInvertColors
            />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.photo, styles.photoEmpty]} />
      )}

      <View style={styles.meta}>
        <Pill label={t(STATUS_LABEL[detail.status])} />
        {photoStatus !== null ? <Pill label={t(PHOTO_STATUS_LABEL[photoStatus])} /> : null}
        {detail.number !== null ? (
          <Text style={styles.metaText}>
            {t('inventoryItem.number', { number: detail.number })}
          </Text>
        ) : null}
      </View>

      <SelectField
        label={t('inventoryItem.category')}
        value={form.category}
        options={categoryOptions}
        onChange={(value) => setField('category', value)}
        disabled={!editable}
        clearable
      />
      <SelectField
        label={t('inventoryItem.doelgroep')}
        value={form.doelgroep}
        options={doelgroepOptions}
        onChange={(value) => setField('doelgroep', value)}
        disabled={!editable}
        clearable
      />
      <SelectField
        label={t('inventoryItem.colour')}
        value={form.colour}
        options={colourOptions}
        onChange={(value) => setField('colour', value)}
        disabled={!editable}
        clearable
      />
      <SelectField
        label={t('inventoryItem.size')}
        value={form.size}
        options={sizeOptions}
        onChange={(value) => setField('size', value)}
        disabled={!editable}
        clearable
      />

      <TextField
        {...chain.field(0)}
        label={t('inventoryItem.brand')}
        value={form.brand}
        onChangeText={(text) => setField('brand', text)}
        editable={editable}
        autoCapitalize="words"
      />
      <TextField
        {...chain.field(1)}
        label={t('inventoryItem.price')}
        value={form.priceText}
        onChangeText={(text) => setField('priceText', text)}
        editable={editable && !priceLocked}
        keyboardType="decimal-pad"
      />
      {priceLocked ? <Text style={styles.hint}>{t('inventoryItem.priceLocked')}</Text> : null}
      <TextField
        {...chain.field(2)}
        label={t('inventoryItem.location')}
        value={form.location}
        onChangeText={(text) => setField('location', text)}
        editable={editable}
      />
      <TextField
        {...chain.field(3)}
        label={t('inventoryItem.typeKeywords')}
        value={form.typeKeywordsText}
        onChangeText={(text) => setField('typeKeywordsText', text)}
        editable={editable}
      />
      <TextField
        {...chain.field(4, { multiline: true })}
        label={t('inventoryItem.description')}
        value={form.description}
        onChangeText={(text) => setField('description', text)}
        editable={editable}
        multiline
        autoCapitalize="sentences"
      />
      <Toggle
        label={t('inventoryItem.sport')}
        value={form.sport}
        onValueChange={(next) => setField('sport', next)}
        disabled={!editable}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photos: { marginHorizontal: -spacingX.screen },
  reviewTile: {
    marginRight: spacingX.sm,
    rowGap: spacingY.xs,
  },
  reviewPhoto: {
    width: 160,
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  photo: {
    width: 160,
    height: 200,
    borderRadius: radius.md,
    marginRight: spacingX.sm,
    backgroundColor: colors.border,
  },
  photoEmpty: { width: '100%', height: 160, marginRight: 0 },
  reviewLabel: { ...type.small, color: colors.textMuted },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacingX.sm,
    rowGap: spacingY.sm,
    flexWrap: 'wrap',
  },
  metaText: { ...type.small, color: colors.textMuted },
  hint: { ...type.small, color: colors.textMuted },
  error: { ...type.body, color: colors.danger },
});
