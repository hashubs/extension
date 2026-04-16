import { preferenceStore } from '@/ui/features/appearance';
import { useCurrency } from '@/modules/currency/useCurrency';
import { Button } from '@/ui/ui-kit';

export function CurrencySelector() {
  const { currency } = useCurrency();
  const currencies = ['usd', 'idr', 'eur', 'gbp'];

  return (
    <div className="flex gap-2">
      {currencies.map((c) => (
        <Button
          key={c}
          variant={currency.toLowerCase() === c ? 'default' : 'secondary'}
          className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider"
          onClick={() => preferenceStore.setState({ 
            ...preferenceStore.getState(),
            currency: c 
          })}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}
