import { ethers } from 'ethers';
import browser from 'webextension-polyfill';
// import { configureBackgroundClient } from '@/modules/defi-sdk/background';
import { SessionCacheService } from '@/background/resource/session-cache-service';
import { mainNetworksStore } from '@/modules/networks/networks-store.background';
import { userLifecycleStore } from '@/shared/analytics/shared/user-lifecycle';
import { runtimeStore } from '@/shared/core/runtime-store';
import { openOnboarding } from '@/shared/open-onboarding';
import { ORIGIN_PROTOCOL } from '@/shared/origin-protocol';
import { initializeSidepanel } from '@/shared/sidepanel/initialize.background';
import { ContentScriptManager } from './content-script-manager';
import { emitter } from './events';
import { initialize } from './initialize';
import { handleAccountEvents } from './messaging/controller-event-handlers/account-events-handler';
import { EthereumEventsBroadcaster } from './messaging/controller-event-handlers/ethereum-provider-events';
import { createHttpConnectionMessageHandler } from './messaging/port-message-handlers/create-http-connection-message-handler';
import { createPortMessageHandler } from './messaging/port-message-handlers/create-port-message-handler';
import { createWalletMessageHandler } from './messaging/port-message-handlers/create-wallet-message-handler';
import { createNotificationWindowMessageHandler } from './messaging/port-message-handlers/notification-window-message-handler';
import { PortRegistry } from './messaging/port-registry';
import { MemoryCacheRPC } from './resource/memory-cache-rpc';
import { TransactionService } from './transactions/transaction-service';
import * as userActivity from './user-activity';
import type { RuntimePort } from './webapis/runtime-port';

Object.assign(globalThis, { ethers });

initializeSidepanel();

globalThis.addEventListener('install', (_event) => {
  /** Seems to be recommended when clients always expect a service worker */
  // @ts-ignore sw service-worker environment
  globalThis.skipWaiting();
});
globalThis.addEventListener('activate', (_event) => {
  /** Seems to be recommended when clients always expect a service worker */
  // @ts-ignore sw service-worker environment
  globalThis.clients.claim();
});

if (process.env.NODE_ENV === 'development') {
  // Set different icon for development
  const icon = new URL('../images/logo-icon-dev-128.png', import.meta.url);
  browser.action.setIcon({
    path: icon.toString(),
  });
}

// configureBackgroundClient();
mainNetworksStore.load();

function isOnboardingMode(port: RuntimePort) {
  if (!port.sender?.url) {
    return false;
  }
  return port.sender.url.includes('#/onboarding');
}

function verifyPort(port: RuntimePort) {
  const protocol = port.sender?.url ? new URL(port.sender.url).protocol : null;
  if (protocol === ORIGIN_PROTOCOL) {
    return true;
  } else {
    // the only non-extension (meaning, content-script) port
    // allowed is `${browser.runtime.id}/ethereum`
    return port.name === `${browser.runtime.id}/ethereum`;
  }
}

async function notifyContentScriptsAndUIAboutInitialization() {
  try {
    await browser.runtime.sendMessage(browser.runtime.id, {
      event: 'background-initialized',
    });
  } catch (e) {
    /* OK, message is meant only for a running UI */
  }
  // To query all tabs, pass empty object to tabs.query({})
  const tabs = await browser.tabs.query({});
  tabs.forEach(async (tab) => {
    if (!tab.id) {
      return;
    }
    try {
      await browser.tabs.sendMessage(tab.id, {
        event: 'background-initialized',
      });
    } catch (error) {
      // "Could not establish connection. Receiving end does not exist."
      // No problem, this message is only meant for content-scripts which
      // are still attached to a disconnected extension context
    }
  });
}

const portRegistry = new PortRegistry();
Object.assign(globalThis, { portRegistry });

// Listeners must be registered synchronously from the start of the page:
// https://developer.chrome.com/docs/extensions/mv3/service_workers/#listeners
browser.runtime.onConnect.addListener((port) => {
  if (verifyPort(port)) {
    portRegistry.register(port);
  } else if (port.name === 'content-script/keepAlive') {
    // This is an attempt to keep service worker alive. By sending a disconnect
    // to the connected port, we force the content script to create a new
    // connection (custom logic), which, in turn, should keep service worker running.
    const WAIT_TIME_MS = 240000; // some heuristic, maybe should be sooner
    setTimeout(() => {
      port.disconnect();
    }, WAIT_TIME_MS);
  }
});

userActivity.trackLastActive();
userActivity.scheduleAlarms();
// Listeners for alarms must also be registered at the top level.
// It's not mentioned on the Alarms API page, but it's mentioned here:
// https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#alarms
browser.alarms.onAlarm.addListener(userActivity.handleAlarm);
browser.alarms.onAlarm.addListener(ContentScriptManager.handleAlarm);
browser.alarms.onAlarm.addListener(TransactionService.handleAlarm);

console.time('bg initialize'); // eslint-disable-line no-console

browser.runtime.onStartup.addListener(() => {
  runtimeStore.handleStartupEvent();
});

initialize().then((values) => {
  console.timeEnd('bg initialize'); // eslint-disable-line no-console
  const account = values.account;
  const accountPublicRPC = values.accountPublicRPC;
  // const dnaService = values.dnaService;
  const notificationWindow = values.notificationWindow;
  emitter.emit('backgroundScriptInitialized');
  notifyContentScriptsAndUIAboutInitialization();
  // const httpConnection = new HttpConnection(() => account.getCurrentWallet());
  const memoryCacheRPC = new MemoryCacheRPC();

  new ContentScriptManager().removeExpiredRecords().activate();

  portRegistry.addMessageHandler(
    createWalletMessageHandler(() => account.getCurrentWallet())
  );
  portRegistry.addMessageHandler((port, msg) => {
    if (port.name === 'handshake') {
      port.postMessage({ ack: (msg as { syn: number }).syn + 1 });
    }
  });
  portRegistry.addMessageHandler(
    createPortMessageHandler({
      check: (port) => port.name === 'accountPublicRPC',
      controller: accountPublicRPC,
    })
  );
  portRegistry.addMessageHandler(
    createPortMessageHandler({
      check: (port) => port.name === 'memoryCacheRPC',
      controller: memoryCacheRPC,
    })
  );
  // portRegistry.addMessageHandler(
  //   createPortMessageHandler({
  //     check: (port) => port.name === 'dnaService',
  //     controller: dnaService,
  //   })
  // );
  portRegistry.addMessageHandler(
    createPortMessageHandler({
      check: (port) => port.name === 'sessionCacheService',
      controller: new SessionCacheService(),
    })
  );
  portRegistry.addMessageHandler(
    createNotificationWindowMessageHandler(notificationWindow)
  );
  portRegistry.addMessageHandler(
    // createHttpConnectionMessageHandler(httpConnection)
    createHttpConnectionMessageHandler(() => account.getCurrentWallet())
  );

  handleAccountEvents({ account });
  const ethereumEventsBroadcaster = new EthereumEventsBroadcaster({
    account,
    getActivePorts: () => portRegistry.getActivePorts(),
  });
  ethereumEventsBroadcaster.startListening();

  portRegistry.addListener('disconnect', (port: RuntimePort) => {
    if (
      port.name === `${browser.runtime.id}/wallet` &&
      !isOnboardingMode(port)
    ) {
      // Means extension UI is closed
      account.expirePasswordSession();
      emitter.emit('uiClosed', { url: port.sender?.url || null });
    }
  });

  account.on('reset', () => {
    portRegistry.postMessage({
      portName: `${browser.runtime.id}/wallet`,
      message: { payload: 'session-logout' },
    });
  });

  emitter.on('sessionExpired', () => account.logout());
  userActivity.expireSessionIfNeeded();
});

browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  runtimeStore.handleInstalledEvent({ reason, previousVersion });
  if (reason === 'install') {
    userLifecycleStore.handleRuntimeInstalledEvent();
    openOnboarding();
  }
});
