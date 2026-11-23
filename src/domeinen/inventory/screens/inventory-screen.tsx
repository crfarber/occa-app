import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveSelectedStoreId } from '@/domeinen/shops';
import { useMyStores, useSelectStore, useSelectedStoreId } from '@/domeinen/shops/ui';
import { IconButton } from '@/shared/ui/icon-button';
import { useSuppressKeyboardToolbar } from '@/shared/ui/keyboard-toolbar-context';
import { ListCard } from '@/shared/ui/list-card';
import { Pill } from '@/shared/ui/pill';
import { PillField } from '@/shared/ui/pill-field';
import { stickySectionHeaderStyle, useHeaderInset } from '@/shared/ui/glass-header';
import { Screen } from '@/shared/ui/screen';
import { systemAdjustsHeaderInset } from '@/shared/ui/stack-header';
import { TAB_BAR_CLEARANCE } from '@/shared/ui/tab-bar-inset';
import { colors, spacingX, spacingY, type } from '@/shared/ui/theme';
import type { ShopItem, ShopItemStatus, ShopPhotoStatus } from '../api/shop-items';
import { FilterSheet } from '../components/filter-sheet';
import { activeFilterCount } from '../domain/inventory-filter';
import { inventoryListRow } from '../domain/inventory-list-row';
import { groupInventoryByCategory } from '../domain/inventory-sections';
import { dedupeInventoryById } from '../domain/inventory-window';
import { useInventoryFilters, useInventoryItems } from '../hooks/inventory-context';
import { useInventoryBrowse } from '../hooks/use-inventory-browse';

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

function statusTone(status: ShopItemStatus): 'brand' | 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'concept':
      return 'brand';
    case 'gepubliceerd':
      return 'success';
    case 'aangevraagd':
    case 'bevestigd':
    case 'terughangen':
      return 'warning';
    default:
      return 'neutral';
  }
}

function useToolbarIcon(name: keyof typeof Ionicons.glyphMap): ImageSourcePropType | undefined {
  const [source, setSource] = useState<ImageSourcePropType | undefined>(undefined);
  useEffect(() => {
    if (Platform.OS === 'ios') return;
    let cancelled = false;
    void Ionicons.getImageSource(name, 24, colors.text).then((image) => {
      if (!cancelled && image !== null) setSource(image);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);
  return source;
}

/** Shop inventory (Inboedel) for the selected branch. */
export function InventoryScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const storeId = useSelectedStoreId();
  const selectStore = useSelectStore();
  const storesQuery = useMyStores();
  const browse = useInventoryBrowse();
  const itemsQuery = useInventoryItems(storeId, browse.debouncedSearch, browse.state.applied);
  const sheetOpen = browse.state.sheet.phase === 'editing';
  const filtersQuery = useInventoryFilters(storeId, i18n.language, sheetOpen);
  const filterIcon = useToolbarIcon('options-outline');
  const suppressToolbar = useSuppressKeyboardToolbar();
  const [searchHeight, setSearchHeight] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const closeSearch = () => {
    browse.setSearch('');
    searchInputRef.current?.blur();
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (!storesQuery.isSuccess) return;
    const next = resolveSelectedStoreId(storeId, storesQuery.data.stores);
    if (next !== null && next !== storeId) {
      void selectStore(next);
    }
  }, [storeId, storesQuery.isSuccess, storesQuery.data, selectStore]);

  useFocusEffect(
    useCallback(() => {
      if (storeId === null) return;
      void itemsQuery.refetch();
    }, [storeId, itemsQuery.refetch]),
  );

  const hasActiveQuery =
    browse.debouncedSearch.trim() !== '' || activeFilterCount(browse.state.applied) > 0;
  const draft =
    browse.state.sheet.phase === 'editing' ? browse.state.sheet.draft : browse.state.applied;

  const items = useMemo(() => {
    const pages = itemsQuery.data?.pages ?? [];
    const flat: ShopItem[] = [];
    for (const page of pages) {
      for (const item of page.items ?? []) {
        flat.push(item);
      }
    }
    return dedupeInventoryById(flat);
  }, [itemsQuery.data?.pages]);

  const sections = useMemo(
    () => groupInventoryByCategory(items, t('inventory.uncategorized')),
    [items, t],
  );

  const hasMore = itemsQuery.hasNextPage === true;

  const revealMore = useCallback(() => {
    if (!itemsQuery.hasNextPage || itemsQuery.isFetchingNextPage) return;
    void itemsQuery.fetchNextPage();
  }, [itemsQuery.hasNextPage, itemsQuery.isFetchingNextPage, itemsQuery.fetchNextPage]);

  const headerInset = useHeaderInset();
  const tabClearance = TAB_BAR_CLEARANCE + insets.bottom;
  // iOS floating headers also add the home-indicator inset to the list itself.
  const listBottomPad =
    searchHeight + tabClearance - (systemAdjustsHeaderInset ? insets.bottom : 0) + spacingY.md;

  return (
    <Screen scroll={false} safeAreaBottom={false} contentStyle={styles.content}>
      <Stack.Screen options={{ title: t('inventory.title') }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'line.3.horizontal.decrease' : filterIcon}
          accessibilityLabel={t('inventory.filters.open')}
          onPress={browse.openSheet}
        >
          {browse.activeCount > 0 ? (
            <Stack.Toolbar.Badge>{String(browse.activeCount)}</Stack.Toolbar.Badge>
          ) : null}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <SectionList
        style={styles.list}
        contentInsetAdjustmentBehavior={systemAdjustsHeaderInset ? 'automatic' : 'never'}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        onEndReached={hasMore ? revealMore : undefined}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            {itemsQuery.isPending ? (
              <ActivityIndicator color={colors.brand} style={styles.center} />
            ) : null}
            {itemsQuery.isError ? (
              <Text style={styles.error}>{t('inventory.loadFailed')}</Text>
            ) : null}
          </>
        }
        ListFooterComponent={
          hasMore || itemsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={colors.brand} style={styles.footer} />
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: spacingY.xs + headerInset, paddingBottom: listBottomPad },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={itemsQuery.isRefetching && !itemsQuery.isPending && !itemsQuery.isFetchingNextPage}
            onRefresh={() => {
              void itemsQuery.refetch();
            }}
            tintColor={colors.brand}
            progressViewOffset={headerInset}
          />
        }
        ListEmptyComponent={
          itemsQuery.isSuccess ? (
            <Text style={styles.empty}>
              {t(hasActiveQuery ? 'inventory.noResults' : 'inventory.empty')}
            </Text>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, stickySectionHeaderStyle(headerInset, spacingY.md)]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <InventoryRow item={item} />}
      />

      <KeyboardStickyView offset={{ closed: -tabClearance, opened: 0 }} style={styles.searchSticky}>
        <View
          style={styles.searchHost}
          onLayout={(event) => setSearchHeight(event.nativeEvent.layout.height)}
        >
          <PillField
            inputRef={searchInputRef}
            value={browse.state.search}
            onChangeText={browse.setSearch}
            placeholder={t('inventory.search.placeholder')}
            accessibilityLabel={t('inventory.search.placeholder')}
            returnKeyType="search"
            onFocus={() => {
              suppressToolbar.onFocus();
              setSearchFocused(true);
            }}
            onBlur={() => {
              suppressToolbar.onBlur();
              setSearchFocused(false);
            }}
            icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
            containerStyle={styles.searchField}
          />
          {searchFocused || browse.state.search !== '' ? (
            <IconButton
              accessibilityLabel={t('inventory.search.close')}
              onPress={closeSearch}
              icon={<Ionicons name="close" size={24} color={colors.text} />}
            />
          ) : null}
        </View>
      </KeyboardStickyView>

      <FilterSheet
        visible={sheetOpen}
        draft={draft}
        facets={filtersQuery.data}
        loading={filtersQuery.isPending}
        failed={filtersQuery.isError}
        onClose={browse.dismissSheet}
        onToggleSize={browse.toggleSize}
        onSelectColour={browse.selectColour}
        onToggleCategory={browse.toggleCategory}
        onClear={browse.clearDraft}
        onApply={browse.applyDraft}
      />
    </Screen>
  );
}

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

function photoStatusTone(status: ShopPhotoStatus): 'brand' | 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'klaar':
      return 'success';
    case 'mislukt':
      return 'warning';
    case 'bezig':
    case 'wachtend':
      return 'brand';
  }
}

const InventoryRow = memo(function InventoryRow({ item }: { item: ShopItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const row = inventoryListRow(item, t('inventory.untitled'), { includeCategory: false });
  const photoStatus = item.photoStatus ?? null;
  const showPhotoStatus =
    item.status === 'concept' && photoStatus !== null && photoStatus !== 'klaar';

  return (
    <ListCard
      title={row.title}
      subtitle={row.subtitle}
      imageUri={item.photoUrl}
      onPress={() => router.push(`/inventory/${item.id}`)}
      accessory={
        <Pill
          label={
            showPhotoStatus ? t(PHOTO_STATUS_LABEL[photoStatus]) : t(STATUS_LABEL[item.status])
          }
          tone={showPhotoStatus ? photoStatusTone(photoStatus) : statusTone(item.status)}
        />
      }
    />
  );
});

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  searchSticky: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  searchHost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.sm,
    paddingHorizontal: spacingX.screen,
    paddingTop: spacingY.sm,
    paddingBottom: spacingY.sm,
  },
  searchField: { flex: 1 },
  center: { marginTop: spacingY.lg },
  footer: { marginVertical: spacingY.md },
  error: {
    ...type.body,
    color: colors.danger,
    paddingHorizontal: spacingX.sm,
    paddingVertical: spacingY.md,
  },
  empty: {
    ...type.body,
    color: colors.textMuted,
    paddingHorizontal: spacingX.sm,
    paddingVertical: spacingY.md,
  },
  list: { flex: 1, alignSelf: 'stretch' },
  listContent: {
    flexGrow: 1,
    paddingTop: spacingY.xs,
    paddingHorizontal: spacingX.sm,
  },
  section: {
    ...type.header,
    color: colors.text,
    paddingTop: spacingY.md,
    paddingBottom: spacingY.sm,
    backgroundColor: colors.canvas,
    textTransform: 'capitalize',
  },
});
