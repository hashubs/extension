import { INTERNAL_ORIGIN } from '@/background/constants';
import { prepareForHref } from '@/shared/prepare-for-href';
import { setUrlContext } from '@/shared/set-url-context';
import type { YounoApiClient } from '@/shared/youno-api/youno-api-bare';
import { YounoAPI as YounoAPIBackground } from '@/shared/youno-api/youno-api.background';
import { knownDappOrigins } from '@/shared/dapps/known-dapps';
import browser from 'webextension-polyfill';

export type DappSecurityStatus =
  | 'loading'
  | 'phishing'
  | 'ok'
  | 'unknown'
  | 'error';

class PhishingDefence {
  private whitelistedWebsites: Set<string>;
  private websiteStatus: Record<string, DappSecurityStatus> = {};
  apiClient: YounoApiClient;

  constructor(apiClient: YounoApiClient) {
    this.apiClient = apiClient;
    this.whitelistedWebsites = new Set(knownDappOrigins);
  }

  private getSafeOrigin(url: string) {
    const safeUrl = url ? prepareForHref(url) : null;
    return safeUrl ? safeUrl.origin : null;
  }

  async blockOriginWithWarning(origin: string) {
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab?.url && this.getSafeOrigin(tab.url) === origin) {
        const rawPopupUrl = browser.runtime.getManifest().action?.default_popup;
        if (!rawPopupUrl) {
          return;
        }
        const popupUrl = new URL(browser.runtime.getURL(rawPopupUrl));
        popupUrl.hash = `/phishing-warning?url=${origin}`;
        setUrlContext(popupUrl.searchParams, { windowType: 'tab' });
        browser.tabs.update(tab.id, { url: popupUrl.toString() });
      }
    }
  }

  async ignoreDappSecurityWarning(url: string) {
    const origin = this.getSafeOrigin(url);
    if (origin) {
      this.whitelistedWebsites.add(origin);
    }
  }

  async checkDapp(
    url?: string | null
  ): Promise<{ status: DappSecurityStatus; isWhitelisted: boolean }> {
    if (url === INTERNAL_ORIGIN) {
      return {
        status: 'ok',
        isWhitelisted: false,
      };
    }
    const origin = url ? this.getSafeOrigin(url) : null;
    if (!origin || !url) {
      return {
        status: 'unknown',
        isWhitelisted: false,
      };
    }

    const isWhitelisted = this.whitelistedWebsites.has(origin);
    const existingStatus = this.websiteStatus[origin] || 'unknown';

    if (isWhitelisted) {
      return {
        status: existingStatus === 'unknown' ? 'ok' : existingStatus,
        isWhitelisted,
      };
    }
    this.websiteStatus[origin] = 'loading';

    try {
      const result = await this.apiClient.securityCheckUrl({ url });
      const status = result.data?.flags.isMalicious ? 'phishing' : 'ok';
      this.websiteStatus[origin] = status;

      return { status, isWhitelisted };
    } catch {
      this.websiteStatus[origin] = 'error';
      return { status: 'error', isWhitelisted };
    }
  }

  async getDappSecurityStatus(
    url?: string | null
  ): Promise<{ status: DappSecurityStatus; isWhitelisted: boolean }> {
    if (url === INTERNAL_ORIGIN) {
      return {
        status: 'ok',
        isWhitelisted: false,
      };
    }

    const origin = url ? this.getSafeOrigin(url) : null;
    const isWhitelisted = origin ? this.whitelistedWebsites.has(origin) : false;

    if (origin && !isWhitelisted) {
      const status = this.websiteStatus[origin] || 'unknown';

      // TRIGGER: If status is unknown or missing, initiate investigation in background
      if (status === 'unknown') {
        this.checkDapp(url).catch((e) =>
          console.error('[Phishing Defence] checkDapp background error:', e)
        );
      } else if (status === 'error') {
        this.checkDapp(url).catch((e) =>
          console.error('[Phishing Defence] checkDapp re-trigger error:', e)
        );
      }
    }

    const currentStatus = (origin && this.websiteStatus[origin]) || 'unknown';

    return {
      status: isWhitelisted && currentStatus === 'unknown' ? 'ok' : currentStatus,
      isWhitelisted,
    };
  }
}

/** TODO: should this be instantiated in Wallet/Wallet.ts? */
export const phishingDefenceService = new PhishingDefence(YounoAPIBackground);
