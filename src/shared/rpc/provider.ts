import { ethers } from "ethers";

const providerCache = new Map<string, ethers.JsonRpcProvider>();

/**
 * Get a cached JsonRpcProvider for the given RPC URL.
 */
export function getCachedProvider(rpcUrl: string): ethers.JsonRpcProvider {
  if (!providerCache.has(rpcUrl)) {
    providerCache.set(rpcUrl, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providerCache.get(rpcUrl)!;
}
