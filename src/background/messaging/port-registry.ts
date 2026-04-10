import type { RuntimePort } from '@/background/webapis/runtime-port';
import { pushUnique, removeFromArray } from '@/shared/array-mutations';

export type PortMessageHandler = (
  port: RuntimePort,
  msg: unknown
) => void | boolean;

export class PortRegistry {
  private ports: RuntimePort[];
  private handlers: PortMessageHandler[];
  listener: (msg: unknown, port: RuntimePort) => void;
  private listeners: {
    onDisconnect: Set<(port: RuntimePort) => void>;
  };

  constructor() {
    this.ports = [];
    this.handlers = [];

    this.listener = (msg: unknown, port: RuntimePort) => {
      for (const handler of this.handlers) {
        const didHandle = handler(port, msg);
        if (didHandle) {
          break;
        }
      }
    };

    this.listeners = {
      onDisconnect: new Set(),
    };
  }

  addListener(event: 'disconnect', listener: (port: RuntimePort) => void) {
    if (event === 'disconnect') {
      this.listeners.onDisconnect.add(listener);
      return () => {
        this.listeners.onDisconnect.delete(listener);
      };
    } else {
      throw new Error('Unsupported event');
    }
  }

  register(port: RuntimePort) {
    console.log(
      `[PortRegistry] Registering port: ${port.name}`,
      port.sender?.url
    );
    pushUnique(this.ports, port);
    // @ts-ignore
    port.onMessage.addListener(this.listener);

    const disconnectHandler = () => {
      console.log(`[PortRegistry] Port disconnected: ${port.name}`);
      // @ts-ignore
      port.onMessage.removeListener(this.listener);
      for (const eventListener of this.listeners.onDisconnect) {
        eventListener(port);
      }
      this.unregister(port);
      // @ts-ignore
      port.onDisconnect.removeListener(disconnectHandler);
    };
    // @ts-ignore
    port.onDisconnect.addListener(disconnectHandler);
  }

  unregister(port: RuntimePort) {
    removeFromArray(this.ports, port);
  }

  getActivePorts() {
    return this.ports;
  }

  addMessageHandler(handler: PortMessageHandler) {
    console.log(
      `[PortRegistry] Adding message handler: ${handler.name || 'anonymous'}`
    );
    this.handlers.push(handler);
  }

  postMessage<T>({ portName, message }: { portName: string; message: T }) {
    const port = this.ports.find((port) => port.name === portName);
    if (port) {
      // @ts-ignore
      port.postMessage(message);
    }
  }

  broadcast(message: unknown) {
    for (const port of this.ports) {
      try {
        // @ts-ignore
        port.postMessage(message);
      } catch (e) {
        // Handle potential channel errors
      }
    }
  }
}
