// @ts-ignore parcel syntax for bundle url
import workerPath from 'url:./mnemonic-n-derivation.worker';
import type { Params, Result } from './mnemonic-n-derivation.worker';

export async function mnemonicNDerivation(params: Params) {
  return new Promise<Result>((resolve, reject) => {
    const worker = new Worker(workerPath);
    worker.postMessage(params);
    worker.onmessage = (event: MessageEvent<Result>) => {
      resolve(event.data);
    };
    worker.onerror = (event) => {
      reject(event.message);
    };
  });
}
