import { ActionType } from './wallet-get-actions';

export interface Payload {
  /**
   * @description Currency name for price conversions // [!code link {"token":"Currency","href":"/docs/actions/entities.html#currency"}]
   * @example usd
   */
  currency?: string;
  /** @description Wallet addresses */
  addresses: string[];
  /** @description Pagination cursor */
  cursor?: string;
  /** @description Pagination limit */
  limit?: number;
  /**
   * @description Chain identifier on which the nft is located // [!code link {"token":"Chain","href":"/docs/actions/entities.html#chain"}]
   * @example ethereum
   */
  chain?: string;
  /** @description Filter by types of actions */
  actionTypes?: ActionType[];
  /** @description Filter by types of assets */
  assetTypes?: ('fungible' | 'nft')[];
  /** @description Filter by asset id for fungible assets */
  fungibleId?: string;
  /** @description Search query */
  searchQuery?: string;
  /** @description Include spam transactions */
  includeSpam?: boolean;
}
