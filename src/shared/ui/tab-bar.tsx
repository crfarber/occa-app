import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GlassSurface } from './glass-surface';
import { color, colors, motion, radius, size, spacingX, spacingY, type } from './theme';

type TabBarItem<T extends string> = {
  id: T;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type TabBarProps<T extends string> = {
  tabs: readonly TabBarItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Equal-width floating tab strip; the plum pill slides between tabs. */
export function TabBar<T extends string>({ tabs, value, onChange }: TabBarProps<T>) {
  const tabWidth = useSharedValue(0);
  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );
  const reduceMotion = useReducedMotion();

  const indicatorStyle = useAnimatedStyle(() => {
    const inset = spacingX.xs;
    const width = Math.max(0, tabWidth.value - inset * 2);
    const target = selectedIndex * tabWidth.value + inset;
    return {
      width,
      transform: [
        {
          translateX: reduceMotion ? target : withTiming(target, { duration: motion.base }),
        },
      ],
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    tabWidth.value = tabs.length > 0 ? width / tabs.length : 0;
  };

  return (
    <GlassSurface accessibilityRole="tablist" style={styles.bar} onLayout={onLayout}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab) => {
        const selected = tab.id === value;
        const tint = selected ? color.onPlum : colors.textMuted;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Ionicons name={tab.icon} size={24} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    minHeight: size.tabBar,
    paddingVertical: spacingY.xs,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: spacingY.xs,
    bottom: spacingY.xs,
    borderRadius: radius.xxl,
    backgroundColor: color.plum,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingY.xs,
    paddingVertical: spacingY.sm,
    zIndex: 1,
  },
  pressed: { opacity: 0.7 },
  label: {
    ...type.statusLabel,
  },
});
