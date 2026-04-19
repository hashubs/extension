import { ERC20_ABI } from '@/modules/ethereum/abi/erc20';
import { MULTICALL_ABI } from '@/modules/ethereum/abi/multicall';
import { getChainCaip, parseCaip19 } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { Networks } from '@/modules/networks/networks';
import { MULTICALL_ADDRESS } from '@/shared/address';
import { CustomToken } from '@/shared/fungible/types';
import { getCachedProvider } from '@/shared/rpc/provider';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import pLimit from 'p-limit';

export type TokenBalanceInput = Pick<
  CustomToken,
  'assetId' | 'address' | 'decimals'
>;

export type BalanceResult = {
  raw: string;
  amount: number;
};

const EVM_BATCH_SIZE = 10;
const RPC_TIMEOUT_MS = 20_000;
const SOLANA_CONCURRENCY = 5;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[${label}] Timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

function zeroBalance(): BalanceResult {
  return { raw: '0', amount: 0 };
}

function getCustomTokenKey(token: { assetId: string }): string {
  return token.assetId;
}

export async function rpcTokenBalancesBatch(
  chains: NetworkConfig[],
  address: string,
  customTokens: TokenBalanceInput[] = []
): Promise<Record<string | number, BalanceResult>> {
  const map: Record<string | number, BalanceResult> = {};

  const tokensByChain: Record<string, TokenBalanceInput[]> = {};
  for (const token of customTokens) {
    const parsed = parseCaip19(token.assetId);
    if (!parsed) continue;
    (tokensByChain[parsed.caip] ??= []).push(token);
  }

  const tasks = chains.map((chain) => {
    const caip = getChainCaip(chain);
    return withTimeout(
      processChain(chain, address, tokensByChain, map),
      RPC_TIMEOUT_MS,
      `chain:${caip}`
    ).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[fetchTokenBalances] Chain ${caip} skipped — ${msg}`);
      map[caip] ??= zeroBalance();
      for (const token of tokensByChain[caip] ?? []) {
        map[getCustomTokenKey(token)] ??= zeroBalance();
      }
    });
  });

  await Promise.allSettled(tasks);
  return map;
}

export async function rpcTokenBalancesSingle(
  chain: NetworkConfig,
  tokenAddress: string,
  walletAddress: string,
  decimals: number
): Promise<BalanceResult> {
  const isSolana = chain.standard === 'solana';

  if (isSolana) {
    try {
      const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
      const connection = new Connection(rpcUrl, 'confirmed');
      const mintPubkey = new PublicKey(tokenAddress);
      const ownerPubkey = new PublicKey(walletAddress);
      const ata = getAssociatedTokenAddressSync(mintPubkey, ownerPubkey);
      const res = await connection.getTokenAccountBalance(ata);
      return {
        raw: res.value.amount,
        amount: res.value.uiAmount ?? 0,
      };
    } catch {
      return { raw: '0', amount: 0 };
    }
  }

  try {
    const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
    const provider = getCachedProvider(rpcUrl);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const raw: bigint = await contract.balanceOf(walletAddress);
    return {
      raw: raw.toString(),
      amount: Number(ethers.formatUnits(raw, decimals)),
    };
  } catch {
    return { raw: '0', amount: 0 };
  }
}

export async function rpcTokenNativeBalanceSingle(
  chain: NetworkConfig,
  walletAddress: string
): Promise<BalanceResult> {
  const isSolana = chain.standard === 'solana';

  if (isSolana) {
    const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(walletAddress);
    try {
      const raw = await connection.getBalance(pubkey);
      const decimals = chain.native_asset?.decimals ?? 9;
      return {
        raw: raw.toString(),
        amount: raw / 10 ** decimals,
      };
    } catch {
      return { raw: '0', amount: 0 };
    }
  }

  const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
  const provider = getCachedProvider(rpcUrl);
  try {
    const raw = await provider.getBalance(walletAddress);
    return {
      raw: raw.toString(),
      amount: Number(
        ethers.formatUnits(raw, chain.native_asset?.decimals ?? 18)
      ),
    };
  } catch {
    return { raw: '0', amount: 0 };
  }
}

async function processChain(
  chain: NetworkConfig,
  address: string,
  tokensByChain: Record<string, TokenBalanceInput[]>,
  map: Record<string | number, BalanceResult>
): Promise<void> {
  if (!address) return;

  const caip = getChainCaip(chain);
  const chainTokens = tokensByChain[caip] ?? [];

  const isSolana = chain.standard === 'solana';

  if (isSolana) {
    await processSolanaChain(chain, address, chainTokens, map);
  } else {
    await processEvmChain(chain, address, chainTokens, map);
  }
}

async function processSolanaChain(
  chain: NetworkConfig,
  address: string,
  chainTokens: TokenBalanceInput[],
  map: Record<string | number, BalanceResult>
): Promise<void> {
  const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
  const connection = new Connection(rpcUrl, 'confirmed');
  const ownerPubkey = new PublicKey(address);

  const caip = getChainCaip(chain);

  const nativeResult = await connection
    .getBalance(ownerPubkey)
    .then((v) => ({ status: 'fulfilled' as const, value: v }))
    .catch((reason: unknown) => ({ status: 'rejected' as const, reason }));

  if (nativeResult.status === 'fulfilled') {
    const decimals = chain.native_asset?.decimals ?? 9;
    map[caip] = {
      raw: nativeResult.value.toString(),
      amount: nativeResult.value / 10 ** decimals,
    };
  } else {
    console.warn(
      `[Solana][${caip}] Native balance failed:`,
      nativeResult.reason
    );
    map[caip] = zeroBalance();
  }

  if (chainTokens.length === 0) return;

  const limit = pLimit(SOLANA_CONCURRENCY);

  const tokenResults = await Promise.allSettled(
    chainTokens.map((token) =>
      limit(async () => {
        const mintPubkey = new PublicKey(token.address);
        const ata = getAssociatedTokenAddressSync(mintPubkey, ownerPubkey);
        const res = await connection.getTokenAccountBalance(ata);
        return {
          key: getCustomTokenKey(token),
          raw: res.value.amount,
          amount: res.value.uiAmount ?? 0,
        };
      })
    )
  );

  for (const [i, result] of tokenResults.entries()) {
    const token = chainTokens[i];
    if (result.status === 'fulfilled') {
      map[result.value.key] = {
        raw: result.value.raw,
        amount: result.value.amount,
      };
    } else {
      map[getCustomTokenKey(token)] = zeroBalance();
    }
  }
}

async function processEvmChain(
  chain: NetworkConfig,
  address: string,
  chainTokens: TokenBalanceInput[],
  map: Record<string | number, BalanceResult>
): Promise<void> {
  const caip = getChainCaip(chain);

  if (!ethers.isAddress(address)) {
    console.warn(
      `[EVM][${caip}] Invalid EVM address "${address}" — skipping chain`
    );
    map[caip] = zeroBalance();
    for (const token of chainTokens) {
      map[getCustomTokenKey(token)] = zeroBalance();
    }
    return;
  }

  const rpcUrl = Networks.getNetworkRpcUrlInternal(chain);
  const provider = getCachedProvider(rpcUrl);
  const erc20Interface = new ethers.Interface(ERC20_ABI);

  try {
    const rawNative = await provider.getBalance(address);
    const decimals = chain.native_asset?.decimals ?? 18;
    map[caip] = {
      raw: rawNative.toString(),
      amount: Number(ethers.formatUnits(rawNative, decimals)),
    };
  } catch (err) {
    console.warn(`[EVM][${caip}] Native balance failed:`, err);
    map[caip] = zeroBalance();
  }

  if (chainTokens.length === 0) return;

  const validTokens: TokenBalanceInput[] = [];
  for (const token of chainTokens) {
    if (ethers.isAddress(token.address)) {
      validTokens.push(token);
    } else {
      console.warn(
        `[EVM][${caip}] Token has invalid address "${token.address}" — skipped`
      );
      map[getCustomTokenKey(token)] = zeroBalance();
    }
  }

  if (validTokens.length === 0) return;

  try {
    const multicall = new ethers.Contract(
      MULTICALL_ADDRESS,
      MULTICALL_ABI,
      provider
    );
    const chunks = chunkArray(validTokens, EVM_BATCH_SIZE);

    await Promise.all(
      chunks.map(async (chunk) => {
        const calls = chunk.map((token) => ({
          target: token.address,
          allowFailure: true,
          callData: erc20Interface.encodeFunctionData('balanceOf', [address]),
        }));

        const results: { success: boolean; returnData: string }[] =
          await multicall.aggregate3.staticCall(calls);

        for (const [i, res] of results.entries()) {
          const token = chunk[i];
          if (res.success) {
            const rawBalance = erc20Interface.decodeFunctionResult(
              'balanceOf',
              res.returnData
            )[0] as bigint;
            map[getCustomTokenKey(token)] = {
              raw: rawBalance.toString(),
              amount: Number(ethers.formatUnits(rawBalance, token.decimals)),
            };
          } else {
            map[getCustomTokenKey(token)] = zeroBalance();
          }
        }
      })
    );
  } catch {
    await Promise.allSettled(
      validTokens.map(async (token) => {
        try {
          const contract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
          );
          const raw: bigint = await contract.balanceOf(address);
          map[getCustomTokenKey(token)] = {
            raw: raw.toString(),
            amount: Number(ethers.formatUnits(raw, token.decimals)),
          };
        } catch {
          map[getCustomTokenKey(token)] = zeroBalance();
        }
      })
    );
  }
}
