import type { YounoApiContext } from './youno-api-bare';
import { YounoApiBare } from './youno-api-bare';

const context: YounoApiContext = {
  getAddressProviderHeader: async (_address: string) => {
    // Placeholder implementation for client/UI
    return '';
  },
  getKyOptions: () => ({}),
};

export const YounoAPI = Object.assign(context, YounoApiBare);
export type YounoApiBackground = typeof YounoAPI;
