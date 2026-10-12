import { useEffect, useRef, type MutableRefObject } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  type PanGestureHandlerStateChangeEvent,
  type PinchGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { colors } from '@/shared/ui/theme';
import {
  clampAlignTranslation,
  coverScaleForFrame,
  cropRectFromAlignTransform,
  type ImageCropRect,
  type Size,
} from '../domain/frame-crop';
import { FrameOverlay } from './frame-overlay';

type AlignPhotoProps = {
  uri: string;
  imageSize: Size;
  frame: Size;
  frameLabel: string;
  /** Exposes the current crop so the parent can read it on confirm. */
  cropRef: MutableRefObject<ImageCropRect | null>;
};

/**
 * Pinch-to-zoom / pan editor: the image stays under a fixed frame; what sits
 * inside the frame is what will be cropped for recognition and colour.
 */
export function AlignPhoto({ uri, imageSize, frame, frameLabel, cropRef }: AlignPhotoProps) {
  const baseScale = useRef(1);
  const baseTranslateX = useRef(0);
  const baseTranslateY = useRef(0);

  const pinchScale = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const committedScale = useRef(new Animated.Value(1)).current;
  const committedX = useRef(new Animated.Value(0)).current;
  const committedY = useRef(new Animated.Value(0)).current;

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);

  const cover = coverScaleForFrame(frame, imageSize);
  const displayWidth = imageSize.width * cover;
  const displayHeight = imageSize.height * cover;

  const writeCrop = (userScale: number, translateX: number, translateY: number) => {
    cropRef.current = cropRectFromAlignTransform({
      frame,
      image: imageSize,
      userScale,
      translateX,
      translateY,
    });
  };

  useEffect(() => {
    baseScale.current = 1;
    baseTranslateX.current = 0;
    baseTranslateY.current = 0;
    committedScale.setValue(1);
    committedX.setValue(0);
    committedY.setValue(0);
    pinchScale.setValue(1);
    panX.setValue(0);
    panY.setValue(0);
    writeCrop(1, 0, 0);
  }, [uri, frame.width, frame.height, imageSize.width, imageSize.height]);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  const onPanEvent = Animated.event([{ nativeEvent: { translationX: panX, translationY: panY } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) {
      return;
    }
    const next = Math.max(1, baseScale.current * event.nativeEvent.scale);
    const clamped = clampAlignTranslation({
      frame,
      image: imageSize,
      userScale: next,
      translateX: baseTranslateX.current,
      translateY: baseTranslateY.current,
    });
    baseScale.current = next;
    baseTranslateX.current = clamped.translateX;
    baseTranslateY.current = clamped.translateY;
    committedScale.setValue(next);
    committedX.setValue(clamped.translateX);
    committedY.setValue(clamped.translateY);
    pinchScale.setValue(1);
    panX.setValue(0);
    panY.setValue(0);
    writeCrop(next, clamped.translateX, clamped.translateY);
  };

  const onPanStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) {
      return;
    }
    const nextX = baseTranslateX.current + event.nativeEvent.translationX;
    const nextY = baseTranslateY.current + event.nativeEvent.translationY;
    const clamped = clampAlignTranslation({
      frame,
      image: imageSize,
      userScale: baseScale.current,
      translateX: nextX,
      translateY: nextY,
    });
    baseTranslateX.current = clamped.translateX;
    baseTranslateY.current = clamped.translateY;
    committedX.setValue(clamped.translateX);
    committedY.setValue(clamped.translateY);
    panX.setValue(0);
    panY.setValue(0);
    writeCrop(baseScale.current, clamped.translateX, clamped.translateY);
  };

  const animatedScale = Animated.multiply(committedScale, pinchScale);
  const animatedX = Animated.add(committedX, panX);
  const animatedY = Animated.add(committedY, panY);

  return (
    <View style={[styles.host, { width: frame.width, height: frame.height }]}>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={pinchRef}
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
        minPointers={1}
        maxPointers={2}
      >
        <Animated.View style={styles.fill}>
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View style={styles.fill}>
              <View style={styles.clip}>
                <Animated.View
                  style={[
                    styles.imageWrap,
                    {
                      width: displayWidth,
                      height: displayHeight,
                      transform: [
                        { translateX: animatedX },
                        { translateY: animatedY },
                        { scale: animatedScale },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: displayWidth, height: displayHeight }}
                    accessibilityIgnoresInvertColors
                  />
                </Animated.View>
              </View>
              <FrameOverlay
                frame={{ x: 0, y: 0, width: frame.width, height: frame.height }}
                label={frameLabel}
              />
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'center',
    backgroundColor: colors.inverseSurface,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
