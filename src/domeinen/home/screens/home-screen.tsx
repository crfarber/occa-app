import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import {
  groupScansByCategory,
  listingSummary,
  primaryPhotoUri,
  type ScanSectionKey,
  type ScannedItem,
} from '@/domeinen/capture';
import { useScans } from '@/domeinen/capture/ui';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { colors, radius, spacing, type } from '@/shared/ui/theme';

type SectionLabelKey =
  | 'capture.category.top'
  | 'capture.category.broek'
  | 'capture.category.schoenen'
  | 'capture.category.tas'
  | 'capture.category.jas'
  | 'capture.category.rok'
  | 'capture.category.jurk'
  | 'capture.category.trui_vest'
  | 'capture.category.unknown';

const SECTION_LABEL = {
  top: 'capture.category.top',
  broek: 'capture.category.broek',
  schoenen: 'capture.category.schoenen',
  tas: 'capture.category.tas',
  jas: 'capture.category.jas',
  rok: 'capture.category.rok',
  jurk: 'capture.category.jurk',
  trui_vest: 'capture.category.trui_vest',
  unknown: 'capture.category.unknown',
} as const satisfies Record<ScanSectionKey, SectionLabelKey>;

/** Start a scan, then review what was found in the single scans tab. */
export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const items = useScans();
  const sections = useMemo(() => groupScansByCategory(items), [items]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.start}>
        <Text style={styles.startTitle}>{t('home.start.title')}</Text>
        <Text style={styles.startBody}>{t('home.start.body')}</Text>
        <Button label={t('home.start.action')} onPress={() => router.navigate('/')} />
      </View>
      <View style={styles.tabBar} accessibilityRole="tablist">
        <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.tab}>
          <Text style={styles.tabLabel}>{t('home.tabs.scanned')}</Text>
          <View style={styles.tabIndicator} />
        </View>
      </View>
      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{t(SECTION_LABEL[section.key])}</Text>
        )}
        renderItem={({ item }) => (
          <ScannedItemRow
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('home.empty')}</Text>}
        contentContainerStyle={styles.listContent}
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
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  startTitle: { ...type.header, color: colors.text },
  startBody: { ...type.body, color: colors.textMuted },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tabLabel: { ...type.label, color: colors.brand },
  tabIndicator: {
    height: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
  },
  list: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: spacing.lg },
  section: {
    ...type.small,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  empty: {
    ...type.body,
    color: colors.textMuted,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  rowPressed: { opacity: 0.7 },
  photo: {
    width: spacing.xl * 3,
    height: spacing.xl * 3,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  rowText: { flex: 1, gap: spacing.xs },
  finding: { ...type.body, color: colors.text },
  score: { ...type.small, color: colors.textMuted },
  complete: { ...type.small, color: colors.action },
});
