import { ERC20_ABI } from '@/modules/ethereum/abi/erc20';
import { NetworkConfig } from '@/modules/networks/network-config';
import { getMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

export interface TokenMetadata {
  symbol: string | null;
  decimals: number;
  name?: string | null;
  logoUrl?: string | null;
}

export type ChainType = 'evm' | 'solana';

async function metadataEvm(
  address: string,
  chain: NetworkConfig
): Promise<TokenMetadata> {
  try {
    const provider = new ethers.JsonRpcProvider(
      chain.rpc_url_internal || chain.rpc_url_public?.[0] || ''
    );
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    const [symbolResult, decimalsResult, nameResult] = await Promise.allSettled(
      [
        contract.symbol() as Promise<string>,
        contract.decimals() as Promise<bigint>,
        contract.name() as Promise<string>,
      ]
    );

    if (decimalsResult.status === 'rejected') {
      throw new Error('Invalid token address');
    }

    return {
      symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : null,
      decimals: Number(decimalsResult.value),
      name: nameResult.status === 'fulfilled' ? nameResult.value : null,
      logoUrl: null,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid token address')
      throw err;
    throw new Error('Invalid token address');
  }
}

const METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Parse Metaplex metadata from raw account buffer.
 *
 * Fixed layout (after 1-byte discriminator + 32-byte update authority + 32-byte mint):
 *   Offset  Size   Field
 *   ──────  ────   ─────
 *   65      4      name  length (LE u32)
 *   69      n      name  bytes (UTF-8, zero-padded to fixed capacity)
 *   69+n    4      symbol length (LE u32)
 *   73+n    m      symbol bytes (UTF-8, zero-padded)
 *   ...     4+uri  uri (skipped)
 */
function parseMetaplexMetadata(data: Buffer): {
  name: string | null;
  symbol: string | null;
  uri: string | null;
} {
  try {
    let offset = 1 + 32 + 32;

    const readString = (): string | null => {
      if (offset + 4 > data.length) return null;
      const len = data.readUInt32LE(offset);
      offset += 4;
      if (offset + len > data.length) return null;
      const str = data
        .subarray(offset, offset + len)
        .toString('utf8')
        .replace(/\0/g, '')
        .trim();
      offset += len;
      return str || null;
    };

    const name = readString();
    const symbol = readString();
    const uri = readString();

    return { name, symbol, uri };
  } catch {
    return { name: null, symbol: null, uri: null };
  }
}

async function metadataSolana(
  address: string,
  rpcUrl: string
): Promise<TokenMetadata> {
  const connection = new Connection(rpcUrl);
  const mint = new PublicKey(address);

  let decimals: number;
  try {
    const mintInfo = await getMint(connection, mint);
    decimals = mintInfo.decimals;
  } catch {
    throw new Error('Invalid token address');
  }

  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );

  const accountInfo = await connection.getAccountInfo(metadataPDA);
  if (!accountInfo)
    return { name: null, symbol: null, decimals, logoUrl: null };

  const { name, symbol, uri } = parseMetaplexMetadata(
    Buffer.from(accountInfo.data)
  );

  let logoUrl: string | null = null;
  if (uri) {
    try {
      const res = await fetch(uri);
      const json = await res.json();
      logoUrl = json.image ?? null;
    } catch {
      // skip
    }
  }

  return { name, symbol, decimals, logoUrl };
}

export async function rpcGetTokenMetadata(
  address: string,
  chain: NetworkConfig,
  chainType: ChainType
): Promise<TokenMetadata> {
  switch (chainType) {
    case 'evm':
      return metadataEvm(address, chain);
    case 'solana':
      return metadataSolana(
        address,
        chain.rpc_url_internal || chain.rpc_url_public?.[0] || ''
      );
    default:
      throw new Error(`Unsupported chain: ${chainType satisfies never}`);
  }
}
