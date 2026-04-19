import { nanoid } from 'nanoid';
import { invariant } from '../shared/invariant';

const CHANNEL_ID_SCRIPT_ID = `selvo-extension-channel`;

export function setChannelIdInDom(): string {
  const scriptWithId = document.getElementById(CHANNEL_ID_SCRIPT_ID);
  if (!scriptWithId) {
    const id = nanoid();
    const script = document.createElement('script');
    script.setAttribute('id', CHANNEL_ID_SCRIPT_ID);
    script.dataset.walletChannelId = id;
    script.dataset.walletExtension = 'true';
    const container = document.head || document.documentElement;
    container.appendChild(script);
    return id;
  } else {
    const id = scriptWithId.dataset.walletChannelId;
    invariant(id, 'set: walletChannelId missing from script tag');
    return id;
  }
}

export function popWalletChannelId(): string {
  const scriptWithId = document.getElementById(CHANNEL_ID_SCRIPT_ID);
  const id = scriptWithId?.dataset.walletChannelId;
  invariant(id, 'read: walletChannelId missing from script tag');
  scriptWithId?.remove(); // Remove script to preserve initial DOM shape
  return id;
}
