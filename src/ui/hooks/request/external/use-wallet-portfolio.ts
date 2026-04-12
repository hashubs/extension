// import { QUERY_KEYS } from '@/constants/query-key';
// import {
//   sanitizePortfolio,
//   type SanitizedPortfolio,
// } from '@/lib/token/sanitize-portfolio';
// import { buildFromServerBalance } from '@/lib/token/token-builders';
// import { SenthiumAPI } from '@/modules/api/senthium-api.client';
// import { persistentQuery } from '@/shared/query-client/queryClientPersistence';
// import { useQuery } from '@tanstack/react-query';

// interface Params {
//   evmAddress?: string;
//   svmAddress?: string;
//   enabled?: boolean;
// }

// export function useWalletPortfolio({
//   evmAddress,
//   svmAddress,
//   enabled = true,
// }: Params) {
//   return useQuery<SanitizedPortfolio[]>({
//     queryKey: persistentQuery[('walletGetPortfolio', evmAddress, svmAddress)],
//     queryFn: async () => {
//       const res = await SenthiumAPI.walletGetPortfolio({
//         addresses: [evmAddress, svmAddress].filter(Boolean) as string[],
//         currency: 'usd',
//         portfolioType: 'asset',
//       });
//       return res.data.map((item) =>
//         buildFromServerBalance(sanitizePortfolio(item))
//       );
//     },
//     enabled: enabled && !!(evmAddress || svmAddress),
//     staleTime: 30_000,
//   });
// }
