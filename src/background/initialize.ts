import { prepareStorage } from '@/shared/core/version/version.background';
// import { DnaService } from '@/modules/dna-service/dna.background';
// import { initialize as initializeAnalytics } from '@/shared/analytics/analytics.background';
import { initialize as initializeRemoteConfig } from '@/modules/remote-config';
// import { referralProgramService } from '@/ui/features/referral-program/ReferralProgramService.background';
// import { initialize as initializeLiteweightChainSupport } from './requests/liteweight-chain-support';
import { Account } from './account/account';
import { AccountPublicRPC } from './account/account-public-rpc';
import { InDappNotificationService } from './in-dapp-notifications';
import { NotificationWindow } from './notification-window/notification-window';
import { transactionService } from './transactions/transaction-service';
import { setUninstallURL } from './uninstall';
import { globalPreferences } from './wallet/global-preferences';

let didInitialize = false;

export const ServiceLocator: { account?: Account } = {};

export async function initialize() {
  if (didInitialize) {
    throw new Error('Initialize function should be run only once');
  }
  didInitialize = true;

  await prepareStorage();

  // This method is called only when background script runs for the first time
  // This means that either the user is opening the extension for the first time,
  // or that the browser decided to "restart" the background scripts
  // Either way, we either create a user from scratch or find one in storage
  await Account.ensureUserAndWallet();

  const notificationWindow = new NotificationWindow();
  await notificationWindow.initialize();
  const account = new Account({ notificationWindow });
  await account.initialize();
  const accountPublicRPC = new AccountPublicRPC(account);
  // const dnaService = new DnaService({
  //   getWallet: () => account.getCurrentWallet(),
  // });
  // referralProgramService.initialize({
  //   getWallet: () => account.getCurrentWallet(),
  // });
  // dnaService.initialize({ account });
  await transactionService.initialize({
    getWallet: () => account.getCurrentWallet(),
  });
  initializeRemoteConfig().then(() => {
    globalPreferences.initialize();
    setUninstallURL();
  });
  // initializeAnalytics({ account });
  // initializeLiteweightChainSupport(account);

  const inDappNotificationService = new InDappNotificationService({
    getWallet: () => account.getCurrentWallet(),
  });
  inDappNotificationService.initialize();

  Object.assign(globalThis, {
    account,
    Account,
    accountPublicRPC,
    // dnaService,
    transactionService,
    // referralProgramService,
    globalPreferences,
    notificationWindow,
  });
  ServiceLocator.account = account;
  return {
    account,
    accountPublicRPC,
    transactionService,
    // dnaService,
    notificationWindow,
  };
}
