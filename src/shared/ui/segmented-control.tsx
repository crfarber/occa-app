import { Pressable, StyleSheet, Text, type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, size, spacingX, spacingY, type } from './theme';

type Segment = {
  id: string;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const segmentWidth = useSharedValue(0);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const reduceMotion = useReducedMotion();

  const indicatorStyle = useAnimatedStyle(() => {
    const target = selectedIndex * segmentWidth.value + spacingX.xs;
    return {
      width: Math.max(0, segmentWidth.value - spacingX.xs * 2),
      transform: [
        {
          translateX: reduceMotion ? target : withTiming(target, { duration: 220 }),
        },
      ],
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    segmentWidth.value = event.nativeEvent.layout.width / options.length;
  };

  return (
    <View accessibilityRole="tablist" style={styles.control} onLayout={onLayout}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((option: Segment) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id as T)}
            style={({ pressed }) => [styles.segment, pressed && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    minHeight: size.touchMin,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    paddingVertical: spacingY.xs,
  },
  indicator: {
    position: 'absolute',
    top: spacingY.xs,
    bottom: spacingY.xs,
    borderRadius: radius.xxl,
    backgroundColor: colors.brand,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacingX.md,
  },
  pressed: { opacity: 0.7 },
  label: { ...type.label, color: colors.textMuted },
  labelSelected: { color: colors.onBrand },
});
