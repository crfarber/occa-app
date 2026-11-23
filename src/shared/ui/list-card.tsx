import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, size, spacingX, spacingY, type } from './theme';

type ListCardProps = {
  title: string;
  subtitle?: string | null;
  imageUri?: string | null;
  accessory?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Rounded white row card with optional image, subtitle and accessory slot. */
export function ListCard({
  title,
  subtitle,
  imageUri,
  accessory,
  onPress,
  accessibilityLabel,
}: ListCardProps) {
  const content = (
    <>
      {imageUri !== undefined && imageUri !== null && imageUri !== '' ? (
        <Image source={{ uri: imageUri }} style={styles.photo} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.photo, styles.photoEmpty]} />
      )}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle !== undefined && subtitle !== null && subtitle !== '' ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {accessory !== undefined ? <View style={styles.accessory}>{accessory}</View> : null}
      </View>
    </>
  );

  if (onPress === undefined) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.md,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.md,
    marginVertical: spacingY.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  pressed: { opacity: 0.7 },
  photo: {
    width: size.thumbnail,
    height: size.thumbnail,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  photoEmpty: {},
  text: { flex: 1, gap: spacingY.xs },
  title: { ...type.body, color: colors.text, fontWeight: '600' },
  subtitle: { ...type.small, color: colors.textMuted },
  accessory: { marginTop: spacingY.xs },
});
