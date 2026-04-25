import type { ChainId } from '@/modules/ethereum/transactions/chainId';
import type { Chain } from '@/modules/networks/chain';
import type {
  MessageContextParams,
  TransactionContextParams,
  TransactionFormedContext,
} from '@/shared/types/signature-context-params';
import { createNanoEvents } from 'nanoevents';
// import type {
//   BannerClickedParams,
//   ButtonClickedParams,
// } from '@/shared/types/button-events';
import type { TypedData } from '@/modules/ethereum/message-signing/TypedData';
import type { AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import type { NetworksSource } from '@/shared/request/shared';
import type { QuoteErrorContext } from '@/shared/types/quote-error-context';
import type { SignTransactionResult } from '@/shared/types/sign-transaction-result';
import type { WindowType } from '@/shared/types/UrlContext';
import type { State as GlobalPreferencesState } from './wallet/global-preferences';
import type { WalletContainer } from './wallet/model/types';
import type { WalletOrigin } from './wallet/model/wallet-origin';

export interface ScreenViewParams {
  title: string;
  pathname: string;
  previous: string | null;
  address: string | null;
  screenSize: string;
  windowType: WindowType;
}

export interface DaylightEventParams {
  event_name: string;
  address: string;
  [key: string]: string;
}

export interface AssetClickedParams {
  assetId: string;
  pathname: string;
  section: string;
}

export const emitter = createNanoEvents<{
  backgroundScriptInitialized: () => void;
  accountsChanged: () => void;
  chainsUpdated: () => void;
  chainChanged: (chain: Chain, origin: string) => void;
  'ui:chainSelected': (chain: Chain) => void;
  globalError: (data: {
    name: 'network_error' | 'signing_error';
    message: string;
  }) => void;
  switchChainError: (chainId: ChainId, origin: string, error: unknown) => void;
  transactionFormed: (context: TransactionFormedContext) => void;
  transactionSent: (
    result: SignTransactionResult,
    context: { mode: 'default' | 'testnet' } & TransactionContextParams
  ) => void;
  transactionFailed: (
    errorMessage: string,
    context: { mode: 'default' | 'testnet' } & TransactionContextParams
  ) => void;
  quoteError: (context: QuoteErrorContext, source: NetworksSource) => void;
  typedDataSigned: (
    data: { typedData: TypedData; address: string } & MessageContextParams
  ) => void;
  messageSigned: (
    data: { message: string; address: string } & MessageContextParams
  ) => void;
  userActivity: () => void;
  connectToSiteEvent: (info: { origin: string }) => void;
  sessionExpired: () => void;
  requestAccountsResolved: (data: {
    origin: string;
    address: string;
    /** {explicitly: true} means that user confirmed connection in a dialog. {false} means that we resolve a previously approved address value */
    explicitly: boolean;
  }) => void;
  screenView: (data: ScreenViewParams) => void;
  unlockedAppOpened: () => void;
  firstScreenView: (timestamp: number) => void;
  daylightAction: (data: DaylightEventParams) => void;
  walletCreated: (wallet: {
    walletContainer: WalletContainer;
    origin: WalletOrigin;
    groupId: string | null;
  }) => void;
  addEthereumChain: (data: {
    values: [AddEthereumChainParameter];
    origin: string;
  }) => void;
  globalPreferencesChange: (
    state: GlobalPreferencesState,
    prevState: GlobalPreferencesState
  ) => void;
  holdToSignPreferenceChange: (active: boolean) => void;
  keyboardShortcutToSignPreferenceChange: (active: boolean) => void;
  eip6963SupportDetected: (data: { origin: string }) => void;
  uiClosed: (data: { url: string | null }) => void;
  // buttonClicked: (data: ButtonClickedParams) => void;
  // bannerClicked: (data: BannerClickedParams) => void;
  cloudflareChallengeIssued: () => void;
  assetClicked: (data: AssetClickedParams) => void;
  passkeyLoginEnabled: () => void;
  passkeyLoginDisabled: () => void;
  passwordChangeSuccess: () => void;
  passwordChangeError: () => void; // we do not pass error body to analytics to avoid sensitive data leaks
  reportLedgerError: (errorMessage: string) => void;
}>();
