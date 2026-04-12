import type { ApiContext } from './api-bare';
import { ApiBare } from './api-bare';

const context: ApiContext = {
  getAddressProviderHeader: async (_address: string) => {
    // Placeholder implementation for client/UI
    return '';
  },
  getKyOptions: () => ({}),
};

export const ApiBackground = Object.assign(context, ApiBare);
export type ApiBackgroundType = typeof ApiBackground;
