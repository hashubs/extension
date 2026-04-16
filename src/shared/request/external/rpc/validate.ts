import { Connection, PublicKey } from "@solana/web3.js";
import { Contract, isAddress, JsonRpcProvider } from "ethers";

const ERC20_ABI = ["function decimals() view returns (uint8)"];

export async function isValidEvmToken(address: string, rpc: string) {
  if (!isAddress(address)) return false;

  const provider = new JsonRpcProvider(rpc);
  const contract = new Contract(address, ERC20_ABI, provider);

  try {
    await contract.decimals();
    return true;
  } catch {
    return false;
  }
}

export async function isValidSolanaToken(address: string, rpc: string) {
  try {
    const connection = new Connection(rpc);
    const pubkey = new PublicKey(address);

    const info = await connection.getParsedAccountInfo(pubkey);

    if (!info.value) return false;

    const data = info.value.data;

    return "parsed" in data && data.parsed.type === "mint";
  } catch {
    return false;
  }
}
