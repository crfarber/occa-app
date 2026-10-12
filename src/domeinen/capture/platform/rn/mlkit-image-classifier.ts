import ImageLabeling from '@react-native-ml-kit/image-labeling';
import type { ImageClassifier } from '../../service/image-classifier';

/** On-device ML Kit base model. No network call. */
export function createMlKitImageClassifier(): ImageClassifier {
  return {
    async label(imageUri) {
      const labels = await ImageLabeling.label(imageUri);
      return labels.map((label) => ({
        text: label.text,
        confidence: label.confidence,
      }));
    },
  };
}
