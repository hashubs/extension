export const CHAIN_NAMESPACES = {
  EVM: 'eip155',
  SOLANA: 'solana',
} as const;

export type ChainNamespace =
  (typeof CHAIN_NAMESPACES)[keyof typeof CHAIN_NAMESPACES];

export type ChainRegistry = {
  caip: string | null;
  namespace: ChainNamespace;
  chain_identifier: number | null;
  name: string;
  native_coin_id: string | null;
  image: string;
  gecko_id: string | null;
};

export type Ecosystem = 'EVM' | 'SOLANA';
