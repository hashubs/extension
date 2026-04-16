import { ApiClient } from '@/shared/request/api.client';
import type { CurrencyRPC } from '@/shared/types/currency';

const POLL_INTERVAL = 10 * 60 * 1000;
const REFETCH_THRESHOLD = 5 * 60 * 1000;

export class CurrencyController implements CurrencyRPC {
  private rates: Record<string, Record<string, number>> = {};
  private fetchedAt: Record<string, number> = {};
  private pollIntervalId: NodeJS.Timeout | null = null;
  private activeBaseCurrencies: Set<string> = new Set(['usd']);

  constructor() {
    this.startPolling();
  }

  startPolling() {
    this.poll();
    if (!this.pollIntervalId) {
      this.pollIntervalId = setInterval(() => {
        this.poll();
      }, POLL_INTERVAL);
    }
  }

  stopPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private async poll() {
    for (const baseCurrency of this.activeBaseCurrencies) {
      await this.fetchRates(baseCurrency);
    }
  }

  private async fetchRates(baseCurrency: string) {
    try {
      const response = await ApiClient.exchangeRates({
        baseCurrency: baseCurrency.toLowerCase(),
      });

      if (response) {
        const transformedRates: Record<string, number> = {};
        Object.entries(response).forEach(([key, rate]) => {
          transformedRates[key.toLowerCase()] = rate.value;
        });

        this.rates[baseCurrency.toLowerCase()] = transformedRates;
        this.fetchedAt[baseCurrency.toLowerCase()] = Date.now();
        console.log(
          `[CurrencyController] Berhasil polling kurs untuk: ${baseCurrency}`
        );
      }
    } catch (error) {
      console.error(
        `[CurrencyController] Gagal polling kurs untuk ${baseCurrency}:`,
        error
      );
    }
  }

  async getExchangeRates({
    params: { baseCurrency },
  }: {
    params: { baseCurrency: string };
  }) {
    const currency = baseCurrency.toLowerCase();
    this.activeBaseCurrencies.add(currency);

    const cachedRates = this.rates[currency];
    const lastFetch = this.fetchedAt[currency] || 0;

    if (!cachedRates || Date.now() - lastFetch > REFETCH_THRESHOLD) {
      if (!cachedRates) {
        await this.fetchRates(currency);
      } else {
        this.fetchRates(currency);
      }
    }

    return this.rates[currency] || {};
  }
}
