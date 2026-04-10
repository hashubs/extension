import { jest } from '@jest/globals';
import { webcrypto } from 'node:crypto';
import browser from 'webextension-polyfill';

class MockStorage {
  private data: Record<string, any> = {};

  async get(keys: string | string[] | Record<string, any> | null) {
    if (keys === null) {
      return { ...this.data };
    }
    if (typeof keys === 'string') {
      return { [keys]: this.data[keys] };
    }
    if (Array.isArray(keys)) {
      return keys.reduce((acc, key) => {
        acc[key] = this.data[key];
        return acc;
      }, {} as Record<string, any>);
    }
    // Record version
    return Object.keys(keys).reduce((acc, key) => {
      acc[key] = this.data[key] !== undefined ? this.data[key] : keys[key];
      return acc;
    }, {} as Record<string, any>);
  }

  async set(items: Record<string, any>) {
    Object.assign(this.data, items);
  }

  async remove(keys: string | string[]) {
    if (typeof keys === 'string') {
      delete this.data[keys];
    } else {
      keys.forEach((key) => delete this.data[key]);
    }
  }

  async clear() {
    this.data = {};
  }
}

export const mockLocalStorage = new MockStorage();
export const mockSessionStorage = new MockStorage();

/** 
 * Use this to initialize the mocks at the beginning of each test file 
 * or in a beforeEach if needed.
 */
export function setupStorageMocks() {
  const local = browser.storage.local as any;
  local.get = jest.fn((...args: any[]) => mockLocalStorage.get(args[0]));
  local.set = jest.fn((items: any) => mockLocalStorage.set(items));
  local.remove = jest.fn((keys: any) => mockLocalStorage.remove(keys));
  local.clear = jest.fn(() => mockLocalStorage.clear());

  const session = browser.storage.session as any;
  session.get = jest.fn((...args: any[]) => mockSessionStorage.get(args[0]));
  session.set = jest.fn((items: any) => mockSessionStorage.set(items));
  session.remove = jest.fn((keys: any) => mockSessionStorage.remove(keys));
  session.clear = jest.fn(() => mockSessionStorage.clear());
}

// Global crypto mock setup for Node environment
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
  });
}

export { webcrypto };
