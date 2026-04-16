export const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
];
