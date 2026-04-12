import { ethers } from 'ethers';

export function valueToHex(
  value: ethers.BigNumberish | string,
  transformEmptyString = false
): string {
  if (ethers.isHexString(value)) {
    return value as string;
  }

  if (value === '') {
    return transformEmptyString ? '0x' : '';
  }

  try {
    return ethers.toBeHex(ethers.toBigInt(value));
  } catch (error) {
    return String(value);
  }
}
