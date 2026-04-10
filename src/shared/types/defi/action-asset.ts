import { Asset } from './asset';
import { NFTCollection } from './nft';
import { NFTAsset } from './nft-asset';

export declare type TransactionStatus = 'confirmed' | 'failed' | 'pending';
export declare type ActionAssetFilter = 'fungible' | 'nft' | 'all';
export declare type ActionTypeFilter =
  | 'mint'
  | 'send'
  | 'receive'
  | 'trade'
  | 'others';
export declare type ActionType =
  | 'send'
  | 'receive'
  | 'trade'
  | 'approve'
  | 'revoke'
  | 'execute'
  | 'deploy'
  | 'cancel'
  | 'deposit'
  | 'withdraw'
  | 'borrow'
  | 'repay'
  | 'stake'
  | 'unstake'
  | 'claim'
  | 'mint'
  | 'burn';
export declare type ActionAsset =
  | {
      fungible: Asset | Record<string, never>;
    }
  | {
      nft: NFTAsset | Record<string, never>;
    };
export interface ActionTransfer {
  asset: ActionAsset;
  quantity: string;
  price: number | null;
  recipient?: string | null;
  sender?: string | null;
}
export interface ActionTransfers {
  outgoing?: ActionTransfer[];
  incoming?: ActionTransfer[];
}
interface ApprovalNFTCollection extends Omit<NFTCollection, 'id'> {
  id: string;
}
export interface AddressAction {
  id: string;
  datetime: string;
  address: string;
  type: {
    value: ActionType;
    display_value: string;
  };
  transaction: {
    chain: string;
    hash: string;
    status: TransactionStatus;
    nonce: number;
    sponsored: boolean;
    fee: {
      asset: ActionAsset;
      quantity: string;
      price: number | null;
    } | null;
    gasback?: number | null;
  };
  label: {
    type: 'to' | 'from' | 'application' | 'contract';
    value: string;
    icon_url?: string;
    display_value: {
      wallet_address?: string;
      contract_address?: string;
      text?: string;
    };
  } | null;
  content: {
    transfers?: ActionTransfers;
    single_asset?: {
      asset: ActionAsset;
      quantity: string;
    };
    collection?: ApprovalNFTCollection;
  } | null;
}
