import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { useFieldChain } from '@/shared/ui/use-field-chain';
import { color, colors, radius, size, spacingX, spacingY, type } from '@/shared/ui/theme';
import { useAuthService, useSession } from '../hooks/auth-context';
import { useLoginForm } from '../hooks/use-login-form';

const LOGO = require('@/assets/images/remi-logo.svg') as number;
const appVersion = Constants.expoConfig?.version;

/** Remi splash canvas with the sign-in form once the session is known to be signed out. */
export function LoginScreen() {
  const { t } = useTranslation();
  const authService = useAuthService();
  const sessionExpired = useSession((state) => state.signedOutReason === 'expired');
  const { state, setEmail, setPassword, submitSignIn } = useLoginForm();

  const needsPassword = authService.method === 'supabase';

  const signIn = () => {
    void submitSignIn((credentials) => authService.signIn(credentials), needsPassword);
  };

  const chain = useFieldChain(2, { onSubmit: signIn });

  return (
    <Screen
      backgroundColor={color.remiYellow}
      safeAreaTop
      keyboardMode="layout"
      contentStyle={styles.content}
    >
      <View style={styles.hero}>
        <Image source={LOGO} style={styles.logo} contentFit="contain" />
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        {sessionExpired ? (
          <View style={styles.noticeBox}>
            <Text style={styles.notice}>{t('login.sessionExpired')}</Text>
          </View>
        ) : null}
        {state.messageKey !== null ? (
          <View style={styles.noticeBox}>
            <Text accessibilityRole="alert" style={styles.error}>
              {t(state.messageKey)}
            </Text>
          </View>
        ) : null}
        {authService.method === 'demo' ? (
          <Text style={styles.hint}>{t('login.demoHint')}</Text>
        ) : null}
        {needsPassword ? (
          <>
            <TextField
              {...chain.field(0)}
              value={state.email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="username"
              textContentType="username"
              placeholder={t('login.email')}
              containerStyle={styles.field}
            />
            <TextField
              {...chain.field(1, { lastAction: 'go' })}
              value={state.password}
              onChangeText={setPassword}
              autoComplete="password"
              textContentType="password"
              secureTextEntry
              placeholder={t('login.password')}
              containerStyle={styles.field}
            />
          </>
        ) : null}
        <Button label={t('login.signIn')} onPress={signIn} loading={state.busy} />
      </View>

      {appVersion ? (
        <Text style={styles.version}>{t('login.version', { version: appVersion })}</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    paddingHorizontal: spacingX.lg,
    paddingBottom: spacingY.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacingY.lg,
    paddingTop: spacingY.xl,
  },
  logo: {
    width: size.logoWidth,
    height: size.logoHeight,
  },
  subtitle: {
    ...type.body,
    color: color.ink,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: spacingY.md,
  },
  field: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacingX.sm,
    paddingVertical: spacingY.sm,
  },
  noticeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.sm,
  },
  notice: { ...type.body, color: colors.text, textAlign: 'center' },
  error: { ...type.body, color: colors.danger, textAlign: 'center' },
  hint: { ...type.small, color: color.ink, textAlign: 'center' },
  version: {
    ...type.small,
    color: color.ink,
    textAlign: 'center',
    opacity: 0.7,
  },
});
