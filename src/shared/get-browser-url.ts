import browser from 'webextension-polyfill';

export function getOnboardingUrl() {
  const url = getIndexUrl();
  url.hash = '/onboarding';
  return url;
}

export function getPopupUrl() {
  const popupUrl = browser.runtime.getManifest().action?.default_popup;
  if (!popupUrl) {
    throw new Error('popupUrl not found');
  }
  return new URL(browser.runtime.getURL(popupUrl));
}

export function getSidepanelUrl() {
  // @ts-ignore extension manifest types
  const sidepanelUrl = browser.runtime.getManifest().side_panel?.default_path;
  if (!sidepanelUrl) {
    throw new Error('sidepanelUrl not found');
  }
  return new URL(browser.runtime.getURL(sidepanelUrl));
}

export function getNotificationUrl() {
  const notificationPath = 'notification.html';
  return new URL(browser.runtime.getURL(notificationPath));
}

export function getIndexUrl() {
  const indexPath = 'index.html';
  return new URL(browser.runtime.getURL(indexPath));
}
