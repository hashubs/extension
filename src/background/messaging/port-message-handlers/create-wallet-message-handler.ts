import { isClassProperty } from '@/shared/core/is-class-property';
import { mapRPCMessageToController } from '@/shared/custom-rpc/map-rpc-to-controller';
import type { Wallet } from '@/shared/types/wallet';
import {
  isJsonRpcPayload,
  isJsonRpcRequest,
} from '@walletconnect/jsonrpc-utils';
import browser from 'webextension-polyfill';
import { getPortContext } from '../get-port-context';
import type { PortMessageHandler } from '../port-registry';

export function createWalletMessageHandler(
  getWallet: () => Wallet
): PortMessageHandler {
  return function walletMessageHandler(port, msg): boolean {
    const isValidRequest = isJsonRpcPayload(msg) && isJsonRpcRequest(msg);

    if (!isValidRequest) {
      return false;
    }

    const { method } = msg;

    const context = getPortContext(port);

    function mapToControllerIfPossible<T>(controller: T) {
      if (
        isClassProperty(controller, method) &&
        typeof controller[method as keyof typeof controller] === 'function'
      ) {
        mapRPCMessageToController(port, msg, controller, context);
        return true;
      } else {
        return false;
      }
    }

    if (port.name === `${browser.runtime.id}/ethereum`) {
      const controller = getWallet().publicEthereumController;
      return mapToControllerIfPossible(controller);
    } else if (port.name === `${browser.runtime.id}/wallet`) {
      const controller = getWallet();
      return mapToControllerIfPossible(controller);
    } else {
      return false;
    }
  };
}
