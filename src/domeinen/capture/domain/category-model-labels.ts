/**
 * Class names for the on-device category TFLite model (training/export/labels.json).
 * Index order must match the model output tensor.
 */
export const CATEGORY_MODEL_LABELS = [
  'Blazer',
  'Dress',
  'Hat',
  'Hoodie',
  'Longsleeve',
  'Outwear',
  'Pants',
  'Polo',
  'Shirt',
  'Shoes',
  'Shorts',
  'Skirt',
  'T-Shirt',
  'Undershirt',
] as const;

export type CategoryModelLabel = (typeof CATEGORY_MODEL_LABELS)[number];

/** Resolves a model output index to its training label. Unknown indexes stay null. */
export function textForCategoryIndex(index: number): string | null {
  if (!Number.isInteger(index) || index < 0 || index >= CATEGORY_MODEL_LABELS.length) {
    return null;
  }
  return CATEGORY_MODEL_LABELS[index] ?? null;
}
