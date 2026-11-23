import { describe, expect, it } from 'vitest';
import { goBackOrReplace, stackHeaderOptions } from './navigation';
import { colors } from './theme';

function createNavigation(hasHistory: boolean) {
  const calls: string[] = [];
  return {
    calls,
    canGoBack: () => hasHistory,
    back: () => {
      calls.push('back');
    },
    replace: (route: string) => {
      calls.push(route);
    },
  };
}

describe('stack header options', () => {
  it.each(['liquidGlass', 'blur', 'solid'] as const)(
    'keeps an empty title, compact back button and no bottom border (%s)',
    (look) => {
      expect(stackHeaderOptions(look)).toMatchObject({
        headerTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      });
    },
  );

  it('leaves liquid glass to the system without an extra blur', () => {
    const options = stackHeaderOptions('liquidGlass');
    expect(options).toMatchObject({ headerTransparent: true });
    expect(options).not.toHaveProperty('headerStyle');
    expect(options).not.toHaveProperty('headerBlurEffect');
  });

  it('frosts the transparent header when liquid glass is unavailable', () => {
    expect(stackHeaderOptions('blur')).toMatchObject({
      headerTransparent: true,
      headerBlurEffect: 'systemThinMaterialLight',
    });
  });

  it('keeps a solid canvas header when content must not scroll beneath it', () => {
    expect(stackHeaderOptions('solid')).toMatchObject({
      headerTransparent: false,
      headerStyle: { backgroundColor: colors.canvas },
    });
  });
});

describe('back navigation', () => {
  it('returns to the previous screen without opening another dashboard', () => {
    const navigation = createNavigation(true);

    goBackOrReplace(navigation, '/');

    expect(navigation.calls).toEqual(['back']);
  });

  it('returns to the actual previous screen rather than the settings fallback', () => {
    const navigation = createNavigation(true);

    goBackOrReplace(navigation, '/settings');

    expect(navigation.calls).toEqual(['back']);
  });

  it.each(['/', '/settings'])('replaces the route with %s only without history', (route) => {
    const navigation = createNavigation(false);

    goBackOrReplace(navigation, route);

    expect(navigation.calls).toEqual([route]);
  });
});
