import type { ImageCropRect } from '../../domain/frame-crop';
import { UPLOAD_PHOTO_JPEG_QUALITY, fitInsideMaxEdge } from '../../domain/upload-photo-size';

/**
 * Crops a local image to the given pixel rectangle, then downscales so the
 * long edge is at most UPLOAD_PHOTO_MAX_EDGE (web-sized JPEG for upload).
 */
export async function cropImageToRect(uri: string, crop: ImageCropRect): Promise<string> {
  const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
  const context = ImageManipulator.manipulate(uri);
  context.crop(crop);
  const target = fitInsideMaxEdge({ width: crop.width, height: crop.height });
  if (target !== null) {
    context.resize(target);
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: UPLOAD_PHOTO_JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}
