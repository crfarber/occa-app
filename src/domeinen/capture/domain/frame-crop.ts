/**
 * Geometry for the capture alignment frame: the region that becomes the cropped photo
 * (and therefore the dominant-colour sample). Pure math — no React Native.
 */

export type Size = { width: number; height: number };

export type Rect = { x: number; y: number; width: number; height: number };

/** Crop rectangle in image pixel coordinates (expo-image-manipulator). */
export type ImageCropRect = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

/** Portrait clothing frame (width / height). */
export const CAPTURE_FRAME_ASPECT = 3 / 4;

/**
 * Centred frame inside a viewport, leaving room for header hint and bottom actions.
 * Width is capped; height follows the aspect ratio.
 */
export function frameRectInViewport(
  viewport: Size,
  options?: {
    /** Horizontal inset as a fraction of viewport width (each side uses half). Default 0.1. */
    horizontalInsetFraction?: number;
    /** Top reserved band in points (header / hint). */
    topReserve?: number;
    /** Bottom reserved band in points (buttons). */
    bottomReserve?: number;
  },
): Rect {
  const horizontalInsetFraction = options?.horizontalInsetFraction ?? 0.1;
  const topReserve = options?.topReserve ?? 0;
  const bottomReserve = options?.bottomReserve ?? 0;

  const availableWidth = viewport.width * (1 - horizontalInsetFraction);
  const availableHeight = Math.max(0, viewport.height - topReserve - bottomReserve);

  let width = availableWidth;
  let height = width / CAPTURE_FRAME_ASPECT;
  if (height > availableHeight && availableHeight > 0) {
    height = availableHeight;
    width = height * CAPTURE_FRAME_ASPECT;
  }

  const x = (viewport.width - width) / 2;
  const y = topReserve + (availableHeight - height) / 2;
  return { x, y, width, height };
}

/** Where a cover-fitted image sits inside a view (may extend past the edges). */
export function coverFittedImageRect(view: Size, image: Size): Rect {
  if (view.width <= 0 || view.height <= 0 || image.width <= 0 || image.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const scale = Math.max(view.width / image.width, view.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    x: (view.width - width) / 2,
    y: (view.height - height) / 2,
    width,
    height,
  };
}

/** Maps a rectangle in view coordinates onto image pixels (cover preview). */
export function mapViewRectToImageCrop(
  viewRect: Rect,
  view: Size,
  image: Size,
): ImageCropRect | null {
  const fitted = coverFittedImageRect(view, image);
  if (fitted.width <= 0 || fitted.height <= 0) {
    return null;
  }
  const scaleX = image.width / fitted.width;
  const scaleY = image.height / fitted.height;
  return clampImageCrop(
    {
      originX: (viewRect.x - fitted.x) * scaleX,
      originY: (viewRect.y - fitted.y) * scaleY,
      width: viewRect.width * scaleX,
      height: viewRect.height * scaleY,
    },
    image,
  );
}

/**
 * Minimum scale so the image covers the frame (user scale is multiplied on top; min 1).
 */
export function coverScaleForFrame(frame: Size, image: Size): number {
  if (frame.width <= 0 || frame.height <= 0 || image.width <= 0 || image.height <= 0) {
    return 1;
  }
  return Math.max(frame.width / image.width, frame.height / image.height);
}

/**
 * Crop in image pixels from an alignment transform (cover base × user scale + pan).
 * `translateX` / `translateY` are in frame points, positive right/down, relative to centred image.
 */
export function cropRectFromAlignTransform(input: {
  frame: Size;
  image: Size;
  userScale: number;
  translateX: number;
  translateY: number;
}): ImageCropRect | null {
  const { frame, image } = input;
  const userScale = Math.max(1, input.userScale);
  const base = coverScaleForFrame(frame, image);
  const totalScale = base * userScale;
  if (totalScale <= 0) {
    return null;
  }

  const dispW = image.width * totalScale;
  const dispH = image.height * totalScale;
  const maxTx = Math.max(0, (dispW - frame.width) / 2);
  const maxTy = Math.max(0, (dispH - frame.height) / 2);
  const translateX = clamp(input.translateX, -maxTx, maxTx);
  const translateY = clamp(input.translateY, -maxTy, maxTy);

  const imageLeft = frame.width / 2 - dispW / 2 + translateX;
  const imageTop = frame.height / 2 - dispH / 2 + translateY;

  return clampImageCrop(
    {
      originX: (0 - imageLeft) / totalScale,
      originY: (0 - imageTop) / totalScale,
      width: frame.width / totalScale,
      height: frame.height / totalScale,
    },
    image,
  );
}

/** Keeps pan within bounds so the frame stays filled. */
export function clampAlignTranslation(input: {
  frame: Size;
  image: Size;
  userScale: number;
  translateX: number;
  translateY: number;
}): { translateX: number; translateY: number } {
  const userScale = Math.max(1, input.userScale);
  const totalScale = coverScaleForFrame(input.frame, input.image) * userScale;
  const dispW = input.image.width * totalScale;
  const dispH = input.image.height * totalScale;
  const maxTx = Math.max(0, (dispW - input.frame.width) / 2);
  const maxTy = Math.max(0, (dispH - input.frame.height) / 2);
  return {
    translateX: clamp(input.translateX, -maxTx, maxTx),
    translateY: clamp(input.translateY, -maxTy, maxTy),
  };
}

function clampImageCrop(crop: ImageCropRect, image: Size): ImageCropRect | null {
  if (image.width < 1 || image.height < 1) {
    return null;
  }

  let originX = Math.floor(crop.originX);
  let originY = Math.floor(crop.originY);
  let width = Math.ceil(crop.width);
  let height = Math.ceil(crop.height);

  if (originX < 0) {
    width += originX;
    originX = 0;
  }
  if (originY < 0) {
    height += originY;
    originY = 0;
  }
  if (originX + width > image.width) {
    width = image.width - originX;
  }
  if (originY + height > image.height) {
    height = image.height - originY;
  }

  if (width < 1 || height < 1) {
    return null;
  }

  return { originX, originY, width, height };
}

function clamp(value: number, min: number, max: number): number {
  const next = Math.min(max, Math.max(min, value));
  // Avoid -0 from Math when min/max are zero (breaks strict equality in tests).
  return next === 0 ? 0 : next;
}
