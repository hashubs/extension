import { lookupAddressName } from '@/shared/domain-name-service';
import { persistentQuery } from '@/shared/query-client/queryClientPersistence';
import { getWalletDisplayName } from '@/ui/components/wallet';
import { useQuery } from '@tanstack/react-query';
import { normalizeAddress } from 'src/shared/normalize-address';
import type { BareWallet } from 'src/shared/types/bare-wallet';

const testAddress = process.env.TEST_WALLET_ADDRESS as string;

function randomCoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const testWalletSuffixes = ['⧗', '🤘️️️️️️', '♥️'];
const testWalletSuffix = randomCoice(testWalletSuffixes);

export enum WalletNameType {
  address,
  domain,
  customName,
}

export const lookupAddressNameKey = 'name-service/lookupAddressName';

export function useProfileName(
  wallet: Pick<BareWallet, 'address' | 'name'> | null | undefined,
  {
    padding = 5,
    maxCharacters,
  }: { padding?: number; maxCharacters?: number } = {}
): { type: WalletNameType; value: string; isLoading: boolean } {
  const { isLoading: isDomainLoading, data: domain } = useQuery({
    queryKey: persistentQuery([lookupAddressNameKey, wallet?.address]),
    queryFn: async () => lookupAddressName(wallet!.address),
    enabled: !!wallet?.address && !wallet?.name,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    retry: 0,
    staleTime: 40000,
  });

  if (!wallet) {
    return {
      type: WalletNameType.address,
      value: '',
      isLoading: true,
    };
  }

  const isQueryLoading = isDomainLoading && !wallet.name;
  const domainName = isQueryLoading ? null : domain;

  if (wallet.name) {
    return {
      type: WalletNameType.customName,
      value: getWalletDisplayName(wallet, { padding, maxCharacters }),
      isLoading: false,
    };
  }

  const value =
    domainName ?? getWalletDisplayName(wallet, { padding, maxCharacters });
  const type = domainName ? WalletNameType.domain : WalletNameType.address;

  let finalValue = value;
  if (normalizeAddress(wallet.address) === testAddress) {
    finalValue = `${value} ${testWalletSuffix}`;
  }

  return { type, value: finalValue, isLoading: isQueryLoading };
}

// export function useProfileName(
//   wallet: Pick<BareWallet, 'address' | 'name'>,
//   {
//     padding = 5,
//     maxCharacters,
//   }: { padding?: number; maxCharacters?: number } = {}
// ): { type: WalletNameType; value: string } {
//   const { isLoading: isDomainLoading, data: domain } = useQuery({
//     queryKey: persistentQuery([lookupAddressNameKey, wallet.address]),
//     queryFn: async () => lookupAddressName(wallet.address),
//     enabled: !wallet.name,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//     retryOnMount: false,
//     retry: 0,
//     staleTime: 40000,
//   });

//   const domainName = isDomainLoading ? null : domain;

//   if (wallet.name) {
//     return {
//       type: WalletNameType.customName,
//       value: getWalletDisplayName(wallet, { padding, maxCharacters }),
//     };
//   }
//   const value =
//     domainName ?? getWalletDisplayName(wallet, { padding, maxCharacters });
//   const type = domainName ? WalletNameType.domain : WalletNameType.address;
//   if (normalizeAddress(wallet.address) === testAddress) {
//     return { type, value: `${value} ${testWalletSuffix}` };
//   }
//   return { type, value };
// }
