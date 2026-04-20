import exchangeData from './fiat.json';

export const CURRENCIES = Object.entries(exchangeData).map(([id, data]) => ({
  id,
  name: data.name,
  symbol: data.ticker.toUpperCase(),
  currencySymbol: data.symbol,
}));
