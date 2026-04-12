import {
  isLocalAddressAction,
  type AnyAddressAction,
} from '@/modules/ethereum/transactions/addressAction';
import type { ChainId } from '@/modules/ethereum/transactions/chainId';
import { getTransactionCount } from '@/modules/ethereum/transactions/getTransactionCount';
import {
  getPendingTransactions,
  isPendingTransaction,
} from '@/modules/ethereum/transactions/model';
import type {
  StoredTransactions,
  TransactionObject,
} from '@/modules/ethereum/transactions/types';
import { getNetworkByChainId } from '@/modules/networks/networks-api';
import { PersistentStore } from '@/modules/persistent-store';
import { ensureSolanaResult } from '@/modules/transactions/helpers';
import { invariant } from '@/shared/invariant';
import { normalizeAddress } from '@/shared/normalize-address';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import type { SignTransactionResult } from '@/shared/types/sign-transaction-result';
import type { Wallet } from '@/shared/types/wallet';
import { upsert } from '@/shared/upsert';
import { produce } from 'immer';
import throttle from 'lodash/throttle';
import { createNanoEvents } from 'nanoevents';
import browser from 'webextension-polyfill';
import { emitter } from '../events';
import {
  toEthersV5Receipt,
  txPlainToEthersV5TransactionResponse,
} from '../wallet/model/ethers-v5-types';
import type { PollingTx } from './transaction-poller';
import { TransactionsPoller } from './transaction-poller';

const FOUR_MINUTES_IN_MS = 1000 * 60 * 4;
const ONE_DAY_IN_MINUTES = 1 * 60 * 24;

class TransactionsStore extends PersistentStore<StoredTransactions> {
  upsertTransaction(value: TransactionObject) {
    this.setState((state) =>
      produce(state, (draft) => {
        upsert(draft, value, (x) => x.hash ?? x.signature);
      })
    );
  }

  getByHash(hash: string) {
    return this.getState().find((item) => item.hash === hash);
  }

  getBySignature(signature: string) {
    return this.getState().find((item) => item.signature === signature);
  }

  bulkDeleteTransactionsById(ids: string[]) {
    const idsSet = new Set(ids);
    this.setState((state) =>
      state.filter((item) => !idsSet.has(item.hash ?? item.signature))
    );
  }

  clearPendingTransactions() {
    this.setState((state) => state.filter((t) => !isPendingTransaction(t)));
  }
}

function toPollingObj(value: TransactionObject): PollingTx {
  if (value.transaction) {
    return {
      standard: 'evm',
      hash: value.hash,
      chainId: normalizeChainId(value.transaction.chainId),
      nonce: value.transaction.nonce,
      from: value.transaction.from,
    };
  } else if (value.solanaBase64) {
    return {
      standard: 'solana',
      from: value.publicKey,
      signature: value.signature,
      timestamp: value.timestamp,
    };
  } else {
    throw new Error('Invalud TransactionObject');
  }
}

interface Options {
  getWallet: () => Wallet;
}

export class TransactionService {
  private transactionsStore: TransactionsStore;
  private transactionsPoller: TransactionsPoller;
  options: Options | null = null;

  static ALARM_NAME = 'TransactionService:performPurgeCheck';
  static emitter = createNanoEvents<{ alarm: () => void }>();

  static async scheduleAlarms() {
    const alarm = await browser.alarms.get(TransactionService.ALARM_NAME);
    // I think we should be able to safely create alarms with the same name
    // unconditionally and not worry about duplication, but chrome docs
    // have a recommendation to check if alarm already exists, so why not:
    // https://developer.chrome.com/docs/extensions/reference/api/alarms#persistence
    if (!alarm) {
      browser.alarms.create(TransactionService.ALARM_NAME, {
        periodInMinutes: ONE_DAY_IN_MINUTES,
      });
    }
  }

  static handleAlarm(alarm: browser.Alarms.Alarm) {
    if (alarm.name === TransactionService.ALARM_NAME) {
      TransactionService.emitter.emit('alarm');
    }
  }

  constructor() {
    this.transactionsStore = new TransactionsStore([], 'transactions');
    this.transactionsPoller = new TransactionsPoller();
    TransactionService.emitter.on('alarm', () => {
      // Just wondering... When a chrome alarm goes off, does this mean that
      // the whole background script runs from scratch? If it does, it means we
      // instantiate TransactionService anyway, and when we do, we {performPurgeCheck()} anyway...
      // So do we need a handler at all?
      // But if we don't add a handler, might chrome be "smart" and not run the alarm?
      // Documentation doesn't have answers for this.
      this.performPurgeCheck();
    });
  }

  async initialize(options: Options) {
    this.options = options;
    await this.transactionsStore.ready();
    const transactions = this.transactionsStore.getState();
    const pending = getPendingTransactions(transactions);
    this.transactionsPoller.setOptions({
      getRpcUrlByChainId: (chainId: ChainId) => {
        invariant(this.options, "Options aren't expected to become null");
        const wallet = this.options.getWallet();
        return wallet.getRpcUrlByChainId({ chainId, type: 'internal' });
      },
      getRpcUrlSolana: async () => {
        invariant(this.options, "Options aren't expected to become null");
        const wallet = this.options.getWallet();
        try {
          return wallet.getRpcUrlSolana();
        } catch {
          return null;
        }
      },
    });
    this.transactionsPoller.add(pending.map(toPollingObj));
    this.addListeners();
    if (transactions.length) {
      this.startPurgeInterval({ leading: true });
    }
  }

  private startPurgeInterval({ leading } = { leading: false }) {
    if (leading) {
      this.performPurgeCheck(); // make leading call
    }
    TransactionService.scheduleAlarms();
  }

  private schedulePurgeCheck = throttle(
    () => {
      this.performPurgeCheck();
    },
    FOUR_MINUTES_IN_MS,
    { leading: false } // Invoke no sooner and no more frequent than FOUR_MINUTES
  );

  /**
   * Purges from cache all transactions belonging to {address} in {chainId}
   * which have a nonce less than or equals to {fromNonce}
   */
  private async purgeEntries({
    address,
    fromNonce,
    chainId,
  }: {
    address: string;
    fromNonce: number;
    chainId: ChainId;
  }) {
    const transactions = await this.transactionsStore.getSavedState();
    const candidates = transactions.filter((item) => {
      return (
        item.hash &&
        normalizeAddress(item.transaction.from) === normalizeAddress(address) &&
        normalizeChainId(item.transaction.chainId) === chainId &&
        item.transaction.nonce <= fromNonce
      );
    });
    this.transactionsStore.bulkDeleteTransactionsById(
      candidates.map((item) => item.hash ?? item.signature)
    );
  }

  /**
   * Finds confirmed transactions via RPC (eth_getTransactionCount) and removes
   * stale local pending transactions whose nonce has already been consumed.
   * This replaces the previous server-side approach (getLatestNonceKnownByBackend via defi-sdk).
   */
  private async performPurgeCheck() {
    const transactions = await this.transactionsStore.getSavedState();

    type Address = string;
    type Key = `${Address}:${ChainId}`;
    const map = new Map<Key, { hash: string }>();

    for (const item of transactions) {
      if (!item.hash) {
        continue; // Skip Solana items (no nonce ordering)
      }
      const chainId = normalizeChainId(item.transaction.chainId);
      const key = `${item.transaction.from}:${chainId}` as const;
      map.set(key, { hash: item.hash });
    }

    const wallet = this.options?.getWallet();
    if (!wallet) {
      return;
    }

    for (const [key] of map.entries()) {
      const [address, chainIdStr] = key.split(':');
      const chainId = chainIdStr as ChainId;
      const network = await getNetworkByChainId(chainId);
      if (!network) {
        continue;
      }
      try {
        /**
         * eth_getTransactionCount returns count of confirmed txs.
         * The last confirmed nonce = count - 1.
         * Any local pending tx with nonce <= confirmedNonce is stale and can be purged.
         */
        const { value: count } = await getTransactionCount({
          address,
          network,
          defaultBlock: 'latest',
        });
        const confirmedNonce = count - 1;
        if (confirmedNonce >= 0) {
          this.purgeEntries({ address, chainId, fromNonce: confirmedNonce });
        }
      } catch {
        // RPC might be unavailable, skip this address silently
      }
    }
  }

  private markAsDropped(item: TransactionObject | undefined) {
    if (item) {
      this.transactionsStore.upsertTransaction({ ...item, dropped: true });
    }
  }

  getTransactionsStore() {
    return this.transactionsStore;
  }

  static toTransactionObject(
    result: SignTransactionResult,
    {
      initiator,
      addressAction,
    }: { initiator: string; addressAction?: AnyAddressAction }
  ): TransactionObject {
    const timestamp = Date.now();
    if (result.evm) {
      return {
        transaction: txPlainToEthersV5TransactionResponse(result.evm),
        hash: result.evm.hash,
        initiator,
        timestamp,
        addressAction,
      };
    } else if (result.solana) {
      const solResult = ensureSolanaResult(result);
      return {
        solanaBase64: solResult.tx,
        signature: solResult.signature,
        publicKey: solResult.publicKey,
        signatureStatus: null,
        initiator,
        timestamp,
        addressAction,
      };
    } else {
      throw new Error('Unexpected result type');
    }
  }

  addListeners() {
    emitter.on('transactionSent', (result, { initiator, addressAction }) => {
      const newItem = TransactionService.toTransactionObject(result, {
        initiator,
        addressAction: addressAction ?? undefined,
      });
      if (
        addressAction &&
        isLocalAddressAction(addressAction) &&
        addressAction.relatedTransaction
      ) {
        newItem.relatedTransactionHash = addressAction.relatedTransaction;
      }
      this.transactionsPoller.add([toPollingObj(newItem)]);

      this.transactionsStore.setState((state) =>
        produce(state, (draft) => {
          draft.push(newItem);
        })
      );
      this.startPurgeInterval();
      this.schedulePurgeCheck();
    });

    this.transactionsPoller.emitter.on('evm:mined', (receipt) => {
      const item = this.transactionsStore.getByHash(receipt.hash);
      if (item) {
        invariant(item.hash, 'Item must be evm');
        this.transactionsStore.upsertTransaction({
          ...item,
          receipt: toEthersV5Receipt(receipt),
        });
        if (item.relatedTransactionHash) {
          const relatedItem = this.transactionsStore.getByHash(
            item.relatedTransactionHash
          );
          // NOTE: there still a possible opposite case:
          // There can be a transaction with "relatedTransactionHash" equal to currently mined one,
          // but this might be resolved by transactionsPoller
          this.markAsDropped(relatedItem);
        }
      }
    });
    this.transactionsPoller.emitter.on(
      'solana:mined',
      (signature, signatureStatus) => {
        const item = this.transactionsStore.getBySignature(signature);
        if (item) {
          invariant(item.signature, 'Item must be solana');
          this.transactionsStore.upsertTransaction({
            ...item,
            signatureStatus,
          });
        }
      }
    );
    this.transactionsPoller.emitter.on('evm:dropped', (hash) => {
      const item = this.transactionsStore.getByHash(hash);
      this.markAsDropped(item);
    });
    this.transactionsPoller.emitter.on('solana:dropped', (signature) => {
      const item = this.transactionsStore.getBySignature(signature);
      this.markAsDropped(item);
    });
  }

  async clearPendingTransactions() {
    await this.transactionsStore.ready();
    this.transactionsStore.clearPendingTransactions();
  }
}

export const transactionService = new TransactionService();
