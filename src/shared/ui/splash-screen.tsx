import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { color, radius, size, spacingY } from './theme';

const TRACK_WIDTH = 240;
const INDICATOR_WIDTH = 90;
const LOGO = require('@/assets/images/remi-logo.svg') as number;

type SplashScreenViewProps = {
  /** Called once the view has a size, so the native splash can hide without a blank frame. */
  onLayout?: () => void;
};

export function SplashScreenView({ onLayout }: SplashScreenViewProps) {
  const { t } = useTranslation();
  const progress = useRef(new Animated.Value(-INDICATOR_WIDTH)).current;

  useEffect(() => {
    let cancelled = false;
    let animation: Animated.CompositeAnimation | null = null;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }
      if (reduceMotion) {
        progress.setValue((TRACK_WIDTH - INDICATOR_WIDTH) / 2);
        return;
      }
      animation = Animated.loop(
        Animated.timing(progress, {
          toValue: TRACK_WIDTH,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      );
      animation.start();
    });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [progress]);

  return (
    <View style={styles.root} onLayout={onLayout}>
      <View style={styles.content}>
        <Image source={LOGO} style={styles.logo} contentFit="contain" />
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t('common.loading')}
          style={styles.track}
        >
          <Animated.View style={[styles.progress, { transform: [{ translateX: progress }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.remiYellow,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: spacingY.xxxl,
  },
  logo: {
    width: size.logoWidth,
    height: size.logoHeight,
  },
  track: {
    width: TRACK_WIDTH,
    height: spacingY.md,
    borderRadius: radius.xxl,
    borderWidth: 2,
    borderColor: color.plum,
    overflow: 'hidden',
  },
  progress: {
    width: INDICATOR_WIDTH,
    height: '100%',
    borderRadius: radius.xxl,
    backgroundColor: color.plum,
  },
});
