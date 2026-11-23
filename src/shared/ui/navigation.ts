import { colors } from './theme';

export function goBackOrReplace<Route>(
  navigation: {
    canGoBack: () => boolean;
    back: () => void;
    replace: (route: Route) => void;
  },
  fallbackRoute: Route,
): void {
  if (navigation.canGoBack()) {
    navigation.back();
    return;
  }
  navigation.replace(fallbackRoute);
}

/**
 * Screens keep their `title` for accessibility and the back-button history menu; only the
 * header itself stays empty.
 */
const baseStackHeaderOptions = {
  headerTitle: '',
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: colors.text,
  headerTitleAlign: 'center',
  headerShadowVisible: false,
} as const;

export type StackHeaderLook = 'liquidGlass' | 'blur' | 'solid';

/**
 * `liquidGlass` / `blur` float over the screen so content can scroll beneath the chrome;
 * `solid` keeps an opaque canvas bar. Android blur background is attached separately.
 */
export function stackHeaderOptions(look: StackHeaderLook) {
  switch (look) {
    case 'liquidGlass':
      // Native scroll-edge glass; an extra blur would double up.
      return { ...baseStackHeaderOptions, headerTransparent: true };
    case 'blur':
      return {
        ...baseStackHeaderOptions,
        headerTransparent: true,
        headerBlurEffect: 'systemThinMaterialLight',
      } as const;
    case 'solid':
      return {
        ...baseStackHeaderOptions,
        headerTransparent: false,
        headerStyle: { backgroundColor: colors.canvas },
      };
  }
}
