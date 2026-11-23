import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

/** Storybook (web) stand-ins: no native keyboard module. */

export function KeyboardProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export const KeyboardAwareScrollView = ScrollView;

export function KeyboardStickyView({
  children,
  style,
  offset: _offset,
}: {
  children?: ReactNode;
  style?: ComponentProps<typeof View>['style'];
  offset?: { closed?: number; opened?: number };
}) {
  return <View style={style}>{children}</View>;
}

function ToolbarStub({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

ToolbarStub.Prev = function Prev() {
  return null;
};
ToolbarStub.Next = function Next() {
  return null;
};
ToolbarStub.Done = function Done(_props: { text?: ReactNode }) {
  return null;
};
ToolbarStub.Content = function Content({ children }: { children?: ReactNode }) {
  return <>{children}</>;
};
ToolbarStub.Background = function Background() {
  return null;
};
ToolbarStub.Group = View;

export const KeyboardToolbar = ToolbarStub;

export const DefaultKeyboardToolbarTheme = {
  light: {
    primary: '#2c2c2c',
    disabled: '#B0BEC5',
    background: '#f3f3f4',
    ripple: '#bcbcbcbc',
  },
  dark: {
    primary: '#fafafa',
    disabled: '#707070',
    background: '#2C2C2E',
    ripple: '#F8F8F888',
  },
};
