const R2_BASE_URL = "https://pub-c00e8ea6219e4be79477cc4888b05ffe.r2.dev";

export function getR2TokenUrl(
  chainId: string | number,
  address: string,
): string {
  if (!address) return "";
  return `${R2_BASE_URL}/tokens/${chainId}/${address.toLowerCase()}.webp`;
}
