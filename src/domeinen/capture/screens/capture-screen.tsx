import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/ui/button';
import { choose } from '@/shared/ui/confirm';
import { Screen } from '@/shared/ui/screen';
import { colors, radius, spacing, type } from '@/shared/ui/theme';
import { AlignPhoto } from '../components/align-photo';
import { FrameOverlay } from '../components/frame-overlay';
import { SelectRow } from '../components/select-row';
import {
  applyPixelColor,
  COLOR_OPTIONS,
  formDraftFromLabels,
  listingFromForm,
  PRODUCT_CATEGORIES,
  SUBTYPE_OPTIONS,
  type ResultFormDraft,
} from '../domain/draft-from-labels';
import {
  frameRectInViewport,
  mapViewRectToImageCrop,
  type ImageCropRect,
  type Size,
} from '../domain/frame-crop';
import {
  interpretLabels,
  PATTERNS,
  type InterpretLabelsResult,
  type Pattern,
  type ProductCategory,
} from '../domain/interpret-labels';
import { mergeInterpretResults } from '../domain/merge-interpret-results';
import {
  canAddPhoto,
  MAX_SCAN_PHOTOS,
  primaryPhotoUri,
  type PhotoRole,
  type ScanPhoto,
} from '../domain/scan-photos';
import { useImageClassifier, useImageColorSampler, useRecordScan } from '../hooks/capture-context';
import { cropImageToRect } from '../platform/rn/crop-image';

type CategoryMessageKey =
  | 'capture.category.top'
  | 'capture.category.broek'
  | 'capture.category.schoenen'
  | 'capture.category.tas'
  | 'capture.category.jas'
  | 'capture.category.rok'
  | 'capture.category.jurk'
  | 'capture.category.trui_vest';

const CATEGORY_KEYS: Record<ProductCategory, CategoryMessageKey> = {
  top: 'capture.category.top',
  broek: 'capture.category.broek',
  schoenen: 'capture.category.schoenen',
  tas: 'capture.category.tas',
  jas: 'capture.category.jas',
  rok: 'capture.category.rok',
  jurk: 'capture.category.jurk',
  trui_vest: 'capture.category.trui_vest',
};

type PatternMessageKey =
  | 'capture.pattern.gestreept'
  | 'capture.pattern.geruit'
  | 'capture.pattern.bloemen'
  | 'capture.pattern.print'
  | 'capture.pattern.dessin'
  | 'capture.pattern.effen'
  | 'capture.pattern.anders';

const PATTERN_KEYS: Record<Pattern, PatternMessageKey> = {
  gestreept: 'capture.pattern.gestreept',
  geruit: 'capture.pattern.geruit',
  bloemen: 'capture.pattern.bloemen',
  print: 'capture.pattern.print',
  dessin: 'capture.pattern.dessin',
  effen: 'capture.pattern.effen',
  anders: 'capture.pattern.anders',
};

/** Bottom action stack height used when laying out the camera frame. */
const CAMERA_ACTIONS_RESERVE = 140;

/**
 * Height of a transparent native stack header, including the status bar.
 * Mirrors the bar sizes React Navigation uses, so the hint starts under the title.
 */
function transparentHeaderHeight(
  topInset: number,
  window: { width: number; height: number },
): number {
  if (Platform.OS === 'ios') {
    if (Platform.isPad) {
      return topInset + 50;
    }
    return topInset + (window.width > window.height ? 32 : 44);
  }
  return topInset + 64;
}

/** White title over the camera preview. The opaque header uses the default title. */
function CameraHeaderTitle({ children }: { children: string }) {
  return (
    <Text numberOfLines={1} style={styles.cameraHeaderTitle}>
      {children}
    </Text>
  );
}

/**
 * Leaves the camera. The scan route is the root, so without history this opens home or login
 * on top; their own back button returns here.
 */
function CaptureBackButton({ shadowed }: { shadowed: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push('/home');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('capture.goHome')}
      onPress={leave}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
    >
      <Ionicons
        name={Platform.OS === 'android' ? 'arrow-back' : 'chevron-back'}
        size={28}
        color={colors.onBrand}
        style={shadowed ? styles.backIconShadow : undefined}
      />
    </Pressable>
  );
}

type CapturePhase =
  | { kind: 'camera' }
  | {
      kind: 'align';
      uri: string;
      imageSize: Size;
    }
  | { kind: 'classifying'; uri: string }
  | { kind: 'result'; result: InterpretLabelsResult }
  | {
      kind: 'error';
      uri: string | null;
      messageKey: 'capture.errors.classify' | 'capture.errors.capture' | 'capture.errors.crop';
    };

async function draftFromOverviewResults(
  overviewResults: InterpretLabelsResult[],
  latestOverviewUri: string | null,
  colorSampler: { sampleColorName(uri: string): Promise<string | null> },
): Promise<{ result: InterpretLabelsResult; draft: ResultFormDraft }> {
  const result = mergeInterpretResults(overviewResults);
  let draft = formDraftFromLabels(result);
  if (draft.color === '' && latestOverviewUri !== null) {
    const pixelColor = await colorSampler.sampleColorName(latestOverviewUri);
    draft = applyPixelColor(draft, pixelColor);
  }
  return { result, draft };
}

/** Local clothing recognition: take or pick photos, classify on-device, no backend call. */
export function CaptureScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const classifier = useImageClassifier();
  const colorSampler = useImageColorSampler();
  const recordScan = useRecordScan();
  const cameraRef = useRef<CameraView>(null);
  const alignCropRef = useRef<ImageCropRect | null>(null);
  const insets = useSafeAreaInsets();
  const viewport = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<CapturePhase>({ kind: 'camera' });
  const [form, setForm] = useState<ResultFormDraft | null>(null);
  const [photos, setPhotos] = useState<ScanPhoto[]>([]);
  const [overviewResults, setOverviewResults] = useState<InterpretLabelsResult[]>([]);
  const [pendingRole, setPendingRole] = useState<PhotoRole>('overview');
  const showingCamera = permission?.granted === true && phase.kind === 'camera';
  const showingAlign = phase.kind === 'align';

  const headerTop = transparentHeaderHeight(insets.top, viewport);
  const cameraFrame = useMemo(
    () =>
      frameRectInViewport(
        { width: viewport.width, height: viewport.height },
        {
          topReserve: headerTop + spacing.xl + 48,
          bottomReserve: insets.bottom + CAMERA_ACTIONS_RESERVE,
          horizontalInsetFraction: 0.12,
        },
      ),
    [viewport.width, viewport.height, headerTop, insets.bottom],
  );

  const alignFrame = useMemo(() => {
    const rect = frameRectInViewport(
      { width: viewport.width, height: viewport.height },
      {
        topReserve: headerTop + spacing.xl + 56,
        bottomReserve: insets.bottom + CAMERA_ACTIONS_RESERVE,
        horizontalInsetFraction: 0.08,
      },
    );
    return { width: rect.width, height: rect.height };
  }, [viewport.width, viewport.height, headerTop, insets.bottom]);

  const finishWithPhoto = useCallback(
    async (uri: string, role: PhotoRole) => {
      const nextPhotos = [...photos, { uri, role }];

      if (role === 'label') {
        setPhotos(nextPhotos);
        const result = mergeInterpretResults(overviewResults);
        if (form === null) {
          setForm(formDraftFromLabels(result));
        }
        setPhase({ kind: 'result', result });
        return;
      }

      setPhase({ kind: 'classifying', uri });
      try {
        const labels = await classifier.label(uri);
        const single = interpretLabels(labels);
        const nextOverview = [...overviewResults, single];
        const { result, draft } = await draftFromOverviewResults(nextOverview, uri, colorSampler);
        setPhotos(nextPhotos);
        setOverviewResults(nextOverview);
        setForm(draft);
        setPhase({ kind: 'result', result });
      } catch {
        setForm(null);
        setPhase({ kind: 'error', uri, messageKey: 'capture.errors.classify' });
      }
    },
    [classifier, colorSampler, form, overviewResults, photos],
  );

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri === undefined || photo.width === undefined || photo.height === undefined) {
        setPhase({
          kind: 'error',
          uri: null,
          messageKey: 'capture.errors.capture',
        });
        return;
      }

      const crop = mapViewRectToImageCrop(
        cameraFrame,
        { width: viewport.width, height: viewport.height },
        { width: photo.width, height: photo.height },
      );
      if (crop === null) {
        setPhase({
          kind: 'error',
          uri: photo.uri,
          messageKey: 'capture.errors.crop',
        });
        return;
      }

      try {
        const croppedUri = await cropImageToRect(photo.uri, crop);
        await finishWithPhoto(croppedUri, pendingRole);
      } catch {
        setPhase({
          kind: 'error',
          uri: photo.uri,
          messageKey: 'capture.errors.crop',
        });
      }
    } catch {
      setPhase({
        kind: 'error',
        uri: null,
        messageKey: 'capture.errors.capture',
      });
    }
  };

  const pickPhoto = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (picked.canceled || picked.assets[0] === undefined) {
      return;
    }
    const asset = picked.assets[0];
    const width = asset.width;
    const height = asset.height;
    if (width === undefined || height === undefined || width < 1 || height < 1) {
      setPhase({
        kind: 'error',
        uri: asset.uri,
        messageKey: 'capture.errors.crop',
      });
      return;
    }
    alignCropRef.current = null;
    setPhase({
      kind: 'align',
      uri: asset.uri,
      imageSize: { width, height },
    });
  };

  const confirmAlign = async () => {
    if (phase.kind !== 'align') {
      return;
    }
    const crop = alignCropRef.current;
    if (crop === null) {
      setPhase({
        kind: 'error',
        uri: phase.uri,
        messageKey: 'capture.errors.crop',
      });
      return;
    }
    try {
      const croppedUri = await cropImageToRect(phase.uri, crop);
      await finishWithPhoto(croppedUri, pendingRole);
    } catch {
      setPhase({
        kind: 'error',
        uri: phase.uri,
        messageKey: 'capture.errors.crop',
      });
    }
  };

  const reset = () => {
    setForm(null);
    setPhotos([]);
    setOverviewResults([]);
    setPendingRole('overview');
    alignCropRef.current = null;
    setPhase({ kind: 'camera' });
  };

  const startAddPhoto = async () => {
    if (!canAddPhoto(photos)) {
      return;
    }
    const selected = await choose({
      title: t('capture.photoRole.title'),
      options: [
        { id: 'overview', label: t('capture.photoRole.overview') },
        { id: 'label', label: t('capture.photoRole.label') },
      ],
    });
    if (selected !== 'overview' && selected !== 'label') {
      return;
    }
    setPendingRole(selected);
    setPhase({ kind: 'camera' });
  };

  const save = () => {
    if (phase.kind !== 'result' || form === null || photos.length === 0) {
      return;
    }
    recordScan({
      photos,
      result: phase.result,
      listing: listingFromForm(form),
    });
    router.push('/home');
  };

  const pickCategory = async () => {
    const selected = await choose({
      title: t('capture.draft.category'),
      options: [
        { id: '', label: t('capture.clearChoice'), style: 'cancel' },
        ...PRODUCT_CATEGORIES.map((id) => ({
          id,
          label: t(CATEGORY_KEYS[id]),
        })),
      ],
    });
    if (selected === null || form === null) {
      return;
    }
    setForm({ ...form, category: selected as ProductCategory | '' });
  };

  const pickColor = async () => {
    const selected = await choose({
      title: t('capture.draft.colors'),
      options: [
        { id: '', label: t('capture.clearChoice'), style: 'cancel' },
        ...COLOR_OPTIONS.map((id) => ({ id, label: id })),
      ],
    });
    if (selected === null || form === null) {
      return;
    }
    setForm({ ...form, color: selected });
  };

  const pickSubtype = async () => {
    const selected = await choose({
      title: t('capture.draft.subtype'),
      options: [
        { id: '', label: t('capture.clearChoice'), style: 'cancel' },
        ...SUBTYPE_OPTIONS.map((id) => ({ id, label: id })),
      ],
    });
    if (selected === null || form === null) {
      return;
    }
    setForm({ ...form, subcategory: selected });
  };

  const pickPattern = async () => {
    const selected = await choose({
      title: t('capture.draft.pattern'),
      options: [
        { id: '', label: t('capture.clearChoice'), style: 'cancel' },
        ...PATTERNS.map((id) => ({
          id,
          label: t(PATTERN_KEYS[id]),
        })),
      ],
    });
    if (selected === null || form === null) {
      return;
    }
    setForm({ ...form, pattern: selected as Pattern | '' });
  };

  const headerTransparent = showingCamera || showingAlign;
  const header = (
    <Stack.Screen
      options={{
        headerTransparent,
        headerShadowVisible: !headerTransparent,
        headerStyle: {
          backgroundColor: headerTransparent ? 'transparent' : colors.brand,
        },
        headerTitle: headerTransparent
          ? ({ children }) => <CameraHeaderTitle>{children}</CameraHeaderTitle>
          : t('capture.title'),
        headerLeft: () => <CaptureBackButton shadowed={headerTransparent} />,
      }}
    />
  );

  if (permission === null) {
    return (
      <>
        {header}
        <Screen>
          <Text style={styles.body}>{t('common.loading')}</Text>
        </Screen>
      </>
    );
  }

  if (!permission.granted && phase.kind === 'camera') {
    return (
      <>
        {header}
        <Screen
          footer={
            <>
              <Button
                label={t('capture.permission.allow')}
                onPress={() => void requestPermission()}
              />
              <Button
                label={t('capture.pickPhoto')}
                variant="secondary"
                onPress={() => void pickPhoto()}
              />
            </>
          }
        >
          <Text style={styles.body}>{t('capture.permission.denied')}</Text>
        </Screen>
      </>
    );
  }

  if (phase.kind === 'camera' && permission.granted) {
    const cameraHint = pendingRole === 'label' ? t('capture.photoRole.label') : t('capture.hint');
    return (
      <>
        {header}
        <View style={styles.fullscreen}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          <FrameOverlay frame={cameraFrame} label={t('capture.frameLabel')} />
          <SafeAreaView
            style={[
              styles.cameraOverlay,
              {
                paddingTop: headerTop + spacing.sm,
              },
            ]}
            edges={['bottom']}
          >
            <Text style={styles.cameraHint}>{cameraHint}</Text>
            <View style={styles.cameraActions}>
              <Button
                label={t('capture.takePhoto')}
                variant="light"
                onPress={() => void takePhoto()}
              />
              <Button
                label={t('capture.pickPhoto')}
                variant="light"
                onPress={() => void pickPhoto()}
              />
              {photos.length > 0 ? (
                <Button
                  label={t('capture.cancelAdd')}
                  variant="light"
                  onPress={() => {
                    const result = mergeInterpretResults(overviewResults);
                    setForm(formDraftFromLabels(result));
                    setPhase({ kind: 'result', result });
                  }}
                />
              ) : null}
            </View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  if (phase.kind === 'align') {
    return (
      <>
        {header}
        <View style={styles.fullscreen}>
          <SafeAreaView
            style={[styles.cameraOverlay, { paddingTop: headerTop + spacing.sm }]}
            edges={['bottom']}
          >
            <Text style={styles.cameraHint}>{t('capture.alignHint')}</Text>
            <View style={styles.alignStage}>
              <AlignPhoto
                uri={phase.uri}
                imageSize={phase.imageSize}
                frame={alignFrame}
                frameLabel={t('capture.frameLabel')}
                cropRef={alignCropRef}
              />
            </View>
            <View style={styles.cameraActions}>
              <Button
                label={t('capture.alignConfirm')}
                variant="light"
                onPress={() => void confirmAlign()}
              />
              <Button label={t('capture.again')} variant="light" onPress={reset} />
            </View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  const previewUri =
    phase.kind === 'classifying'
      ? phase.uri
      : phase.kind === 'error'
        ? phase.uri
        : primaryPhotoUri(photos);
  const busy = phase.kind === 'classifying';
  const canSave = phase.kind === 'result' && form !== null && photos.length > 0;

  return (
    <>
      {header}
      <Screen
        footer={
          <>
            {canSave ? <Button label={t('capture.save')} onPress={save} /> : null}
            {canSave && canAddPhoto(photos) ? (
              <Button
                label={t('capture.addPhoto')}
                variant="secondary"
                onPress={() => void startAddPhoto()}
              />
            ) : null}
            <Button
              label={t('capture.again')}
              variant={canSave ? 'secondary' : 'primary'}
              onPress={reset}
              disabled={busy}
            />
          </>
        }
      >
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.photo}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        {photos.length > 0 ? (
          <>
            <Text style={styles.section}>{t('capture.photos', { max: MAX_SCAN_PHOTOS })}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {photos.map((photo) => (
                <View key={`${photo.role}-${photo.uri}`} style={styles.thumbWrap}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.thumb}
                    accessibilityIgnoresInvertColors
                  />
                  <Text style={styles.thumbLabel}>
                    {photo.role === 'label'
                      ? t('capture.photoRole.label')
                      : t('capture.photoRole.overview')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}
        {busy ? <Text style={styles.body}>{t('capture.classifying')}</Text> : null}
        {phase.kind === 'error' ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {t(phase.messageKey)}
          </Text>
        ) : null}
        {phase.kind === 'result' && form !== null ? (
          <>
            <Text style={styles.section}>{t('capture.draft.title')}</Text>
            <View style={styles.form}>
              <SelectRow
                label={t('capture.draft.category')}
                value={form.category === '' ? '' : t(CATEGORY_KEYS[form.category])}
                placeholder={t('capture.choose')}
                onPress={() => void pickCategory()}
              />
              <SelectRow
                label={t('capture.draft.colors')}
                value={form.color}
                placeholder={t('capture.choose')}
                onPress={() => void pickColor()}
              />
              <SelectRow
                label={t('capture.draft.subtype')}
                value={form.subcategory}
                placeholder={t('capture.choose')}
                onPress={() => void pickSubtype()}
              />
              <SelectRow
                label={t('capture.draft.pattern')}
                value={form.pattern === '' ? '' : t(PATTERN_KEYS[form.pattern])}
                placeholder={t('capture.choose')}
                onPress={() => void pickPattern()}
              />
            </View>
            <Text style={styles.section}>{t('capture.rawLabels')}</Text>
            {phase.result.labels.length === 0 ? (
              <Text style={styles.body}>{t('capture.noLabels')}</Text>
            ) : (
              phase.result.labels.map((label) => (
                <Text key={`${label.text}-${label.confidence}`} style={styles.labelRow}>
                  {t('capture.labelRow', {
                    text: label.text,
                    score: Math.round(label.confidence * 100),
                  })}
                </Text>
              ))
            )}
          </>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: colors.inverseSurface,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  alignStage: {
    flex: 1,
    justifyContent: 'center',
  },
  cameraHeaderTitle: {
    ...type.label,
    color: colors.onInverseSurface,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backButtonPressed: { opacity: 0.6 },
  backIconShadow: {
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cameraHint: {
    ...type.body,
    color: colors.onInverseSurface,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cameraActions: {
    gap: spacing.sm,
  },
  body: { ...type.body, color: colors.textMuted },
  section: { ...type.label, color: colors.text, marginTop: spacing.sm },
  form: { gap: spacing.sm },
  labelRow: { ...type.body, color: colors.text },
  error: { ...type.body, color: colors.danger },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  thumbRow: {
    marginTop: spacing.xs,
  },
  thumbWrap: {
    marginRight: spacing.sm,
    width: 72,
  },
  thumb: {
    width: 72,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  thumbLabel: {
    ...type.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
