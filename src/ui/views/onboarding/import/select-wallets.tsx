import { BlockieAddress } from '@/ui/components/blockie';
import { Processing as ScanningWallet } from '@/ui/components/processing';
import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
import {
  AnimatedCheckmark,
  Button,
  Card,
  CardItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/ui-kit';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImportWallet } from './import-context';

import { isSolanaAddress } from '@/modules/solana/shared';
import { invariant } from '@/shared/invariant';
import { isEthereumAddress } from '@/shared/is-ethereum-address';
import { normalizeAddress } from '@/shared/normalize-address';
import { formatPriceValue } from '@/shared/units/format-price-value';
import { wait } from '@/shared/wait';
import { encodeForMasking } from '@/shared/wallet/encode-locally';
import {
  prepareWalletsToImport,
  suggestInitialWallets,
} from '@/ui/components/ImportWallet/Mnemonic/helpers';
import { useAllExistingMnemonicAddresses } from '@/ui/hooks/request/internal/useAllExistingAddresses';
import { truncateAddress } from '@/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';
import EcosystemEthereumIcon from 'jsx:src/ui/assets/ecosystem-ethereum.svg';
import EcosystemSolanaIcon from 'jsx:src/ui/assets/ecosystem-solana.svg';
import { FaChevronDown } from 'react-icons/fa6';
import { SectionHeader } from '../section-header';

type WalletEcosystem = 'evm' | 'solana';

interface WalletItem {
  address: string;
  ecosystem: WalletEcosystem;
}

interface WalletGroup {
  ecosystem: WalletEcosystem;
  wallets: WalletItem[];
}

const MAX_MORE_PER_ECOSYSTEM = 10;

const ECOSYSTEM_META: Record<
  WalletEcosystem,
  {
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    iconSize: number;
  }
> = {
  evm: {
    label: 'Ethereum wallets',
    Icon: EcosystemEthereumIcon,
    iconSize: 24,
  },
  solana: {
    label: 'Solana wallets',
    Icon: EcosystemSolanaIcon,
    iconSize: 28,
  },
};

import { ONBOARDING_ROUTES } from '../routes';

export function SelectWallets() {
  const {
    selectedAddresses,
    setSelectedAddresses,
    toggleAddress,
    phrase: mnemonic,
  } = useImportWallet();

  const navigate = useNavigate();

  invariant(mnemonic, 'Mnemonic is required');

  const { data, isLoading: isDeriving } = useQuery({
    queryKey: ['prepareWalletsToImport', mnemonic],
    queryFn: async () => {
      await wait(500);
      const phrase = encodeForMasking(mnemonic);
      return prepareWalletsToImport(phrase);
    },
    enabled: Boolean(mnemonic),
  });

  const { data: activeWallets, isLoading: isCheckingActivity } =
    usePortfolioValues(data?.addressesToCheck || []);

  const isScanning = !!isDeriving || !!isCheckingActivity;
  const wallets = data?.derivedWallets || [];

  const existingAddresses = useAllExistingMnemonicAddresses();
  const existingAddressesSet = useMemo(
    () => new Set(existingAddresses),
    [existingAddresses]
  );

  const suggestedWallets = useMemo(
    () =>
      suggestInitialWallets({
        wallets,
        activeWallets: activeWallets ?? {},
        existingAddressesSet,
      }),
    [activeWallets, existingAddressesSet, wallets]
  );

  const moreWallets = useMemo(() => {
    if (!wallets.length) return { groups: [] as WalletGroup[] };

    const suggestedAddresses = new Set(
      suggestedWallets.groups.flatMap((g) => g.wallets.map((w) => w.address))
    );
    const allDerived = wallets.flatMap((c) => c.wallets);
    const remaining = allDerived.filter(
      (w) =>
        !existingAddressesSet.has(normalizeAddress(w.address)) &&
        !suggestedAddresses.has(w.address)
    );

    const active = activeWallets ?? {};
    const sortedRemaining = [...remaining].sort((a, b) => {
      const aVal = active[normalizeAddress(a.address)]?.totalValue ?? 0;
      const bVal = active[normalizeAddress(b.address)]?.totalValue ?? 0;
      const aActive = aVal > 0 ? 1 : 0;
      const bActive = bVal > 0 ? 1 : 0;
      return bActive - aActive;
    });

    const evmWallets: WalletItem[] = sortedRemaining
      .filter((w) => isEthereumAddress(w.address))
      .slice(0, MAX_MORE_PER_ECOSYSTEM)
      .map((w) => ({ address: w.address, ecosystem: 'evm' }));

    const solanaWallets: WalletItem[] = sortedRemaining
      .filter((w) => isSolanaAddress(w.address))
      .slice(0, MAX_MORE_PER_ECOSYSTEM)
      .map((w) => ({ address: w.address, ecosystem: 'solana' }));

    return {
      groups: [
        { ecosystem: 'evm' as WalletEcosystem, wallets: evmWallets },
        { ecosystem: 'solana' as WalletEcosystem, wallets: solanaWallets },
      ].filter((g) => g.wallets.length > 0),
    };
  }, [wallets, existingAddressesSet, suggestedWallets, activeWallets]);

  useEffect(() => {
    if (!isScanning && suggestedWallets.groups.length > 0) {
      const addresses = suggestedWallets.groups.flatMap((g) =>
        g.wallets.map((w) => w.address)
      );
      if (selectedAddresses.size === 0 && addresses.length > 0) {
        setSelectedAddresses(new Set(addresses));
      }
    }
  }, [isScanning, suggestedWallets]);

  const moreWalletsByEcosystem = useMemo(
    () =>
      Object.fromEntries(
        moreWallets.groups.map((g) => [g.ecosystem, g.wallets])
      ) as Record<WalletEcosystem, WalletGroup['wallets']>,
    [moreWallets]
  );

  const selectedCount = selectedAddresses.size;

  function handleContinue() {
    if (selectedCount === 0) return;
    navigate(`../${ONBOARDING_ROUTES.IMPORT.PASSWORD}`);
  }

  const getValueAddress = (address: string) => {
    const lookupKey = isEthereumAddress(address)
      ? address.toLowerCase()
      : address;

    const totalValue = activeWallets?.[lookupKey]?.totalValue ?? 0;

    return formatPriceValue(totalValue, 'en-US', 'USD');
  };

  if (!mnemonic) return null;

  if (isScanning) {
    return (
      <ScanningWallet
        title="Scanning your wallets"
        description="Please wait while we scan your wallets..."
      />
    );
  }

  return (
    <>
      <SectionHeader
        title="We found your wallets"
        description="Select wallets from your recovery phrase to import."
      />

      <div className="flex flex-col mb-6 shrink-0 space-y-4">
        {suggestedWallets.groups
          .filter((group) => group.wallets.length > 0)
          .map((group) => {
            const meta = ECOSYSTEM_META[group.ecosystem];
            const moreList = moreWalletsByEcosystem[group.ecosystem] ?? [];
            const moreCount = moreList.length;

            return (
              <Collapsible key={group.ecosystem}>
                <Card
                  title={meta.label}
                  titleIconNode={
                    <meta.Icon
                      style={{ width: meta.iconSize, height: meta.iconSize }}
                    />
                  }
                  className="bg-transparent"
                  classNameTitle="first:mt-0 mt-4"
                >
                  {group.wallets.map((wallet) => {
                    const isSelected = selectedAddresses.has(wallet.address);
                    const subLabel = getValueAddress(wallet.address);

                    return (
                      <CardItem
                        key={wallet.address}
                        item={{
                          iconNode: (
                            <BlockieAddress
                              address={wallet.address}
                              size={meta.iconSize}
                              borderRadius={4}
                            />
                          ),
                          label: truncateAddress(wallet.address),
                          subLabel,
                          onClick: () => toggleAddress(wallet.address),
                          rightElement: (
                            <AnimatedCheckmark
                              animate
                              checked={isSelected}
                              checkedColor="var(--muted-foreground)"
                              uncheckedColor="var(--surface-container-highest)"
                              size={20}
                            />
                          ),
                        }}
                      />
                    );
                  })}

                  {moreCount > 0 && (
                    <>
                      <CollapsibleContent>
                        {moreList.map((wallet) => {
                          const isSelected = selectedAddresses.has(
                            wallet.address
                          );
                          const subLabel = getValueAddress(wallet.address);

                          return (
                            <CardItem
                              key={wallet.address}
                              item={{
                                iconNode: (
                                  <BlockieAddress
                                    address={wallet.address}
                                    size={meta.iconSize}
                                    borderRadius={4}
                                  />
                                ),
                                label: truncateAddress(wallet.address),
                                subLabel,
                                onClick: () => toggleAddress(wallet.address),
                                rightElement: (
                                  <AnimatedCheckmark
                                    animate
                                    checked={isSelected}
                                    checkedColor="var(--muted-foreground)"
                                    uncheckedColor="var(--surface-container-highest)"
                                    size={20}
                                  />
                                ),
                              }}
                            />
                          );
                        })}
                      </CollapsibleContent>

                      <CollapsibleTrigger className="flex justify-center items-center gap-1.5 bg-transparent border-none text-muted-foreground/80 text-sm font-medium px-1 py-2 cursor-pointer hover:opacity-70 transition-opacity duration-200 w-full">
                        <FaChevronDown
                          className="transition-transform duration-200 in-data-open:rotate-180"
                          style={{ width: 14, height: 14 }}
                        />
                        <span className="in-data-open:hidden">
                          Show {moreCount} more
                        </span>
                        <span className="hidden in-data-open:inline">
                          Show less
                        </span>
                      </CollapsibleTrigger>
                    </>
                  )}
                </Card>
              </Collapsible>
            );
          })}
      </div>

      <div className="mt-auto shrink-0">
        <Button
          variant="primary"
          size="lg"
          disabled={selectedCount === 0}
          onClick={handleContinue}
        >
          Continue ({selectedCount})
        </Button>
      </div>
    </>
  );
}
