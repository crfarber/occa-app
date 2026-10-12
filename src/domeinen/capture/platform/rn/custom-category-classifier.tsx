import {
  useImageLabeling,
  useImageLabelingModels,
  useImageLabelingProvider,
  type ImageLabelingConfig,
} from '@infinitered/react-native-mlkit-image-labeling';
import { useMemo, type ReactNode } from 'react';
import categoryModel from '@/assets/models/occa_category.tflite';
import { realSleep } from '@/shared/platform/ports';
import { textForCategoryIndex } from '../../domain/category-model-labels';
import type { ImageClassifier } from '../../service/image-classifier';
import { waitForLoaded } from './wait-for-loaded';

const MODELS = {
  category: {
    model: categoryModel,
    options: {
      maxResultCount: 5,
      // Int8 softmax peaks are often soft; a high ML Kit floor yielded empty lists.
      confidenceThreshold: 0.05,
    },
  },
} as const satisfies ImageLabelingConfig;

/**
 * Loads the bundled category TFLite model. Wrap the tree that calls
 * `useCustomCategoryClassifier`.
 */
export function CategoryModelProvider({ children }: { children: ReactNode }) {
  const models = useImageLabelingModels(MODELS);
  const { ImageLabelingModelProvider } = useImageLabelingProvider(models);
  return <ImageLabelingModelProvider>{children}</ImageLabelingModelProvider>;
}

/**
 * ImageClassifier backed by the custom category model. Resolves class indexes
 * via `textForCategoryIndex` (not ML Kit's `text` field, which may be empty).
 */
export function useCustomCategoryClassifier(): ImageClassifier {
  const classifier = useImageLabeling('category');

  return useMemo(
    () => ({
      async label(imageUri: string) {
        const ready = await waitForLoaded(classifier, { sleep: realSleep });
        const results = await ready.classifyImage(imageUri);
        return results.map((entry) => ({
          text: textForCategoryIndex(entry.index) ?? entry.text,
          confidence: entry.confidence,
        }));
      },
    }),
    [classifier],
  );
}
