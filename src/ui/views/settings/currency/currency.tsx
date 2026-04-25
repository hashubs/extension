import { Layout } from '@/ui/components/layout';
import { preferenceStore, useCurrency } from '@/ui/features/appearance';
import { Card, CardItem, Input } from '@/ui/ui-kit';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { LuCheck as Check } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { CURRENCIES } from './constants';

export function CurrencyView() {
  const navigate = useNavigate();
  const { currency: defaultCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const onSetDefaultCurrency = (id: string) => {
    preferenceStore.setState({
      ...preferenceStore.getState(),
      currency: id,
    });
  };

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowVirtualizer = useVirtualizer({
    count: filteredCurrencies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  console.log('Virtualizer debug:', {
    count: filteredCurrencies.length,
    virtualItemsCount: virtualItems.length,
    totalSize: rowVirtualizer.getTotalSize(),
    parentHeight: parentRef.current?.offsetHeight,
    parentScrollHeight: parentRef.current?.scrollHeight,
  });

  return (
    <Layout
      title="Currency"
      onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      wrapped={false}
    >
      <Input
        type="search"
        placeholder="Search currencies"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        size="md"
        status="default"
        icon={IoSearchOutline}
      />

      <Card ref={parentRef} className="overflow-y-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const currency = filteredCurrencies[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <CardItem
                  item={{
                    iconNode: (
                      <span className="text-sm font-semibold opacity-75">
                        {currency.currencySymbol}
                      </span>
                    ),
                    iconClassName: 'border border-muted-foreground/10',
                    label: currency.name,
                    subLabel: currency.symbol,
                    iconRight:
                      defaultCurrency.toLowerCase() === currency.id
                        ? Check
                        : undefined,
                    onClick: () => {
                      onSetDefaultCurrency(currency.id);
                      navigate('/settings', { state: { direction: 'back' } });
                    },
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </Layout>
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
