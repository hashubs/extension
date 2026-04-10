import { Store } from 'store-unit';
import { BrowserStorage } from '@/background/webapis/storage';

type Options<S> = {
  retrieve: (key: string) => Promise<S | undefined>;
  save: (key: string, value: S) => Promise<void>;
};

export class PersistentStore<T> extends Store<T> {
  static async readSavedState<T>(key: string) {
    return BrowserStorage.get<T>(key);
  }

  protected key: string;
  protected isReady: boolean;
  private readyPromise: Promise<void>;

  public options: Options<T>;
  public defaultOptions: Options<T> = {
    retrieve: <S>(key: string) => PersistentStore.readSavedState<S>(key),
    save: (key, value) => BrowserStorage.set(key, value),
  };

  constructor(initialState: T, key: string, options: Partial<Options<T>> = {}) {
    super(initialState);
    this.key = key;
    this.options = { ...this.defaultOptions, ...options };
    this.isReady = false;
    this.readyPromise = this.restore();
    this.on('change', (state) => {
      if (this.isReady) {
        this.options.save(this.key, state);
      }
    });
  }

  getState() {
    if (!this.isReady) {
      throw new Error('Do not access getState() before checking ready()');
    }
    return super.getState();
  }

  setState(...args: Parameters<Store<T>['setState']>) {
    return super.setState(...args);
  }

  async restore() {
    const saved = await this.options.retrieve(this.key);
    if (saved) {
      super.setState(saved);
    }
    this.isReady = true;
  }

  async ready(): Promise<void> {
    return this.isReady ? Promise.resolve() : this.readyPromise;
  }

  async getSavedState() {
    await this.ready();
    return this.getState();
  }
}
