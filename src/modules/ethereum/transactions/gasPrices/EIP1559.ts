export interface EIP1559 {
  maxFee: number;
  priorityFee: number;
}
export type NetworkFeeSpeed = 'fast' | 'average' | 'custom';

export interface NetworkFeeConfiguration {
  speed: NetworkFeeSpeed;
  custom1559GasPrice: EIP1559 | null;
  customClassicGasPrice: number | null;
  gasLimit: string | null;
}
export interface CustomConfiguration {
  nonce: string | null;
  slippage: number | null;
  networkFee: NetworkFeeConfiguration;
}

export type EIP1559Base = EIP1559 & {
  baseFee: number;
};
