import { Layout } from '@/ui/components/layout';
import {
  PinnedSearchBody,
  PinnedSearchHeader,
} from '@/ui/components/Pinnedsearch/Pinnedsearch';
import { preferenceStore, useCurrency } from '@/ui/features/appearance';
import { usePinnedSearch } from '@/ui/hooks/usePinnedSearch';
import { CardItem, Input } from '@/ui/ui-kit';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { LuCheck as Check } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { CURRENCIES } from './constants';

export function CurrencyView() {
  const navigate = useNavigate();
  const { currency: defaultCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const { searchPinned, searchRef, scrollElement, setScrollElement } =
    usePinnedSearch();

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
    getScrollElement: () => scrollElement,
    estimateSize: () => 64,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <Layout
      ref={setScrollElement}
      onBack={() => navigate(-1)}
      renderHeaderElement={
        <PinnedSearchHeader searchPinned={searchPinned} title="Currency">
          <Input
            type="search"
            placeholder="Search currencies"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
            status="default"
            icon={IoSearchOutline}
          />
        </PinnedSearchHeader>
      }
    >
      <PinnedSearchBody
        searchPinned={searchPinned}
        searchRef={searchRef}
        className="px-0"
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
      </PinnedSearchBody>

      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const currency = filteredCurrencies[virtualItem.index];
          const isActive = defaultCurrency.toLowerCase() === currency.id;
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
                    <span className="text-xs font-semibold opacity-75">
                      {currency.currencySymbol}
                    </span>
                  ),
                  iconClassName: 'border border-muted-foreground/10',
                  label: currency.name,
                  subLabel: currency.symbol,
                  className:
                    'hover:rounded-lg hover:bg-transparent px-0 hover:px-2 py-2 transition-all duration-200',
                  iconRight: isActive ? Check : undefined,
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
