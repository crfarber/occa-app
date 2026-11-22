import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  groupScansByCategory,
  listingSummary,
  primaryPhotoUri,
  scanSectionMessageKey,
  type ScannedItem,
} from '@/domeinen/capture';
import { useScans } from '@/domeinen/capture/ui';
import { Button } from '@/shared/ui/button';
import { stickySectionHeaderStyle, useHeaderInset } from '@/shared/ui/glass-header';
import { Screen } from '@/shared/ui/screen';
import { hasFloatingHeader, systemAdjustsHeaderInset } from '@/shared/ui/stack-header';
import { TAB_BAR_CLEARANCE } from '@/shared/ui/tab-bar-inset';
import { colors, radius, size, spacingX, spacingY, type } from '@/shared/ui/theme';

/** Start a scan, then review what was found in this session. */
export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useScans();
  const sections = useMemo(() => groupScansByCategory(items), [items]);
  const headerInset = useHeaderInset();
  // iOS floating headers also add the home-indicator inset to the list itself.
  const listBottomPad =
    TAB_BAR_CLEARANCE + (systemAdjustsHeaderInset ? 0 : insets.bottom) + spacingY.lg;
  const start = (
    <View style={styles.start}>
      <Text style={styles.startTitle}>{t('home.start.title')}</Text>
      <Text style={styles.startBody}>{t('home.start.body')}</Text>
      <Button label={t('home.start.action')} onPress={() => router.navigate('/scan')} />
    </View>
  );

  return (
    <Screen scroll={false} safeAreaBottom={false} contentStyle={styles.content}>
      {hasFloatingHeader ? null : start}
      <SectionList
        style={styles.list}
        contentInsetAdjustmentBehavior={systemAdjustsHeaderInset ? 'automatic' : 'never'}
        ListHeaderComponent={hasFloatingHeader ? start : null}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, stickySectionHeaderStyle(headerInset, spacingY.lg)]}>
            {t(scanSectionMessageKey(section.key))}
          </Text>
        )}
        renderItem={({ item }) => (
          <ScannedItemRow
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('home.empty')}</Text>}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerInset, paddingBottom: listBottomPad },
        ]}
        stickySectionHeadersEnabled
      />
    </Screen>
  );
}

function ScannedItemRow({ item, onPress }: { item: ScannedItem; onPress: () => void }) {
  const { t } = useTranslation();
  const labels = item.result.labels;
  const finding =
    labels.length === 0
      ? t('capture.noLabels')
      : labels
          .slice(0, 3)
          .map((label) =>
            t('capture.labelRow', {
              text: label.text,
              score: Math.round(label.confidence * 100),
            }),
          )
          .join('\n');
  const summary = listingSummary(item.listing);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={summary ?? t('home.complete')}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Image
        source={{ uri: primaryPhotoUri(item.photos) ?? '' }}
        style={styles.photo}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.rowText}>
        <Text style={styles.finding}>{finding}</Text>
        <Text style={summary === null ? styles.complete : styles.score}>
          {summary ?? t('home.complete')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  start: {
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.md,
    gap: spacingY.sm,
    backgroundColor: colors.background,
  },
  startTitle: { ...type.header, color: colors.text },
  startBody: { ...type.body, color: colors.textMuted },
  list: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: spacingY.lg },
  section: {
    ...type.small,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacingX.md,
    paddingTop: spacingY.lg,
    paddingBottom: spacingY.sm,
    backgroundColor: colors.surface,
  },
  empty: {
    ...type.body,
    color: colors.textMuted,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.md,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.sm,
    backgroundColor: colors.background,
  },
  rowPressed: { opacity: 0.7 },
  photo: {
    width: size.thumbnail,
    height: size.thumbnail,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  rowText: { flex: 1, gap: spacingY.xs },
  finding: { ...type.body, color: colors.text },
  score: { ...type.small, color: colors.textMuted },
  complete: { ...type.small, color: colors.action },
});
