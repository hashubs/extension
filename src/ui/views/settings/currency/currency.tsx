import { useCurrency } from '@/modules/currency/useCurrency';
import { Header } from '@/ui/components/header';
import { preferenceStore } from '@/ui/features/appearance';
import { Card, CardItem } from '@/ui/ui-kit';
import { LuCheck as Check } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const CURRENCIES = [
  { id: 'usd', name: 'United States Dollar', symbol: 'USD' },
  { id: 'idr', name: 'Indonesian Rupiah', symbol: 'IDR' },
  { id: 'eur', name: 'Euro', symbol: 'EUR' },
  { id: 'gbp', name: 'British Pound', symbol: 'GBP' },
  { id: 'jpy', name: 'Japanese Yen', symbol: 'JPY' },
];

export function CurrencyView() {
  const navigate = useNavigate();
  const { currency: defaultCurrency } = useCurrency();

  const onSetDefaultCurrency = (id: string) => {
    preferenceStore.setState({
      ...preferenceStore.getState(),
      currency: id,
    });
  };

  return (
    <>
      <Header
        title="Currency"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />

      <div className="flex flex-col h-full px-4">
        <p className="text-sm text-muted-foreground mb-4">
          Select primary fiat currency to display prices and valuations.
        </p>
        <Card>
          {CURRENCIES.map((currency) => (
            <CardItem
              key={currency.id}
              item={{
                label: currency.name,
                subLabel: currency.symbol,
                iconRight:
                  defaultCurrency.toLowerCase() === currency.id
                    ? Check
                    : undefined,
                onClick: () => onSetDefaultCurrency(currency.id),
              }}
            />
          ))}
        </Card>
      </div>
    </>
  );
}

export const CurrencyBadge = () => {
  const { currency } = useCurrency();
  return (
    <span className="text-xs font-medium text-foreground/60 uppercase">
      {currency}
    </span>
  );
};
