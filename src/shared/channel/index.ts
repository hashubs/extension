import type { RpcRequestWithContext } from '@/shared/custom-rpc';
import { UserRejected } from '@/shared/errors/errors';
import { isObj } from '@/shared/is-obj';
import { PortMessageChannel } from '@/shared/port-message-channel';
import type { AccountPublicRPC } from '@/shared/types/account-public-rpc';
import type { MemoryCacheRPC } from '@/shared/types/memory-cache-rpc';
import type { Wallet } from '@/shared/types/wallet';
import { getWindowType } from '@/shared/window-type';
import browser from 'webextension-polyfill';
// import type { DnaService } from '../../modules/dna-service/dna.background';
// import { initDnaApi } from '../../modules/dna-service/dna.client';
import type { SessionCacheService } from '@/background/resource/session-cache-service';
import { emitter } from '@/shared/events';
import { navigateProgrammatically } from '@/ui/shared/routing/helpers';
import type { RPCPort } from './channels.types';

export const walletPort = new PortMessageChannel({
  name: `${browser.runtime.id}/wallet`,
}) as RPCPort<Wallet>;

type BlockTag = 'latest' | 'earliest' | 'pending';
interface NodeMethods {
  eth_getBalance(
    request: RpcRequestWithContext<[string, BlockTag]>
  ): Promise<string>;
}

export const httpConnectionPort = new PortMessageChannel({
  name: `${browser.runtime.id}/http-connection-ui`,
}) as RPCPort<NodeMethods>;

export const accountPublicRPCPort = new PortMessageChannel({
  name: 'accountPublicRPC',
}) as RPCPort<AccountPublicRPC>;

export const memoryCacheRPCPort = new PortMessageChannel({
  name: 'memoryCacheRPC',
}) as RPCPort<MemoryCacheRPC>;

// export const dnaServicePort = new PortMessageChannel({
//   name: 'dnaService',
// }) as RPCPort<DnaService>;

export const sessionCacheService = new PortMessageChannel({
  name: 'sessionCacheService',
}) as RPCPort<SessionCacheService>;

class WindowPort extends PortMessageChannel {
  static maybeRestoreRouteForSidepanel() {
    if (getWindowType() === 'sidepanel') {
      // TODO: navigate to location that user was on before opening the request view?
      navigateProgrammatically({ pathname: '/' });
    }
  }

  confirm<T>(
    windowId: string,
    // result MUST NOT be undefined, otherwise the payload will not be interpreter
    // as JsonRpcResult or RpcResult, because `undefined` properties get removed
    // when sent via ports
    result: T
  ) {
    try {
      return this.request('resolve', [{ windowId, result }]);
    } finally {
      WindowPort.maybeRestoreRouteForSidepanel();
    }
  }

  reject(windowId: string) {
    try {
      return this.request('reject', [{ windowId, error: new UserRejected() }]);
    } finally {
      WindowPort.maybeRestoreRouteForSidepanel();
    }
  }
}

export const windowPort = new WindowPort({ name: 'window' });

export function initialize() {
  walletPort.initialize();
  httpConnectionPort.initialize();
  accountPublicRPCPort.initialize();
  memoryCacheRPCPort.initialize();
  windowPort.initialize();
  // dnaServicePort.initialize();
  sessionCacheService.initialize();
  // initDnaApi();

  walletPort.emitter.on('message', (msg) => {
    if (isObj(msg) && msg.type === 'ethereumEvent') {
      emitter.emit('ethereumEvent');
    }
  });
}
