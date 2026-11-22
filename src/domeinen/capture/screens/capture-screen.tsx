import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { Flash, FlashOff, MediaImage, NavArrowLeft } from 'iconoir-react-native';
import { useMemo, useRef } from 'react';
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
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { colors, radius, shadowRN, size, spacingX, spacingY, type } from '@/shared/ui/theme';
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
} from '../domain/frame-crop';
import { categoryMessageKey } from '../domain/category-labels';
import {
  interpretLabels,
  PATTERNS,
  type InterpretLabelsResult,
  type Pattern,
  type ProductCategory,
} from '../domain/interpret-labels';
import { mergeInterpretResults } from '../domain/merge-interpret-results';
import { canSubmitCaptureDraft, MAX_CLOTHING_PHOTOS } from '../domain/capture-draft';
import { primaryPhotoUri, type PhotoRole } from '../domain/scan-photos';
import { useSelectedStoreId } from '@/domeinen/shops/ui';
import { useSubmission } from '@/domeinen/submission/ui';
import { useStatusOverlay } from '@/shared/ui/status-overlay-host';
import {
  useCaptureDraft,
  useImageClassifier,
  useImageColorSampler,
  useRecordScan,
  useScanStoreActions,
  useTextRecognizer,
} from '../hooks/capture-context';
import { useCaptureUi } from '../hooks/use-capture-ui';
import { cropImageToRect } from '../platform/rn/crop-image';

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
const CAMERA_ACTIONS_RESERVE = 248;

const THUMB_WIDTH = 60;
const THUMB_HEIGHT = 80;

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

/**
 * Leaves the camera. The scan route is the root, so without history this opens home or login
 * on top; their own back button returns here.
 */
function CaptureBackButton() {
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
    <IconButton
      accessibilityLabel={t('capture.goHome')}
      onPress={leave}
      transparent={true}
      icon={<NavArrowLeft width={24} height={24} color={colors.text} strokeWidth={1.75} />}
    />
  );
}

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
  const textRecognizer = useTextRecognizer();
  const recordScan = useRecordScan();
  const submission = useSubmission();
  const statusOverlay = useStatusOverlay();
  const storeId = useSelectedStoreId();
  const draft = useCaptureDraft();
  const scanActions = useScanStoreActions();
  const cameraRef = useRef<CameraView>(null);
  const alignCropRef = useRef<ImageCropRect | null>(null);
  const insets = useSafeAreaInsets();
  const viewport = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const {
    state: ui,
    showCamera,
    showAlign,
    showRecognizing,
    showClassifying,
    showResult,
    showError,
    toggleFlash,
    setCaptureMode,
    setFormField,
    resetUi,
  } = useCaptureUi();
  const { phase, flash, form, captureMode } = ui;
  const showingCamera =
    permission?.granted === true && (phase.kind === 'camera' || phase.kind === 'recognizing');
  const showingAlign = phase.kind === 'align';

  const headerTop = transparentHeaderHeight(insets.top, viewport);
  const cameraFrame = useMemo(
    () =>
      frameRectInViewport(
        { width: viewport.width, height: viewport.height },
        {
          topReserve: headerTop + spacingY.xl + 48,
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
        topReserve: headerTop + spacingY.xl + 56,
        bottomReserve: insets.bottom + CAMERA_ACTIONS_RESERVE,
        horizontalInsetFraction: 0.08,
      },
    );
    return { width: rect.width, height: rect.height };
  }, [viewport.width, viewport.height, headerTop, insets.bottom]);

  const finishWithPhoto = async (uri: string, role: PhotoRole) => {
    if (role === 'overview') {
      scanActions.addDraftPhoto({ uri, role });
      showCamera();
      return;
    }

    showRecognizing(uri);
    try {
      const recognized = await textRecognizer.recognize(uri);
      scanActions.setDraftLabel(uri, recognized.text);
      showCamera();
    } catch {
      showError(uri, 'capture.errors.recognize');
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri === undefined || photo.width === undefined || photo.height === undefined) {
        showError(null, 'capture.errors.capture');
        return;
      }

      const crop = mapViewRectToImageCrop(
        cameraFrame,
        { width: viewport.width, height: viewport.height },
        { width: photo.width, height: photo.height },
      );
      if (crop === null) {
        showError(photo.uri, 'capture.errors.crop');
        return;
      }

      try {
        const croppedUri = await cropImageToRect(photo.uri, crop);
        await finishWithPhoto(croppedUri, captureMode === 'textLabel' ? 'label' : 'overview');
      } catch {
        showError(photo.uri, 'capture.errors.crop');
      }
    } catch {
      showError(null, 'capture.errors.capture');
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
      showError(asset.uri, 'capture.errors.crop');
      return;
    }
    alignCropRef.current = null;
    showAlign(asset.uri, { width, height });
  };

  const confirmAlign = async () => {
    if (phase.kind !== 'align') {
      return;
    }
    const crop = alignCropRef.current;
    if (crop === null) {
      showError(phase.uri, 'capture.errors.crop');
      return;
    }
    try {
      const croppedUri = await cropImageToRect(phase.uri, crop);
      await finishWithPhoto(croppedUri, captureMode === 'textLabel' ? 'label' : 'overview');
    } catch {
      showError(phase.uri, 'capture.errors.crop');
    }
  };

  const reset = () => {
    scanActions.clearDraft();
    alignCropRef.current = null;
    resetUi();
  };

  const submit = async () => {
    if (!canSubmitCaptureDraft(draft)) {
      return;
    }
    const overviewUris = draft.photos
      .filter((photo) => photo.role === 'overview')
      .map((photo) => photo.uri);
    showClassifying(overviewUris[0] ?? '');
    try {
      const results: InterpretLabelsResult[] = [];
      for (const uri of overviewUris) {
        results.push(interpretLabels(await classifier.label(uri)));
      }
      const latestOverviewUri = overviewUris[overviewUris.length - 1] ?? null;
      const next = await draftFromOverviewResults(results, latestOverviewUri, colorSampler);
      showResult(next.result, next.draft);
    } catch {
      showError(overviewUris[0] ?? null, 'capture.errors.classify', true);
    }
  };

  const save = () => {
    if (phase.kind !== 'result' || form === null || draft.photos.length === 0) {
      return;
    }
    if (storeId === null) {
      void statusOverlay.run(t('capture.saving'), async () => ({
        tone: 'error',
        message: t('capture.errors.noStore'),
      }));
      return;
    }
    const listing = listingFromForm(form);
    const scanned = recordScan({
      photos: draft.photos,
      labelText: draft.labelText,
      result: phase.result,
      listing,
    });
    void statusOverlay.run(t('capture.saving'), async () => {
      await submission.enqueue({
        storeId,
        clientKey: `scan-${scanned.id}`,
        photos: scanned.photos,
        result: scanned.result,
        listing: scanned.listing,
      });
      return { tone: 'queued', message: t('capture.queued') };
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
          label: t(categoryMessageKey(id)),
        })),
      ],
    });
    if (selected === null || form === null) {
      return;
    }
    setFormField('category', selected as ProductCategory | '');
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
    setFormField('color', selected);
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
    setFormField('subcategory', selected);
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
    setFormField('pattern', selected as Pattern | '');
  };

  const headerTransparent = showingCamera || showingAlign;
  const header = (
    <Stack.Screen
      options={{
        headerTransparent,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: headerTransparent ? 'transparent' : colors.brand,
        },
        headerLeft: () => <CaptureBackButton />,
        headerRight: () =>
          showingCamera ? (
            <IconButton
              accessibilityLabel={flash === 'on' ? t('capture.flash.off') : t('capture.flash.on')}
              onPress={toggleFlash}
              transparent={true}
              icon={
                flash === 'on' ? (
                  <Flash width={24} height={24} color={colors.text} strokeWidth={1.75} />
                ) : (
                  <FlashOff width={24} height={24} color={colors.text} strokeWidth={1.75} />
                )
              }
            />
          ) : null,
      }}
    />
  );

  if (permission === null) {
    return (
      <>
        {header}
        <Screen floatingHeader={false}>
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
          floatingHeader={false}
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

  if ((phase.kind === 'camera' || phase.kind === 'recognizing') && permission.granted) {
    const cameraHint =
      captureMode === 'textLabel' ? t('capture.photoRole.label') : t('capture.hint');
    const clothingCount = draft.photos.filter((photo) => photo.role === 'overview').length;
    const canTakeAnother = captureMode === 'textLabel' || clothingCount < MAX_CLOTHING_PHOTOS;
    const recognizing = phase.kind === 'recognizing';
    return (
      <>
        {header}
        <View style={styles.fullscreen}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" flash={flash} />
          <FrameOverlay frame={cameraFrame} label={t('capture.frameLabel')} />
          <SafeAreaView
            style={[
              styles.cameraOverlay,
              {
                paddingTop: headerTop + spacingY.sm,
              },
            ]}
            edges={['bottom']}
          >
            <Text style={styles.cameraHint}>
              {recognizing ? t('capture.recognizingLabel') : cameraHint}
            </Text>
            <View style={styles.cameraControls}>
              <SegmentedControl
                options={[
                  { id: 'clothing', label: t('capture.modes.clothing') },
                  { id: 'textLabel', label: t('capture.modes.textLabel') },
                ]}
                value={captureMode}
                onChange={setCaptureMode}
              />
              <View style={styles.cameraActions}>
                <View style={styles.cameraActionSlot}>
                  <IconButton
                    accessibilityLabel={t('capture.pickPhoto')}
                    disabled={!canTakeAnother || recognizing}
                    onPress={() => void pickPhoto()}
                    icon={
                      <MediaImage width={24} height={24} color={colors.text} strokeWidth={1.75} />
                    }
                  />
                </View>
                <View style={styles.cameraActionSlot}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('capture.takePhoto')}
                    onPress={() => void takePhoto()}
                    disabled={!canTakeAnother || recognizing}
                    style={({ pressed }) => [
                      styles.shutter,
                      pressed && styles.shutterPressed,
                      (!canTakeAnother || recognizing) && styles.shutterDisabled,
                    ]}
                  >
                    <View style={styles.shutterInner} />
                  </Pressable>
                </View>
                <View style={styles.cameraActionSlot}>
                  <Text style={styles.photoCount}>
                    {t('capture.photoCount', {
                      count: clothingCount,
                      max: MAX_CLOTHING_PHOTOS,
                    })}
                  </Text>
                </View>
              </View>
              <Button
                label={t('capture.continue')}
                onPress={() => void submit()}
                disabled={!canSubmitCaptureDraft(draft) || recognizing}
              />
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
            style={[styles.cameraOverlay, { paddingTop: headerTop + spacingY.sm }]}
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
        : primaryPhotoUri(draft.photos);
  const busy = phase.kind === 'classifying';
  const canSave = phase.kind === 'result' && form !== null && draft.photos.length > 0;

  return (
    <>
      {header}
      <Screen
        floatingHeader={false}
        footer={
          <>
            {canSave ? <Button label={t('capture.save')} onPress={save} /> : null}
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
        {draft.photos.length > 0 ? (
          <>
            <Text style={styles.section}>
              {t('capture.photos', { max: MAX_CLOTHING_PHOTOS + 1 })}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {draft.photos.map((photo) => (
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
            <Text style={styles.section}>{t('capture.summary.title')}</Text>
            <Text style={styles.body}>{t('capture.summary.label')}</Text>
            <Text style={styles.recognizedText}>{draft.labelText}</Text>
            <Text style={styles.section}>{t('capture.draft.title')}</Text>
            <View style={styles.form}>
              <SelectRow
                label={t('capture.draft.category')}
                value={form.category === '' ? '' : t(categoryMessageKey(form.category))}
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
    paddingHorizontal: spacingX.lg,
    paddingBottom: spacingY.md,
  },
  alignStage: {
    flex: 1,
    justifyContent: 'center',
  },
  cameraHint: {
    ...type.body,
    color: colors.onInverseSurface,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cameraControls: {
    gap: spacingY.md,
  },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    paddingHorizontal: spacingX.lg,
  },
  cameraActionSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: size.shutter,
    height: size.shutter,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    ...shadowRN.raised,
  },
  shutterPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  shutterDisabled: { opacity: 0.45 },
  shutterInner: {
    width: size.shutterInner,
    height: size.shutterInner,
    borderRadius: radius.xxl,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoCount: {
    ...type.small,
    color: colors.onInverseSurface,
    textAlign: 'center',
  },
  recognizedText: {
    ...type.body,
    color: colors.text,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.md,
    borderRadius: radius.md,
    backgroundColor: colors.inputFill,
  },
  body: { ...type.body, color: colors.textMuted },
  section: { ...type.label, color: colors.text, marginTop: spacingY.sm },
  form: { gap: spacingY.sm },
  labelRow: { ...type.body, color: colors.text },
  error: { ...type.body, color: colors.danger },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  thumbRow: {
    marginTop: spacingY.xs,
  },
  thumbWrap: {
    marginRight: spacingX.sm,
    width: THUMB_WIDTH,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  thumbLabel: {
    ...type.small,
    color: colors.textMuted,
    marginTop: spacingY.xs,
  },
});
