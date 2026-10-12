import jpeg from 'jpeg-js';
import { averageRgbFromRgba, nearestColorName } from '../../domain/color-from-rgb';
import type { ImageColorSampler } from '../../service/image-color-sampler';

const SAMPLE_WIDTH = 48;

/**
 * Resizes the photo, decodes JPEG pixels in JS, and maps the centre average to a colour name.
 * No network; fails soft (null) when the file cannot be decoded.
 */
export function createAverageImageColorSampler(): ImageColorSampler {
  return {
    async sampleColorName(imageUri) {
      try {
        const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
        const context = ImageManipulator.manipulate(imageUri);
        context.resize({ width: SAMPLE_WIDTH });
        const image = await context.renderAsync();
        const resized = await image.saveAsync({
          base64: true,
          format: SaveFormat.JPEG,
          compress: 0.7,
        });
        if (resized.base64 === undefined || resized.base64 === '') {
          return null;
        }

        const binary = atob(resized.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }

        const decoded = jpeg.decode(bytes, {
          useTArray: true,
          formatAsRGBA: true,
        });
        const average = averageRgbFromRgba(decoded.data, decoded.width, decoded.height, 0.25);
        if (average === null) {
          return null;
        }
        return nearestColorName(average);
      } catch {
        return null;
      }
    },
  };
}
