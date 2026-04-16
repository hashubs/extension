// import { INTERNAL_ORIGIN } from '@/background/constants';
// import { createChain } from '@/modules/networks/chain';
// import { toAddEthereumChainParameter } from '@/modules/networks/helpers';
// import { walletPort } from '@/shared/channel';
// import { Header } from '@/ui/components/header';
// import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
// import { Button } from '@/ui/ui-kit';
// import { Card } from '@/ui/ui-kit/card';
// import { useMutation } from '@tanstack/react-query';
// import { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { FormField } from '../_shared/FormField';
// import { updateNetworks } from '../_shared/updateNetworks';

// export function AddRpcEndpoint() {
//   const { id: chainStr } = useParams();
//   const navigate = useNavigate();
//   const [url, setUrl] = useState('');
//   const [error, setError] = useState('');

//   const { networks } = useNetworks();
//   const network = networks?.getNetworkByName(createChain(chainStr!));

//   const saveMutation = useMutation({
//     mutationFn: async (rpcUrl: string) => {
//       const config = toAddEthereumChainParameter(network!);
//       if (config.rpcUrls.includes(rpcUrl)) throw new Error('RPC already exists');
//       await walletPort.request('addEthereumChain', {
//         values: [{ ...config, rpcUrls: [...config.rpcUrls, rpcUrl] }],
//         origin: INTERNAL_ORIGIN,
//         chain: chainStr ?? null,
//         prevChain: chainStr ?? null,
//       });
//       await updateNetworks();
//     },
//     onSuccess: () => navigate(-1),
//     onError: (err: any) => setError(err.message),
//   });

//   return (
//     <div className="flex flex-col h-full bg-background">
//       <Header title="Add RPC Endpoint" onBack={() => navigate(-1)} />
//       <div className="p-4 space-y-6">
//         <Card>
//           <FormField
//             label="New RPC URL"
//             wrapperClassName="p-3"
//             placeholder="https://..."
//             value={url}
//             onChange={(e: any) => setUrl(e.target.value)}
//             error={error}
//             autoFocus
//           />
//         </Card>
//         <Button
//           onClick={() => saveMutation.mutate(url)}
//           disabled={!url || saveMutation.isPending}
//           size="lg"
//           className="w-full rounded-2xl h-12 uppercase text-xs font-bold tracking-widest leading-relaxed"
//         >
//           {saveMutation.isPending ? 'Adding...' : 'Add RPC Endpoint'}
//         </Button>
//       </div>
//     </div>
//   );
// }
