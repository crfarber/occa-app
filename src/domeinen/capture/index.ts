/** The pure entry of capture. */
export {
  interpretLabels,
  PATTERNS,
  PRODUCT_CATEGORIES,
  UNCERTAIN_FIELDS,
  type CategoryGuess,
  type InterpretLabelsResult,
  type Pattern,
  type PatternGuess,
  type ProductCategory,
  type RawLabel,
  type UncertainField,
} from './domain/interpret-labels';
export {
  groupScansByCategory,
  SCAN_SECTION_ORDER,
  type GroupableScan,
  type ScanSection,
  type ScanSectionKey,
} from './domain/group-scans';
export { averageRgbFromRgba, nearestColorName, type Rgb } from './domain/color-from-rgb';
export {
  applyPixelColor,
  COLOR_OPTIONS,
  formDraftFromLabels,
  listingFromForm,
  listingFromLabels,
  SUBTYPE_OPTIONS,
  type ResultFormDraft,
} from './domain/draft-from-labels';
export { mergeInterpretResults } from './domain/merge-interpret-results';
export {
  canAddPhoto,
  MAX_SCAN_PHOTOS,
  PHOTO_ROLES,
  primaryPhotoUri,
  type PhotoRole,
  type ScanPhoto,
} from './domain/scan-photos';
export type { ImageColorSampler } from './service/image-color-sampler';
export {
  applyListingPatch,
  emptyListing,
  LISTING_FIELDS,
  listingSummary,
  type ListingDraft,
  type ListingField,
} from './domain/listing';
export type { ImageClassifier } from './service/image-classifier';
export { createScanStore } from './store/scan-store';
export type { ScanState, ScanStore, ScannedItem } from './store/scan-store';
