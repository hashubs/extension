
const TESTNET_KEYWORDS = [
  'testnet',
  'devnet',
  'sepolia',
  'goerli',
  'holesky',
  'mumbai',
  'amoy',
  'fuji',
  'chapel',
  'test',
  'staging',
  'sandbox',
  'ropsten',
  'rinkeby',
  'kovan',
  'cardona',
  'nitro',
  'stylus',
  'chapel',
  'localnet',
  'preview',
  'preprod',
];

function isTestnet(chain) {
  const name = (chain.name || '').toLowerCase();
  const title = (chain.title || '').toLowerCase();
  const network = (chain.network || '').toLowerCase();

  if (network === 'mainnet') return false;
  if (name.includes('mainnet') || title.includes('mainnet')) return false;
  if (network === 'testnet') return true;

  return TESTNET_KEYWORDS.some(
    (kw) => name.includes(kw) || title.includes(kw) || network.includes(kw)
  );
}

const samples = [
    { name: "Sepolia", chainId: 11155111 },
    { name: "Sepolia Mainnet", chainId: 1000 },
    { name: "OP Sepolia", chainId: 11155420 },
    { name: "Ethereum Mainnet", chainId: 1 }
];

samples.forEach(s => {
    console.log(`${s.name}: ${isTestnet(s)}`);
});
