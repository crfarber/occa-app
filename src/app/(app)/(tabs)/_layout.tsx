import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from '@/shared/ui/tab-bar';
import { colors, spacingX, spacingY } from '@/shared/ui/theme';

const TAB_IDS = ['home', 'inventory'] as const;
type TabId = (typeof TAB_IDS)[number];

function isTabId(name: string): name is TabId {
  return (TAB_IDS as readonly string[]).includes(name);
}

function AppTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const active = state.routes[state.index]?.name;
  const value: TabId = active !== undefined && isTabId(active) ? active : 'home';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabBarHost, { paddingBottom: spacingY.md + insets.bottom }]}
    >
      <TabBar
        value={value}
        onChange={(id) => navigation.navigate(id)}
        tabs={[
          { id: 'home', label: t('home.title'), icon: 'home-outline' },
          { id: 'inventory', label: t('inventory.title'), icon: 'file-tray-full-outline' },
        ]}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        initialRouteName="home"
        tabBar={(props) => <AppTabBar state={props.state} navigation={props.navigation} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Tabs.Screen name="home" options={{ title: t('home.title') }} />
        <Tabs.Screen name="inventory" options={{ title: t('inventory.title') }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    paddingHorizontal: spacingX.screen,
    paddingTop: spacingY.sm,
  },
});
