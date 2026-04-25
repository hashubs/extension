import { applyDrawFix } from '@/shared/apply-draw-fix';
import { initialize as initializeChannels } from '@/shared/channels';
import { BackgroundScriptUpdateHandler } from '@/shared/core/background-script-update-handler';
import { runtimeStore } from '@/shared/core/runtime-store';
import { HandshakeFailed } from '@/shared/errors/errors';
import { emitter } from '@/shared/events';
import { queryClient } from '@/shared/query-client/queryClient';
import { persistQueryClient } from '@/shared/query-client/queryClientPersistence';
import { restoreRoute } from '@/shared/RouteRestoration';
import { initializeSidepanelEvents } from '@/shared/sidepanel/initialize.client';
import { urlContext } from '@/shared/UrlContext';
import { getPreferences } from '@/ui/features/preferences/usePreferences';
import '@/ui/index.css';
import { OnboardingInterrupt } from '@/ui/views/onboarding/errors';
import { maybeOpenOnboarding } from '@/ui/views/onboarding/initialization';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import browser from 'webextension-polyfill';
import { App, type AppProps } from './App';

applyDrawFix();
initializeSidepanelEvents();
if (process.env.NODE_ENV === 'development') {
  console.time('UI render'); // eslint-disable-line no-console
  console.time('UI render effect'); // eslint-disable-line no-console
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  /** Seems to be recommended when clients always expect a service worker */
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    // We can try calling an update method here, but I'm not sure
    // it does anything useful. I'll comment it out for now as an experiment.
    // return registration.update();
  } else {
    const { background } = browser.runtime.getManifest();
    if (background && 'service_worker' in background) {
      await navigator.serviceWorker.register(background.service_worker);
    }
  }
}

let reactRoot: Root | null = null;

function renderApp({ initialView, inspect }: AppProps) {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('#root element not found');
  }

  if (reactRoot) {
    reactRoot.unmount();
  }
  reactRoot = createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <App initialView={initialView} inspect={inspect} />
    </React.StrictMode>
  );
}

const isPopup = urlContext.windowType === 'popup';

let isFirstLoad = true;
async function initializeUI({
  initialView,
  inspect,
}: Pick<AppProps, 'initialView' | 'inspect'> = {}) {
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
    await getPreferences(); // seed queryClient. TODO before merge: do we need this?
    // await configureUIClient();
    if (isPopup && !initialView) {
      await restoreRoute();
    }
    // initializeClientAnalytics();
    renderApp({ initialView, inspect });
  } catch (error) {
    if (error instanceof OnboardingInterrupt) {
      // do nothing
    } else {
      throw error;
    }
  }
}

async function handleFailedHandshake() {
  /**
   * This code (which is commented out) works in local development,
   * but also can lead to unwanted page refreshes. I'll leave it here as
   * a reference to a working method for force-updating the service_worker,
   * but maybe it's only worth to use during development.
   */
  // const registration = await navigator.serviceWorker.getRegistration();
  // await registration?.unregister();
  // window.location.reload(); // MUST reload to be able to register new service worker
  emitter.emit('error', new HandshakeFailed());
  initializeUI({ initialView: 'handshakeFailure' });
}

new BackgroundScriptUpdateHandler({
  onActivate: () => {
    initializeChannels();
    runtimeStore.setState((state) => ({ ...state, connected: true }));
  },
  onDisconnect: () => {
    runtimeStore.setState((state) => ({ ...state, connected: false }));
  },
  onFailedHandshake: () => handleFailedHandshake(),
}).keepAlive();

initializeUI();

// TODO: replace with window.location.reload
emitter.on('reloadExtension', initializeUI);
