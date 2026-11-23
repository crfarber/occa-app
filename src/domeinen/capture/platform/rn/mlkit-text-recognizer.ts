import type { TextRecognizer } from '../../service/text-recognizer';

export function createMlKitTextRecognizer(): TextRecognizer {
  return {
    async recognize(uri) {
      const { recognizeText } = await import('@infinitered/react-native-mlkit-text-recognition');
      return recognizeText(uri);
    },
  };
}
