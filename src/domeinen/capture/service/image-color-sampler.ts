/** Samples a dominant / average colour from a local image file. */
export type ImageColorSampler = {
  /** Dutch colour name, or null when the image cannot be read. */
  sampleColorName(imageUri: string): Promise<string | null>;
};
