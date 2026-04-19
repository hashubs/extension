type Ecosystem = 'EVM' | 'SOLANA';

export interface CustomToken {
  id?: string;
  assetId: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  accountAddress: string;
  ecosystem?: Ecosystem;
}
