import type { ApiContext } from './api-bare';
import { ApiBare } from './api-bare';

const context: ApiContext = {
  getAddressProviderHeader: async (_address: string) => {
    // Placeholder implementation for client/UI
    return '';
  },
  getKyOptions: () => ({}),
};

export const ApiClient = Object.assign(context, ApiBare);
export type ApiClientType = typeof ApiClient;
