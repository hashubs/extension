import { BrowserStorage } from '@/background/webapis/storage';
import { dataToModel } from '@/modules/ethereum/transactions/model';
import type { StoredTransactions } from '@/modules/ethereum/transactions/types';
import { Store } from 'store-unit';
import browser from 'webextension-polyfill';

class LocalTransactionsStore extends Store<StoredTransactions> {
  constructor() {
    super([]);
    this.init();
  }

  async init() {
    const transactions: StoredTransactions | undefined =
      await BrowserStorage.get('transactions');
    if (transactions) {
      this.setState(dataToModel(transactions));
    }
    browser.storage.onChanged.addListener((changes, _namespace) => {
      if ('transactions' in changes) {
        const newValue: StoredTransactions =
          changes.transactions.newValue || [];
        this.setState(dataToModel(newValue));
      }
    });
  }
}

export const localTransactionsStore = new LocalTransactionsStore();
Object.assign(window, { localTransactionsStore });
