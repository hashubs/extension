export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount)',
  'function approve(address spender, uint256 amount)',
];

export const ERC721_ABI = [
  'function transferFrom(address from,address to,uint256 tokenId)',
  'function safeTransferFrom(address from,address to,uint256 tokenId)',
];
