export interface CurrencyRPC {
  getExchangeRates(arg: {
    params: { baseCurrency: string };
  }): Promise<Record<string, number>>;
}
