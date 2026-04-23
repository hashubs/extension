import { isEthereumAddress } from '@/shared/is-ethereum-address';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { normalizeAddress } from '@/shared/normalize-address';
import { MaskedBareWallet } from '@/shared/types/bare-wallet';
import { formatFiat } from '@/shared/units/format-fiat';
import { BlockieAddress } from '@/ui/components/blockie';
import { Header } from '@/ui/components/header';
import {
  DerivedWallets,
  prepareWalletsToImport,
  suggestInitialWallets,
} from '@/ui/components/ImportWallet/Mnemonic/helpers';
import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
import { useAllExistingMnemonicAddresses } from '@/ui/hooks/request/internal/useWallet';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { useToggledValues } from '@/ui/hooks/useToggledValues';
import { truncateAddress } from '@/ui/lib/utils';
import {
  AnimatedCheckmark,
  Button,
  Card,
  CardItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import groupBy from 'lodash/groupBy';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SiEthereum, SiSolana } from 'react-icons/si';

import { useMnenomicPhraseForLocation } from '@/ui/hooks/request/internal/useMnemonicLocal';
import { MemoryLocationState } from '@/ui/shared/memoryLocationState';

const ECOSYSTEM_META = {
  evm: {
    label: 'Ethereum wallets',
    Icon: SiEthereum,
    iconSize: 22,
  },
  solana: {
    label: 'Solana wallets',
    Icon: SiSolana,
    iconSize: 24,
  },
};

function VirtualizedWalletList({
  active,
  rest,
  existingAddressesSet,
  values,
  toggleValue,
  getValueAddress,
}: {
  active: MaskedBareWallet[];
  rest: MaskedBareWallet[];
  existingAddressesSet: Set<string>;
  values: Set<string>;
  toggleValue: (address: string) => void;
  getValueAddress: (address: string) => string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const flatItems = useMemo(() => {
    const items: Array<
      | { type: 'header'; label: string }
      | { type: 'wallet'; wallet: MaskedBareWallet }
    > = [];
    if (active.length > 0) {
      items.push({ type: 'header', label: 'Active wallets' });
      active.forEach((w) => items.push({ type: 'wallet', wallet: w }));
    }
    if (rest.length > 0) {
      items.push({ type: 'header', label: 'Inactive wallets' });
      rest.forEach((w) => items.push({ type: 'wallet', wallet: w }));
    }
    return items;
  }, [active, rest]);

  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (flatItems[index].type === 'header' ? 32 : 56),
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto no-scrollbar">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = flatItems[virtualItem.index];

          if (item.type === 'header') {
            return (
              <div
                key={virtualItem.key}
                className="absolute top-0 left-0 w-full flex items-center bg-background z-10"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <h4 className="text-xs font-semibold text-muted-foreground uppercase px-4">
                  {item.label}
                </h4>
              </div>
            );
          }

          const wallet = item.wallet;
          const isExisting = existingAddressesSet.has(
            normalizeAddress(wallet.address)
          );

          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CardItem
                item={{
                  label: truncateAddress(wallet.address),
                  subLabel: isExisting
                    ? 'Already imported'
                    : getValueAddress(wallet.address),
                  disabled: isExisting,
                  iconNode: (
                    <BlockieAddress
                      address={wallet.address}
                      size={22}
                      borderRadius={4}
                    />
                  ),
                  onClick: isExisting
                    ? undefined
                    : () => toggleValue(wallet.address),
                  rightElement: (
                    <AnimatedCheckmark
                      animate
                      checked={values.has(wallet.address)}
                      size={20}
                      checkedColor="var(--muted-foreground)"
                      uncheckedColor="var(--surface-container-highest)"
                    />
                  ),
                  className: 'hover:rounded-none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectMoreWalletsDialog({
  isOpen,
  onOpenChange,
  wallets,
  existingAddressesSet,
  activeWallets,
  initialValues,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: Set<string>;
  wallets: DerivedWallets | null;
  existingAddressesSet: Set<string>;
  activeWallets: Record<string, { totalValue?: number }>;
  onSubmit: (values: Set<string>) => void;
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const groupedByEcosystem = useMemo(() => {
    const toActiveStatus = ({ address }: { address: string }) =>
      (activeWallets[normalizeAddress(address)]?.totalValue ?? 0) > 0
        ? 'active'
        : 'rest';

    type Grouped = Record<'active' | 'rest', MaskedBareWallet[] | undefined>;
    return wallets?.reduce((acc, config) => {
      const key = `${config.curve}:${config.pathType}`;
      acc[key] = groupBy(config.wallets, toActiveStatus) as Grouped;
      return acc;
    }, {} as { [key: string]: Grouped });
  }, [activeWallets, wallets]);

  const [curve, setCurve] = useState<'ecdsa' | 'ed25519'>('ecdsa');
  const ethPathType = 'bip44';
  type SolanaPathType =
    | 'solanaBip44Change'
    | 'solanaBip44'
    | 'solanaDeprecated';
  const [solPathType, setSolPathType] =
    useState<SolanaPathType>('solanaBip44Change');

  const [values, toggleValue] = useToggledValues(initialValues);

  if (!groupedByEcosystem) {
    return null;
  }

  const filter =
    curve === 'ecdsa' ? `${curve}:${ethPathType}` : `${curve}:${solPathType}`;
  const group = groupedByEcosystem[filter];

  const getValueAddress = (address: string) => {
    const lookupKey = isEthereumAddress(address)
      ? address.toLowerCase()
      : address;
    const totalValue = activeWallets?.[lookupKey]?.totalValue ?? 0;
    return formatFiat(convertUsdToFiat(totalValue), defaultCurrency);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0">
        <Header
          title="Select Another Wallet"
          onBack={() => onOpenChange(false)}
        />

        <Tabs
          value={curve}
          onValueChange={(v) => setCurve(v as 'ecdsa' | 'ed25519')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-y border-muted-foreground/10 px-4 py-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="ecdsa">EVM</TabsTrigger>
              <TabsTrigger value="ed25519">Solana</TabsTrigger>
            </TabsList>

            {curve === 'ed25519' && (
              <Select
                value={solPathType}
                onValueChange={(v) => setSolPathType(v as SolanaPathType)}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Path Type" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="solanaBip44Change">Bip44Change</SelectItem>
                  <SelectItem value="solanaBip44">Bip44</SelectItem>
                  <SelectItem value="solanaDeprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="ecdsa" className="flex-1 flex flex-col min-h-0">
            <VirtualizedWalletList
              active={group?.active || []}
              rest={group?.rest || []}
              existingAddressesSet={existingAddressesSet}
              values={values}
              toggleValue={toggleValue}
              getValueAddress={getValueAddress}
            />
          </TabsContent>

          <TabsContent value="ed25519" className="flex-1 flex flex-col min-h-0">
            <VirtualizedWalletList
              active={group?.active || []}
              rest={group?.rest || []}
              existingAddressesSet={existingAddressesSet}
              values={values}
              toggleValue={toggleValue}
              getValueAddress={getValueAddress}
            />
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-muted-foreground/10 mt-auto">
          <Button
            size="md"
            variant="primary"
            disabled={values.size === 0}
            onClick={() => {
              onSubmit(values);
              onOpenChange(false);
            }}
          >
            Continue{values.size ? ` (${values.size})` : null}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WalletDiscoveryContent({
  wallets,
  activeWallets,
  onBack,
  onSuccess,
}: {
  wallets: DerivedWallets;
  activeWallets: Record<string, { totalValue?: number }>;
  onBack: () => void;
  onSuccess: (selectedWallets: MaskedBareWallet[]) => void;
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();
  const existingAddresses = useAllExistingMnemonicAddresses();
  const existingAddressesSet = useMemo(
    () => new Set(existingAddresses),
    [existingAddresses]
  );

  const suggestedWallets = useMemo(
    () =>
      suggestInitialWallets({
        wallets,
        activeWallets: activeWallets || {},
        existingAddressesSet,
      }),
    [activeWallets, existingAddressesSet, wallets]
  );

  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(
    () => {
      return new Set(
        suggestedWallets.groups.flatMap((group) =>
          group.wallets.map((w) => w.address)
        )
      );
    }
  );

  useEffect(() => {
    setSelectedAddresses((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const addr of next) {
        if (existingAddressesSet.has(normalizeAddress(addr))) {
          next.delete(addr);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [existingAddressesSet]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const displayGroups = useMemo(() => {
    const suggested = suggestedWallets.groups.flatMap((g) => g.wallets);
    const suggestedAddresses = new Set(suggested.map((w) => w.address));

    const allWallets = wallets.flatMap((c) =>
      c.wallets.map((w) => ({ ...w, curve: c.curve }))
    );
    const allByAddress = new Map(allWallets.map((w) => [w.address, w]));

    const visibleAddresses = new Set([
      ...suggestedAddresses,
      ...selectedAddresses,
    ]);

    const visibleWallets = Array.from(visibleAddresses)
      .map((addr) => allByAddress.get(addr))
      .filter((w): w is NonNullable<typeof w> => !!w);

    const eth = visibleWallets.filter((w) => w.curve === 'ecdsa');
    const sol = visibleWallets.filter((w) => w.curve === 'ed25519');

    return [
      { ecosystem: 'evm' as const, wallets: eth },
      { ecosystem: 'solana' as const, wallets: sol },
    ];
  }, [suggestedWallets, selectedAddresses, wallets]);

  const handleSelect = (selectedValues: Set<string>) => {
    const selectedWallets = wallets
      .flatMap((c) => c.wallets)
      .filter(
        (wallet) =>
          selectedValues.has(wallet.address) &&
          !existingAddressesSet.has(normalizeAddress(wallet.address))
      );

    onSuccess(selectedWallets);
  };

  const getValueAddress = (address: string) => {
    const lookupKey = isEthereumAddress(address)
      ? address.toLowerCase()
      : address;
    const totalValue = activeWallets?.[lookupKey]?.totalValue ?? 0;
    return formatFiat(convertUsdToFiat(totalValue), defaultCurrency);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Header title="Wallets Ready to Import" onBack={onBack} />

      <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <div className="text-center space-y-1">
          {suggestedWallets.activeCount ? (
            <h3 className="text-lg font-bold">
              We found{' '}
              {suggestedWallets.activeCount === 1
                ? '1 active wallet'
                : `${suggestedWallets.activeCount} active wallets`}
            </h3>
          ) : (
            <>
              <h3 className="text-lg font-bold">
                We didn’t find any active wallets
              </h3>
              <p className="text-sm text-muted-foreground">
                Start with these wallets associated with your recovery phrase
              </p>
            </>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {displayGroups
            .filter((group) => group.wallets.length > 0)
            .map((group) => {
              const meta = ECOSYSTEM_META[group.ecosystem as 'evm' | 'solana'];
              return (
                <Card
                  key={group.ecosystem}
                  title={meta.label}
                  titleIconNode={
                    <meta.Icon
                      style={{ width: meta.iconSize, height: meta.iconSize }}
                    />
                  }
                  className="bg-transparent"
                >
                  {group.wallets.map((wallet) => {
                    const isExisting = existingAddressesSet.has(
                      normalizeAddress(wallet.address)
                    );
                    return (
                      <CardItem
                        key={wallet.address}
                        item={{
                          label: truncateAddress(wallet.address),
                          subLabel: isExisting
                            ? 'Already imported'
                            : getValueAddress(wallet.address),
                          disabled: isExisting,
                          iconNode: (
                            <BlockieAddress
                              address={wallet.address}
                              size={22}
                              borderRadius={4}
                            />
                          ),
                          onClick: isExisting
                            ? undefined
                            : () => {
                                setSelectedAddresses((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(wallet.address))
                                    next.delete(wallet.address);
                                  else next.add(wallet.address);
                                  return next;
                                });
                              },
                          rightElement: (
                            <AnimatedCheckmark
                              animate
                              checked={selectedAddresses.has(wallet.address)}
                              size={20}
                              checkedColor="var(--muted-foreground)"
                              uncheckedColor="var(--surface-container-highest)"
                            />
                          ),
                        }}
                      />
                    );
                  })}
                </Card>
              );
            })}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsSheetOpen(true)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Select Another Wallet
          </Button>
          <Button
            variant="primary"
            disabled={selectedAddresses.size === 0}
            onClick={() => handleSelect(selectedAddresses)}
          >
            Continue{' '}
            {selectedAddresses.size ? ` (${selectedAddresses.size})` : ''}
          </Button>
        </div>
      </div>

      <SelectMoreWalletsDialog
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialValues={selectedAddresses}
        wallets={wallets}
        activeWallets={activeWallets || {}}
        existingAddressesSet={existingAddressesSet}
        onSubmit={(v) => setSelectedAddresses(new Set(v))}
      />
    </div>
  );
}

export function WalletDiscoveryView({
  locationStateStore,
  onBack,
  onSuccess,
  onSessionExpired,
}: {
  locationStateStore: MemoryLocationState;
  onBack: () => void;
  onSuccess: (selectedWallets: MaskedBareWallet[]) => void;
  onSessionExpired: () => void;
}) {
  const {
    phrase,
    isLoading: isLoadingPhrase,
    isError: isErrorPhrase,
    error: errorPhrase,
  } = useMnenomicPhraseForLocation({
    locationStateStore,
  });

  const {
    data: scanData,
    isLoading: isLoadingScan,
    isError: isErrorScan,
    error: errorScan,
  } = useQuery({
    queryKey: ['prepareWalletsToImport', phrase],
    queryFn: async () => {
      if (!phrase) return;
      return prepareWalletsToImport(phrase);
    },
    enabled: Boolean(phrase),
  });

  useEffect(() => {
    if (
      (isErrorPhrase && isSessionExpiredError(errorPhrase)) ||
      (isErrorScan && isSessionExpiredError(errorScan))
    ) {
      onSessionExpired();
    }
  }, [isErrorPhrase, errorPhrase, isErrorScan, errorScan, onSessionExpired]);

  const { data: activeWallets, isLoading: isLoadingPortfolio } =
    usePortfolioValues(scanData?.addressesToCheck || []);

  const wallets = scanData?.derivedWallets;

  if (isLoadingPhrase || isLoadingScan || isLoadingPortfolio || !wallets) {
    // Return null or a simple placeholder while loading
    // The previous ScanView already showed a processing state
    return null;
  }

  return (
    <WalletDiscoveryContent
      wallets={wallets}
      activeWallets={activeWallets || {}}
      onBack={onBack}
      onSuccess={onSuccess}
    />
  );
}
