/** The pure entry of submission (local outbox → shop API). */
export {
  fieldsFromListing,
  payloadFromScan,
  photosFromScan,
  suggestionsFromResult,
  type SubmissionFields,
  type SubmissionPayload,
  type SubmissionPhoto,
  type SubmissionPhotoRole,
  type SubmissionSuggestions,
} from './domain/map-scan';
export { platformCategoryOf } from './domain/category-map';
export {
  isPlatformCategory,
  PLATFORM_CATEGORIES,
  type PlatformCategory,
} from './domain/platform-categories';
export {
  dueEntries,
  markFailed,
  markRetryable,
  markSending,
  markWaiting,
  nextAttemptAt,
  removeEntry,
  replaceEntry,
  OUTBOX_STATUSES,
  type OutboxEntry,
  type OutboxPhotoState,
  type OutboxStatus,
} from './domain/outbox';
export {
  createShopItemCreateApi,
  shopItemCreatedSchema,
  shopItemPhotoUploadedSchema,
  shopPhotoStatusSchema,
  type CreateItemBody,
  type ShopItemCreateApi,
  type ShopItemCreated,
  type ShopItemPhotoUploaded,
  type ShopPhotoStatus,
  type UploadPhotoInput,
} from './api/shop-item-create';
export {
  createOutboxRepository,
  OUTBOX_STORAGE_KEY,
  type OutboxRepository,
} from './service/outbox-repository';
export {
  createSubmissionService,
  type EnqueueScanInput,
  type SubmissionService,
  type SubmissionServiceDeps,
} from './service/submission-service';
