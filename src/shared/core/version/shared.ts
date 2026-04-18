import { BrowserStorage } from '@/background/webapis/storage';
import browser from 'webextension-polyfill';

export const STORAGE_VERSION = 0.1;

export async function getCurrentVersion() {
  const saved = await BrowserStorage.get<number | string>('STORAGE_VERSION');
  return saved ?? 'no-version';
}

export const checkExisingData = async () =>
  Boolean(await BrowserStorage.get('currentUser'));

export async function eraseAndUpdateToLatestVersion() {
  await browser.storage.local.clear();
  await BrowserStorage.set('STORAGE_VERSION', STORAGE_VERSION);
}
