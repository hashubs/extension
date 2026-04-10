import browser from 'webextension-polyfill';
import { getOnboardingUrl } from './get-browser-url';

export function openOnboarding() {
  const onboardingUrl = getOnboardingUrl();
  browser.tabs.create({ url: onboardingUrl.toString() });
}
