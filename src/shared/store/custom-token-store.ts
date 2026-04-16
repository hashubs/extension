import { CustomToken } from '@/shared/fungible/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CustomTokenState {
  customTokens: CustomToken[];
  addToken: (token: CustomToken) => void;
  removeToken: (assetId: string, accountAddress: string) => void;
  clearTokens: () => void;
}

export const useCustomTokenStore = create<CustomTokenState>()(
  persist(
    (set) => ({
      customTokens: [],

      addToken: (token) =>
        set((state) => {
          const exists = state.customTokens.some(
            (t) =>
              t.assetId.toLowerCase() === token.assetId.toLowerCase() &&
              t.accountAddress.toLowerCase() ===
                token.accountAddress.toLowerCase()
          );
          if (exists) return state;
          return { customTokens: [...state.customTokens, token] };
        }),

      removeToken: (assetId, accountAddress) =>
        set((state) => ({
          customTokens: state.customTokens.filter(
            (t) =>
              !(
                t.assetId.toLowerCase() === assetId.toLowerCase() &&
                t.accountAddress.toLowerCase() === accountAddress.toLowerCase()
              )
          ),
        })),

      clearTokens: () => set({ customTokens: [] }),
    }),
    {
      name: 'selvo-custom-tokens',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
