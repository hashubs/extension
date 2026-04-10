import { applyDrawFix } from '@/shared/apply-draw-fix';
import { initialize as initializeChannels } from '@/shared/channel';
import { BackgroundScriptUpdateHandler } from '@/shared/core/background-script-update-handler';
import { runtimeStore } from '@/shared/core/runtime-store';
import { HandshakeFailed } from '@/shared/errors/errors';
import { emitter } from '@/shared/events';
import { queryClient } from '@/shared/query-client/queryClient';
import { persistQueryClient } from '@/shared/query-client/queryClientPersistence';
import { restoreRoute } from '@/shared/RouteRestoration';
import { initializeSidepanelEvents } from '@/shared/sidepanel/initialize.client';
import { getPreferences } from '@/ui/features/preferences/usePreferences';
import { OnboardingInterrupt } from '@/ui/views/onboarding/errors';
import { maybeOpenOnboarding } from '@/ui/views/onboarding/initialization';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import browser from 'webextension-polyfill';

import '@/ui/index.css';

let reactRoot: Root | null = null;
let isFirstLoad = true;

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    const { background } = browser.runtime.getManifest();
    if (background && 'service_worker' in background) {
      await navigator.serviceWorker.register(background.service_worker);
    }
  }
}

/**
 * Orchestrates the complex initialization process for extension entry points (Popup, Sidepanel, Onboarding).
 */
export async function initializeEntry(
  App: React.ComponentType<any>,
  options: { isPopup?: boolean; isSidepanel?: boolean } = {}
) {
  const { isPopup } = options;

  if (options.isSidepanel) {
    initializeSidepanelEvents();
  }

  applyDrawFix();

  const renderApp = (props: any = {}) => {
    const container = document.getElementById('root');
    if (!container) throw new Error('#root element not found');

    if (reactRoot) reactRoot.unmount();
    reactRoot = createRoot(container);
    reactRoot.render(
      <React.StrictMode>
        <App {...props} />
      </React.StrictMode>
    );
  };

  const initializeUI = async (props: any = {}) => {
    const innerIsFirstLoad = isFirstLoad;
    isFirstLoad = false;

    try {
      await registerServiceWorker();
      initializeChannels();
      await maybeOpenOnboarding();

      if (innerIsFirstLoad) {
        await persistQueryClient(queryClient);
      } else {
        queryClient.clear();
      }

      await getPreferences();

      if (isPopup && !props.initialView) {
        await restoreRoute();
      }

      renderApp(props);
    } catch (error) {
      if (!(error instanceof OnboardingInterrupt)) {
        throw error;
      }
    }
  };

  // Setup keep-alive and update handlers
  new BackgroundScriptUpdateHandler({
    onActivate: () => {
      initializeChannels();
      runtimeStore.setState((state) => ({ ...state, connected: true }));
    },
    onDisconnect: () => {
      runtimeStore.setState((state) => ({ ...state, connected: false }));
    },
    onFailedHandshake: () => {
      emitter.emit('error', new HandshakeFailed());
      initializeUI({ initialView: 'handshakeFailure' });
    },
  }).keepAlive();

  // Initial load
  await initializeUI();

  // Handle reloads
  emitter.on('reloadExtension', initializeUI);
}
