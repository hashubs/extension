import browser from 'webextension-polyfill';
import { getIndexUrl } from './get-browser-url';
import { setUrlContext } from './setUrlContext';

export function openOnboarding() {
  const indexUrl = getIndexUrl();
  indexUrl.hash = '/onboarding';
  setUrlContext(indexUrl.searchParams, {
    appMode: 'onboarding',
    windowType: 'tab',
  });
  browser.tabs.create({ url: indexUrl.toString() });
}
