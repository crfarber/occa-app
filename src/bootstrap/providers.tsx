import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { AppState } from 'react-native';
import { AuthProvider } from '@/domeinen/auth/ui';
import {
  CaptureProvider,
  CategoryModelProvider,
  useCustomCategoryClassifier,
} from '@/domeinen/capture/ui';
import { InventoryProvider } from '@/domeinen/inventory/ui';
import { SettingsProvider } from '@/domeinen/settings/ui';
import { ShopsProvider } from '@/domeinen/shops/ui';
import { SubmissionProvider } from '@/domeinen/submission/ui';
import { StatusOverlayProvider } from '@/shared/ui/status-overlay-host';
import { FeedbackProvider } from '@/shared/ui/toast-host';
import { SchedulerProvider } from '@/shared/ui/scheduler-context';
import type { Container } from './container';

/** Tells the session when the app returns to the foreground, so an expired token is renewed at once. */
function useForegroundRefresh(container: Container): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void container.lifecycle.onForeground();
        void container.submission.flush();
      }
    });
    return () => subscription.remove();
  }, [container]);
}

/**
 * Capture wiring that prefers the bundled category TFLite model.
 * Must sit under `CategoryModelProvider`.
 */
function CaptureWithCategoryModel({
  container,
  children,
}: {
  container: Container;
  children: ReactNode;
}) {
  const imageClassifier = useCustomCategoryClassifier();
  const capture = useMemo(
    () => ({
      imageClassifier,
      imageColorSampler: container.imageColorSampler,
      textRecognizer: container.textRecognizer,
      scanStore: container.scanStore,
    }),
    [container, imageClassifier],
  );

  return <CaptureProvider value={capture}>{children}</CaptureProvider>;
}

/** Hands the parts of the container to the React tree. This is the only place that does so. */
export function AppProviders({
  container,
  children,
}: {
  container: Container;
  children: ReactNode;
}) {
  useForegroundRefresh(container);

  const auth = useMemo(
    () => ({
      authService: container.authService,
      sessionStore: container.sessionStore,
    }),
    [container],
  );
  const settings = useMemo(() => ({ languageSettings: container.languageSettings }), [container]);
  const shops = useMemo(
    () => ({ shopsApi: container.shopsApi, selectedStore: container.selectedStore }),
    [container],
  );
  const inventory = useMemo(
    () => ({ itemsApi: container.inventoryApi, itemDetailApi: container.itemDetailApi }),
    [container],
  );

  return (
    <QueryClientProvider client={container.queryClient}>
      <I18nextProvider i18n={container.i18n}>
        <FeedbackProvider value={container.feedback}>
          <StatusOverlayProvider value={container.statusOverlay}>
            <SchedulerProvider value={container.scheduler}>
              <AuthProvider value={auth}>
                <ShopsProvider value={shops}>
                  <InventoryProvider value={inventory}>
                    <SubmissionProvider value={container.submission}>
                      <CategoryModelProvider>
                        <CaptureWithCategoryModel container={container}>
                          <SettingsProvider value={settings}>{children}</SettingsProvider>
                        </CaptureWithCategoryModel>
                      </CategoryModelProvider>
                    </SubmissionProvider>
                  </InventoryProvider>
                </ShopsProvider>
              </AuthProvider>
            </SchedulerProvider>
          </StatusOverlayProvider>
        </FeedbackProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
