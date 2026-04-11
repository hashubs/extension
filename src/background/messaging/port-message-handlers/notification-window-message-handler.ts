import type { NotificationWindow } from '@/background/notification-window/notification-window';
import { isRpcRequest } from '@/shared/custom-rpc';
import { formatJsonRpcResultForPort } from '@/shared/custom-rpc/format-json-rpc-result-for-port';
import { formatJsonRpcWalletError } from '@/shared/custom-rpc/format-json-rpc-wallet-error';
import { invariant } from '@/shared/invariant';
import { isObj } from '@/shared/is-obj';
import type { ErrorResponse } from '@walletconnect/jsonrpc-utils';
import type { PortMessageHandler } from '../port-registry';

function assertType<T>(
  value: unknown,
  check: (value: unknown) => value is T
): asserts value is T {
  invariant(check(value), 'Type Error');
}

type WindowResolve = { windowId: string; result: unknown };
const isWindowResolve = (v: unknown): v is WindowResolve =>
  isObj(v) && 'windowId' in v && 'result' in v;
type WindowReject = { windowId: string; error: unknown };
const isWindowReject = (v: unknown): v is WindowReject =>
  isObj(v) && 'windowId' in v && 'error' in v;

export function createNotificationWindowMessageHandler(
  notificationWindow: NotificationWindow
): PortMessageHandler {
  return function notificationWindowMessageHandler(port, msg) {
    if (port.name !== 'window') {
      return;
    }

    if (isRpcRequest(msg)) {
      try {
        const { params, method } = msg;
        if (method === 'resolve') {
          assertType(params, (v): v is [unknown] => Array.isArray(v));
          assertType(params[0], isWindowResolve);
          notificationWindow.emit('resolve', {
            id: params[0].windowId,
            result: params[0].result,
          });
          port.postMessage(formatJsonRpcResultForPort(Number(msg.id), null));
        } else if (msg.method === 'reject') {
          assertType(params, (v): v is [unknown] => Array.isArray(v));
          assertType(params[0], isWindowReject);
          notificationWindow.emit('reject', {
            id: params[0].windowId,
            error: params[0].error as ErrorResponse,
          });
          port.postMessage(formatJsonRpcResultForPort(Number(msg.id), null));
        } else if (msg.method === 'closeCurrentWindow') {
          notificationWindow.closeCurrentWindow();
        }
      } catch (error: any) {
        port.postMessage(formatJsonRpcWalletError(Number(msg.id), error));
      }
    } else {
      return false;
    }

    return true;
  };
}
