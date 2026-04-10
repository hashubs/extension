import { ethers } from 'ethers';

export function normalizeAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch {
    return address.toLowerCase();
  }
}
