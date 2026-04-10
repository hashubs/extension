import type { JsonRpcResult } from '@walletconnect/jsonrpc-utils';
import { formatJsonRpcResult } from '@walletconnect/jsonrpc-utils';

export function formatJsonRpcResultForPort<T = any | null | undefined>(
  id: number,
  result: T
) {
  const value = formatJsonRpcResult(id, result) as JsonRpcResult<T | null>;
  if (value.result === undefined) {
    // When messages are sent via ports, `undefined` properties get removed
    value.result = null;
  }
  return value;
}
