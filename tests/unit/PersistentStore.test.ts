import { describe, it, expect, beforeEach } from '@jest/globals';
import { PersistentStore } from '@/modules/persistent-store';
import { mockLocalStorage, setupStorageMocks } from '../test-utils';

class TestStore extends PersistentStore<{ count: number }> {
  constructor(initialState = { count: 0 }, key = 'test-key') {
    super(initialState, key);
  }
}

describe('PersistentStore', () => {
  const STORE_KEY = 'test-key';

  beforeEach(async () => {
    setupStorageMocks();
    await mockLocalStorage.clear();
  });

  it('should initialize with initial state and then restore from storage', async () => {
    await mockLocalStorage.set({ [STORE_KEY]: { count: 10 } });
    
    const store = new TestStore();
    await store.ready();
    
    expect(store.getState().count).toBe(10);
  });

  it('should use initial state if storage is empty', async () => {
    const store = new TestStore({ count: 5 });
    await store.ready();
    
    expect(store.getState().count).toBe(5);
  });

  it('should save to storage when state changes', async () => {
    const store = new TestStore();
    await store.ready();
    
    store.setState({ count: 42 });
    
    // Give it a tiny bit of time for the 'change' event to propagate and save
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    const saved = await mockLocalStorage.get(STORE_KEY);
    expect(saved[STORE_KEY]).toEqual({ count: 42 });
  });

  it('should throw if getState() is called before ready', () => {
    const store = new TestStore();
    expect(() => store.getState()).toThrow('Do not access getState() before checking ready()');
  });

  it('getSavedState() should wait for ready and return state', async () => {
    await mockLocalStorage.set({ [STORE_KEY]: { count: 100 } });
    const store = new TestStore();
    
    const state = await store.getSavedState();
    expect(state.count).toBe(100);
  });
});
