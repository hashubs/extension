import { createChain } from '@/modules/networks/chain';
import { walletPort } from '@/shared/channels';
import type { BlockchainType } from 'src/shared/wallet/classifiers';

export function requestChainForOrigin(
  tabOrigin: string,
  standard: BlockchainType
) {
  return walletPort
    .request('requestChainForOrigin', { origin: tabOrigin, standard })
    .then((chain) => createChain(chain));
}
