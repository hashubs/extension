import type { PortContext } from '@/background/messaging/port-context';
import { SLOW_MODE } from '@/env/config';
import { isClassProperty } from '@/shared/core/is-class-property';
import { formatJsonRpcResultForPort } from '@/shared/custom-rpc/format-json-rpc-result-for-port';
import { formatJsonRpcWalletError } from '@/shared/custom-rpc/format-json-rpc-wallet-error';
import { MethodNotFound } from '@/shared/errors/errors';
import { getError } from '@/shared/errors/get-error';
import { wait } from '@/shared/wait';
import type {
  JsonRpcPayload,
  JsonRpcResponse,
} from '@walletconnect/jsonrpc-utils';
import {
  isJsonRpcPayload,
  isJsonRpcRequest,
} from '@walletconnect/jsonrpc-utils';
import type browser from 'webextension-polyfill';

/**
 * This function takes a JsonRpcRequest and maps
 * it to a corresponding method of a controller (if it exists),
 * then posts the result back to the port
 */
export function mapRPCMessageToController<T>(
  port: browser.Runtime.Port | chrome.runtime.Port,
  msg: JsonRpcPayload | unknown,
  controller: T,
  context: PortContext
) {
  if (isJsonRpcPayload(msg) && isJsonRpcRequest(msg)) {
    const { method, params, id } = msg;

    if (
      !isClassProperty(controller, method) ||
      typeof controller[method as keyof typeof controller] !== 'function'
    ) {
      // @ts-ignore
      port.postMessage(
        formatJsonRpcWalletError(
          id,
          new MethodNotFound(method ? `Method not found: ${method}` : undefined)
        )
      );
      return;
    }

    const controllerMethod = controller[method as keyof typeof controller];
    (controllerMethod as any)
      .call(controller, { params, context, id })
      .then((result: unknown) => (SLOW_MODE ? wait(1000, result) : result))
      .then(
        (result: unknown) => {
          return formatJsonRpcResultForPort(id, result);
        },
        (error: unknown) => {
          const normalizedError = formatJsonRpcWalletError(id, getError(error));
          console.group('Controller error');
          console.table(normalizedError);
          console.groupEnd();
          return normalizedError;
        }
      )
      .then((result: JsonRpcResponse) => {
        // @ts-ignore
        port.postMessage(result);
      });
  }
}
