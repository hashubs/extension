import { ethers } from 'ethers';

const addr = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
try {
  console.log('INPUT:', addr);
  const normalized = ethers.getAddress(addr);
  console.log('NORMALIZED:', normalized);
} catch (e: any) {
  console.log('ERROR:', e.message);
}
