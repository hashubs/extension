import { RuntimePort } from '@/background/webapis/runtime-port';
import { mapRPCMessageToController } from '@/shared/custom-rpc/map-rpc-to-controller';
import type browser from 'webextension-polyfill';
import { getPortContext } from '../get-port-context';
import type { PortMessageHandler } from '../port-registry';

export function createPortMessageHandler<T>({
  controller,
  check,
}: {
  controller: T;
  check: (port: RuntimePort) => boolean;
}): PortMessageHandler {
  return function portMessageHandler(port, msg) {
    if (!check(port)) {
      return false;
    }
    const context = getPortContext(port as browser.Runtime.Port);
    mapRPCMessageToController(port, msg, controller, context);
    return true;
  };
}
