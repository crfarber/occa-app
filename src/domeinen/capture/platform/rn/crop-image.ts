import type { ImageCropRect } from '../../domain/frame-crop';

/** Crops a local image to the given pixel rectangle. */
export async function cropImageToRect(uri: string, crop: ImageCropRect): Promise<string> {
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
  const context = ImageManipulator.manipulate(uri);
  context.crop(crop);
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}
