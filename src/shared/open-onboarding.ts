import { getPopupUrl } from 'src/shared/get-popup-url';
import browser from 'webextension-polyfill';
import { setUrlContext } from './set-url-context';

export function openOnboarding() {
  const popupUrl = getPopupUrl();
  popupUrl.hash = '/onboarding';
  setUrlContext(popupUrl.searchParams, {
    appMode: 'onboarding',
    windowType: 'tab',
  });
  browser.tabs.create({ url: popupUrl.toString() });
}
