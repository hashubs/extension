import { formatJsonRpcRequest } from '@walletconnect/jsonrpc-utils';
import { getPayloadId } from './get-payload-id';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatJsonRpcRequestPatched<T = any>(
  method: string,
  params: T,
  maybeId?: number
) {
  /** Use our own getPayloadId() which guarantees uniqueness */
  const id = maybeId ?? getPayloadId();
  return formatJsonRpcRequest(method, params, id);
}
