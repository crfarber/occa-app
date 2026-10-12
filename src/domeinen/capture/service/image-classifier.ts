import type { RawLabel } from '../domain/interpret-labels';

/** Labels a local image file. The device adapter uses on-device ML Kit; tests use a fake. */
export type ImageClassifier = {
  label(imageUri: string): Promise<RawLabel[]>;
};
