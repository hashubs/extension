import { webcrypto } from 'node:crypto';


// Global crypto mock setup for Node environment
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
  });
}


// individual tests will call setupStorageMocks(jest) as needed 
// because jest is not global here in ESM setupFilesAfterEnv
